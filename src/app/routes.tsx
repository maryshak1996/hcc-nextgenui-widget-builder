import * as React from 'react';
import { matchPath, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Homepage } from '@app/Homepage/Homepage';
import { AllServices } from '@app/AllServices/AllServices';
import { Dashboard } from '@app/Dashboard/Dashboard';
import { DashboardHub } from '@app/DashboardHub/DashboardHub';
import { EditableDashboard } from '@app/DashboardHub/EditableDashboard';
import { AlertManager } from '@app/AlertManager/AlertManager';
import { RoleDeleted } from '@app/AlertManager/RoleDeleted';
import { AuthenticationPolicy } from '@app/AuthenticationPolicy/AuthenticationPolicy';
import { DataIntegration } from '@app/DataIntegration/DataIntegration';
import { EventLog } from '@app/EventLog/EventLog';
import { LearningResources } from '@app/LearningResources/LearningResources';
import { LearningResourcesIAM } from '@app/LearningResourcesIAM/LearningResourcesIAM';
import { MyUserAccess } from '@app/MyUserAccess/MyUserAccess'; 
import { ServiceAccounts } from '@app/ServiceAccounts/ServiceAccounts';
import { UserAccess } from '@app/UserAccess/UserAccess';
import { SupportOverview } from '@app/Support/SupportOverview';
import { SupportCases } from '@app/Support/SupportCases';
import { SupportPartnerships } from '@app/Support/SupportPartnerships';
import { SupportRbac } from '@app/Support/SupportRbac';
import { SupportLearningResources } from '@app/Support/SupportLearningResources';
import { SupportNewCase } from '@app/Support/SupportNewCase';
import { Users } from '@app/Users/Users';
import { Groups } from '@app/Groups/Groups';
import { Roles } from '@app/Roles/Roles';
import { AlertOverriderRole } from '@app/Roles/AlertOverriderRole';
import { Workspaces } from '@app/Workspaces/Workspaces';
import { RedHatAccessRequests } from '@app/RedHatAccessRequests/RedHatAccessRequests';
import { GeneralSettings } from '@app/Settings/General/GeneralSettings';
import { ProfileSettings } from '@app/Settings/Profile/ProfileSettings';
import { NotFound } from '@app/NotFound/NotFound';
import { RhelBundleLandingPage } from '@app/RhelVulnerability/RhelBundleLandingPage';
import { RhelVulnerabilityCvePage } from '@app/RhelVulnerability/RhelVulnerabilityCvePage';

/** Redirect old Insights-only CVE URLs to the RHEL bundle–scoped path. */
const LegacyInsightsVulnCveRedirect: React.FunctionComponent = () => {
  const { cveId } = useParams<{ cveId: string }>();
  return <Navigate to={`/red-hat-enterprise-linux/insights/vulnerability/cves/${cveId}`} replace />;
};

export interface IAppRoute {
  label?: string; // Excluding the label will exclude the route from the nav sidebar in AppLayout
  element: React.ReactElement;
  exact?: boolean;
  path: string;
  title: string;
  routes?: undefined;
}

export interface IAppRouteGroup {
  label: string;
  routes: IAppRoute[];
}

export type AppRouteConfig = IAppRoute | IAppRouteGroup;

const routes: AppRouteConfig[] = [
  {
    element: <Homepage />,
    exact: true,
    path: '/',
    title: 'Red Hat',
  },
  {
    element: <AllServices />,
    exact: true,
    path: '/all-services',
    title: 'All Services | Red Hat',
  },
  {
    element: <Dashboard />,
    exact: true,
    label: 'Overview',
    path: '/overview',
    title: 'Overview | Red Hat',
  },
  {
    element: <DashboardHub />,
    exact: true,
    path: '/dashboard-hub',
    title: 'Dashboard Hub | Red Hat',
  },
  {
    element: <DashboardHub />,
    exact: true,
    path: '/dashboard',
    title: 'Dashboard Hub | Red Hat',
  },
  {
    element: <EditableDashboard />,
    path: '/dashboard-hub/:dashboardId',
    title: 'Edit dashboard | Red Hat',
  },
  {
    element: <AlertManager />,
    exact: true,
    label: 'Alert Manager',
    path: '/alert-manager',
    title: 'Alert Manager | Red Hat',
  },
  {
    element: <RoleDeleted />,
    exact: true,
    path: '/alert-manager/role-deleted',
    title: 'Role deleted | Alert Manager | Red Hat',
  },
  {
    element: <DataIntegration />,
    exact: true,
    label: 'Data Integration',
    path: '/data-integration',
    title: 'Data Integration | Red Hat',
  },
  {
    element: <DataIntegration />,
    exact: true,
    path: '/data-integrations',
    title: 'Data Integration | Red Hat',
  },
  {
    element: <EventLog />,
    exact: true,
    label: 'Event Log',
    path: '/event-log',
    title: 'Event Log | Red Hat',
  },
  {
    element: <LearningResources />,
    exact: true,
    label: 'Learning Resources',
    path: '/learning-resources',
    title: 'Learning Resources | Red Hat',
  },
  // Routes without labels (accessible via URL but not shown in navigation)
  {
    element: <MyUserAccess />,
    exact: true,
    path: '/my-user-access',
    title: 'My User Access | Red Hat',
  },
  {
    element: <UserAccess />,
    exact: true,
    path: '/user-access',
    title: 'User Access | Red Hat',
  },
  {
    element: <AuthenticationPolicy />,
    exact: true,
    path: '/authentication-policy',
    title: 'Authentication Policy | Red Hat',
  },
  {
    element: <ServiceAccounts />,
    exact: true,
    path: '/service-accounts',
    title: 'Service Accounts | Red Hat',
  },
  {
    element: <GeneralSettings />,
    exact: true,
    path: '/settings/general',
    title: 'General Settings | Red Hat',
  },
  {
    element: <ProfileSettings />,
    exact: true,
    path: '/settings/profile',
    title: 'Profile Settings | Red Hat',
  },
  {
    element: <SupportOverview />,
    exact: true,
    path: '/support',
    title: 'Support · Overview | Red Hat',
  },
  {
    element: <SupportCases />,
    exact: true,
    path: '/support/cases',
    title: 'Support cases | Red Hat',
  },
  {
    element: <SupportNewCase />,
    exact: true,
    path: '/support/cases/new',
    title: 'New support case | Red Hat',
  },
  {
    element: <SupportPartnerships />,
    exact: true,
    path: '/support/partnerships',
    title: 'Partnerships | Red Hat',
  },
  {
    element: <SupportRbac />,
    exact: true,
    path: '/support/rbac',
    title: 'RBAC | Red Hat',
  },
  {
    element: <SupportLearningResources />,
    exact: true,
    path: '/support/learning-resources',
    title: 'Support · Learning resources | Red Hat',
  },
  {
    element: <LearningResourcesIAM />,
    exact: true,
    path: '/learning-resources-iam',
    title: 'IAM Learning Resources | Red Hat',
  },
  {
    element: <Users />,
    exact: true,
    path: '/users',
    title: 'Users | Red Hat',
  },
  {
    element: <Groups />,
    exact: true,
    path: '/groups',
    title: 'Groups | Red Hat',
  },
  {
    element: <Roles />,
    exact: true,
    path: '/roles',
    title: 'Roles | Red Hat',
  },
  {
    element: <AlertOverriderRole />,
    exact: true,
    path: '/user-access/roles/alert-overrider',
    title: 'Alert overrider | Red Hat',
  },
  {
    element: <Workspaces />,
    exact: true,
    path: '/workspaces',
    title: 'Workspaces | Red Hat',
  },
  {
    element: <RedHatAccessRequests />,
    exact: true,
    path: '/red-hat-access-requests',
    title: 'Red Hat Access Requests | Red Hat',
  },
  {
    element: <RhelBundleLandingPage />,
    exact: true,
    path: '/red-hat-enterprise-linux',
    title: 'Red Hat Enterprise Linux | Red Hat',
  },
  {
    element: <RhelVulnerabilityCvePage />,
    exact: true,
    path: '/red-hat-enterprise-linux/insights/vulnerability/cves/:cveId',
    title: 'CVE · Vulnerability · Red Hat',
  },
  {
    element: <LegacyInsightsVulnCveRedirect />,
    path: '/insights/vulnerability/cves/:cveId',
    title: 'CVE · Vulnerability · Red Hat',
  },
];

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[]
);

/** Longest-prefix-style match for fake browser tab titles (PCM desktop shell). */
function getAppRouteForPathname(pathname: string): IAppRoute | null {
  const sorted = [...flattenedRoutes].sort((a, b) => b.path.length - a.path.length);
  for (const route of sorted) {
    if (matchPath({ path: route.path, end: true }, pathname)) {
      return route;
    }
  }
  return null;
}

/**
 * Label for the Red Hat console tab in the PCM fake browser chrome.
 * Strips the marketing suffix and truncates long titles.
 */
export function getHccFakeBrowserTabTitle(pathname: string): string {
  const route = getAppRouteForPathname(pathname);
  if (!route) {
    return 'Red Hat';
  }
  const short = route.title.replace(/\s*\|\s*Red Hat\s*$/i, '').trim();
  if (short.length <= 52) {
    return short;
  }
  return `${short.slice(0, 49)}…`;
}

const AppRoutes = (): React.ReactElement => (
  <Routes>
    {flattenedRoutes.map(({ path, element }, idx) => (
      <Route path={path} element={element} key={idx} />
    ))}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export { AppRoutes, routes };
