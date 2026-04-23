import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
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
import { Support } from '@app/Support/Support';
import { Users } from '@app/Users/Users';
import { Groups } from '@app/Groups/Groups';
import { Roles } from '@app/Roles/Roles';
import { AlertOverriderRole } from '@app/Roles/AlertOverriderRole';
import { Workspaces } from '@app/Workspaces/Workspaces';
import { RedHatAccessRequests } from '@app/RedHatAccessRequests/RedHatAccessRequests';
import { GeneralSettings } from '@app/Settings/General/GeneralSettings';
import { ProfileSettings } from '@app/Settings/Profile/ProfileSettings';
import { NotFound } from '@app/NotFound/NotFound';

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
    title: 'Red Hat Hybrid Cloud Console',
  },
  {
    element: <AllServices />,
    exact: true,
    path: '/all-services',
    title: 'All Services | Red Hat Hybrid Cloud Console',
  },
  {
    element: <Dashboard />,
    exact: true,
    label: 'Overview',
    path: '/overview',
    title: 'Overview | Red Hat Hybrid Cloud Console',
  },
  {
    element: <DashboardHub />,
    exact: true,
    path: '/dashboard-hub',
    title: 'Dashboard Hub | Red Hat Hybrid Cloud Console',
  },
  {
    element: <DashboardHub />,
    exact: true,
    path: '/dashboard',
    title: 'Dashboard Hub | Red Hat Hybrid Cloud Console',
  },
  {
    element: <EditableDashboard />,
    path: '/dashboard-hub/:dashboardId',
    title: 'Edit dashboard | Red Hat Hybrid Cloud Console',
  },
  {
    element: <AlertManager />,
    exact: true,
    label: 'Alert Manager',
    path: '/alert-manager',
    title: 'Alert Manager | Red Hat Hybrid Cloud Console',
  },
  {
    element: <RoleDeleted />,
    exact: true,
    path: '/alert-manager/role-deleted',
    title: 'Role deleted | Alert Manager | Red Hat Hybrid Cloud Console',
  },
  {
    element: <DataIntegration />,
    exact: true,
    label: 'Data Integration',
    path: '/data-integration',
    title: 'Data Integration | Red Hat Hybrid Cloud Console',
  },
  {
    element: <DataIntegration />,
    exact: true,
    path: '/data-integrations',
    title: 'Data Integration | Red Hat Hybrid Cloud Console',
  },
  {
    element: <EventLog />,
    exact: true,
    label: 'Event Log',
    path: '/event-log',
    title: 'Event Log | Red Hat Hybrid Cloud Console',
  },
  {
    element: <LearningResources />,
    exact: true,
    label: 'Learning Resources',
    path: '/learning-resources',
    title: 'Learning Resources | Red Hat Hybrid Cloud Console',
  },
  // Routes without labels (accessible via URL but not shown in navigation)
  {
    element: <MyUserAccess />,
    exact: true,
    path: '/my-user-access',
    title: 'My User Access | Red Hat Hybrid Cloud Console',
  },
  {
    element: <UserAccess />,
    exact: true,
    path: '/user-access',
    title: 'User Access | Red Hat Hybrid Cloud Console',
  },
  {
    element: <AuthenticationPolicy />,
    exact: true,
    path: '/authentication-policy',
    title: 'Authentication Policy | Red Hat Hybrid Cloud Console',
  },
  {
    element: <ServiceAccounts />,
    exact: true,
    path: '/service-accounts',
    title: 'Service Accounts | Red Hat Hybrid Cloud Console',
  },
  {
    element: <GeneralSettings />,
    exact: true,
    path: '/settings/general',
    title: 'General Settings | Red Hat Hybrid Cloud Console',
  },
  {
    element: <ProfileSettings />,
    exact: true,
    path: '/settings/profile',
    title: 'Profile Settings | Red Hat Hybrid Cloud Console',
  },
  {
    element: <Support />,
    exact: true,
    path: '/support',
    title: 'Support | Red Hat Hybrid Cloud Console',
  },
  {
    element: <LearningResourcesIAM />,
    exact: true,
    path: '/learning-resources-iam',
    title: 'IAM Learning Resources | Red Hat Hybrid Cloud Console',
  },
  {
    element: <Users />,
    exact: true,
    path: '/users',
    title: 'Users | Red Hat Hybrid Cloud Console',
  },
  {
    element: <Groups />,
    exact: true,
    path: '/groups',
    title: 'Groups | Red Hat Hybrid Cloud Console',
  },
  {
    element: <Roles />,
    exact: true,
    path: '/roles',
    title: 'Roles | Red Hat Hybrid Cloud Console',
  },
  {
    element: <AlertOverriderRole />,
    exact: true,
    path: '/user-access/roles/alert-overrider',
    title: 'Alert overrider | Red Hat Hybrid Cloud Console',
  },
  {
    element: <Workspaces />,
    exact: true,
    path: '/workspaces',
    title: 'Workspaces | Red Hat Hybrid Cloud Console',
  },
  {
    element: <RedHatAccessRequests />,
    exact: true,
    path: '/red-hat-access-requests',
    title: 'Red Hat Access Requests | Red Hat Hybrid Cloud Console',
  },
];

const flattenedRoutes: IAppRoute[] = routes.reduce(
  (flattened, route) => [...flattened, ...(route.routes ? route.routes : [route])],
  [] as IAppRoute[],
);

const AppRoutes = (): React.ReactElement => (
  <Routes>
    {flattenedRoutes.map(({ path, element }, idx) => (
      <Route path={path} element={element} key={idx} />
    ))}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export { AppRoutes, routes };
