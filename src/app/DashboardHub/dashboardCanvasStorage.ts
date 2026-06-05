import type { Widget } from '@app/Homepage/widgetTypes';
import { MAX_ROW_SPAN, MIN_ROW_SPAN } from '@app/Homepage/widgetTypes';
import { clampRowSpan, migrateLegacyRowSpan } from '@app/Homepage/homepageWidgetGrid';
import { createHomepageWidgetClones } from '@app/Homepage/homepageWidgetCatalog';
import { getConsoleDefaultWidgets, isConsoleDefaultHubRow } from '@app/DashboardHub/consoleDefaultDashboard';
import type { HubRow } from '@app/DashboardHub/dashboardHubMockData';

const STORAGE_PREFIX = 'hcc-dashboard-canvas-';

/** Session layout schema — v2 stores rowSpan as half-row units (1–12). */
const CANVAS_LAYOUT_VERSION = 2;

const CANVAS_UPDATED = 'hcc-dashboard-canvas-updated';

function storageKey(dashboardId: string): string {
  return `${STORAGE_PREFIX}${dashboardId}`;
}

export function notifyDashboardCanvasUpdated(dashboardId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(
    new CustomEvent(CANVAS_UPDATED, { detail: { dashboardId }, bubbles: false })
  );
}

function isValidWidget(x: unknown): x is { id: string; title: string; type: string; colSpan: number; rowSpan: number } {
  if (typeof x !== 'object' || x === null) {
    return false;
  }
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    typeof o.type === 'string' &&
    typeof o.colSpan === 'number' &&
    typeof o.rowSpan === 'number' &&
    o.colSpan >= 1 &&
    o.colSpan <= 4 &&
    o.rowSpan >= MIN_ROW_SPAN &&
    o.rowSpan <= MAX_ROW_SPAN
  );
}

/** Validates each entry like session storage; returns null if any item is invalid. */
function normalizeWidgetsFromUnknownArray(items: unknown[]): Widget[] | null {
  const out: Widget[] = [];
  for (const item of items) {
    if (!isValidWidget(item)) {
      return null;
    }
    const ext = item as { navigateTo?: unknown; footerText?: unknown };
    const w: Widget = {
      id: item.id,
      title: item.title,
      type: item.type as Widget['type'],
      colSpan: item.colSpan as Widget['colSpan'],
      rowSpan: clampRowSpan(item.rowSpan),
      navigateTo: typeof ext.navigateTo === 'string' ? ext.navigateTo : undefined,
      footerText: typeof ext.footerText === 'string' ? ext.footerText : undefined
    };
    out.push(w);
  }
  return out;
}

/** Shape produced by “Copy JSON config” (homepage, hub row, detail kebab). */
export type DashboardClipboardPayload = {
  dashboardId: string;
  name: string;
  widgets: Widget[];
};

export function serializeDashboardConfigPayload(payload: DashboardClipboardPayload): string {
  return JSON.stringify(payload, null, 2);
}

/**
 * Parses JSON from the import modal / pasted clipboard. Accepts the exported object
 * `{ dashboardId, name, widgets }` or a raw `widgets` array for compatibility.
 */
export function parseDashboardConfigClipboardText(text: string): { ok: true; widgets: Widget[] } | { ok: false; message: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, message: 'This text is not valid JSON. Paste the complete JSON config.' };
  }

  if (Array.isArray(data)) {
    const widgets = normalizeWidgetsFromUnknownArray(data);
    if (!widgets) {
      return { ok: false, message: 'One or more widgets in the configuration are invalid.' };
    }
    return {
      ok: true,
      widgets: widgets.map((widget) => ({
        ...widget,
        rowSpan: migrateLegacyRowSpan(widget.rowSpan)
      }))
    };
  }

  if (typeof data !== 'object' || data === null) {
    return {
      ok: false,
      message: 'Configuration must be a JSON object with a widgets array (use Copy JSON config from a dashboard).'
    };
  }

  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.widgets)) {
    return {
      ok: false,
      message: 'Missing widgets array. Paste the exported configuration from Copy JSON config.'
    };
  }

  const widgets = normalizeWidgetsFromUnknownArray(o.widgets);
  if (!widgets) {
    return { ok: false, message: 'One or more widgets in the configuration are invalid.' };
  }
  return {
    ok: true,
    widgets: widgets.map((widget) => ({
      ...widget,
      rowSpan: migrateLegacyRowSpan(widget.rowSpan)
    }))
  };
}

/** Merges stored widgets with the catalog so definitions stay current; layout (span) comes from storage. */
export function mergeCanvasWidgetsWithCatalog(stored: Widget[], catalog: Widget[] = createHomepageWidgetClones()): Widget[] {
  const byId = new Map(catalog.map((w) => [w.id, w] as const));
  return stored.map((s) => {
    const c = byId.get(s.id);
    if (!c) {
      return s;
    }
    return {
      ...c,
      colSpan: s.colSpan,
      rowSpan: s.rowSpan,
      title: s.title || c.title
    };
  });
}

/** Session-backed layout, or the built-in console-default layout when applicable. */
export function resolveDashboardCanvasWidgets(row: HubRow): Widget[] | null {
  if (isConsoleDefaultHubRow(row)) {
    return getConsoleDefaultWidgets();
  }
  return readDashboardCanvasWidgets(row.id);
}

/** Parses stored canvas JSON (legacy array or versioned object). */
function parseStoredCanvas(raw: string): { layoutVersion: number; widgets: unknown[] } | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return { layoutVersion: 1, widgets: parsed };
    }
    if (typeof parsed === 'object' && parsed !== null) {
      const o = parsed as Record<string, unknown>;
      if (Array.isArray(o.widgets)) {
        const layoutVersion = typeof o.v === 'number' ? o.v : 1;
        return { layoutVersion, widgets: o.widgets };
      }
    }
    return null;
  } catch {
    return null;
  }
}

function normalizeStoredWidgets(items: unknown[], layoutVersion: number): Widget[] | null {
  const widgets = normalizeWidgetsFromUnknownArray(items);
  if (!widgets) {
    return null;
  }
  if (layoutVersion >= CANVAS_LAYOUT_VERSION) {
    return widgets;
  }
  return widgets.map((widget) => ({
    ...widget,
    rowSpan: migrateLegacyRowSpan(widget.rowSpan)
  }));
}

export function readDashboardCanvasWidgets(dashboardId: string): Widget[] | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(storageKey(dashboardId));
    if (!raw) {
      return null;
    }
    const parsed = parseStoredCanvas(raw);
    if (!parsed || parsed.widgets.length === 0) {
      return null;
    }
    return normalizeStoredWidgets(parsed.widgets, parsed.layoutVersion);
  } catch {
    return null;
  }
}

export function writeDashboardCanvasWidgets(dashboardId: string, widgets: Widget[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serial = widgets.map((w) => ({
      id: w.id,
      title: w.title,
      type: w.type,
      colSpan: w.colSpan,
      rowSpan: w.rowSpan,
      ...(w.navigateTo ? { navigateTo: w.navigateTo } : {}),
      ...(w.footerText ? { footerText: w.footerText } : {})
    }));
    window.sessionStorage.setItem(
      storageKey(dashboardId),
      JSON.stringify({ v: CANVAS_LAYOUT_VERSION, widgets: serial })
    );
    notifyDashboardCanvasUpdated(dashboardId);
  } catch {
    // ignore
  }
}

/** Remove persisted layout for a dashboard (e.g. when the dashboard is deleted). */
export function clearDashboardCanvasWidgets(dashboardId: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.removeItem(storageKey(dashboardId));
  } catch {
    // ignore
  }
  notifyDashboardCanvasUpdated(dashboardId);
}

export function onDashboardCanvasUpdated(
  callback: (detail: { dashboardId: string } | null) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }
  const handler: EventListener = (e) => {
    const d = (e as CustomEvent<{ dashboardId: string } | undefined>).detail;
    if (d?.dashboardId) {
      callback(d);
    } else {
      callback(null);
    }
  };
  window.addEventListener(CANVAS_UPDATED, handler);
  return () => window.removeEventListener(CANVAS_UPDATED, handler);
}
