import type { Widget } from '@app/Homepage/widgetTypes';
import { createHomepageWidgetClones } from '@app/Homepage/homepageWidgetCatalog';
import { getConsoleDefaultWidgets, isConsoleDefaultHubRow } from '@app/DashboardHub/consoleDefaultDashboard';
import type { HubRow } from '@app/DashboardHub/dashboardHubMockData';

const STORAGE_PREFIX = 'hcc-dashboard-canvas-';

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
    o.rowSpan >= 1 &&
    o.rowSpan <= 6
  );
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

export function readDashboardCanvasWidgets(dashboardId: string): Widget[] | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(storageKey(dashboardId));
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }
    const out: Widget[] = [];
    for (const item of parsed) {
      if (!isValidWidget(item)) {
        return null;
      }
      const ext = item as { navigateTo?: unknown; footerText?: unknown };
      const w: Widget = {
        id: item.id,
        title: item.title,
        type: item.type as Widget['type'],
        colSpan: item.colSpan as Widget['colSpan'],
        rowSpan: item.rowSpan as Widget['rowSpan'],
        navigateTo: typeof ext.navigateTo === 'string' ? ext.navigateTo : undefined,
        footerText: typeof ext.footerText === 'string' ? ext.footerText : undefined
      };
      out.push(w);
    }
    return out;
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
    window.sessionStorage.setItem(storageKey(dashboardId), JSON.stringify(serial));
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
