import * as React from 'react';
import {
  AnsibleTowerIcon,
  AutomationIcon,
  BellIcon,
  BookmarkIcon,
  ChartLineIcon,
  CloudIcon,
  CommentsIcon,
  CreditCardIcon,
  CubesIcon,
  DatabaseIcon,
  DesktopIcon,
  DollarSignIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  HistoryIcon,
  KeyIcon,
  PlugIcon,
  ProjectDiagramIcon,
  SearchIcon,
  ServerIcon,
  ShieldAltIcon,
  StarIcon,
  SyncIcon,
  UserIcon,
  VirtualMachineIcon
} from '@patternfly/react-icons';

export type WidgetHeaderIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

/** PatternFly icon component per catalog widget id (fallback: `CubesIcon`). */
export const WIDGET_HEADER_ICON_MAP: Record<string, WidgetHeaderIconComponent> = {
  events: BellIcon,
  rhel: ServerIcon,
  openshift: CloudIcon,
  ansible: AnsibleTowerIcon,
  'red-hat-ai': VirtualMachineIcon,
  'image-builder': DesktopIcon,
  'explore-capabilities': SearchIcon,
  'quay-io': ExternalLinkAltIcon,
  integrations: PlugIcon,
  subscriptions: CreditCardIcon,
  'my-favorite-services': StarIcon,
  'recently-visited': HistoryIcon,
  'support-cases': CommentsIcon,
  'bookmarked-learning-resources': BookmarkIcon,
  'recent-clusters': CloudIcon,
  'openshift-subscription-usage': ChartLineIcon,
  'rhel-subscription-usage': DollarSignIcon,
  'ansible-subscription-usage': AutomationIcon,
  'openshift-cost-management': DollarSignIcon,
  'cluster-status': ProjectDiagramIcon,
  'my-account': UserIcon,
  'advisor-recommendations': ShieldAltIcon,
  vulnerabilities: ExclamationTriangleIcon,
  'red-hat-satellite': ServerIcon,
  'activation-keys': KeyIcon,
  manifests: DatabaseIcon,
  'simple-content-access-sca': SyncIcon
};

export function getWidgetHeaderIcon(widgetId: string): WidgetHeaderIconComponent {
  return WIDGET_HEADER_ICON_MAP[widgetId] ?? CubesIcon;
}

/** Lead icon for widget titles (bank cards, dashboard cards). */
export function WidgetTitleLeadIcon({ widgetId }: { widgetId: string }) {
  const Cmp = getWidgetHeaderIcon(widgetId);
  return (
    <span className="widget-title-lead-icon" aria-hidden>
      <Cmp />
    </span>
  );
}
