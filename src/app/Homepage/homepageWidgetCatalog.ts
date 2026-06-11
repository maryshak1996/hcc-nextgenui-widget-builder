import type { ColumnSpan, Widget } from '@app/Homepage/widgetTypes';

/** Default dashboard column width when a widget is added (user can resize afterward). */
const DEFAULT_THREE_COL_WIDGET_IDS = new Set<string>(['explore-capabilities', 'subscriptions']);

const DEFAULT_TWO_COL_WIDGET_IDS = new Set<string>([
  'events',
  'integrations',
  'support-cases',
  'recent-clusters',
  'openshift-cost-management',
  'openshift-subscription-usage',
  'rhel-subscription-usage',
  'ansible-subscription-usage'
]);

export function getDefaultDashboardWidgetColSpan(widgetId: string): ColumnSpan {
  if (DEFAULT_THREE_COL_WIDGET_IDS.has(widgetId)) {
    return 3;
  }
  if (DEFAULT_TWO_COL_WIDGET_IDS.has(widgetId)) {
    return 2;
  }
  return 1;
}

/**
 * Full widget bank for search and “Add widgets” (same catalog everywhere).
 * Rich body content is filled in per widget in `homepageWidgetGrid` over time;
 * others use the default placeholder in `renderHomepageWidgetContent`.
 */
export const HOMEPAGE_WIDGET_CATALOG: Readonly<Widget[]> = [
  {
    id: 'events',
    title: 'Events',
    type: 'events',
    colSpan: 2,
    rowSpan: 4
  },
  {
    id: 'rhel',
    title: 'Red Hat Enterprise Linux',
    type: 'product',
    colSpan: 1,
    rowSpan: 6
  },
  {
    id: 'openshift',
    title: 'Red Hat OpenShift',
    type: 'product',
    colSpan: 1,
    rowSpan: 6
  },
  {
    id: 'ansible',
    title: 'Red Hat Ansible Automation Platform',
    type: 'product',
    colSpan: 1,
    rowSpan: 6
  },
  {
    id: 'red-hat-ai',
    title: 'Red Hat AI',
    type: 'product',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'image-builder',
    title: 'Image Builder',
    type: 'product',
    colSpan: 1,
    rowSpan: 6
  },
  {
    id: 'explore-capabilities',
    title: 'Explore capabilities',
    type: 'explore-capabilities',
    colSpan: 3,
    rowSpan: 10
  },
  {
    id: 'quay-io',
    title: 'Quay.io',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'integrations',
    title: 'Integrations',
    type: 'integrations',
    colSpan: 2,
    rowSpan: 4
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    type: 'subscriptions',
    colSpan: 3,
    rowSpan: 4
  },
  {
    id: 'my-favorite-services',
    title: 'My favorite services',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'recently-visited',
    title: 'Recently visited',
    type: 'recently-visited',
    colSpan: 1,
    rowSpan: 8
  },
  {
    id: 'support-cases',
    title: 'My support cases',
    type: 'placeholder',
    colSpan: 2,
    rowSpan: 4
  },
  {
    id: 'bookmarked-learning-resources',
    title: 'Bookmarked learning resources',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'recent-clusters',
    title: 'Recent clusters',
    type: 'placeholder',
    colSpan: 2,
    rowSpan: 4
  },
  {
    id: 'openshift-subscription-usage',
    title: 'OpenShift subscription usage',
    type: 'placeholder',
    colSpan: 2,
    rowSpan: 4
  },
  {
    id: 'rhel-subscription-usage',
    title: 'RHEL subscription usage',
    type: 'placeholder',
    colSpan: 2,
    rowSpan: 4
  },
  {
    id: 'ansible-subscription-usage',
    title: 'Ansible subscription usage',
    type: 'placeholder',
    colSpan: 2,
    rowSpan: 4
  },
  {
    id: 'openshift-cost-management',
    title: 'OpenShift cost management',
    type: 'placeholder',
    colSpan: 2,
    rowSpan: 4
  },
  {
    id: 'cluster-status',
    title: 'Cluster status',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'my-account',
    title: 'My account',
    type: 'my-account',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'advisor-recommendations',
    title: 'Advisor recommendations',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'vulnerabilities',
    title: 'Vulnerabilities',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'red-hat-satellite',
    title: 'Red Hat Satellite',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'activation-keys',
    title: 'Activation keys',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'manifests',
    title: 'Subscriptions manifests',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'simple-content-access-sca',
    title: 'Simple content access (SCA)',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 4
  }
];

/** Shown on the grid first; the rest of the catalog starts in the add-widgets bank. */
export const DEFAULT_HOMEPAGE_WIDGET_IDS: readonly string[] = [
  'recently-visited',
  'explore-capabilities',
  'openshift',
  'rhel',
  'ansible'
];

export function createHomepageWidgetClones(): Widget[] {
  return HOMEPAGE_WIDGET_CATALOG.map((w) => ({
    ...w,
    colSpan: getDefaultDashboardWidgetColSpan(w.id)
  }));
}

export function createDefaultHomepageLayout(): { gridWidgets: Widget[]; bankWidgets: Widget[] } {
  const all = createHomepageWidgetClones();
  const clonesById = new Map(all.map((w) => [w.id, w] as const));
  const grid = DEFAULT_HOMEPAGE_WIDGET_IDS.map((id) => clonesById.get(id)).filter(
    (w): w is Widget => w !== undefined
  );
  const gridId = new Set(grid.map((w) => w.id));
  const bank = all.filter((w) => !gridId.has(w.id));
  return { gridWidgets: grid, bankWidgets: bank };
}

/** One shared layout for Homepage `useState` init (avoids two independent splits). */
let initialHomepageLayout: { gridWidgets: Widget[]; bankWidgets: Widget[] } | null = null;
export function getInitialHomepageLayout() {
  if (!initialHomepageLayout) {
    initialHomepageLayout = createDefaultHomepageLayout();
  }
  return initialHomepageLayout;
}
