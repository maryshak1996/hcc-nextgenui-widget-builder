export interface HubRow {
  id: string;
  name: string;
  /** In-canvas hero title. Snapshots `name` at first persist; can diverge from `name` after edits. */
  canvasTitle?: string;
  description: string;
  lastModified: string;
  /** When true, this dashboard is the user’s console homepage (at most one). */
  isHomepage?: boolean;
  /**
   * Product-provided console homepage dashboard (layout is code-defined, not session storage).
   * Cannot be renamed, edited on-canvas, or deleted; users override by setting another homepage.
   */
  isConsoleDefault?: boolean;
  /**
   * Other system-maintained dashboards (layout is code-defined, not session storage).
   * Cannot be renamed, edited on-canvas, or deleted; users may duplicate to customize.
   */
  isPrebuilt?: boolean;
}

export const DASHBOARD_DUPLICATE_NAME_ERROR = 'A dashboard with this name already exists.';

/** User-created dashboards — replace with API data later. System-maintained rows come from prebuiltDashboards. */
export const DASHBOARD_HUB_ROWS: HubRow[] = [];

/** Legacy mock placeholder ids — stripped when loading session storage. */
export const LEGACY_PLACEHOLDER_DASHBOARD_IDS: readonly string[] = ['1', '2', '3'];

export function getDashboardById(dashboardId: string): HubRow | undefined {
  return DASHBOARD_HUB_ROWS.find((row) => row.id === dashboardId);
}
