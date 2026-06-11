import * as React from 'react';
import {
  AnalyzeIcon,
  AnsibleTowerIcon,
  AiExperienceIcon,
  BookmarkIcon,
  ChartLineIcon,
  CheckClipboardIcon,
  CloudIcon,
  ClusterIcon,
  CommentsIcon,
  CreditCardIcon,
  CubesIcon,
  DataSourceIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  FolderOpenIcon,
  HistoryIcon,
  KeyIcon,
  LightbulbIcon,
  OutlinedCloneIcon,
  RegistryIcon,
  RunningIcon,
  SearchIcon,
  ServerStackIcon,
  SatelliteIcon,
  ShieldAltIcon,
  StarIcon,
  UserIcon
} from '@app/icons/rhUiIcons';

export type WidgetHeaderIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

/** PatternFly icon component per catalog widget id (fallback: `CubesIcon`). */
export const WIDGET_HEADER_ICON_MAP: Record<string, WidgetHeaderIconComponent> = {
  events: RunningIcon,
  rhel: ServerStackIcon,
  openshift: ClusterIcon,
  ansible: AnsibleTowerIcon,
  'red-hat-ai': AiExperienceIcon,
  'image-builder': OutlinedCloneIcon,
  'explore-capabilities': SearchIcon,
  'quay-io': RegistryIcon,
  integrations: DataSourceIcon,
  subscriptions: CreditCardIcon,
  'my-favorite-services': StarIcon,
  'recently-visited': HistoryIcon,
  'support-cases': CommentsIcon,
  'bookmarked-learning-resources': BookmarkIcon,
  'recent-clusters': ClusterIcon,
  'openshift-subscription-usage': ChartLineIcon,
  'rhel-subscription-usage': ChartLineIcon,
  'ansible-subscription-usage': ChartLineIcon,
  'openshift-cost-management': AnalyzeIcon,
  'cluster-status': ClusterIcon,
  'my-account': UserIcon,
  'advisor-recommendations': LightbulbIcon,
  vulnerabilities: ExclamationTriangleIcon,
  'red-hat-satellite': SatelliteIcon,
  'activation-keys': KeyIcon,
  manifests: CheckClipboardIcon,
  'simple-content-access-sca': FolderOpenIcon
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
