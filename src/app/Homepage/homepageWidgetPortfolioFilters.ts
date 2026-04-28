/**
 * Portfolio filter chips for the dashboard widgets help panel (best-guess tagging until product defines rules).
 */
export const WIDGET_PORTFOLIO_FILTERS = [
  { id: 'rhel', label: 'Red Hat Enterprise Linux' },
  { id: 'openshift', label: 'OpenShift' },
  { id: 'ansible', label: 'Ansible Automation Platform' },
  { id: 'subscription-services', label: 'Subscription Services' },
  { id: 'iam', label: 'Identity & Access Management' },
  { id: 'console-settings', label: 'Console Settings' },
  { id: 'other', label: 'Other' }
] as const;

export type WidgetPortfolioFilterId = (typeof WIDGET_PORTFOLIO_FILTERS)[number]['id'];

/** Which portfolio tags apply to each catalog widget id (widget may match multiple filters). */
export const HOMEPAGE_WIDGET_PORTFOLIO_TAGS: Readonly<Record<string, readonly WidgetPortfolioFilterId[]>> = {
  events: ['other'],
  rhel: ['rhel'],
  openshift: ['openshift'],
  ansible: ['ansible'],
  'red-hat-ai': ['openshift', 'other'],
  'image-builder': ['rhel'],
  'explore-capabilities': ['other'],
  'quay-io': ['openshift'],
  integrations: ['console-settings'],
  subscriptions: ['subscription-services'],
  'my-favorite-services': ['other'],
  'recently-visited': ['other'],
  'support-cases': ['other'],
  'bookmarked-learning-resources': ['other'],
  'recent-clusters': ['openshift'],
  'openshift-subscription-usage': ['openshift', 'subscription-services'],
  'rhel-subscription-usage': ['rhel', 'subscription-services'],
  'ansible-subscription-usage': ['ansible', 'subscription-services'],
  'openshift-cost-management': ['openshift'],
  'cluster-status': ['openshift'],
  'my-account': ['iam'],
  'advisor-recommendations': ['rhel'],
  vulnerabilities: ['rhel', 'openshift'],
  'red-hat-satellite': ['rhel'],
  'activation-keys': ['subscription-services'],
  manifests: ['subscription-services'],
  'simple-content-access-sca': ['subscription-services']
};

export function createInitialPortfolioFilterState(): Record<string, boolean> {
  return Object.fromEntries(WIDGET_PORTFOLIO_FILTERS.map((f) => [f.id, false]));
}

export function getPortfolioFilterLabel(filterId: string): string {
  const row = WIDGET_PORTFOLIO_FILTERS.find((f) => f.id === filterId);
  return row?.label ?? filterId;
}

/**
 * When no filters are selected, returns `widgets` unchanged.
 * When one or more filters are selected, keeps widgets that match **any** selected tag (OR).
 */
export function filterWidgetsByPortfolioTags<T extends { id: string }>(
  widgets: T[],
  selectedFilterIds: ReadonlySet<string>
): T[] {
  if (selectedFilterIds.size === 0) {
    return widgets;
  }
  return widgets.filter((w) => {
    const tags = HOMEPAGE_WIDGET_PORTFOLIO_TAGS[w.id];
    if (!tags?.length) {
      return false;
    }
    return tags.some((t) => selectedFilterIds.has(t));
  });
}
