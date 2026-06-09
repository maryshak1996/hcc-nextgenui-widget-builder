import * as React from 'react';
import { Button, Content, Flex, FlexItem } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { CLUSTER_STATUS_CONFIG, type ClusterStatus } from '@app/Homepage/clusterStatusDisplay';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

export const RECENT_CLUSTERS_WIDGET_LINKS = {
  viewAllClusters: 'https://console.redhat.com/openshift/list'
} as const;

export const RECENT_CLUSTERS_WIDGET_DISPLAY_COUNT = 5;

interface RecentClusterRow {
  id: string;
  name: string;
  href: string;
  status: ClusterStatus;
  type: string;
}

const RECENT_CLUSTER_ROWS: RecentClusterRow[] = [
  {
    id: '1',
    name: 'production-us-east',
    href: '#',
    status: 'Ready',
    type: 'OpenShift Dedicated'
  },
  {
    id: '2',
    name: 'staging-eu-west',
    href: '#',
    status: 'Connected',
    type: 'ROSA'
  },
  {
    id: '3',
    name: 'dev-sandbox-01',
    href: '#',
    status: 'Disconnected',
    type: 'OpenShift Dedicated'
  },
  {
    id: '4',
    name: 'analytics-cluster',
    href: '#',
    status: 'Stale',
    type: 'ARO'
  },
  {
    id: '5',
    name: 'edge-apac-01',
    href: '#',
    status: 'Expired',
    type: 'ROSA'
  }
];

function RecentClusterStatus({ status }: { status: ClusterStatus }) {
  const colSpan = useWidgetColSpan();
  const showIcon = colSpan > 1;
  const { icon: Icon, tone } = CLUSTER_STATUS_CONFIG[status];

  return (
    <Flex
      className="recent-clusters-widget__status"
      alignItems={{ default: 'alignItemsCenter' }}
      spaceItems={{ default: 'spaceItemsSm' }}
    >
      {showIcon ? (
        <FlexItem
          className={`cluster-status-display__icon cluster-status-display__icon--${tone}`}
          aria-hidden
        >
          <Icon />
        </FlexItem>
      ) : null}
      <FlexItem className="recent-clusters-widget__status-label">{status}</FlexItem>
    </Flex>
  );
}

export function RecentClustersWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="recent-clusters"
      title={title}
      toolbar={toolbar}
      titleClassName="recent-clusters-widget-header__title"
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

export function RecentClustersWidgetBody() {
  return (
    <div className="recent-clusters-widget">
      <Content component="p" className="recent-clusters-widget__intro">
        Showing your{' '}
        <span className="recent-clusters-widget__count">{RECENT_CLUSTERS_WIDGET_DISPLAY_COUNT}</span>{' '}
        most recently viewed clusters.
      </Content>
      <div className="recent-clusters-widget__table-wrap">
        <Table variant="compact" aria-label="Recent clusters">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Type</Th>
            </Tr>
          </Thead>
          <Tbody>
            {RECENT_CLUSTER_ROWS.map((row) => (
              <Tr key={row.id}>
                <Td dataLabel="Name">
                  <Button variant="link" isInline component="a" href={row.href}>
                    {row.name}
                  </Button>
                </Td>
                <Td dataLabel="Status" className="recent-clusters-widget__status-cell">
                  <RecentClusterStatus status={row.status} />
                </Td>
                <Td dataLabel="Type">{row.type}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const RECENT_CLUSTERS_WIDGET_STYLES = `
  .recent-clusters-widget-header__title {
    margin: 0;
  }

  .recent-clusters-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    gap: 0;
  }

  .recent-clusters-widget__intro {
    flex: 0 0 auto;
    margin: 0 0 var(--pf-t--global--spacer--xs);
    padding-inline-start: var(--pf-t--global--spacer--md);
    padding-inline-end: var(--pf-t--global--spacer--md);
  }

  .recent-clusters-widget__count {
    font-weight: var(--pf-t--global--font--weight--body--bold);
  }

  .recent-clusters-widget__table-wrap {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .recent-clusters-widget__table-wrap .pf-v6-c-table {
    --pf-v6-c-table--cell--PaddingBlock: var(--pf-t--global--spacer--sm);
  }

  .recent-clusters-widget__table-wrap .recent-clusters-widget__status-cell {
    min-width: 0;
  }

  .recent-clusters-widget__status {
    min-width: 0;
  }

  .recent-clusters-widget__status-label {
    min-width: 0;
  }
`;
