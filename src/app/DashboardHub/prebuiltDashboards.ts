import type { HubRow } from '@app/DashboardHub/dashboardHubMockData';
import { createHomepageWidgetClones } from '@app/Homepage/homepageWidgetCatalog';
import { type ColumnSpan, type RowSpan, type Widget } from '@app/Homepage/widgetTypes';

export const PREBUILT_DASHBOARD_IDS = {
  CONSOLE_DEFAULT: 'd-console-default',
  ANSIBLE: 'd-prebuilt-ansible',
  OPENSHIFT: 'd-prebuilt-openshift',
  RHEL: 'd-prebuilt-rhel',
  SECURITY: 'd-prebuilt-security',
  GENERAL_ADMIN: 'd-prebuilt-general-admin'
} as const;

/** @deprecated Use PREBUILT_DASHBOARD_IDS.CONSOLE_DEFAULT */
export const CONSOLE_DEFAULT_DASHBOARD_ID = PREBUILT_DASHBOARD_IDS.CONSOLE_DEFAULT;

/** Shown in the homepage / built-in console-default body (hub name stays “Console default”). */
export const CONSOLE_DEFAULT_BODY_TITLE = 'Welcome to the Hybrid Cloud Console';

interface PrebuiltDashboardDefinition {
  id: string;
  name: string;
  description: string;
  canvasTitle?: string;
  isConsoleDefault?: boolean;
  widgetIds: readonly string[];
  widgetSizes?: Partial<Record<string, { colSpan: ColumnSpan; rowSpan: RowSpan }>>;
  widgetTitles?: Partial<Record<string, string>>;
  widgetDefaultProductTabs?: Partial<Record<string, 'rhel' | 'openshift'>>;
  /** Widget ids that should auto-fit row span to natural content height on first paint. */
  autoSizeWidgetIds?: readonly string[];
}

/**
 * Widget order for the built-in console homepage (grid auto-flow: first-fit in DOM order).
 *
 * 4-column layout:
 * - Cols 1–3: RHEL | Ansible | OpenShift, then Subscriptions (3-wide), then Events (3-wide)
 * - Col 4: My account (top), Recently visited (below)
 */
const CONSOLE_DEFAULT_WIDGET_IDS: readonly string[] = [
  'rhel',
  'ansible',
  'openshift',
  'subscriptions',
  'events',
  'my-account',
  'recently-visited'
];

const CONSOLE_DEFAULT_WIDGET_SIZES: Partial<Record<string, { colSpan: ColumnSpan; rowSpan: RowSpan }>> = {
  rhel: { colSpan: 1, rowSpan: 4 },
  ansible: { colSpan: 1, rowSpan: 4 },
  openshift: { colSpan: 1, rowSpan: 4 },
  subscriptions: { colSpan: 3, rowSpan: 4 },
  events: { colSpan: 3, rowSpan: 7 },
  'my-account': { colSpan: 1, rowSpan: 5 },
  'recently-visited': { colSpan: 1, rowSpan: 6 }
};

const CONSOLE_DEFAULT_WIDGET_TITLES: Partial<Record<string, string>> = {
  openshift: 'OpenShift',
  rhel: 'RHEL',
  ansible: 'Ansible'
};

/**
 * Ansible Dashboard — 4-column first-fit (see product screenshot).
 * Left (2 cols): Ansible · Ansible subscription usage · Support cases.
 * Right (2 cols): My account + Recently visited · Events · Subscriptions.
 */
const ANSIBLE_DASHBOARD_WIDGET_IDS: readonly string[] = [
  'ansible',
  'my-account',
  'recently-visited',
  'ansible-subscription-usage',
  'events',
  'support-cases',
  'subscriptions'
];

const ANSIBLE_DASHBOARD_WIDGET_SIZES: Partial<Record<string, { colSpan: ColumnSpan; rowSpan: RowSpan }>> = {
  ansible: { colSpan: 2, rowSpan: 4 },
  'my-account': { colSpan: 1, rowSpan: 5 },
  'recently-visited': { colSpan: 1, rowSpan: 5 },
  'ansible-subscription-usage': { colSpan: 2, rowSpan: 6 },
  events: { colSpan: 2, rowSpan: 7 },
  'support-cases': { colSpan: 2, rowSpan: 8 },
  subscriptions: { colSpan: 2, rowSpan: 6 }
};

const ANSIBLE_DASHBOARD_WIDGET_TITLES: Partial<Record<string, string>> = {
  ansible: 'Ansible'
};

/**
 * OpenShift Dashboard — 4-column first-fit (see product screenshot).
 * Row 1: OpenShift · Cluster status · Recent clusters (2).
 * Row 2: Vulnerabilities · Advisor · My account · Recently visited.
 * Row 3: OpenShift subscription usage (2, under my account + recently visited) · Cost management (2).
 * Row 4: Support cases (2) · Subscriptions (2).
 */
const OPENSHIFT_DASHBOARD_WIDGET_IDS: readonly string[] = [
  'openshift',
  'cluster-status',
  'recent-clusters',
  'vulnerabilities',
  'advisor-recommendations',
  'my-account',
  'recently-visited',
  'openshift-subscription-usage',
  'openshift-cost-management',
  'support-cases',
  'subscriptions'
];

const OPENSHIFT_DASHBOARD_WIDGET_SIZES: Partial<Record<string, { colSpan: ColumnSpan; rowSpan: RowSpan }>> = {
  openshift: { colSpan: 1, rowSpan: 4 },
  'cluster-status': { colSpan: 1, rowSpan: 5 },
  'recent-clusters': { colSpan: 2, rowSpan: 6 },
  vulnerabilities: { colSpan: 1, rowSpan: 6 },
  'advisor-recommendations': { colSpan: 1, rowSpan: 6 },
  'my-account': { colSpan: 1, rowSpan: 5 },
  'recently-visited': { colSpan: 1, rowSpan: 5 },
  'openshift-subscription-usage': { colSpan: 2, rowSpan: 6 },
  'openshift-cost-management': { colSpan: 2, rowSpan: 6 },
  'support-cases': { colSpan: 2, rowSpan: 8 },
  subscriptions: { colSpan: 2, rowSpan: 6 }
};

const OPENSHIFT_DASHBOARD_WIDGET_DEFAULT_PRODUCT_TABS: Partial<Record<string, 'rhel' | 'openshift'>> = {
  'advisor-recommendations': 'openshift',
  vulnerabilities: 'openshift'
};

const OPENSHIFT_DASHBOARD_WIDGET_TITLES: Partial<Record<string, string>> = {
  openshift: 'OpenShift'
};

/**
 * RHEL Dashboard — 4-column first-fit (see product screenshot).
 * Col 1: RHEL · My account · Recently visited.
 * Cols 2–3: RHEL subscription usage (2) · Satellite · Advisor · Events (2, under advisor + image builder).
 * Col 4: Vulnerabilities · Image Builder.
 * Bottom: Subscriptions (2, under recently visited + satellite).
 */
const RHEL_DASHBOARD_WIDGET_IDS: readonly string[] = [
  'rhel',
  'rhel-subscription-usage',
  'vulnerabilities',
  'my-account',
  'red-hat-satellite',
  'advisor-recommendations',
  'image-builder',
  'events',
  'recently-visited',
  'subscriptions'
];

const RHEL_DASHBOARD_WIDGET_SIZES: Partial<Record<string, { colSpan: ColumnSpan; rowSpan: RowSpan }>> = {
  rhel: { colSpan: 1, rowSpan: 4 },
  'rhel-subscription-usage': { colSpan: 2, rowSpan: 6 },
  vulnerabilities: { colSpan: 1, rowSpan: 6 },
  'my-account': { colSpan: 1, rowSpan: 5 },
  'red-hat-satellite': { colSpan: 1, rowSpan: 9 },
  'advisor-recommendations': { colSpan: 1, rowSpan: 6 },
  'image-builder': { colSpan: 1, rowSpan: 6 },
  'recently-visited': { colSpan: 1, rowSpan: 6 },
  events: { colSpan: 2, rowSpan: 7 },
  subscriptions: { colSpan: 2, rowSpan: 6 }
};

const RHEL_DASHBOARD_WIDGET_TITLES: Partial<Record<string, string>> = {
  rhel: 'RHEL'
};

/**
 * Security Dashboard — 4-column first-fit (see product screenshot).
 * Top: Vulnerabilities (4).
 * Col 1: Advisor · SCA.
 * Cols 2–3: Cluster status (2) · Events (2) · Support cases (2).
 * Col 4: Activation keys · Recently visited · Quay.io · My account.
 */
const SECURITY_DASHBOARD_WIDGET_IDS: readonly string[] = [
  'vulnerabilities',
  'advisor-recommendations',
  'cluster-status',
  'activation-keys',
  'events',
  'recently-visited',
  'quay-io',
  'simple-content-access-sca',
  'support-cases',
  'my-account'
];

const SECURITY_DASHBOARD_WIDGET_SIZES: Partial<Record<string, { colSpan: ColumnSpan; rowSpan: RowSpan }>> = {
  vulnerabilities: { colSpan: 4, rowSpan: 4 },
  'advisor-recommendations': { colSpan: 1, rowSpan: 6 },
  'cluster-status': { colSpan: 2, rowSpan: 5 },
  'activation-keys': { colSpan: 1, rowSpan: 6 },
  'recently-visited': { colSpan: 1, rowSpan: 6 },
  events: { colSpan: 2, rowSpan: 7 },
  'quay-io': { colSpan: 1, rowSpan: 5 },
  'simple-content-access-sca': { colSpan: 1, rowSpan: 6 },
  'support-cases': { colSpan: 2, rowSpan: 8 },
  'my-account': { colSpan: 1, rowSpan: 5 }
};

/**
 * General Administration Dashboard — 4-column first-fit (see product screenshot).
 * Row 1: Subscriptions (4).
 * Row 2: Activation keys · Manifests · SCA · My account.
 * Row 3: Events (2) · Integrations (2).
 * Row 4: RHEL subscription usage (2) · OpenShift subscription usage (2).
 * Row 5: Ansible subscription usage (2) · Support cases (2).
 */
const GENERAL_ADMIN_DASHBOARD_WIDGET_IDS: readonly string[] = [
  'subscriptions',
  'activation-keys',
  'manifests',
  'simple-content-access-sca',
  'my-account',
  'events',
  'integrations',
  'rhel-subscription-usage',
  'openshift-subscription-usage',
  'ansible-subscription-usage',
  'support-cases'
];

const GENERAL_ADMIN_DASHBOARD_WIDGET_SIZES: Partial<Record<string, { colSpan: ColumnSpan; rowSpan: RowSpan }>> = {
  subscriptions: { colSpan: 4, rowSpan: 4 },
  'activation-keys': { colSpan: 1, rowSpan: 6 },
  manifests: { colSpan: 1, rowSpan: 6 },
  'simple-content-access-sca': { colSpan: 1, rowSpan: 6 },
  'my-account': { colSpan: 1, rowSpan: 5 },
  events: { colSpan: 2, rowSpan: 7 },
  integrations: { colSpan: 2, rowSpan: 8 },
  'rhel-subscription-usage': { colSpan: 2, rowSpan: 8 },
  'openshift-subscription-usage': { colSpan: 2, rowSpan: 8 },
  'ansible-subscription-usage': { colSpan: 2, rowSpan: 8 },
  'support-cases': { colSpan: 2, rowSpan: 8 }
};

const PREBUILT_DASHBOARD_DEFINITIONS: readonly PrebuiltDashboardDefinition[] = [
  {
    id: PREBUILT_DASHBOARD_IDS.CONSOLE_DEFAULT,
    name: 'Console default',
    canvasTitle: 'Console default',
    description:
      'A built-in dashboard for every user. Set another dashboard as your homepage to replace it; this layout cannot be edited.',
    isConsoleDefault: true,
    widgetIds: CONSOLE_DEFAULT_WIDGET_IDS,
    widgetSizes: CONSOLE_DEFAULT_WIDGET_SIZES,
    widgetTitles: CONSOLE_DEFAULT_WIDGET_TITLES
  },
  {
    id: PREBUILT_DASHBOARD_IDS.ANSIBLE,
    name: 'Ansible Dashboard',
    description: 'High level overview of your Ansible usage on the Hybrid Cloud Console.',
    widgetIds: ANSIBLE_DASHBOARD_WIDGET_IDS,
    widgetSizes: ANSIBLE_DASHBOARD_WIDGET_SIZES,
    widgetTitles: ANSIBLE_DASHBOARD_WIDGET_TITLES
  },
  {
    id: PREBUILT_DASHBOARD_IDS.OPENSHIFT,
    name: 'OpenShift Dashboard',
    description: 'High level overview of your OpenShift usage on the Hybrid Cloud Console.',
    widgetIds: OPENSHIFT_DASHBOARD_WIDGET_IDS,
    widgetSizes: OPENSHIFT_DASHBOARD_WIDGET_SIZES,
    widgetTitles: OPENSHIFT_DASHBOARD_WIDGET_TITLES,
    widgetDefaultProductTabs: OPENSHIFT_DASHBOARD_WIDGET_DEFAULT_PRODUCT_TABS
  },
  {
    id: PREBUILT_DASHBOARD_IDS.RHEL,
    name: 'RHEL Dashboard',
    description: 'High level overview of your RHEL usage on the Hybrid Cloud Console.',
    widgetIds: RHEL_DASHBOARD_WIDGET_IDS,
    widgetSizes: RHEL_DASHBOARD_WIDGET_SIZES,
    widgetTitles: RHEL_DASHBOARD_WIDGET_TITLES
  },
  {
    id: PREBUILT_DASHBOARD_IDS.SECURITY,
    name: 'Security Dashboard',
    description:
      'An overview of security-related information and data with your Hybrid Cloud Console usage.',
    widgetIds: SECURITY_DASHBOARD_WIDGET_IDS,
    widgetSizes: SECURITY_DASHBOARD_WIDGET_SIZES,
    autoSizeWidgetIds: ['vulnerabilities']
  },
  {
    id: PREBUILT_DASHBOARD_IDS.GENERAL_ADMIN,
    name: 'General Administration Dashboard',
    description:
      'A dashboard for getting quick access to and monitoring of subscriptions management, alerting, third-party tooling configuration, and RBAC management.',
    widgetIds: GENERAL_ADMIN_DASHBOARD_WIDGET_IDS,
    widgetSizes: GENERAL_ADMIN_DASHBOARD_WIDGET_SIZES,
    autoSizeWidgetIds: ['subscriptions']
  }
];

const PREBUILT_BY_ID = new Map(PREBUILT_DASHBOARD_DEFINITIONS.map((d) => [d.id, d] as const));

function buildPrebuiltWidgets(definition: PrebuiltDashboardDefinition): Widget[] {
  const all = createHomepageWidgetClones();
  const byId = new Map(all.map((w) => [w.id, w] as const));
  return definition.widgetIds.map((id) => {
    const w = byId.get(id);
    if (!w) {
      throw new Error(`Prebuilt dashboard "${definition.name}" references unknown widget id: ${id}`);
    }
    const title = definition.widgetTitles?.[id] ?? w.title;
    const size = definition.widgetSizes?.[id];
    const defaultProductTab = definition.widgetDefaultProductTabs?.[id];
    const sized = size ? { ...w, title, colSpan: size.colSpan, rowSpan: size.rowSpan } : { ...w, title };
    return defaultProductTab ? { ...sized, defaultProductTab } : sized;
  });
}

export function isPrebuiltDashboardId(id: string): boolean {
  return PREBUILT_BY_ID.has(id);
}

export function isPrebuiltHubRow(row: HubRow | undefined): boolean {
  return Boolean(
    row?.isPrebuilt ||
      row?.isConsoleDefault ||
      (row && isPrebuiltDashboardId(row.id))
  );
}

export function isConsoleDefaultDashboardId(id: string): boolean {
  return id === PREBUILT_DASHBOARD_IDS.CONSOLE_DEFAULT;
}

export function isConsoleDefaultHubRow(row: HubRow | undefined): boolean {
  return Boolean(row?.isConsoleDefault || (row && isConsoleDefaultDashboardId(row.id)));
}

export function getPrebuiltDashboardName(id: string): string | undefined {
  return PREBUILT_BY_ID.get(id)?.name;
}

export function createPrebuiltHubRow(
  definition: PrebuiltDashboardDefinition,
  overrides?: Partial<HubRow>
): HubRow {
  return {
    id: definition.id,
    name: definition.name,
    canvasTitle: definition.canvasTitle ?? definition.name,
    description: definition.description,
    lastModified: 'System-maintained',
    isConsoleDefault: definition.isConsoleDefault ? true : undefined,
    isPrebuilt: definition.isConsoleDefault ? undefined : true,
    ...overrides
  };
}

/** @deprecated Use createPrebuiltHubRow with console definition */
export function createConsoleDefaultHubRow(overrides?: Partial<HubRow>): HubRow {
  const def = PREBUILT_BY_ID.get(PREBUILT_DASHBOARD_IDS.CONSOLE_DEFAULT);
  if (!def) {
    throw new Error('Console default dashboard definition is missing');
  }
  return createPrebuiltHubRow(def, overrides);
}

export function getPrebuiltDashboardWidgets(id: string): Widget[] {
  const def = PREBUILT_BY_ID.get(id);
  if (!def) {
    return [];
  }
  return buildPrebuiltWidgets(def);
}

export function getPrebuiltDashboardAutoSizeWidgetIds(id: string): readonly string[] {
  const def = PREBUILT_BY_ID.get(id);
  return def?.autoSizeWidgetIds ?? [];
}

/** Canonical widget layout for the console-default dashboard (not read from session storage). */
export function getConsoleDefaultWidgets(): Widget[] {
  return getPrebuiltDashboardWidgets(PREBUILT_DASHBOARD_IDS.CONSOLE_DEFAULT);
}

/**
 * Ensures all system-maintained dashboard rows exist. Console default acts as homepage when the user
 * has not chosen another.
 */
export function mergePrebuiltDashboardsIntoRows(rows: HubRow[]): HubRow[] {
  const prebuiltIds = new Set(PREBUILT_DASHBOARD_DEFINITIONS.map((d) => d.id));
  const withoutPrebuilt = rows.filter((r) => !prebuiltIds.has(r.id));
  const hasHome = withoutPrebuilt.some((r) => r.isHomepage === true);
  const prebuiltRows = PREBUILT_DASHBOARD_DEFINITIONS.map((def) => {
    const overrides: Partial<HubRow> = {};
    if (def.isConsoleDefault && !hasHome) {
      overrides.isHomepage = true;
    }
    return createPrebuiltHubRow(def, overrides);
  });
  return [...prebuiltRows, ...withoutPrebuilt];
}

/** @deprecated Use mergePrebuiltDashboardsIntoRows */
export function mergeConsoleDefaultIntoRows(rows: HubRow[]): HubRow[] {
  return mergePrebuiltDashboardsIntoRows(rows);
}

export function isPrebuiltDashboardName(name: string, excludeDashboardId?: string): boolean {
  const key = name.trim().toLowerCase();
  if (!key) {
    return false;
  }
  return PREBUILT_DASHBOARD_DEFINITIONS.some(
    (def) => def.id !== excludeDashboardId && def.name.trim().toLowerCase() === key
  );
}
