import type { PinDashboardServiceTypeId } from '@app/DashboardHub/pinDashboardServiceTypes';
import { PIN_DASHBOARD_SERVICE_TYPES } from '@app/DashboardHub/pinDashboardServiceTypes';

export const PINNED_DASHBOARDS_STORAGE_KEY = 'hcc-pinned-dashboards-by-service';
export const PINNED_DASHBOARDS_CHANGED_EVENT = 'pinned-dashboards-changed';

export type PinnedDashboardEntry = {
  dashboardId: string;
  dashboardName: string;
};

export type PinnedDashboardsByServiceType = Record<PinDashboardServiceTypeId, PinnedDashboardEntry[]>;

function emptyPinnedDashboards(): PinnedDashboardsByServiceType {
  return PIN_DASHBOARD_SERVICE_TYPES.reduce((accumulator, service) => {
    accumulator[service.id] = [];
    return accumulator;
  }, {} as PinnedDashboardsByServiceType);
}

function isPinnedDashboardEntry(value: unknown): value is PinnedDashboardEntry {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return typeof entry.dashboardId === 'string' && typeof entry.dashboardName === 'string';
}

function normalizePinnedDashboards(value: unknown): PinnedDashboardsByServiceType {
  const next = emptyPinnedDashboards();
  if (typeof value !== 'object' || value === null) {
    return next;
  }
  const record = value as Record<string, unknown>;
  for (const service of PIN_DASHBOARD_SERVICE_TYPES) {
    const rawEntries = record[service.id];
    if (!Array.isArray(rawEntries)) {
      continue;
    }
    const entries = rawEntries.filter(isPinnedDashboardEntry);
    const seen = new Set<string>();
    next[service.id] = entries.filter((entry) => {
      if (seen.has(entry.dashboardId)) {
        return false;
      }
      seen.add(entry.dashboardId);
      return true;
    });
  }
  return next;
}

export function readPinnedDashboardsFromStorage(): PinnedDashboardsByServiceType {
  if (typeof window === 'undefined') {
    return emptyPinnedDashboards();
  }
  try {
    const raw = window.sessionStorage.getItem(PINNED_DASHBOARDS_STORAGE_KEY);
    if (!raw) {
      return emptyPinnedDashboards();
    }
    return normalizePinnedDashboards(JSON.parse(raw));
  } catch {
    return emptyPinnedDashboards();
  }
}

export function writePinnedDashboardsToStorage(next: PinnedDashboardsByServiceType): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(PINNED_DASHBOARDS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(PINNED_DASHBOARDS_CHANGED_EVENT));
  } catch {
    // ignore storage failures in prototype
  }
}

export function syncDashboardPins(
  current: PinnedDashboardsByServiceType,
  dashboardId: string,
  dashboardName: string,
  serviceTypeIds: PinDashboardServiceTypeId[]
): PinnedDashboardsByServiceType {
  const next = { ...current };
  const selected = new Set(serviceTypeIds);
  const entry: PinnedDashboardEntry = { dashboardId, dashboardName };

  for (const service of PIN_DASHBOARD_SERVICE_TYPES) {
    const existing = [...(next[service.id] ?? [])];
    const index = existing.findIndex((item) => item.dashboardId === dashboardId);
    const shouldBePinned = selected.has(service.id);

    if (shouldBePinned && index < 0) {
      existing.push(entry);
    } else if (shouldBePinned && index >= 0) {
      existing[index] = entry;
    } else if (!shouldBePinned && index >= 0) {
      existing.splice(index, 1);
    }

    next[service.id] = existing;
  }

  return next;
}

export function removeDashboardPin(
  current: PinnedDashboardsByServiceType,
  dashboardId: string,
  serviceTypeId: PinDashboardServiceTypeId
): PinnedDashboardsByServiceType {
  const next = { ...current };
  next[serviceTypeId] = (next[serviceTypeId] ?? []).filter((entry) => entry.dashboardId !== dashboardId);
  return next;
}

export function getPinnedServiceTypesForDashboard(
  pinnedByServiceType: PinnedDashboardsByServiceType,
  dashboardId: string
): PinDashboardServiceTypeId[] {
  return PIN_DASHBOARD_SERVICE_TYPES.filter((service) =>
    (pinnedByServiceType[service.id] ?? []).some((entry) => entry.dashboardId === dashboardId)
  ).map((service) => service.id);
}
