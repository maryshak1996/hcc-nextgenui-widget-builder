import * as React from 'react';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm
} from '@patternfly/react-core';
import { CLUSTER_STATUS_CONFIG, type ClusterStatus } from '@app/Homepage/clusterStatusDisplay';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { WidgetDescriptionList } from '@app/Homepage/widgetDescriptionList';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';
import { RECENT_CLUSTERS_WIDGET_LINKS } from '@app/Homepage/recentClustersWidget';

const CLUSTER_STATUS_COUNTS: Record<ClusterStatus, string> = {
  Connected: '3',
  Ready: '8',
  Disconnected: '1',
  Stale: '2',
  Expired: '1'
};

const CLUSTER_STATUS_ORDER: ClusterStatus[] = [
  'Connected',
  'Ready',
  'Disconnected',
  'Stale',
  'Expired'
];

function ClusterStatusTermIcon({ status }: { status: ClusterStatus }) {
  const { icon: Icon, tone } = CLUSTER_STATUS_CONFIG[status];

  return (
    <span className={`cluster-status-display__icon cluster-status-display__icon--${tone}`} aria-hidden>
      <Icon />
    </span>
  );
}

function ClusterStatusDescriptionGroups() {
  return (
    <>
      {CLUSTER_STATUS_ORDER.map((status) => (
        <DescriptionListGroup key={status}>
          <DescriptionListTerm icon={<ClusterStatusTermIcon status={status} />}>
            {status}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Button variant="link" isInline component="a" href="#">
              {CLUSTER_STATUS_COUNTS[status]}
            </Button>
          </DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </>
  );
}

export function ClusterStatusWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="cluster-status"
      title={title}
      toolbar={toolbar}
      titleClassName="cluster-status-widget-header__title"
      inlineLink={
        <Button
          variant="link"
          isInline
          component="a"
          href={RECENT_CLUSTERS_WIDGET_LINKS.viewAllClusters}
        >
          View all clusters
        </Button>
      }
    />
  );
}

export function ClusterStatusWidgetBody() {
  const colSpan = useWidgetColSpan();
  const columnModifier =
    colSpan === 1
      ? { default: '1Col' as const }
      : colSpan === 2
        ? { default: '3Col' as const }
        : undefined;
  const descriptionListClassName = [
    'cluster-status-widget__description-list',
    colSpan >= 3 ? 'cluster-status-widget__description-list--5-col' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="cluster-status-widget">
      <div className="cluster-status-widget__content">
        <WidgetDescriptionList
          horizontalFluid
          columnModifier={columnModifier}
          aria-label="Cluster status"
          className={descriptionListClassName}
        >
          <ClusterStatusDescriptionGroups />
        </WidgetDescriptionList>
      </div>
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const CLUSTER_STATUS_WIDGET_STYLES = `
  .cluster-status-widget-header__title {
    margin: 0;
  }

  .cluster-status-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .cluster-status-widget__content {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
  }

  .cluster-status-widget__description-list {
    --pf-v6-c-description-list--GridTemplateColumns--min: 0;
    align-items: center;
  }

  .cluster-status-widget__description-list--5-col {
    --pf-v6-c-description-list--GridTemplateColumns--count: 5;
  }

  .cluster-status-widget__description-list .pf-v6-c-description-list__group {
    align-items: center;
  }

  .cluster-status-widget__description-list .pf-v6-c-description-list__term {
    align-items: center;
  }

  .cluster-status-widget__description-list .pf-v6-c-description-list__term-icon {
    display: inline-flex;
    align-items: center;
    align-self: center;
  }

  .cluster-status-widget__description-list .pf-v6-c-description-list__description .pf-v6-c-button.pf-m-link {
    line-height: var(--pf-t--global--font--line-height--body);
  }
`;
