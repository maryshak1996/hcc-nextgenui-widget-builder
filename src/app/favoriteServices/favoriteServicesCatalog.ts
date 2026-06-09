import type { WidgetHeaderIconComponent } from '@app/Homepage/homepageWidgetHeaderIcons';
import {
  AiExperienceIcon,
  AnsibleTowerIcon,
  AttentionBellIcon,
  BellIcon,
  ClusterIcon,
  CogIcon,
  CommentsIcon,
  CreditCardIcon,
  DataSourceIcon,
  ExternalLinkAltIcon,
  KeyIcon,
  RunningIcon,
  ServerStackIcon,
  StarIcon,
  UserCheckIcon,
  UsersIcon
} from '@app/icons/rhUiIcons';

export const FAVORITE_SERVICES_EMPTY_STATE_IMAGE =
  'https://www.redhat.com/rhdc/managed-files/console-tech-stack.png';

export const FAVORITE_SERVICES_STORAGE_KEY = 'hcc-favorited-service-ids';

export const FAVORITE_SERVICES_CHANGED_EVENT = 'favorited-services-changed';

export interface FavoriteServiceEntry {
  id: string;
  label: string;
  href: string;
  bundle?: string;
  icon: WidgetHeaderIconComponent;
}

const CATEGORY_BUNDLE: Record<string, string | undefined> = {
  'Console settings': 'Settings',
  'Identity & access management (IAM)': 'IAM',
  'Red Hat Enterprise Linux': 'RHEL',
  'Red Hat OpenShift': 'OpenShift',
  'Red Hat Ansible Automation Platform': 'Ansible',
  'Subscription services': 'Subscriptions'
};

const CATEGORY_ICON: Record<string, WidgetHeaderIconComponent> = {
  'Console settings': CogIcon,
  'Identity & access management (IAM)': UsersIcon,
  'Red Hat Enterprise Linux': ServerStackIcon,
  'Red Hat OpenShift': ClusterIcon,
  'Red Hat Ansible Automation Platform': AnsibleTowerIcon,
  'Subscription services': CreditCardIcon,
  Other: ExternalLinkAltIcon
};

const SERVICE_ICON_OVERRIDES: Record<string, WidgetHeaderIconComponent> = {
  'alert-manager-settings': AttentionBellIcon,
  'console-alert-manager': AttentionBellIcon,
  'data-integration-settings': DataSourceIcon,
  'console-data-integration': DataSourceIcon,
  'event-log-settings': RunningIcon,
  'overview-settings': CogIcon,
  'console-dashboard-hub': StarIcon,
  users: UsersIcon,
  groups: UserCheckIcon,
  roles: UserCheckIcon,
  'service-accounts': KeyIcon,
  'service-accounts-item': KeyIcon,
  'user-access-item': UsersIcon,
  notifications: BellIcon,
  support: CommentsIcon,
  '60day-trial-openshift-ai': AiExperienceIcon,
  'developer-sandbox-openshift-ai': AiExperienceIcon
};

type CatalogSeed = {
  id: string;
  label: string;
  href: string;
  category: string;
};

/** Catalog entries aligned with services dropdown favoritable items. */
const FAVORITE_SERVICE_SEEDS: CatalogSeed[] = [
  { id: 'alert-manager-settings', label: 'Alert manager', href: '/alert-manager', category: 'Console settings' },
  { id: 'data-integration-settings', label: 'Data integration', href: '/data-integrations', category: 'Console settings' },
  { id: 'event-log-settings', label: 'Event log', href: '/event-log', category: 'Console settings' },
  { id: 'overview-settings', label: 'Overview', href: '/overview', category: 'Console settings' },
  { id: 'console-alert-manager', label: 'Alert manager', href: '/alert-manager', category: 'Console settings' },
  { id: 'console-data-integration', label: 'Data integration', href: '/data-integrations', category: 'Console settings' },
  { id: 'console-dashboard-hub', label: 'Dashboard hub', href: '/dashboard-hub', category: 'Console settings' },
  { id: 'preferences', label: 'Preferences', href: '/overview', category: 'Console settings' },
  { id: 'notifications', label: 'Notifications', href: '/overview', category: 'Console settings' },
  { id: 'directory-domain-services', label: 'Directory and domain services', href: '/overview', category: 'Console settings' },
  { id: 'users', label: 'Users', href: '/users', category: 'Identity & access management (IAM)' },
  { id: 'groups', label: 'Groups', href: '/groups', category: 'Identity & access management (IAM)' },
  { id: 'roles', label: 'Roles', href: '/roles', category: 'Identity & access management (IAM)' },
  { id: 'authentication-factors', label: 'Authentication factors', href: '/overview', category: 'Identity & access management (IAM)' },
  { id: 'service-accounts', label: 'Service accounts', href: '/overview', category: 'Identity & access management (IAM)' },
  { id: 'identity-provider-information', label: 'Identity provider information', href: '/overview', category: 'Identity & access management (IAM)' },
  { id: 'workspaces', label: 'Workspaces', href: '/overview', category: 'Identity & access management (IAM)' },
  { id: 'user-access-item', label: 'User access', href: '/my-user-access', category: 'Identity & access management (IAM)' },
  { id: 'service-accounts-item', label: 'Service accounts', href: '/overview', category: 'Identity & access management (IAM)' },
  { id: 'rhel-rhc', label: 'Remote host configuration (RHC)', href: '/overview', category: 'Red Hat Enterprise Linux' },
  { id: 'rhel-activation-keys', label: 'Activation keys', href: '/overview', category: 'Red Hat Enterprise Linux' },
  { id: 'rhel-registration-assistant', label: 'Registration assistant', href: '/overview', category: 'Red Hat Enterprise Linux' },
  { id: 'rhel-staleness-deletion', label: 'Staleness & deletion', href: '/overview', category: 'Red Hat Enterprise Linux' },
  { id: 'rhel-insights', label: 'Red Hat Insights', href: '/overview', category: 'Red Hat Enterprise Linux' },
  { id: 'rhel-patch', label: 'Patch management', href: '/overview', category: 'Red Hat Enterprise Linux' },
  { id: '60day-trial-openshift-ai', label: '60-day product trial | OpenShift AI', href: '/overview', category: 'Red Hat OpenShift' },
  { id: 'developer-sandbox-openshift-ai', label: 'Developer sandbox | OpenShift AI', href: '/overview', category: 'Red Hat OpenShift' },
  { id: 'openshift-clusters', label: 'OpenShift clusters', href: '/overview', category: 'Red Hat OpenShift' },
  { id: 'container-registry', label: 'Container registry', href: '/overview', category: 'Red Hat OpenShift' },
  { id: 'ansible-registration-assistant', label: 'Registration assistant', href: '/overview', category: 'Red Hat Ansible Automation Platform' },
  { id: 'automation-hub', label: 'Automation hub', href: '/overview', category: 'Red Hat Ansible Automation Platform' },
  { id: 'automation-controller', label: 'Automation controller', href: '/overview', category: 'Red Hat Ansible Automation Platform' },
  { id: 'subscriptions', label: 'Subscriptions', href: '/overview', category: 'Subscription services' },
  { id: 'billing', label: 'Billing', href: '/overview', category: 'Subscription services' },
  { id: 'documentation', label: 'Documentation', href: '/overview', category: 'Other' },
  { id: 'support', label: 'Support', href: '/overview', category: 'Other' }
];

export const FAVORITE_SERVICE_CATALOG: Record<string, FavoriteServiceEntry> = Object.fromEntries(
  FAVORITE_SERVICE_SEEDS.map(({ id, label, href, category }) => [
    id,
    {
      id,
      label,
      href,
      bundle: CATEGORY_BUNDLE[category],
      icon: SERVICE_ICON_OVERRIDES[id] ?? CATEGORY_ICON[category] ?? ExternalLinkAltIcon
    }
  ])
);

export function readFavoritedServiceIds(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }

  try {
    const raw = window.localStorage.getItem(FAVORITE_SERVICES_STORAGE_KEY);
    if (!raw) {
      return new Set();
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((id): id is string => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

export function writeFavoritedServiceIds(ids: Set<string>): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(FAVORITE_SERVICES_STORAGE_KEY, JSON.stringify(Array.from(ids)));
  window.dispatchEvent(new Event(FAVORITE_SERVICES_CHANGED_EVENT));
}

export function getFavoriteServicesForIds(ids: Iterable<string>): FavoriteServiceEntry[] {
  const seen = new Set<string>();

  return Array.from(ids)
    .map((id) => FAVORITE_SERVICE_CATALOG[id])
    .filter((entry): entry is FavoriteServiceEntry => {
      if (!entry || seen.has(entry.id)) {
        return false;
      }

      seen.add(entry.id);
      return true;
    });
}
