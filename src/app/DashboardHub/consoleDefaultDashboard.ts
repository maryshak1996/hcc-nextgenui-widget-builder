import type { HubRow } from '@app/DashboardHub/dashboardHubMockData';
import { createHomepageWidgetClones } from '@app/Homepage/homepageWidgetCatalog';
import type { Widget } from '@app/Homepage/widgetTypes';

export const CONSOLE_DEFAULT_DASHBOARD_ID = 'd-console-default';

/** Shown in the homepage / built-in dashboard body (name in hub & switcher stays “Console default”). */
export const CONSOLE_DEFAULT_BODY_TITLE = 'Welcome to the Hybrid Cloud Console';

/**
 * Widget order for the built-in console homepage (grid auto-flow: dense).
 * RHEL → OpenShift → Ansible left-to-right above Explore; My account above Recently visited.
 */
const CONSOLE_DEFAULT_WIDGET_IDS: readonly string[] = [
  'rhel',
  'openshift',
  'ansible',
  'explore-capabilities',
  'my-account',
  'recently-visited'
];

export function isConsoleDefaultDashboardId(id: string): boolean {
  return id === CONSOLE_DEFAULT_DASHBOARD_ID;
}

export function isConsoleDefaultHubRow(row: HubRow | undefined): boolean {
  return Boolean(row?.isConsoleDefault || (row && isConsoleDefaultDashboardId(row.id)));
}

export function createConsoleDefaultHubRow(overrides?: Partial<HubRow>): HubRow {
  return {
    id: CONSOLE_DEFAULT_DASHBOARD_ID,
    name: 'Console default',
    canvasTitle: 'Console default',
    description:
      'A built-in dashboard for every user. Set another dashboard as your homepage to replace it; this layout cannot be edited.',
    lastModified: 'Built-in',
    isConsoleDefault: true,
    ...overrides
  };
}

const CONSOLE_DEFAULT_WIDGET_TITLES: Partial<Record<string, string>> = {
  openshift: 'OpenShift',
  rhel: 'RHEL',
  ansible: 'Ansible'
};

/** Canonical widget layout (not read from session storage). */
export function getConsoleDefaultWidgets(): Widget[] {
  const all = createHomepageWidgetClones();
  const byId = new Map(all.map((w) => [w.id, w] as const));
  return CONSOLE_DEFAULT_WIDGET_IDS.map((id) => {
    const w = byId.get(id);
    if (!w) {
      throw new Error(`Console default dashboard references unknown widget id: ${id}`);
    }
    const title = CONSOLE_DEFAULT_WIDGET_TITLES[id] ?? w.title;
    return { ...w, title };
  });
}

/**
 * Ensures the console-default row exists and acts as homepage when the user has not chosen another.
 */
export function mergeConsoleDefaultIntoRows(rows: HubRow[]): HubRow[] {
  const withoutConsole = rows.filter((r) => r.id !== CONSOLE_DEFAULT_DASHBOARD_ID);
  const hasHome = withoutConsole.some((r) => r.isHomepage === true);
  const consoleRow = createConsoleDefaultHubRow(hasHome ? {} : { isHomepage: true });
  return [consoleRow, ...withoutConsole];
}
