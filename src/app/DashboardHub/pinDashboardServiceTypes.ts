/** Service types available when pinning a dashboard to the console services navigation. */
export const PIN_DASHBOARD_SERVICE_TYPES = [
  { id: 'rhel', label: 'Red Hat Enterprise Linux' },
  { id: 'openshift', label: 'OpenShift' },
  { id: 'ansible', label: 'Ansible' },
  { id: 'subscription-services', label: 'Subscription Services' },
  { id: 'core-console-settings', label: 'Core Console Settings' },
  { id: 'identity-access-management', label: 'Identity & Access Management' }
] as const;

export type PinDashboardServiceTypeId = (typeof PIN_DASHBOARD_SERVICE_TYPES)[number]['id'];
