export type OpenshiftBundlePageConfig = {
  path: string;
  label: string;
  showPinnedDashboard?: boolean;
};

export const OPENSHIFT_BUNDLE_PAGES: readonly OpenshiftBundlePageConfig[] = [
  { path: '/openshift/overview', label: 'Overview', showPinnedDashboard: true },
  { path: '/openshift/fleet/dashboard', label: 'Dashboard' },
  { path: '/openshift/fleet/clusters', label: 'Clusters' },
  { path: '/openshift/cloud-console-settings/user-access', label: 'User Access' },
  { path: '/openshift/resources/learning-resources', label: 'Learning Resources' },
  { path: '/openshift/resources/downloads', label: 'Downloads' },
  { path: '/openshift/resources/releases', label: 'Releases' },
  { path: '/openshift/resources/assisted-installer', label: 'Assisted Installer' }
] as const;

export const OPENSHIFT_BUNDLE_PATHS = OPENSHIFT_BUNDLE_PAGES.map((page) => page.path);

type OpenshiftNavLeaf = {
  type: 'item';
  label: string;
  path: string;
};

export type OpenshiftNavGroup = {
  type: 'group';
  label: string;
  defaultExpanded: boolean;
  children: OpenshiftNavNode[];
};

export type OpenshiftNavNode = OpenshiftNavLeaf | OpenshiftNavGroup;

/** Left-nav tree aligned with the OpenShift bundle screenshot. */
export const OPENSHIFT_BUNDLE_NAV: OpenshiftNavNode[] = [
  { type: 'item', label: 'Overview', path: '/openshift/overview' },
  {
    type: 'group',
    label: 'Fleet management',
    defaultExpanded: true,
    children: [
      { type: 'item', label: 'Dashboard', path: '/openshift/fleet/dashboard' },
      { type: 'item', label: 'Clusters', path: '/openshift/fleet/clusters' },
      {
        type: 'group',
        label: 'Advisor',
        defaultExpanded: false,
        children: []
      },
      {
        type: 'group',
        label: 'Vulnerability dashboard',
        defaultExpanded: false,
        children: []
      },
      {
        type: 'group',
        label: 'Cost Management',
        defaultExpanded: false,
        children: []
      }
    ]
  },
  {
    type: 'group',
    label: 'Cloud console settings',
    defaultExpanded: true,
    children: [
      { type: 'item', label: 'User Access', path: '/openshift/cloud-console-settings/user-access' },
      {
        type: 'group',
        label: 'Notifications',
        defaultExpanded: false,
        children: []
      },
      {
        type: 'group',
        label: 'Subscriptions',
        defaultExpanded: false,
        children: []
      }
    ]
  },
  {
    type: 'group',
    label: 'Resources',
    defaultExpanded: true,
    children: [
      { type: 'item', label: 'Learning Resources', path: '/openshift/resources/learning-resources' },
      { type: 'item', label: 'Downloads', path: '/openshift/resources/downloads' },
      { type: 'item', label: 'Releases', path: '/openshift/resources/releases' },
      { type: 'item', label: 'Assisted Installer', path: '/openshift/resources/assisted-installer' }
    ]
  }
];

export function collectOpenshiftNavPaths(nodes: OpenshiftNavNode[]): string[] {
  const paths: string[] = [];
  for (const node of nodes) {
    if (node.type === 'item') {
      paths.push(node.path);
    } else {
      paths.push(...collectOpenshiftNavPaths(node.children));
    }
  }
  return paths;
}

export function isOpenshiftNavGroupActive(node: OpenshiftNavGroup, pathname: string): boolean {
  return collectOpenshiftNavPaths(node.children).includes(pathname);
}
