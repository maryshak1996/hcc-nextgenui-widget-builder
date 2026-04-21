export interface HubRow {
  id: string;
  name: string;
  description: string;
  lastModified: string;
}

/** Placeholder list — replace with API data later */
export const DASHBOARD_HUB_ROWS: HubRow[] = [
  {
    id: '1',
    name: 'Operations overview',
    description: 'Key metrics and service health across your workspace.',
    lastModified: 'Apr 18, 2026'
  },
  {
    id: '2',
    name: 'Cost insights',
    description: 'Spend trends and allocation views.',
    lastModified: 'Apr 10, 2026'
  },
  {
    id: '3',
    name: 'Security posture',
    description: 'Policy compliance and vulnerability summaries.',
    lastModified: 'Mar 28, 2026'
  }
];

export function getDashboardById(dashboardId: string): HubRow | undefined {
  return DASHBOARD_HUB_ROWS.find((row) => row.id === dashboardId);
}
