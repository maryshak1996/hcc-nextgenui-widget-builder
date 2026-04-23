export interface HubRow {
  id: string;
  name: string;
  /** In-canvas hero title. Snapshots `name` at first persist; can diverge from `name` after edits. */
  canvasTitle?: string;
  description: string;
  lastModified: string;
  /** When true, this dashboard is the user’s console homepage (at most one). */
  isHomepage?: boolean;
}

export const DASHBOARD_DUPLICATE_NAME_ERROR = 'A dashboard with this name already exists.';

/** Placeholder list — replace with API data later */
export const DASHBOARD_HUB_ROWS: HubRow[] = [
  {
    id: '1',
    name: 'Operations overview',
    canvasTitle: 'Operations overview',
    description: 'Key metrics and service health across your workspace.',
    lastModified: 'Apr 18, 2026'
  },
  {
    id: '2',
    name: 'Cost insights',
    canvasTitle: 'Cost insights',
    description: 'Spend trends and allocation views.',
    lastModified: 'Apr 10, 2026'
  },
  {
    id: '3',
    name: 'Security posture',
    canvasTitle: 'Security posture',
    description: 'Policy compliance and vulnerability summaries.',
    lastModified: 'Mar 28, 2026'
  }
];

export function getDashboardById(dashboardId: string): HubRow | undefined {
  return DASHBOARD_HUB_ROWS.find((row) => row.id === dashboardId);
}
