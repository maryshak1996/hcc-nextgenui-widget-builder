import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Content,
  PageSection,
  Title
} from '@patternfly/react-core';
import { PinnedDashboardCanvas } from '@app/DashboardHub/PinnedDashboardCanvas';
import { parsePinnedDashboardQuery } from '@app/DashboardHub/pinnedDashboardNavigation';

export type OpenShiftBundlePageProps = {
  pageLabel: string;
  showPinnedDashboard?: boolean;
};

export const OpenShiftBundlePage: React.FunctionComponent<OpenShiftBundlePageProps> = ({
  pageLabel,
  showPinnedDashboard = false
}) => {
  const [searchParams] = useSearchParams();
  const pinnedDashboardQuery = showPinnedDashboard
    ? parsePinnedDashboardQuery(searchParams.toString())
    : null;

  if (pinnedDashboardQuery?.serviceTypeId === 'openshift') {
    return (
      <PinnedDashboardCanvas
        dashboardId={pinnedDashboardQuery.dashboardId}
        serviceTypeId="openshift"
      />
    );
  }

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb>
          <BreadcrumbItem>OpenShift</BreadcrumbItem>
          <BreadcrumbItem isActive>{pageLabel}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection hasBodyWrapper={false}>
        <Title headingLevel="h1">{pageLabel}</Title>
        <Content>
          <p>OpenShift {pageLabel} content placeholder.</p>
        </Content>
      </PageSection>
    </>
  );
};
