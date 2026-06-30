import {
  PIN_DASHBOARD_SERVICE_TYPES,
  type PinDashboardServiceTypeId
} from '@app/DashboardHub/pinDashboardServiceTypes';
import { OPENSHIFT_BUNDLE_PATHS } from '@app/OpenShift/openshiftBundleNavigation';

export { OPENSHIFT_BUNDLE_PATHS };

/** Existing console bundle labels (aligned with favoriteServicesCatalog). */
export const PIN_SERVICE_TYPE_BUNDLE_LABEL: Record<PinDashboardServiceTypeId, string> = {
  'core-console-settings': 'Settings',
  'identity-access-management': 'IAM',
  rhel: 'RHEL',
  openshift: 'OpenShift',
  ansible: 'Ansible',
  'subscription-services': 'Subscriptions'
};

export const SETTINGS_BUNDLE_PATHS = [
  '/overview',
  '/alert-manager',
  '/data-integration',
  '/event-log',
  '/settings/appearance',
  '/learning-resources'
] as const;

export const IAM_BUNDLE_PATHS = [
  '/my-user-access',
  '/user-access',
  '/users',
  '/groups',
  '/roles',
  '/workspaces',
  '/red-hat-access-requests',
  '/authentication-policy',
  '/service-accounts',
  '/learning-resources-iam'
] as const;

const SERVICE_TYPES_WITH_LEFT_NAV = new Set<PinDashboardServiceTypeId>([
  'core-console-settings',
  'identity-access-management',
  'openshift'
]);

export function serviceTypeSupportsLeftNav(serviceTypeId: PinDashboardServiceTypeId): boolean {
  return SERVICE_TYPES_WITH_LEFT_NAV.has(serviceTypeId);
}

export function getBundleLabel(serviceTypeId: PinDashboardServiceTypeId): string {
  return PIN_SERVICE_TYPE_BUNDLE_LABEL[serviceTypeId];
}

export function getServiceTypeLabel(serviceTypeId: PinDashboardServiceTypeId): string {
  return PIN_DASHBOARD_SERVICE_TYPES.find((service) => service.id === serviceTypeId)?.label ?? serviceTypeId;
}

export function getPinnedDashboardPath(
  serviceTypeId: PinDashboardServiceTypeId,
  dashboardId: string
): string {
  const params = new URLSearchParams({
    pinnedDashboard: dashboardId,
    bundle: serviceTypeId
  });

  if (serviceTypeId === 'identity-access-management') {
    return `/my-user-access?${params.toString()}`;
  }

  if (serviceTypeId === 'openshift') {
    return `/openshift/overview?${params.toString()}`;
  }

  return `/overview?${params.toString()}`;
}

export function parsePinnedDashboardQuery(
  search: string
): { dashboardId: string; serviceTypeId: PinDashboardServiceTypeId } | null {
  const params = new URLSearchParams(search);
  const dashboardId = params.get('pinnedDashboard');
  const bundle = params.get('bundle');

  if (!dashboardId || !bundle) {
    return null;
  }

  if (!PIN_DASHBOARD_SERVICE_TYPES.some((service) => service.id === bundle)) {
    return null;
  }

  return { dashboardId, serviceTypeId: bundle as PinDashboardServiceTypeId };
}

export function resolveNavigationServiceType(
  pathname: string,
  search = ''
): PinDashboardServiceTypeId | null {
  if ((OPENSHIFT_BUNDLE_PATHS as readonly string[]).includes(pathname)) {
    return 'openshift';
  }
  if ((SETTINGS_BUNDLE_PATHS as readonly string[]).includes(pathname)) {
    return 'core-console-settings';
  }
  if ((IAM_BUNDLE_PATHS as readonly string[]).includes(pathname)) {
    return 'identity-access-management';
  }

  const bundle = new URLSearchParams(search).get('bundle');
  if (bundle === 'openshift' && pathname === '/overview') {
    return 'openshift';
  }

  return null;
}

export function getPinnedDashboardLandingPath(serviceTypeId: PinDashboardServiceTypeId): string {
  if (serviceTypeId === 'identity-access-management') {
    return '/my-user-access';
  }
  if (serviceTypeId === 'openshift') {
    return '/openshift/overview';
  }
  return '/overview';
}

export function isViewingPinnedDashboard(
  pathname: string,
  search: string,
  serviceTypeId: PinDashboardServiceTypeId
): boolean {
  const parsed = parsePinnedDashboardQuery(search);
  if (!parsed || parsed.serviceTypeId !== serviceTypeId) {
    return false;
  }
  return pathname === getPinnedDashboardLandingPath(serviceTypeId);
}

export function shouldDeferBundleNavToPinnedDashboard(
  pathname: string,
  search: string,
  serviceTypeId: PinDashboardServiceTypeId
): boolean {
  return isViewingPinnedDashboard(pathname, search, serviceTypeId);
}

export function isPinnedDashboardNavActive(
  pathname: string,
  search: string,
  serviceTypeId: PinDashboardServiceTypeId,
  dashboardId: string
): boolean {
  const parsed = parsePinnedDashboardQuery(search);
  if (!parsed || parsed.dashboardId !== dashboardId || parsed.serviceTypeId !== serviceTypeId) {
    return false;
  }

  return pathname === getPinnedDashboardLandingPath(serviceTypeId);
}
