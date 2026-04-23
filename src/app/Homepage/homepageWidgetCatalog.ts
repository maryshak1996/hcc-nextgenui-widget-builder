import type { Widget } from '@app/Homepage/widgetTypes';

/**
 * Full widget bank for search and “Add widgets” (same catalog everywhere).
 * Rich body content is filled in per widget in `homepageWidgetGrid` over time;
 * others use the default placeholder in `renderHomepageWidgetContent`.
 */
export const HOMEPAGE_WIDGET_CATALOG: Readonly<Widget[]> = [
  {
    id: 'events',
    title: 'Events',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'rhel',
    title: 'Red Hat Enterprise Linux',
    type: 'product',
    colSpan: 1,
    rowSpan: 3
  },
  {
    id: 'openshift',
    title: 'Red Hat OpenShift',
    type: 'product',
    colSpan: 1,
    rowSpan: 3
  },
  {
    id: 'ansible',
    title: 'Red Hat Ansible Automation Platform',
    type: 'product',
    colSpan: 1,
    rowSpan: 3
  },
  {
    id: 'red-hat-ai',
    title: 'Red Hat AI',
    type: 'product',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'image-builder',
    title: 'Image Builder',
    type: 'product',
    colSpan: 1,
    rowSpan: 3
  },
  {
    id: 'explore-capabilities',
    title: 'Explore capabilities',
    type: 'explore-capabilities',
    colSpan: 3,
    rowSpan: 5
  },
  {
    id: 'quay-io',
    title: 'Quay.io',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'integrations',
    title: 'Integrations',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    type: 'subscriptions',
    colSpan: 4,
    rowSpan: 2
  },
  {
    id: 'my-favorite-services',
    title: 'My favorite services',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'recently-visited',
    title: 'Recently visited',
    type: 'recently-visited',
    colSpan: 1,
    rowSpan: 4
  },
  {
    id: 'support-cases',
    title: 'My support cases',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'bookmarked-learning-resources',
    title: 'Bookmarked learning resources',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'recent-clusters',
    title: 'Recent clusters',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'openshift-subscription-usage',
    title: 'OpenShift subscription usage',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'rhel-subscription-usage',
    title: 'RHEL subscription usage',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'ansible-subscription-usage',
    title: 'Ansible subscription usage',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'openshift-cost-management',
    title: 'OpenShift cost management',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'cluster-status',
    title: 'Cluster status',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'my-account',
    title: 'My account',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'advisor-recommendations',
    title: 'Advisor recommendations',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'vulnerabilities',
    title: 'Vulnerabilities',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'red-hat-satellite',
    title: 'Red Hat Satellite',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'activation-keys',
    title: 'Activation Keys',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'manifests',
    title: 'Manifests',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
  },
  {
    id: 'simple-content-access-sca',
    title: 'Simple content access (SCA)',
    type: 'placeholder',
    colSpan: 1,
    rowSpan: 2
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

const catalogById: Map<string, Widget> = new Map(HOMEPAGE_WIDGET_CATALOG.map((w) => [w.id, w]));

export function createHomepageWidgetClones(): Widget[] {
  return HOMEPAGE_WIDGET_CATALOG.map((w) => ({ ...w }));
}

export function createDefaultHomepageLayout(): { gridWidgets: Widget[]; bankWidgets: Widget[] } {
  const all = createHomepageWidgetClones();
  const grid = DEFAULT_HOMEPAGE_WIDGET_IDS.map((id) => catalogById.get(id)).filter(
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
