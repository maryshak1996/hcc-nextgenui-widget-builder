import * as React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IAppRoute, IAppRouteGroup, routes } from '@app/routes';
import { MASTHEAD_USER_DISPLAY_NAME } from '@app/mastheadUserDisplayName';
import { DashboardWidgetsHelpPanelContent } from '@app/Homepage/DashboardWidgetsHelpPanelContent';
import SparkleIcon from '@app/bgimages/sparkle-icon.svg';
import HappyRobotIcon from '@app/bgimages/happy-robot-icon.svg';
import FeedbackIcon from '@app/bgimages/feedback-icon.svg';
import BugIcon from '@app/bgimages/bug-icon.svg';
import DirectionIcon from '@app/bgimages/direction-icon.svg';
import {
  Avatar,
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Checkbox,
  Content,
  DataList,
  DataListCell,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Divider,
  Drawer,
  DrawerActions,
  DrawerCloseButton,
  DrawerContent,
  DrawerContentBody,
  DrawerHead,
  DrawerPanelContent,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Masthead,
  MastheadBrand,
  MastheadContent,
  MastheadLogo,
  MastheadMain,
  MastheadToggle,
  Menu,
  MenuGroup,
  MenuItem,
  MenuItemAction,
  MenuList,
  MenuToggle,
  Nav,
  NavExpandable,
  NavItem,
  NavList,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerHeader,
  NotificationDrawerList,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
  Page,
  PageSidebar,
  PageSidebarBody,
  Pagination,
  SearchInput,
  SkipToContent,
  Spinner,
  Split,
  SplitItem,
  Tab,
  TabTitleIcon,
  TabTitleText,
  Tabs,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  EmptyState
} from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import {
  BarsIcon, 
  BellIcon, 
  BookmarkIcon,
  BookOpenIcon, 
  BrainIcon, 
  ChartLineIcon,
  CloudIcon,
  CodeIcon,
  CogIcon,
  CommentsIcon,
  CreditCardIcon,
  CubeIcon,
  DatabaseIcon,
  EllipsisVIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  EyeIcon,
  HelpIcon,
  InProgressIcon,
  InfoCircleIcon,
  LightbulbIcon,
  ListIcon,
  OutlinedWindowRestoreIcon,
  PlayIcon,
  ProjectDiagramIcon,
  QuestionCircleIcon,
  RocketIcon,
  SearchIcon,
  ServerIcon,
  ShieldAltIcon,
  SignOutAltIcon,
  StarIcon,
  TachometerAltIcon,
  TimesIcon,
  UserIcon,
  UsersIcon,
  WrenchIcon
} from '@patternfly/react-icons';

interface IAppLayout {
  children: React.ReactNode;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  details: string;
  features: string[];
  icon: React.ReactElement;
  url?: string;
  isLink?: boolean;
}

// Create a context for help panel functions
interface HelpPanelContextType {
  /** `variant`: `quickstart` selects Learn + breadcrumb; `in-page` shows all tabs with none selected (default). */
  openHelpPanelWithTab: (title: string, options?: { variant?: 'quickstart' | 'in-page' }) => void;
  /** Find help → Feedback → Share general feedback (breadcrumb screen). */
  openHelpPanelToShareGeneralFeedback: () => void;
}

export const HelpPanelContext = React.createContext<HelpPanelContextType | undefined>(undefined);

// Helper function to get icon based on breadcrumb text
  const getBreadcrumbIcon = (breadcrumbText: string) => {
    const iconStyle = { width: '12px', height: '12px', marginRight: '4px', verticalAlign: 'middle' };
    
    switch (breadcrumbText) {
      case 'Learning resources':
        return <BookOpenIcon style={iconStyle} />;
      case 'Knowledgebase':
      case 'Knowledgebase article':
        return <LightbulbIcon style={iconStyle} />;
      case 'API documentation':
        return <ProjectDiagramIcon style={iconStyle} />;
      case 'My open support tickets':
        return <QuestionCircleIcon style={iconStyle} />;
      case 'Share feedback':
        return <CommentsIcon style={iconStyle} />;
      default:
        return <CloudIcon style={iconStyle} />;
    }
  };

const AppLayout: React.FunctionComponent<IAppLayout> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [isDrawerExpanded, setIsDrawerExpanded] = React.useState(false);
  /** Bottom help subtabs: Search, Learn (incl. KB content), APIs, Support, Feedback (0–4), Chat (5). Null while custom/article view is open. */
  const [helpPanelSubTab, setHelpPanelSubTab] = React.useState<number | null>(0);
  /** Topic opened via openHelpPanelWithTab — custom HTML in the scroll region. */
  const [customHelpTitle, setCustomHelpTitle] = React.useState<string | null>(null);
  /** When custom help is open: quickstart → Learn tab selected + breadcrumb; in-page → no tab selected. */
  const [customHelpVariant, setCustomHelpVariant] = React.useState<'quickstart' | 'in-page' | null>(null);
  /** Remount top help tabs when selection crosses into/out of `null` so PatternFly clears the tab accent (no matching `eventKey`). */
  const [helpTopTabsMountKey, setHelpTopTabsMountKey] = React.useState(0);
  const prevHelpPanelSubTabRef = React.useRef<number | null>(helpPanelSubTab);
  React.useEffect(() => {
    const prev = prevHelpPanelSubTabRef.current;
    const cur = helpPanelSubTab;
    if ((prev === null) !== (cur === null)) {
      setHelpTopTabsMountKey((k) => k + 1);
    }
    prevHelpPanelSubTabRef.current = cur;
  }, [helpPanelSubTab]);
  
  // Complete APIs tab data - all content (43 APIs from Red Hat API Catalog)
  const allApisContent = [
    { id: 'api-1', title: 'Advisor', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-2', title: 'Ansible automation controller API V1', breadcrumb1: 'API documentation', labels: ['Ansible'] },
    { id: 'api-3', title: 'Automation Hub', breadcrumb1: 'API documentation', labels: ['Ansible'] },
    { id: 'api-4', title: 'Compliance V1', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-5', title: 'Compliance V2', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-6', title: 'Cost Management', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-7', title: 'Export Service', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-8', title: 'Image Builder', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-9', title: 'Integrations', breadcrumb1: 'API documentation', labels: ['Settings'] },
    { id: 'api-10', title: 'Launch', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-11', title: 'Malware Detection', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-12', title: 'Managed Inventory', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-13', title: 'Notifications', breadcrumb1: 'API documentation', labels: ['Settings'] },
    { id: 'api-14', title: 'Operator Gathering Conditions Service', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-15', title: 'Payload Ingress Service', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-16', title: 'Insights Advisor for OpenShift V1', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-17', title: 'Insights Advisor for OpenShift V2', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-18', title: 'Patch', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-19', title: 'Playbook Dispatcher', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-20', title: 'Policies', breadcrumb1: 'API documentation', labels: ['Ansible', 'RHEL'] },
    { id: 'api-21', title: 'Remediations', breadcrumb1: 'API documentation', labels: ['Ansible', 'RHEL'] },
    { id: 'api-22', title: 'Resource Optimization', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-23', title: 'Repositories', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-24', title: 'Role-based Access Control', breadcrumb1: 'API documentation', labels: ['IAM'] },
    { id: 'api-25', title: 'Sources', breadcrumb1: 'API documentation', labels: ['IAM'] },
    { id: 'api-26', title: 'Subscriptions v1', breadcrumb1: 'API documentation', labels: ['RHEL', 'OpenShift'] },
    { id: 'api-27', title: 'Subscriptions v2', breadcrumb1: 'API documentation', labels: ['RHEL', 'OpenShift'] },
    { id: 'api-28', title: 'Tasks', breadcrumb1: 'API documentation', labels: ['Ansible', 'RHEL'] },
    { id: 'api-29', title: 'Vulnerability Management', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-30', title: 'Red Hat Ansible Lightspeed', breadcrumb1: 'API documentation', labels: ['Ansible'] },
    { id: 'api-31', title: 'Insights for RHEL Planning', breadcrumb1: 'API documentation', labels: ['RHEL'] },
    { id: 'api-32', title: 'Account Management Service', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-33', title: 'Assisted-Install Service', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-34', title: 'Authorization Service', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-35', title: 'Connector Management', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-36', title: 'Kafka Service Fleet Manager Service', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-37', title: 'RHACS Service Fleet Manager', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-38', title: 'Service Logs', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-39', title: 'Service Registry Management', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-40', title: 'Upgrades Information Service', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-41', title: 'Vulnerability Dashboard OCP', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-42', title: 'Web-RCA Service', breadcrumb1: 'API documentation', labels: ['OpenShift'] },
    { id: 'api-43', title: 'Case Management API', breadcrumb1: 'API documentation', labels: ['Ansible', 'RHEL', 'OpenShift'] }
  ];

  // Knowledgebase article list (shown in the Learn tab)
  const allKnowledgebaseContent = [
    // Real articles from page 1
    { id: 'kb-1', title: 'How do I access Red Hat Enterprise Linux 7 Extended Life Cycle Support (ELS) content after Red Hat Enterprise Linux 7 transitions to Extended Life Phase?', breadcrumb1: 'Knowledgebase article', labels: ['RHEL', 'Subscription Services'] },
    { id: 'kb-2', title: 'System Information Collected by Red Hat Insights', breadcrumb1: 'Knowledgebase article', labels: ['RHEL'] },
    { id: 'kb-3', title: 'Mejores Prácticas en la Creación de Casos Nuevos de Soporte', breadcrumb1: 'Knowledgebase article', labels: ['Settings'] },
    { id: 'kb-4', title: 'Melhores Práticas para a criação de novos casos de suporte', breadcrumb1: 'Knowledgebase article', labels: ['Settings'] },
    { id: 'kb-5', title: 'Opting Out of Sending Metadata from Red Hat Insights Client', breadcrumb1: 'Knowledgebase article', labels: ['RHEL', 'Settings'] },
    { id: 'kb-6', title: 'Obfuscating hostnames, IP addresses and MAC addresses in Red Hat Insights', breadcrumb1: 'Knowledgebase article', labels: ['RHEL', 'Settings'] },
    { id: 'kb-7', title: 'Disable Automatic Update of Collection Rules for Red Hat Insights', breadcrumb1: 'Knowledgebase article', labels: ['RHEL'] },
    { id: 'kb-8', title: 'Creating Custom Schedule for Red Hat Insights Uploads', breadcrumb1: 'Knowledgebase article', labels: ['RHEL'] },
    { id: 'kb-9', title: 'Reference Guide for Engaging with Red Hat Support', breadcrumb1: 'Knowledgebase article', labels: ['Settings'] },
    { id: 'kb-10', title: 'Understanding Red Hat Insights - Advisor: Risk of Change', breadcrumb1: 'Knowledgebase article', labels: ['RHEL'] },
    // Placeholder articles (to be replaced with actual titles from pages 2-12)
    ...Array.from({ length: 107 }, (_, i) => ({
      id: `kb-${i + 11}`,
      title: `Knowledgebase Article ${i + 11}`,
      breadcrumb1: 'Knowledgebase article',
      labels: ['RHEL'] // Default label, will be updated with real data
    }))
  ];

  // Recommended content for Search tab
  const recommendedContentSettings = [
    { id: 'rec-settings-1', title: 'Configuring notifications and integrations', url: 'https://docs.redhat.com/en/documentation/red_hat_hybrid_cloud_console/1-latest/html/configuring_notifications_on_the_red_hat_hybrid_cloud_console/index', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Settings'] },
    { id: 'rec-settings-2', title: 'Azure cloud integrations (sources) on Hybrid Cloud Console to unlock Red Hat Gold Images in Microsoft Azure', url: 'https://access.redhat.com/articles/6961606', breadcrumb1: 'Knowledgebase article', breadcrumb2: '', labels: ['Settings', 'OpenShift'] },
    { id: 'rec-settings-3', title: 'Integrations', url: 'https://developers.redhat.com/api-catalog/api/integrations', breadcrumb1: 'API documentation', breadcrumb2: '', labels: ['Settings'] },
    { id: 'rec-settings-4', title: 'Notifications', url: 'https://developers.redhat.com/api-catalog/api/notifications', breadcrumb1: 'API documentation', breadcrumb2: '', labels: ['Settings'] },
    { id: 'rec-settings-5', title: 'Configuring console event notifications in Slack', url: '#', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['Settings'] }
  ];

  const recommendedContentAll = [
    { id: 'rec-all-1', title: 'Analyzing CentOS Linux systems for conversion in Insights', url: '#', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['RHEL'] },
    { id: 'rec-all-2', title: 'Getting started with the Red Hat Hybrid Cloud Console', url: '#', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Settings', 'RHEL', 'IAM', 'Ansible', 'OpenShift', 'Subscription Services'] },
    { id: 'rec-all-3', title: 'Getting Started with Red Hat Insights', url: '#', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['RHEL'] },
    { id: 'rec-all-4', title: 'Learn about OpenShift cluster services on the console', url: '#', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'rec-all-5', title: 'Managing user access with workspaces', url: '#', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['RHEL', 'IAM'] }
  ];

  // Complete Learn tab data - all content
  const allLearnContent = [
    { id: 'learn-1', title: 'Adding a machine pool to your managed OpenShift cluster', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['OpenShift'] },
    { id: 'learn-2', title: 'Adding an integration: Amazon Web Services', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift', 'Settings'] },
    { id: 'learn-3', title: 'Adding an integration: Google Cloud Platform', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift', 'Settings'] },
    { id: 'learn-4', title: 'Adding an integration: Microsoft Azure', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift', 'Settings'] },
    { id: 'learn-5', title: 'Adding an integration: OpenShift Container Platform', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift', 'Settings'] },
    { id: 'learn-6', title: 'Adding new users to your managed OpenShift cluster', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['OpenShift', 'IAM'] },
    { id: 'learn-7', title: 'Adding OCM roles and access to managed OpenShift clusters', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['OpenShift', 'IAM'] },
    { id: 'learn-8', title: 'API Cheatsheet', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['RHEL'] },
    { id: 'learn-9', title: 'APIs', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['RHEL', 'OpenShift', 'Settings', 'IAM', 'Ansible'] },
    { id: 'learn-10', title: 'Assess security vulnerabilities', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['RHEL'] },
    { id: 'learn-11', title: 'Assessing security vulnerabilities in your OpenShift cluster using Red Hat Insights', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-12', title: 'Configuring granular permissions by service', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['RHEL', 'IAM'] },
    { id: 'learn-13', title: 'Create images and configure automated management', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['RHEL'] },
    { id: 'learn-14', title: 'Create your first Ansible Playbook', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Ansible'] },
    { id: 'learn-15', title: 'Creating a blueprint', breadcrumb1: 'Learning resources', breadcrumb2: 'Learning path', labels: ['RHEL'] },
    { id: 'learn-16', title: 'Creating and managing service accounts', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Settings', 'IAM'] },
    { id: 'learn-17', title: 'Deploy a Java application on Kubernetes in minutes', breadcrumb1: 'Learning resources', breadcrumb2: 'Learning path', labels: ['OpenShift'] },
    { id: 'learn-18', title: 'Deploy a sample application in the Developer Sandbox', breadcrumb1: 'Learning resources', breadcrumb2: 'Learning path', labels: ['OpenShift'] },
    { id: 'learn-19', title: 'Deploy and manage RHEL systems in hybrid clouds', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['RHEL'] },
    { id: 'learn-20', title: 'Deploying an application using Red Hat OpenShift Service on AWS', breadcrumb1: 'Learning resources', breadcrumb2: 'Learning path', labels: ['OpenShift'] },
    { id: 'learn-21', title: 'Deploying and managing RHEL systems in hybrid clouds', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['RHEL'] },
    { id: 'learn-22', title: 'Deploying full-stack JavaScript applications to the Developer Sandbox for Red Hat OpenShift', breadcrumb1: 'Learning resources', breadcrumb2: 'Learning path', labels: ['OpenShift'] },
    { id: 'learn-23', title: 'Editing your managed OpenShift cluster display name', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['OpenShift'] },
    { id: 'learn-24', title: 'Editing your managed OpenShift cluster\'s application ingress', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['OpenShift'] },
    { id: 'learn-25', title: 'Getting started with automation hub', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Ansible'] },
    { id: 'learn-26', title: 'Getting started with hybrid committed spend', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Subscription Services'] },
    { id: 'learn-27', title: 'Getting started with RHEL system registration', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Subscription Services', 'RHEL'] },
    { id: 'learn-28', title: 'Introduction to the OpenShift Developer Sandbox Series', breadcrumb1: 'Learning resources', breadcrumb2: 'Other', labels: ['OpenShift'] },
    { id: 'learn-29', title: 'Learn about OpenShift cluster services on the console', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-30', title: 'Learn about OpenShift Container Platform', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-31', title: 'Learn about OpenShift Dedicated', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-32', title: 'Learn about Red Hat Advanced Cluster Security', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-33', title: 'Learn about Red Hat OpenShift Service on AWS (ROSA)', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-34', title: 'Managing clusters', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-35', title: 'Managing subscriptions', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift', 'Subscription Services'] },
    { id: 'learn-36', title: 'Monitoring your OpenShift cluster health with Insights Advisor', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-37', title: 'Reducing permissions across my organization', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['RHEL', 'IAM'] },
    { id: 'learn-38', title: 'Related console documentation', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Settings', 'IAM'] },
    { id: 'learn-39', title: 'Related documentation for Ansible', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Ansible'] },
    { id: 'learn-40', title: 'Related documentation for edge management', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['RHEL'] },
    { id: 'learn-41', title: 'Related documentation for hybrid committed spend', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Subscription Services'] },
    { id: 'learn-42', title: 'Related documentation for OpenShift Cluster Manager', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-43', title: 'Restricting access to a service to a team', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['RHEL', 'IAM'] },
    { id: 'learn-44', title: 'Setting up User Access', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Settings', 'IAM', 'RHEL', 'Ansible', 'OpenShift'] },
    { id: 'learn-45', title: 'Using Red Hat Marketplace', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift', 'Subscription Services'] },
    { id: 'learn-46', title: 'Using the Automation Calculator', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Ansible'] },
    { id: 'learn-47', title: 'Using two-factor authentication', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['IAM'] },
    { id: 'learn-48', title: 'Viewing automation environment reports', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['Ansible'] },
    { id: 'learn-49', title: 'Visit the OpenShift Library', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['OpenShift'] },
    { id: 'learn-50', title: 'Working with systems in the edge management application', breadcrumb1: 'Learning resources', breadcrumb2: 'Documentation', labels: ['RHEL'] },
    { id: 'learn-51', title: 'Configuring console event notifications in Slack', breadcrumb1: 'Learning resources', breadcrumb2: 'Quick start', labels: ['Settings'] }
  ];


  const [overflowTooltips] = React.useState<Array<{ selector: string; text: string }>>([]);
  
  // Feedback tab state
  const [feedbackView, setFeedbackView] = React.useState<'main' | 'general' | 'bug' | 'direction'>('main');

  // User dropdown state
  const [isUserDropdownOpen, setIsUserDropdownOpen] = React.useState(false);
  const [isUtilitiesDropdownOpen, setIsUtilitiesDropdownOpen] = React.useState(false);
  
  // Notification drawer state
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = React.useState(false);
  const [helpPanelWidth, setHelpPanelWidth] = React.useState(580); // Default size in pixels
  const helpPanelRef = React.useRef<HTMLDivElement>(null);
  const [isNotificationActionsOpen, setIsNotificationActionsOpen] = React.useState(false);

  // Menu groups data for primary-detail view
  const menuGroupsData: Record<string, MenuItem[]> = {
    'Platforms': [
      {
        id: 'ansible',
        name: 'Red Hat Ansible Automation Platform',
        description: 'Enterprise automation platform',
        details: 'Red Hat Ansible Automation Platform is a comprehensive automation solution that enables organizations to automate IT processes, configure systems, deploy applications, and orchestrate complex workflows across hybrid cloud environments.',
        features: ['IT Automation', 'Configuration Management', 'Application Deployment', 'Workflow Orchestration'],
        icon: <WrenchIcon />,
        url: '/ansible-automation-platform',
        isLink: true
      },
      {
        id: 'rhel',
        name: 'Red Hat Enterprise Linux',
        description: 'Enterprise-grade Linux operating system',
        details: 'Red Hat Enterprise Linux (RHEL) is the world\'s leading enterprise Linux platform. Built for mission-critical workloads, RHEL provides enhanced security, reliability, and performance for physical, virtual, cloud, and containerized environments.',
        features: ['Security & Compliance', 'High Availability', 'Performance Optimization', 'Long-term Support'],
        icon: <ServerIcon />,
        url: '/red-hat-enterprise-linux',
        isLink: true
      },
      {
        id: 'openshift',
        name: 'Red Hat OpenShift',
        description: 'Enterprise Kubernetes platform',
        details: 'Red Hat OpenShift is a comprehensive Kubernetes platform that enables organizations to build, deploy, and manage containerized applications at scale. It provides developer-friendly tools and enterprise-grade security for modern application development.',
        features: ['Container Orchestration', 'Developer Tools', 'Multi-cloud Deployment', 'Built-in Security'],
        icon: <CubeIcon />,
        url: '/red-hat-openshift',
        isLink: true
      }
    ],
    'Services': [
      {
        id: 'my-favorite-services',
        name: 'My Favorite Services',
        description: 'Quick access to your most-used services',
        details: 'Access your frequently used and bookmarked services in one convenient location. Customize your dashboard with the services you use most often to improve your workflow efficiency.',
        features: ['Quick Access', 'Custom Dashboard', 'Service Bookmarks', 'Usage Analytics'],
        icon: <StarIcon style={{ color: 'var(--pf-v6-c-button--m-favorited--hover__icon--Color, #f39200)' }} />
      },
      {
        id: 'ai-ml',
        name: 'AI/ML',
        description: 'Artificial intelligence and machine learning services',
        details: 'Build, train, and deploy machine learning models with enterprise-grade AI/ML platforms. Access GPU-accelerated computing, automated model training, and MLOps pipelines.',
        features: ['Model Training', 'GPU Computing', 'MLOps Pipelines', 'Data Science Workbenches'],
        icon: <BrainIcon />
      },
      {
        id: 'alerting-data-integrations',
        name: 'Alerting & Data Integrations',
        description: 'Monitoring alerts and data pipeline management',
        details: 'Configure intelligent alerting systems and manage data integration workflows across your hybrid cloud infrastructure with real-time monitoring and automated responses.',
        features: ['Real-time Alerts', 'Data Pipelines', 'Integration Workflows', 'Event Processing'],
        icon: <BellIcon />
      },
      {
        id: 'automation',
        name: 'Automation',
        description: 'Infrastructure and application automation',
        details: 'Automate repetitive tasks, configuration management, and deployment processes with comprehensive automation tools and workflow orchestration.',
        features: ['Task Automation', 'Configuration Management', 'Workflow Orchestration', 'Process Optimization'],
        icon: <WrenchIcon />
      },
      {
        id: 'containers',
        name: 'Containers',
        description: 'Container management and orchestration',
        details: 'Deploy, manage, and scale containerized applications with enterprise Kubernetes platforms, container registries, and orchestration tools.',
        features: ['Container Orchestration', 'Registry Management', 'Application Scaling', 'Service Mesh'],
        icon: <CubeIcon />
      },
      {
        id: 'deploy',
        name: 'Deploy',
        description: 'Application deployment and delivery',
        details: 'Streamline application deployment with CI/CD pipelines, automated testing, and progressive delivery strategies across multiple environments.',
        features: ['CI/CD Pipelines', 'Automated Testing', 'Progressive Delivery', 'Environment Management'],
        icon: <RocketIcon />
      },
      {
        id: 'identity-access-mgmt',
        name: 'Identity & Access Management',
        description: 'User authentication and authorization',
        details: 'Secure your applications with comprehensive identity management, single sign-on, multi-factor authentication, and role-based access controls.',
        features: ['Single Sign-On', 'Multi-Factor Auth', 'Role-Based Access', 'Identity Federation'],
        icon: <UsersIcon />
      },
      {
        id: 'inventories',
        name: 'Inventories',
        description: 'Asset and resource inventory management',
        details: 'Track and manage your IT assets, infrastructure resources, and application inventories with automated discovery and real-time updates.',
        features: ['Asset Discovery', 'Resource Tracking', 'Inventory Updates', 'Compliance Reporting'],
        icon: <ListIcon />
      },
      {
        id: 'observability-monitoring',
        name: 'Observability & Monitoring',
        description: 'System monitoring and observability',
        details: 'Gain deep insights into your applications and infrastructure with comprehensive monitoring, logging, tracing, and performance analytics.',
        features: ['Application Monitoring', 'Infrastructure Metrics', 'Distributed Tracing', 'Log Analytics'],
        icon: <EyeIcon />
      },
      {
        id: 'operators',
        name: 'Operators',
        description: 'Kubernetes operators and lifecycle management',
        details: 'Deploy and manage complex applications on Kubernetes with operators that automate installation, updates, and day-2 operations.',
        features: ['Operator Lifecycle', 'Application Management', 'Automated Updates', 'Cluster Operations'],
        icon: <PlayIcon />
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Security scanning and threat protection',
        details: 'Protect your infrastructure with advanced security scanning, vulnerability management, threat detection, and compliance monitoring.',
        features: ['Vulnerability Scanning', 'Threat Detection', 'Security Policies', 'Compliance Monitoring'],
        icon: <ShieldAltIcon />
      },
      {
        id: 'subscriptions-spend',
        name: 'Subscriptions & Spend',
        description: 'Subscription management and cost optimization',
        details: 'Manage subscriptions, track usage, optimize costs, and analyze spending patterns across your Red Hat services and cloud resources.',
        features: ['Subscription Tracking', 'Cost Analysis', 'Usage Optimization', 'Spend Management'],
        icon: <CreditCardIcon />
      },
      {
        id: 'system-configuration',
        name: 'System Configuration',
        description: 'System settings and configuration management',
        details: 'Configure and manage system settings, infrastructure parameters, and application configurations with centralized management tools.',
        features: ['Configuration Management', 'System Settings', 'Parameter Tuning', 'Change Tracking'],
        icon: <ServerIcon />
      }
    ]
  };
  
  // Get the first menu item ID from the first non-link group (Services)
  const getFirstMenuItemId = () => {
    // Default to "My Favorite Services" as the first selected item
    return 'my-favorite-services';
  };
  
  // Service dropdown primary-detail state
  const [selectedMenuItem, setSelectedMenuItem] = React.useState(getFirstMenuItemId());
  
  // Favorited items state
  const [favoritedItems, setFavoritedItems] = React.useState<Set<string>>(new Set());
  
  // Function to toggle favorite status of an item
  const toggleFavorite = (itemId: string) => {
    setFavoritedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  // Logo dropdown and expandable search state
  const [isLogoDropdownOpen, setIsLogoDropdownOpen] = React.useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false);
  const [mastheadSearchValue, setMastheadSearchValue] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Array<{id: string, title: string, description: string, category: string, route: string | null}>>([]);
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  
  // Bookmarked menu items state
  const [bookmarkedItems, setBookmarkedItems] = React.useState<Set<string>>(new Set());
  
  // Support tickets state
  const [supportTickets, setSupportTickets] = React.useState<Array<{id: string, title: string, status: 'waiting-red-hat' | 'waiting-customer'}>>([]);
  const [supportTicketsLoading, setSupportTicketsLoading] = React.useState(false);
  
  // Sample support case titles
  const sampleSupportCases = [
    "Critical production outage - Database connection timeout",
    "Performance degradation in API response times",
    "SSL certificate expiration warning",
    "Unable to access admin console after recent update",
    "Cluster nodes failing health checks",
    "Memory leak in application container",
    "Network connectivity issues between nodes",
    "Authentication service intermittent failures",
    "Data replication lag in database cluster",
    "Load balancer configuration assistance needed"
  ];
  
  // Function to toggle bookmark status of a menu item
  const toggleBookmark = (itemId: string) => {
    setBookmarkedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };
  
  // Function to load support tickets from Customer Portal
  const loadSupportTickets = () => {
    setSupportTicketsLoading(true);
    // Simulate API call with a delay
    setTimeout(() => {
      setSupportTicketsLoading(false);
      
      // Get a random title from the sample cases
      const randomTitle = sampleSupportCases[Math.floor(Math.random() * sampleSupportCases.length)];
      // Randomly assign a status
      const randomStatus: 'waiting-red-hat' | 'waiting-customer' = Math.random() > 0.5 ? 'waiting-red-hat' : 'waiting-customer';
      
      // Add a new ticket to the beginning of the array (most recent on top)
      setSupportTickets(prevTickets => [
        {
          id: `support-case-${Date.now()}`,
          title: randomTitle,
          status: randomStatus
        },
        ...prevTickets
      ]);
    }, 1500); // 1.5 second delay
  };
  
  // Learn tab filter states
  const [isContentTypeOpen, setIsContentTypeOpen] = React.useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = React.useState(false);
  const [selectedContentTypes, setSelectedContentTypes] = React.useState<Set<string>>(new Set());
  const [scopeFilter, setScopeFilter] = React.useState<'bundle' | 'all'>('bundle');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  /** Pagination for Knowledgebase article list inside the Learn tab (independent from learning-resources pagination). */
  const [kbPage, setKbPage] = React.useState(1);
  const [kbPerPage, setKbPerPage] = React.useState(10);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [recentSearches, setRecentSearches] = React.useState<Array<{ query: string; count: number }>>([]);
  const [searchPage, setSearchPage] = React.useState(1);
  const [searchPerPage, setSearchPerPage] = React.useState(10);
  const [isSearchContentTypeOpen, setIsSearchContentTypeOpen] = React.useState(false);
  const [selectedSearchContentTypes, setSelectedSearchContentTypes] = React.useState<Set<string>>(new Set());

  // Load recent searches from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('hcc-recent-searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored searches', e);
      }
    }
  }, []);

  // Get all searchable content from all tabs
  const getAllSearchableContent = (): Array<{
    id: string;
    title: string;
    breadcrumb1: string;
    breadcrumb2: string;
    labels: string[];
    tab: string;
  }> => {
    // Use a Map to deduplicate by title (keep first occurrence)
    // Using title as key since same content may have different IDs in different arrays
    const resultsMap = new Map<string, {
      id: string;
      title: string;
      breadcrumb1: string;
      breadcrumb2: string;
      labels: string[];
      tab: string;
    }>();
    
    // Learn tab items (51 items)
    allLearnContent.forEach(item => {
      if (!resultsMap.has(item.title)) {
        resultsMap.set(item.title, {
          id: item.id,
          title: item.title,
          breadcrumb1: item.breadcrumb1,
          breadcrumb2: item.breadcrumb2,
          labels: item.labels,
          tab: 'Learn'
        });
      }
    });
    
    // Recommended content items (also part of Learn resources)
    recommendedContentSettings.forEach(item => {
      if (!resultsMap.has(item.title)) {
        resultsMap.set(item.title, {
          id: item.id,
          title: item.title,
          breadcrumb1: item.breadcrumb1,
          breadcrumb2: item.breadcrumb2 || '',
          labels: item.labels,
          tab: 'Learn'
        });
      }
    });
    
    recommendedContentAll.forEach(item => {
      if (!resultsMap.has(item.title)) {
        resultsMap.set(item.title, {
          id: item.id,
          title: item.title,
          breadcrumb1: item.breadcrumb1,
          breadcrumb2: item.breadcrumb2 || '',
          labels: item.labels,
          tab: 'Learn'
        });
      }
    });
    
    // Knowledgebase items (117 items)
    allKnowledgebaseContent.forEach(item => {
      if (!resultsMap.has(item.title)) {
        resultsMap.set(item.title, {
          id: item.id,
          title: item.title,
          breadcrumb1: item.breadcrumb1,
          breadcrumb2: '',
          labels: item.labels,
          tab: 'Learn'
        });
      }
    });
    
    // API items (43 items)
    allApisContent.forEach(item => {
      if (!resultsMap.has(item.title)) {
        resultsMap.set(item.title, {
          id: item.id,
          title: item.title,
          breadcrumb1: item.breadcrumb1,
          breadcrumb2: '',
          labels: item.labels,
          tab: 'APIs'
        });
      }
    });
    
    // Support items (dynamic)
    supportTickets.forEach(item => {
      if (!resultsMap.has(item.title)) {
        resultsMap.set(item.title, {
          id: item.id,
          title: item.title,
          breadcrumb1: 'My open support tickets',
          breadcrumb2: '',
          labels: [],
          tab: 'Support'
        });
      }
    });
    
    // Convert Map values back to array
    return Array.from(resultsMap.values());
  };

  /**
   * Enhanced search function that searches across all tabs (Learn—including knowledgebase articles—APIs, Support)
   * Searches in: title, breadcrumbs (breadcrumb1, breadcrumb2), labels, and tab names
   * Also applies content type filters if any are selected
   */
  const getSearchResults = () => {
    if (!searchQuery.trim()) return [];
    
    let allContent = getAllSearchableContent();
    const query = searchQuery.toLowerCase();
    
    // First, filter by search query - search across title, breadcrumbs, labels, and tab
    let filteredResults = allContent.filter(item => {
      // Search in title
      if (item.title.toLowerCase().includes(query)) return true;
      
      // Search in breadcrumbs
      if (item.breadcrumb1.toLowerCase().includes(query)) return true;
      if (item.breadcrumb2 && item.breadcrumb2.toLowerCase().includes(query)) return true;
      
      // Search in tab name
      if (item.tab.toLowerCase().includes(query)) return true;
      
      // Search in labels
      if (item.labels && item.labels.some(label => label.toLowerCase().includes(query))) return true;
      
      return false;
    });
    
    // Second, apply content type filters if any are selected
    if (selectedSearchContentTypes.size > 0) {
      filteredResults = filteredResults.filter(item => {
        // Check if item matches any of the selected content types
        
        // Services filter (not implemented yet, reserved for future)
        if (selectedSearchContentTypes.has('services')) {
          // Would filter by service-related content
        }
        
        // Learning resources filters
        if (item.breadcrumb1 === 'Learning resources') {
          if (selectedSearchContentTypes.has('documentation') && item.breadcrumb2 === 'Documentation') {
            return true;
          }
          if (selectedSearchContentTypes.has('quick-starts') && item.breadcrumb2 === 'Quick start') {
            return true;
          }
          if (selectedSearchContentTypes.has('learning-paths') && item.breadcrumb2 === 'Learning path') {
            return true;
          }
          if (selectedSearchContentTypes.has('other') && item.breadcrumb2 === 'Other') {
            return true;
          }
        }
        
        // Knowledgebase filter
        if (selectedSearchContentTypes.has('knowledgebase') && item.breadcrumb1 === 'Knowledgebase article') {
          return true;
        }
        
        // API documentation filter
        if (selectedSearchContentTypes.has('api-documentation') && item.breadcrumb1 === 'API documentation') {
          return true;
        }
        
        // Support cases filter
        if (selectedSearchContentTypes.has('support-cases') && item.breadcrumb1 === 'My open support tickets') {
          return true;
        }
        
        return false;
      });
    }
    
    return filteredResults;
  };

  const helpPanelSearchResults = getSearchResults();
  const totalSearchResults = helpPanelSearchResults.length;
  const searchStartIdx = (searchPage - 1) * searchPerPage;
  const searchEndIdx = searchStartIdx + searchPerPage;
  const visibleSearchResults = helpPanelSearchResults.slice(searchStartIdx, searchEndIdx);

  // Reset search page when query changes
  React.useEffect(() => {
    setSearchPage(1);
  }, [searchQuery]);
  
  // Function to toggle content type selection
  const toggleContentType = (contentType: string) => {
    setSelectedContentTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentType)) {
        newSet.delete(contentType);
      } else {
        newSet.add(contentType);
      }
      return newSet;
    });
  };
  
  // Helper function to get content type display name
  const getContentTypeDisplayName = (contentType: string) => {
    const displayNames: { [key: string]: string } = {
      'documentation': 'Documentation',
      'quick-starts': 'Quick starts',
      'learning-paths': 'Learning paths',
      'other': 'Other'
    };
    return displayNames[contentType] || contentType;
  };
  
  // Helper function to clear all content type filters
  const clearAllContentTypeFilters = () => {
    setSelectedContentTypes(new Set());
  };

  // Search tab filter functions
  const toggleSearchContentType = (contentType: string) => {
    setSelectedSearchContentTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentType)) {
        newSet.delete(contentType);
      } else {
        newSet.add(contentType);
      }
      return newSet;
    });
  };
  
  const getSearchContentTypeDisplayName = (contentType: string) => {
    const displayNames: { [key: string]: string } = {
      'services': 'Services',
      'documentation': 'Documentation',
      'quick-starts': 'Quick starts',
      'learning-paths': 'Learning paths',
      'other': 'Other',
      'knowledgebase': 'Knowledgebase articles',
      'api-documentation': 'API documentation',
      'support-cases': 'My open support cases'
    };
    return displayNames[contentType] || contentType;
  };
  
  const clearAllSearchContentTypeFilters = () => {
    setSelectedSearchContentTypes(new Set());
  };

  // Ref for services dropdown to handle outside clicks
  const servicesDropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Ref for search container to handle outside clicks
  const searchContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Location and navigation
  const location = useLocation();
  const navigate = useNavigate();
  
  // Function to get current bundle name based on route
  const getCurrentBundle = () => {
    const currentPath = location.pathname;
    
    // Settings bundle pages (Dashboard Hub is standalone — no bundle)
    const settingsPaths = [
      '/overview',
      '/alert-manager',
      '/data-integration',
      '/event-log',
      '/learning-resources'
    ];
    if (settingsPaths.includes(currentPath)) {
      return 'Settings';
    }
    
    // IAM bundle pages
    if (['/my-user-access', '/user-access', '/users', '/groups', '/roles', '/workspaces', '/red-hat-access-requests', '/authentication-policy', '/service-accounts', '/learning-resources-iam'].includes(currentPath)) {
      return 'IAM';
    }
    
    // No bundle (homepage, all services, etc.)
    return null;
  };
  
  const currentBundle = getCurrentBundle();

  React.useEffect(() => {
    setKbPage(1);
  }, [scopeFilter, currentBundle]);
  
  // No app sidebar or masthead nav toggle: homepage, all services, or standalone Dashboard Hub
  const isPageWithoutNav =
    location.pathname === '/' ||
    location.pathname === '/all-services' ||
    location.pathname === '/dashboard-hub' ||
    location.pathname === '/dashboard' ||
    location.pathname.startsWith('/dashboard-hub/');

  // Mock search data
  const mockSearchData = [
    // Main Settings Bundle Pages
    { id: '1', title: 'Overview', description: 'View system overview and general information', category: 'Settings', route: '/overview' },
    {
      id: '19',
      title: 'Dashboard Hub',
      description: 'Browse, create, and organize dashboards for your workspace',
      category: 'Dashboard Hub',
      route: '/dashboard-hub'
    },
    { id: '2', title: 'Alert Manager', description: 'Configure and manage system alerts and notifications', category: 'Settings', route: '/alert-manager' },
    { id: '3', title: 'Data Integration', description: 'Manage data integration workflows, connectors, and synchronization settings', category: 'Settings', route: '/data-integration' },
    { id: '4', title: 'Event Log', description: 'View and configure system event logging and monitoring', category: 'Settings', route: '/event-log' },
    { id: '5', title: 'Learning Resources', description: 'Access training materials, tutorials, and documentation resources', category: 'Settings', route: '/learning-resources' },
    
    // IAM Bundle Pages
    { id: '6', title: 'My User Access', description: 'View and manage your personal access permissions and settings', category: 'IAM', route: '/my-user-access' },
    { id: '7', title: 'User Access', description: 'Manage user accounts, groups, and access permissions overview', category: 'IAM', route: '/user-access' },
    { id: '8', title: 'Users', description: 'Manage user accounts and their access permissions', category: 'IAM', route: '/users' },
    { id: '9', title: 'Groups', description: 'Create and manage user groups and group-based permissions', category: 'IAM', route: '/groups' },
    { id: '10', title: 'Roles', description: 'Define and manage user roles with specific permissions and access levels', category: 'IAM', route: '/roles' },
    { id: '11', title: 'Workspaces', description: 'Manage workspaces and project environments for teams', category: 'IAM', route: '/workspaces' },
    { id: '12', title: 'Red Hat Access Requests', description: 'Manage access requests for Red Hat services and resources', category: 'IAM', route: '/red-hat-access-requests' },
    { id: '13', title: 'Authentication Policy', description: 'Configure authentication policies and security settings', category: 'IAM', route: '/authentication-policy' },
    { id: '14', title: 'Service Accounts', description: 'Manage service accounts and API credentials for automated systems', category: 'IAM', route: '/service-accounts' },
    { id: '15', title: 'IAM Learning Resources', description: 'Access Identity & Access Management learning materials and guides', category: 'IAM', route: '/learning-resources-iam' },
    
    // Additional Services
    { id: '16', title: 'Vulnerability', description: 'View and manage system vulnerabilities', category: 'RHEL', route: null },
    { id: '17', title: 'Policies', description: 'Configure and manage security policies', category: 'RHEL', route: null },
    { id: '18', title: 'Application Performance', description: 'Monitor application performance metrics', category: 'Monitoring', route: null }
  ];

  // Top 5 results for empty state
  const topResults = [
    { id: '1', title: 'Overview', description: 'View system overview and general information', category: 'Settings', route: '/overview' },
    { id: '2', title: 'Alert Manager', description: 'Configure and manage system alerts and notifications', category: 'Settings', route: '/alert-manager' },
    { id: '6', title: 'My User Access', description: 'View and manage your personal access permissions and settings', category: 'IAM', route: '/my-user-access' },
    { id: '7', title: 'User Access', description: 'Manage user accounts, groups, and access permissions overview', category: 'IAM', route: '/user-access' },
    { id: '3', title: 'Data Integration', description: 'Manage data integration workflows, connectors, and synchronization settings', category: 'Settings', route: '/data-integration' }
  ];

  // Hide search results and collapse search bar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchButton = document.querySelector('[aria-label="Expandable search input toggle"]');
      
      // Check if click is on search toggle button - don't collapse if so
      if (searchButton && searchButton.contains(event.target as Node)) {
        return;
      }
      
      // If search is expanded and click is outside the search container
      if (isSearchExpanded && searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
        setShowSearchResults(false);
        setSearchResults([]);
        setMastheadSearchValue('');
      } else if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        // Just hide search results if search is not expanded
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);

  // Hide services dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        // Also check if click is on the masthead toggle button
        const mastheadToggle = document.querySelector('[aria-label="Red Hat Hybrid Cloud Console menu"]');
        if (mastheadToggle && mastheadToggle.contains(event.target as Node)) {
          return; // Don't close if clicking on the toggle button
        }
        setIsLogoDropdownOpen(false);
      }
    };

    if (isLogoDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLogoDropdownOpen]);

  // Reset to first menu item when dropdown opens
  React.useEffect(() => {
    if (isLogoDropdownOpen) {
      const firstItemId = getFirstMenuItemId();
      console.log('Setting selectedMenuItem to:', firstItemId);
      setSelectedMenuItem(firstItemId);
      // Force re-render with a small delay to ensure Menu component applies selection
      setTimeout(() => {
        setSelectedMenuItem(firstItemId);
        console.log('Re-setting selectedMenuItem to:', firstItemId);
      }, 10);
    }
  }, [isLogoDropdownOpen]);

  // ResizeObserver to track help panel width changes
  React.useEffect(() => {
    if (!isDrawerExpanded) {
      return;
    }

    // Find the panel element by looking for the drawer panel content
    const findPanelElement = () => {
      const selectors = [
        '.pf-v6-c-drawer__panel-content',
        '.pf-v6-c-drawer__panel',
        '[data-ouia-component-type="DrawerPanelContent"]',
        '.pf-c-drawer__panel-content',
        '.pf-c-drawer__panel'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element;
        }
      }
      
      return null;
    };

    // Wait a bit for the DOM to be ready
    const timeoutId = setTimeout(() => {
      const panelElement = findPanelElement();
      
      if (!panelElement) {
        return;
      }

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newWidth = entry.contentRect.width;
          setHelpPanelWidth(newWidth);
        }
      });

      resizeObserver.observe(panelElement);

      // Store the observer for cleanup
      (window as any).helpPanelResizeObserver = resizeObserver;
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if ((window as any).helpPanelResizeObserver) {
        (window as any).helpPanelResizeObserver.disconnect();
        delete (window as any).helpPanelResizeObserver;
      }
    };
  }, [isDrawerExpanded]);

  // Debug effect to log selectedMenuItem changes
  React.useEffect(() => {
    console.log('selectedMenuItem changed to:', selectedMenuItem);
  }, [selectedMenuItem]);

  const selectHelpPanelSubTab = React.useCallback((subTabIndex: number) => {
    setCustomHelpTitle(null);
    setCustomHelpVariant(null);
    setHelpPanelSubTab(subTabIndex);
    setSearchQuery('');
    if (subTabIndex === 4) {
      setFeedbackView('main');
    }
  }, []);

  const onDrawerToggle = () => {
    const newDrawerState = !isDrawerExpanded;
    setIsDrawerExpanded(newDrawerState);
    
    // If opening the help drawer, close the notification drawer
    if (newDrawerState && isNotificationDrawerOpen) {
      setIsNotificationDrawerOpen(false);
    }
  };

  const onDrawerClose = () => {
    setIsDrawerExpanded(false);
  };

  const onNotificationDrawerToggle = () => {
    const newNotificationState = !isNotificationDrawerOpen;
    setIsNotificationDrawerOpen(newNotificationState);
    
    // If closing the notification drawer, also close the actions dropdown
    if (!newNotificationState) {
      setIsNotificationActionsOpen(false);
    }
    
    // If opening the notification drawer, close the help drawer
    if (newNotificationState && isDrawerExpanded) {
      setIsDrawerExpanded(false);
    }
  };

  const onNotificationDrawerClose = () => {
    setIsNotificationDrawerOpen(false);
    setIsNotificationActionsOpen(false); // Close actions dropdown when drawer closes
  };

  const openHelpPanelWithTab = (title: string, options?: { variant?: 'quickstart' | 'in-page' }) => {
    const variant = options?.variant ?? 'in-page';
    setCustomHelpTitle(title);
    setCustomHelpVariant(variant);
    setHelpPanelSubTab(variant === 'quickstart' ? 1 : null);
    setSearchQuery('');

    if (!isDrawerExpanded) {
      setIsDrawerExpanded(true);
    }
    if (isNotificationDrawerOpen) {
      setIsNotificationDrawerOpen(false);
    }
  };

  const openHelpPanelToShareGeneralFeedback = React.useCallback(() => {
    setCustomHelpTitle(null);
    setCustomHelpVariant(null);
    setHelpPanelSubTab(4);
    setSearchQuery('');
    setFeedbackView('general');

    if (!isDrawerExpanded) {
      setIsDrawerExpanded(true);
    }
    if (isNotificationDrawerOpen) {
      setIsNotificationDrawerOpen(false);
    }
  }, [isDrawerExpanded, isNotificationDrawerOpen]);

  const createSearchHandlers = () => {
    const onSearchSubmit = (value: string) => {
      if (value.trim()) {
        setSearchQuery(value.trim());
      }
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        onSearchSubmit((event.currentTarget as HTMLInputElement).value);
      }
    };

    return { onSearchSubmit, handleSearchKeyDown };
  };


  const onUserDropdownToggle = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const onUserDropdownSelect = () => {
    setIsUserDropdownOpen(false);
  };

  const onUtilitiesDropdownToggle = () => {
    setIsUtilitiesDropdownOpen(!isUtilitiesDropdownOpen);
  };

  const onUtilitiesDropdownSelect = () => {
    setIsUtilitiesDropdownOpen(false);
  };

  const onLogoDropdownSelect = () => {
    setIsLogoDropdownOpen(false);
  };

  const onSearchToggle = (event: React.SyntheticEvent<HTMLButtonElement>, isExpanded: boolean) => {
    setIsSearchExpanded(!isSearchExpanded);
    // Hide search results when collapsing, show top results when expanding
    if (isSearchExpanded) {
      setShowSearchResults(false);
      setSearchResults([]);
    } else {
      // Show top results when expanding and search is empty
      if (mastheadSearchValue.trim().length === 0) {
        setSearchResults(topResults);
        setShowSearchResults(true);
      }
    }
  };

  const onMastheadSearchChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setMastheadSearchValue(value);
    
    // Show top results when search is empty, filtered results when typing
    if (value.trim().length === 0) {
      // Show top results when search is empty
      setSearchResults(topResults);
      setShowSearchResults(true);
    } else if (value.trim().length >= 2) {
      // Perform filtered search when user types (minimum 2 characters)
      const filteredResults = mockSearchData.filter(item =>
        item.title.toLowerCase().includes(value.toLowerCase()) ||
        item.description.toLowerCase().includes(value.toLowerCase()) ||
        item.category.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 6); // Limit to 6 results
      
      setSearchResults(filteredResults);
      setShowSearchResults(true);
    } else {
      // Hide results when typing 1 character (between empty and 2 chars)
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const onMastheadSearchClear = () => {
    setMastheadSearchValue('');
    // Show top results when clearing search (if expanded)
    if (isSearchExpanded) {
      setSearchResults(topResults);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const renderHelpChatPanel = () => (
    <div
      data-help-panel="chat"
      style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '0' }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #d2d2d2',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="plain" style={{ padding: '4px', color: '#666' }} aria-label="Chat options menu">
            <BarsIcon style={{ width: '16px', height: '16px' }} />
          </Button>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F56E6E 0%, #5E40BE 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CommentsIcon style={{ width: '16px', height: '16px', color: 'white' }} />
          </div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#151515' }}>Ask Red Hat</div>
        </div>
        <div style={{ width: '100%' }}>
          <Dropdown
            isOpen={false}
            onSelect={() => {}}
            toggle={(toggleRef: React.Ref<any>) => (
              <MenuToggle
                ref={toggleRef}
                isExpanded={false}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#151515',
                  textAlign: 'left',
                  justifyContent: 'flex-start',
                  backgroundColor: 'transparent',
                  border: '1px solid #d2d2d2',
                  borderRadius: '4px'
                }}
              >
                Agent: General Red Hat
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            <DropdownList>
              <DropdownItem>Agent: General Red Hat</DropdownItem>
              <DropdownItem>Support Agent</DropdownItem>
              <DropdownItem>Feedback Bot</DropdownItem>
            </DropdownList>
          </Dropdown>
        </div>
      </div>
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '0'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F56E6E 0%, #5E40BE 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <CommentsIcon style={{ width: '12px', height: '12px', color: 'white' }} />
          </div>
          <div
            style={{
              backgroundColor: '#f0f0f0',
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              maxWidth: '70%',
              fontSize: '14px',
              lineHeight: '1.4'
            }}
          >
            Hi! I'm here to help with your questions and feedback. How can I assist you today?
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '18px 18px 4px 18px',
              maxWidth: '70%',
              fontSize: '14px',
              lineHeight: '1.4',
              color: 'white',
              background: 'linear-gradient(135deg, #F56E6E 0%, #5E40BE 100%)'
            }}
          >
            I have a question about the new features
          </div>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#d2d2d2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <UserIcon style={{ width: '12px', height: '12px', color: '#666' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F56E6E 0%, #5E40BE 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <CommentsIcon style={{ width: '12px', height: '12px', color: 'white' }} />
          </div>
          <div
            style={{
              backgroundColor: '#f0f0f0',
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              maxWidth: '70%',
              fontSize: '14px',
              lineHeight: '1.4'
            }}
          >
            I'd be happy to help! What specific features would you like to know more about? I can provide information about:
            <br />• New dashboard capabilities
            <br />• Updated user interface
            <br />• Enhanced security features
            <br />• Performance improvements
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F56E6E 0%, #5E40BE 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <CommentsIcon style={{ width: '12px', height: '12px', color: 'white' }} />
          </div>
          <div
            style={{
              backgroundColor: '#f0f0f0',
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#999',
                animation: 'typing 1.4s infinite ease-in-out'
              }}
            />
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#999',
                animation: 'typing 1.4s infinite ease-in-out 0.2s'
              }}
            />
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#999',
                animation: 'typing 1.4s infinite ease-in-out 0.4s'
              }}
            />
          </div>
        </div>
      </div>
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #d2d2d2',
          backgroundColor: 'white',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #d2d2d2',
              borderRadius: '24px',
              fontSize: '14px',
              outline: 'none',
              backgroundColor: 'white'
            }}
            disabled
          />
          <Button
            variant="primary"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F56E6E 0%, #5E40BE 100%)',
              border: 'none'
            }}
            disabled
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </Button>
        </div>
      </div>
      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  const renderCustomHelpByTitle = (title: string) => {
    if (title === 'Alert manager') {
      return (
        <div style={{ padding: '24px' }}>
          <Content>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: '16px' }}>
              Alert Manager Help
            </Title>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#6a6e73' }}>
              This section provides information and guidance about using the Alert Manager feature. Configure alert default settings for your workspace and learn how fired events can alert users and groups through various communication channels.
            </p>
          </Content>
        </div>
      );
    }
    if (title === 'Dashboard widgets') {
      return <DashboardWidgetsHelpPanelContent />;
    }
    if (title === 'Configuring console event notifications in Slack') {
      return (
        <div style={{ padding: '24px' }}>
          <Content>
            <Title headingLevel="h2" size="xl" style={{ marginBottom: '16px' }}>
              Configuring console event notifications in Slack
            </Title>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#6a6e73', marginBottom: '24px' }}>
              Follow these steps to configure your console event notifications to be sent to Slack channels.
            </p>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '12px', marginTop: '24px' }}>
              Prerequisites
            </Title>
            <ul style={{ fontSize: '14px', lineHeight: '1.8', color: '#6a6e73', marginBottom: '24px' }}>
              <li>Active Slack workspace with admin permissions</li>
              <li>Red Hat Hybrid Cloud Console account</li>
              <li>Webhook URL from your Slack workspace</li>
            </ul>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '12px', marginTop: '24px' }}>
              Step 1: Create a Slack webhook
            </Title>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#6a6e73', marginBottom: '16px' }}>
              Navigate to your Slack workspace settings and create a new incoming webhook for the channel where you want to receive notifications.
            </p>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '12px', marginTop: '24px' }}>
              Step 2: Configure integration in console
            </Title>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#6a6e73', marginBottom: '16px' }}>
              Go to Settings → Integrations and add a new Slack integration using your webhook URL.
            </p>
            <Title headingLevel="h3" size="md" style={{ marginBottom: '12px', marginTop: '24px' }}>
              Step 3: Configure notification rules
            </Title>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#6a6e73', marginBottom: '16px' }}>
              Set up which events should trigger Slack notifications in the Alert Manager settings.
            </p>
          </Content>
        </div>
      );
    }
    return (
      <div style={{ padding: '24px' }}>
        <Content>
          <Title headingLevel="h2" size="xl" style={{ marginBottom: '16px' }}>
            {title}
          </Title>
          <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#6a6e73' }}>Help content for this topic.</p>
        </Content>
      </div>
    );
  };

  /**
   * Sentinel `activeKey` so no top tab matches (`eventKey` is 0–5 only). PatternFly leaves none selected;
   * we remount when crossing into/out of `null` so the tab underline accent resets.
   */
  const HELP_PANEL_TOP_TABS_NONE_KEY = -1;

  /** Static help subtabs — always at top of panel; selection mirrors `helpPanelSubTab` (null = none selected). */
  const renderHelpPanelTopTabs = () => {
    const topActiveKey = helpPanelSubTab !== null ? helpPanelSubTab : HELP_PANEL_TOP_TABS_NONE_KEY;

    return (
      <div
        className="help-panel-top-tabs-strip"
        style={{
          flexShrink: 0,
          paddingTop: 'var(--pf-v6-global--spacer--xs)',
          paddingBottom: 'var(--pf-v6-global--spacer--xs)',
          paddingLeft: 'var(--pf-v6-global--spacer--sm)',
          paddingRight: 0,
          backgroundColor: 'var(--pf-v6-global--BackgroundColor--100)'
        }}
      >
        <Tabs
          key={`hcc-help-top-${helpTopTabsMountKey}`}
          id="hcc-help-panel-top-tabs"
          hasNoBorderBottom
          activeKey={topActiveKey}
          onSelect={(_event, key) => {
            if (key === HELP_PANEL_TOP_TABS_NONE_KEY) {
              return;
            }
            selectHelpPanelSubTab(typeof key === 'number' ? key : Number(key));
          }}
          aria-label="Help navigation"
        >
          <Tab
            eventKey={0}
            title={
              <TabTitleIcon>
                <SearchIcon aria-label="Search" />
              </TabTitleIcon>
            }
            aria-label="Search sub tab"
          >
            <span className="pf-v6-u-screen-reader">Search</span>
          </Tab>
          <Tab eventKey={1} title={<TabTitleText>Learn</TabTitleText>} aria-label="Learn sub tab">
            <span className="pf-v6-u-screen-reader">Learn</span>
          </Tab>
          <Tab eventKey={2} title={<TabTitleText>APIs</TabTitleText>} aria-label="APIs sub tab">
            <span className="pf-v6-u-screen-reader">APIs</span>
          </Tab>
          <Tab eventKey={3} title={<TabTitleText>Support</TabTitleText>} aria-label="Support sub tab">
            <span className="pf-v6-u-screen-reader">Support</span>
          </Tab>
          <Tab eventKey={4} title={<TabTitleText>Feedback</TabTitleText>} aria-label="Feedback sub tab">
            <span className="pf-v6-u-screen-reader">Feedback</span>
          </Tab>
          <Tab
            eventKey={5}
            className="help-panel-chat-tab"
            title={
              <TabTitleIcon>
                <img
                  src={HappyRobotIcon}
                  alt=""
                  aria-hidden
                  style={{
                    width: '24px',
                    height: 'auto',
                    aspectRatio: '1 / 1',
                    display: 'block',
                    objectFit: 'contain'
                  }}
                />
              </TabTitleIcon>
            }
            aria-label="Chat sub tab"
          >
            <span className="pf-v6-u-screen-reader">Chat</span>
          </Tab>
        </Tabs>
      </div>
    );
  };

  const renderFindHelpSubTabs = () => {
    const { onSearchSubmit, handleSearchKeyDown } = createSearchHandlers();

    return (
      <div
        className="help-panel-inner-tabs-shell"
        style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
      <Tabs
        activeKey={helpPanelSubTab ?? 0}
        onSelect={(_event, subTabIndex) => selectHelpPanelSubTab(subTabIndex as number)}
        aria-label="Find help sub tabs"
      >
      <Tab 
        eventKey={0} 
        title={<SearchIcon aria-label="Search" />}
        aria-label="Search sub tab"
      >
        <style>{`
          .learn-menu .pf-v6-c-menu {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__list {
            padding: 0 !important;
          }
          .learn-menu .pf-v6-c-menu__list-item {
            width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__item-main {
            display: flex !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding-right: 0 !important;
          }
          .learn-menu .pf-v6-c-menu__item-text {
            padding-right: 0 !important;
          }
          .learn-menu .menu-item-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 4px;
            min-width: 0;
            width: 100%;
          }
          .learn-menu .menu-item-title-row {
            display: flex;
            align-items: center;
            gap: 4px;
            min-width: 0;
          }
          .learn-menu .menu-item-title-row button {
            padding: 4px !important;
          }
          .learn-menu .menu-item-breadcrumb-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .learn-menu .menu-item-title {
            color: var(--pf-v6-global--link--Color, #0066cc);
            cursor: pointer;
            text-decoration: none;
            flex: 1;
            min-width: 0;
            word-wrap: break-word;
            word-break: break-word;
          }
          .learn-menu .menu-item-title:hover {
            color: var(--pf-v6-global--link--Color--hover, #004080);
            text-decoration: underline;
          }
          .learn-menu .menu-item-label {
            pointer-events: none;
          }
          /* Hover effect for overflow label */
          .learn-menu .menu-item-label.overflow-label:hover {
            filter: brightness(0.85);
            transition: filter 0.2s ease;
          }
          /* Remove hover background on menu items - multiple selectors for specificity */
          .learn-menu .pf-v6-c-menu__list-item:hover,
          .learn-menu .pf-v6-c-menu__list-item:hover .pf-v6-c-menu__item,
          .learn-menu .pf-v6-c-menu__item:hover,
          .learn-menu .pf-v6-c-menu__item-main:hover,
          .learn-menu .pf-v6-c-menu__list-item:hover .pf-v6-c-menu__item-main {
            background-color: transparent !important;
          }
          /* Override PatternFly CSS variables for hover */
          .learn-menu .pf-v6-c-menu__list-item {
            --pf-v6-c-menu__list-item--hover--BackgroundColor: transparent !important;
          }
          .learn-menu .pf-v6-c-menu__item {
            --pf-v6-c-menu__item--hover--BackgroundColor: transparent !important;
          }
          /* Make the menu item itself non-clickable */
          .learn-menu .pf-v6-c-menu__item {
            pointer-events: none !important;
          }
          /* Re-enable pointer events for specific clickable elements */
          .learn-menu .pf-v6-c-menu__item button,
          .learn-menu .pf-v6-c-menu__item .menu-item-title {
            pointer-events: auto !important;
          }
          /* Bookmark icon colors */
          .learn-menu .bookmark-icon {
            color: var(--pf-t--global--icon--color--disabled, #6a6e73);
            transition: color 0.2s ease;
          }
          .learn-menu .bookmark-icon.bookmarked {
            color: var(--pf-t--global--color--brand--default, #0066cc);
          }
          /* Hide pagination options menu toggle */
          .learn-menu .pf-v6-c-pagination .pf-v6-c-menu-toggle.pf-m-plain.pf-m-text {
            display: none !important;
          }
          /* Ensure menu items can wrap */
          .learn-menu .pf-v6-c-menu__item {
            width: 100% !important;
            max-width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__item-text {
            width: 100% !important;
            max-width: 100% !important;
          }
          /* Fix dropdown content type menu styling */
          .pf-v6-c-dropdown .pf-v6-c-menu {
            box-shadow: none !important;
            border: none !important;
            --pf-v6-c-menu--BoxShadow: none !important;
          }
          .pf-v6-c-dropdown .pf-v6-c-menu__list {
            padding: 0 !important;
          }
          .pf-v6-c-dropdown .pf-v6-c-menu__content {
            box-shadow: none !important;
            --pf-v6-c-menu__content--BoxShadow: none !important;
          }
          /* Remove shadow from the dropdown popper/panel itself */
          .pf-v6-c-menu-toggle + .pf-v6-c-menu {
            box-shadow: var(--pf-v6-global--BoxShadow--md) !important;
          }
        `}</style>
        <div className="learn-menu">
          <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <SearchInput
                placeholder="Search documentation, APIs, and resources..."
                value={searchQuery}
                onChange={(_event, value) => setSearchQuery(value)}
                onClear={() => setSearchQuery('')}
                onKeyDown={handleSearchKeyDown}
                aria-label="Search help resources"
              />
            </div>
            {searchQuery.trim() && (
              <Dropdown
                isOpen={isSearchContentTypeOpen}
                onOpenChange={(isOpen: boolean) => setIsSearchContentTypeOpen(isOpen)}
                popperProps={{
                  position: 'right'
                }}
                toggle={(toggleRef: React.Ref<any>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={() => setIsSearchContentTypeOpen(!isSearchContentTypeOpen)}
                    isExpanded={isSearchContentTypeOpen}
                    badge={selectedSearchContentTypes.size > 0 ? <Badge isRead>{selectedSearchContentTypes.size}</Badge> : undefined}
                  >
                    Content type
                  </MenuToggle>
                )}
              >
                <Menu>
                  <MenuList>
                    <MenuItem itemId="services">
                      <Checkbox
                        id="search-content-type-services"
                        label="Services"
                        isChecked={selectedSearchContentTypes.has('services')}
                        onChange={() => toggleSearchContentType('services')}
                      />
                    </MenuItem>
                    <Divider component="li" />
                    <MenuGroup label="Learning resources">
                      <MenuItem itemId="documentation">
                        <Checkbox
                          id="search-content-type-documentation"
                          label="Documentation"
                          isChecked={selectedSearchContentTypes.has('documentation')}
                          onChange={() => toggleSearchContentType('documentation')}
                        />
                      </MenuItem>
                      <MenuItem itemId="quick-starts">
                        <Checkbox
                          id="search-content-type-quick-starts"
                          label="Quick starts"
                          isChecked={selectedSearchContentTypes.has('quick-starts')}
                          onChange={() => toggleSearchContentType('quick-starts')}
                        />
                      </MenuItem>
                      <MenuItem itemId="learning-paths">
                        <Checkbox
                          id="search-content-type-learning-paths"
                          label="Learning paths"
                          isChecked={selectedSearchContentTypes.has('learning-paths')}
                          onChange={() => toggleSearchContentType('learning-paths')}
                        />
                      </MenuItem>
                      <MenuItem itemId="other">
                        <Checkbox
                          id="search-content-type-other"
                          label="Other"
                          isChecked={selectedSearchContentTypes.has('other')}
                          onChange={() => toggleSearchContentType('other')}
                        />
                      </MenuItem>
                    </MenuGroup>
                    <Divider component="li" />
                    <MenuItem itemId="knowledgebase">
                      <Checkbox
                        id="search-content-type-knowledgebase"
                        label="Knowledgebase articles"
                        isChecked={selectedSearchContentTypes.has('knowledgebase')}
                        onChange={() => toggleSearchContentType('knowledgebase')}
                      />
                    </MenuItem>
                    <MenuItem itemId="api-documentation">
                      <Checkbox
                        id="search-content-type-api-documentation"
                        label="API documentation"
                        isChecked={selectedSearchContentTypes.has('api-documentation')}
                        onChange={() => toggleSearchContentType('api-documentation')}
                      />
                    </MenuItem>
                    <MenuItem itemId="support-cases">
                      <Checkbox
                        id="search-content-type-support-cases"
                        label="My open support cases"
                        isChecked={selectedSearchContentTypes.has('support-cases')}
                        onChange={() => toggleSearchContentType('support-cases')}
                      />
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Dropdown>
            )}
          </div>
          {!searchQuery.trim() && (
            <div style={{ padding: '0 16px 16px 16px', fontSize: '14px', lineHeight: '1.5', color: 'var(--pf-v6-global--Color--200)' }}>
              Find documentation, quick starts, API documentation, knowledgebase articles, and open support tickets.
            </div>
          )}
          
          {searchQuery.trim() && selectedSearchContentTypes.size > 0 && (
            <div style={{ padding: '0 16px 16px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <LabelGroup numLabels={4}>
                {Array.from(selectedSearchContentTypes).map(contentType => (
                  <Label
                    key={contentType}
                    onClose={() => toggleSearchContentType(contentType)}
                  >
                    {getSearchContentTypeDisplayName(contentType)}
                  </Label>
                ))}
              </LabelGroup>
              <Button variant="link" onClick={clearAllSearchContentTypeFilters}>
                Clear all filters
              </Button>
            </div>
          )}

          {searchQuery.trim() ? (
            // Show search results when user is typing
            <>
              <div style={{ padding: '16px 16px 8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--pf-t--global--font--size--body--lg, 18px)', fontWeight: '400' }}>
                  Search results ({totalSearchResults})
                </span>
                <Pagination
                  itemCount={totalSearchResults}
                  perPage={searchPerPage}
                  page={searchPage}
                  onSetPage={(_event, pageNumber) => setSearchPage(pageNumber)}
                  onPerPageSelect={(_event, perPage) => {
                    setSearchPerPage(perPage);
                    setSearchPage(1);
                  }}
                  variant="top"
                  isCompact
                  toggleTemplate={() => <></>}
                />
              </div>
              {visibleSearchResults.length > 0 ? (
                <Menu>
                  <MenuList>
                    {visibleSearchResults.map((result, idx) => (
                      <React.Fragment key={result.id}>
                        {idx > 0 && <Divider component="li" />}
                        <MenuItem itemId={result.id}>
                          <div className="menu-item-content">
                            <div className="menu-item-title-row">
                              {result.breadcrumb1 === 'Learning resources' && (
                                <Button
                                  variant="plain"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleBookmark(result.id);
                                  }}
                                  aria-label="Bookmark"
                                  style={{ minWidth: 'auto' }}
                                >
                                  <BookmarkIcon className={`bookmark-icon ${bookmarkedItems.has(result.id) ? 'bookmarked' : ''}`} />
                                </Button>
                              )}
                              {result.title === 'Configuring console event notifications in Slack' ? (
                                <div 
                                  className="menu-item-title"
                                  onClick={() => openHelpPanelWithTab('Configuring console event notifications in Slack', { variant: 'quickstart' })}
                                  style={{ display: 'inline', flex: 1, cursor: 'pointer' }}
                                >
                                  {result.title}
                                </div>
                              ) : (
                                <div className="menu-item-title">{result.title}</div>
                              )}
                            </div>
                            <div className="menu-item-breadcrumb-row">
                              <Breadcrumb>
                                <BreadcrumbItem>
                                  {getBreadcrumbIcon(result.breadcrumb1)}
                                  {result.breadcrumb1}
                                </BreadcrumbItem>
                                {result.breadcrumb2 && <BreadcrumbItem>{result.breadcrumb2}</BreadcrumbItem>}
                              </Breadcrumb>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center' }}>
                                {/* Show first 2 labels, then "(X) more" if needed */}
                                {result.labels.slice(0, 2).map((label, labelIdx) => (
                                  <Label key={labelIdx} className="menu-item-label" color="grey" isCompact>
                                    {label}
                                  </Label>
                                ))}
                                {result.labels.length > 2 && (
                                  <span style={{ display: 'inline-block' }}>
                                    <Tooltip
                                      content={result.labels.slice(2).join(', ')}
                                    >
                                      <Label 
                                        className="menu-item-label overflow-label" 
                                        color="grey" 
                                        isCompact 
                                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                      >
                                        ({result.labels.length - 2}) more
                                      </Label>
                                    </Tooltip>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </MenuItem>
                      </React.Fragment>
                    ))}
                  </MenuList>
                </Menu>
              ) : (
                <div style={{ 
                  padding: '32px 16px', 
                  textAlign: 'center', 
                  color: 'var(--pf-v6-global--Color--200)',
                  fontSize: '14px'
                }}>
                  No results found for "{searchQuery}"
                </div>
              )}
              <div style={{ padding: '16px', borderTop: '1px solid var(--pf-v6-global--BorderColor--100)' }}>
                <Pagination
                  itemCount={totalSearchResults}
                  perPage={searchPerPage}
                  page={searchPage}
                  onSetPage={(_event, pageNumber) => setSearchPage(pageNumber)}
                  onPerPageSelect={(_event, perPage) => {
                    setSearchPerPage(perPage);
                    setSearchPage(1);
                  }}
                  variant="bottom"
                />
              </div>
            </>
          ) : (
            // Show recent searches and recommended content when not searching
            <>
              <div style={{ padding: '16px 16px 8px 16px' }}>
                <span style={{ fontSize: 'var(--pf-t--global--font--size--body--lg, 18px)', fontWeight: '400' }}>Recent search queries</span>
              </div>
              {recentSearches.length === 0 ? (
                <div style={{ 
                  padding: '32px 16px', 
                  textAlign: 'center', 
                  color: 'var(--pf-v6-global--Color--200)',
                  fontSize: '14px'
                }}>
                  No recent queries
                </div>
              ) : (
                <Menu>
                  <MenuList>
                    {recentSearches.map((search, idx) => (
                      <React.Fragment key={`recent-search-${idx}`}>
                        {idx > 0 && <Divider component="li" />}
                        <MenuItem 
                          itemId={`recent-search-${idx}`}
                        >
                          <div className="menu-item-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {search.query}
                            <span style={{ color: 'var(--pf-v6-global--Color--200)', fontSize: '14px' }}>({search.count})</span>
                          </div>
                        </MenuItem>
                      </React.Fragment>
                    ))}
                  </MenuList>
                </Menu>
              )}
              <div style={{ padding: '16px 16px 8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: 'var(--pf-t--global--font--size--body--lg, 18px)', fontWeight: '400' }}>Recommended content</span>
                  {currentBundle ? (
                    <ToggleGroup aria-label="Scope filter" isCompact>
                      <ToggleGroupItem
                        text={currentBundle}
                        buttonId="scope-bundle"
                        isSelected={scopeFilter === 'bundle'}
                        onChange={() => setScopeFilter('bundle')}
                      />
                      <ToggleGroupItem
                        text="All"
                        buttonId="scope-all"
                        isSelected={scopeFilter === 'all'}
                        onChange={() => setScopeFilter('all')}
                      />
                    </ToggleGroup>
                  ) : (
                    <ToggleGroup aria-label="Scope filter" isCompact>
                      <ToggleGroupItem
                        text="All"
                        buttonId="scope-all"
                        isSelected={true}
                        onChange={() => {}}
                      />
                    </ToggleGroup>
                  )}
                </div>
              </div>
              <Menu>
            <MenuList>
              {(() => {
                // Select content based on scope filter
                const content = scopeFilter === 'all' || !currentBundle
                  ? recommendedContentAll
                  : recommendedContentSettings;
                
                // Sort alphabetically by title
                const sortedContent = [...content].sort((a, b) => a.title.localeCompare(b.title));
                
                return sortedContent.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    {idx > 0 && <Divider component="li" />}
                    <MenuItem itemId={item.id}>
                      <div className="menu-item-content">
                        <div className="menu-item-title-row">
                          {item.breadcrumb1 === 'Learning resources' && (
                            <Button
                              variant="plain"
                              aria-label={bookmarkedItems.has(item.id) ? 'Remove bookmark' : 'Add bookmark'}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleBookmark(item.id);
                              }}
                              style={{ padding: '4px', marginLeft: '-4px' }}
                            >
                              <BookmarkIcon className={`bookmark-icon ${bookmarkedItems.has(item.id) ? 'bookmarked' : ''}`} />
                            </Button>
                          )}
                          {item.title === 'Configuring console event notifications in Slack' ? (
                            <div 
                              className="menu-item-title"
                              onClick={() => openHelpPanelWithTab('Configuring console event notifications in Slack', { variant: 'quickstart' })}
                              style={{ display: 'inline', flex: 1, cursor: 'pointer' }}
                            >
                              {item.title}
                            </div>
                          ) : (
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="menu-item-title"
                              style={{ display: 'inline', flex: 1 }}
                            >
                              {item.title}
                              <ExternalLinkAltIcon style={{ width: '12px', height: '12px', verticalAlign: 'middle', marginLeft: '4px' }} />
                            </a>
                          )}
                        </div>
                        <div className="menu-item-breadcrumb-row">
                          <Breadcrumb>
                            <BreadcrumbItem>
                              {getBreadcrumbIcon(item.breadcrumb1)}
                              {item.breadcrumb1}
                            </BreadcrumbItem>
                            {item.breadcrumb2 && <BreadcrumbItem>{item.breadcrumb2}</BreadcrumbItem>}
                          </Breadcrumb>
                          {item.labels.length > 0 && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center' }}>
                              {/* Show first 2 labels, then "(X) more" if needed */}
                              {item.labels.slice(0, 2).map((label, labelIdx) => (
                                <Label key={labelIdx} className="menu-item-label" color="grey" isCompact>
                                  {label}
                                </Label>
                              ))}
                              {item.labels.length > 2 && (
                                <span style={{ display: 'inline-block' }}>
                                  <Tooltip
                                    content={item.labels.slice(2).join(', ')}
                                  >
                                    <Label 
                                      className="menu-item-label overflow-label" 
                                      color="grey" 
                                      isCompact 
                                      style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                    >
                                      ({item.labels.length - 2}) more
                                    </Label>
                                  </Tooltip>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </MenuItem>
                  </React.Fragment>
                ));
              })()}
            </MenuList>
          </Menu>
            </>
          )}
        </div>
      </Tab>
      <Tab 
        eventKey={1} 
        title={<TabTitleText>Learn</TabTitleText>}
        aria-label="Learn sub tab"
      >
        <style>{`
          .learn-menu .pf-v6-c-menu {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__list {
            padding: 0 !important;
          }
          .learn-menu .pf-v6-c-menu__list-item {
            width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__item-main {
            display: flex !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding-right: 0 !important;
          }
          .learn-menu .pf-v6-c-menu__item-text {
            padding-right: 0 !important;
          }
          .learn-menu .menu-item-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 4px;
            min-width: 0;
            width: 100%;
          }
          .learn-menu .menu-item-title-row {
            display: flex;
            align-items: center;
            gap: 4px;
            min-width: 0;
          }
          .learn-menu .menu-item-title-row button {
            padding: 4px !important;
          }
          .learn-menu .menu-item-breadcrumb-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .learn-menu .menu-item-title {
            color: var(--pf-v6-global--link--Color, #0066cc);
            cursor: pointer;
            text-decoration: none;
            flex: 1;
            min-width: 0;
            word-wrap: break-word;
            word-break: break-word;
          }
          .learn-menu .menu-item-title:hover {
            color: var(--pf-v6-global--link--Color--hover, #004080);
            text-decoration: underline;
          }
          .learn-menu .menu-item-label {
            pointer-events: none;
          }
          /* Hover effect for overflow label */
          .learn-menu .menu-item-label.overflow-label:hover {
            filter: brightness(0.85);
            transition: filter 0.2s ease;
          }
          /* Remove hover background on menu items - multiple selectors for specificity */
          .learn-menu .pf-v6-c-menu__list-item:hover,
          .learn-menu .pf-v6-c-menu__list-item:hover .pf-v6-c-menu__item,
          .learn-menu .pf-v6-c-menu__item:hover,
          .learn-menu .pf-v6-c-menu__item-main:hover,
          .learn-menu .pf-v6-c-menu__list-item:hover .pf-v6-c-menu__item-main {
            background-color: transparent !important;
          }
          /* Override PatternFly CSS variables for hover */
          .learn-menu .pf-v6-c-menu__list-item {
            --pf-v6-c-menu__list-item--hover--BackgroundColor: transparent !important;
          }
          .learn-menu .pf-v6-c-menu__item {
            --pf-v6-c-menu__item--hover--BackgroundColor: transparent !important;
          }
          /* Make the menu item itself non-clickable */
          .learn-menu .pf-v6-c-menu__item {
            pointer-events: none !important;
          }
          /* Re-enable pointer events for specific clickable elements */
          .learn-menu .pf-v6-c-menu__item button,
          .learn-menu .pf-v6-c-menu__item .menu-item-title {
            pointer-events: auto !important;
          }
          /* Bookmark icon colors */
          .learn-menu .bookmark-icon {
            color: var(--pf-t--global--icon--color--disabled, #6a6e73);
            transition: color 0.2s ease;
          }
          .learn-menu .bookmark-icon.bookmarked {
            color: var(--pf-t--global--color--brand--default, #0066cc);
          }
          /* Hide pagination options menu toggle */
          .learn-menu .pf-v6-c-pagination .pf-v6-c-menu-toggle.pf-m-plain.pf-m-text {
            display: none !important;
          }
          /* Ensure menu items can wrap */
          .learn-menu .pf-v6-c-menu__item {
            width: 100% !important;
            max-width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__item-text {
            width: 100% !important;
            max-width: 100% !important;
          }
        `}</style>
        <div className="learn-menu">
          <div style={{ padding: '16px 16px 12px 16px', fontSize: '14px', lineHeight: '1.5', color: 'var(--pf-v6-global--Color--200)' }}>
            Find product documentation, quick starts, learning paths, knowledgebase articles, and more related to services on the Hybrid Cloud Console. For learning resources, browse the <a href="https://console.redhat.com/learning-resources?tab=all" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pf-v6-global--link--Color, #0066cc)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>All Learning Catalog</a>. For broader knowledgebase and support content, see the <a href="https://access.redhat.com/kb/search?document_kinds=Article&start=0&products=Red+Hat+Hybrid+Cloud+Console" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pf-v6-global--link--Color, #0066cc)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>Customer Portal</a>.
          </div>
          <div style={{ padding: '0 16px 16px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Dropdown
              isOpen={isContentTypeOpen}
              onOpenChange={(isOpen: boolean) => setIsContentTypeOpen(isOpen)}
              toggle={(toggleRef: React.Ref<any>) => (
                <MenuToggle
                  ref={toggleRef}
                  onClick={() => setIsContentTypeOpen(!isContentTypeOpen)}
                  isExpanded={isContentTypeOpen}
                  badge={selectedContentTypes.size > 0 ? <Badge isRead>{selectedContentTypes.size}</Badge> : undefined}
                >
                  Content type
                </MenuToggle>
              )}
            >
              <DropdownList>
                <DropdownItem>
                  <Checkbox
                    id="content-type-documentation"
                    label="Documentation"
                    isChecked={selectedContentTypes.has('documentation')}
                    onChange={() => toggleContentType('documentation')}
                  />
                </DropdownItem>
                <DropdownItem>
                  <Checkbox
                    id="content-type-quick-starts"
                    label="Quick starts"
                    isChecked={selectedContentTypes.has('quick-starts')}
                    onChange={() => toggleContentType('quick-starts')}
                  />
                </DropdownItem>
                <DropdownItem>
                  <Checkbox
                    id="content-type-learning-paths"
                    label="Learning paths"
                    isChecked={selectedContentTypes.has('learning-paths')}
                    onChange={() => toggleContentType('learning-paths')}
                  />
                </DropdownItem>
                <DropdownItem>
                  <Checkbox
                    id="content-type-other"
                    label="Other"
                    isChecked={selectedContentTypes.has('other')}
                    onChange={() => toggleContentType('other')}
                  />
                </DropdownItem>
              </DropdownList>
            </Dropdown>
            <Checkbox
              id="show-bookmarked-only"
              label="Show bookmarked only"
              isChecked={showBookmarkedOnly}
              onChange={(_event, checked) => setShowBookmarkedOnly(checked)}
            />
          </div>
          {selectedContentTypes.size > 0 && (
            <div style={{ padding: '0 16px 16px 16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <LabelGroup numLabels={4}>
                {Array.from(selectedContentTypes).map(contentType => (
                  <Label
                    key={contentType}
                    color="blue"
                    onClose={() => toggleContentType(contentType)}
                  >
                    {getContentTypeDisplayName(contentType)}
                  </Label>
                ))}
              </LabelGroup>
              <Button
                variant="link"
                isInline
                onClick={clearAllContentTypeFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}
          <div style={{ padding: '16px 16px 8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: 'var(--pf-t--global--font--size--body--lg, 18px)', fontWeight: '400' }}>
                Learning resources ({scopeFilter === 'bundle' && currentBundle ? allLearnContent.filter(item => item.labels.includes(currentBundle)).length : allLearnContent.length})
              </span>
              {currentBundle ? (
                <ToggleGroup aria-label="Scope filter" isCompact>
                  <ToggleGroupItem
                    text={currentBundle}
                    buttonId="scope-bundle"
                    isSelected={scopeFilter === 'bundle'}
                    onChange={() => setScopeFilter('bundle')}
                  />
                  <ToggleGroupItem
                    text="All"
                    buttonId="scope-all"
                    isSelected={scopeFilter === 'all'}
                    onChange={() => setScopeFilter('all')}
                  />
                </ToggleGroup>
              ) : (
                <ToggleGroup aria-label="Scope filter" isCompact>
                  <ToggleGroupItem
                    text="All"
                    buttonId="scope-all"
                    isSelected={true}
                    onChange={() => {}}
                  />
                </ToggleGroup>
              )}
            </div>
            <Pagination
              itemCount={scopeFilter === 'bundle' && currentBundle ? allLearnContent.filter(item => item.labels.includes(currentBundle)).length : allLearnContent.length}
              perPage={perPage}
              page={page}
              onSetPage={(_event, pageNumber) => setPage(pageNumber)}
              onPerPageSelect={(_event, perPage) => setPerPage(perPage)}
              variant="top"
              isCompact
              toggleTemplate={() => <></>}
            />
          </div>
          <Menu>
            <MenuList>
              {/* Dynamic filtering based on bundle selection */}
              {(() => {
                // Filter content based on bundle selection
                const filteredContent = scopeFilter === 'bundle' && currentBundle
                  ? allLearnContent.filter(item => item.labels.includes(currentBundle))
                  : allLearnContent;
                
                // Sort alphabetically
                const sortedContent = [...filteredContent].sort((a, b) => a.title.localeCompare(b.title));
                
                // Pagination: show only items for current page (10 per page)
                const startIdx = (page - 1) * perPage;
                const endIdx = startIdx + perPage;
                const paginatedContent = sortedContent.slice(startIdx, endIdx);
                
                return paginatedContent.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    {idx > 0 && <Divider component="li" />}
                    <MenuItem itemId={item.id}>
                      <div className="menu-item-content">
                        <div className="menu-item-title-row">
                          <Button
                            variant="plain"
                            aria-label={bookmarkedItems.has(item.id) ? 'Remove bookmark' : 'Add bookmark'}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(item.id);
                            }}
                            style={{ padding: '4px', marginLeft: '-4px' }}
                          >
                            <BookmarkIcon className={`bookmark-icon ${bookmarkedItems.has(item.id) ? 'bookmarked' : ''}`} />
                          </Button>
                          {item.title === 'Configuring console event notifications in Slack' ? (
                            <div 
                              className="menu-item-title"
                              onClick={() => openHelpPanelWithTab('Configuring console event notifications in Slack', { variant: 'quickstart' })}
                              style={{ display: 'inline', flex: 1, cursor: 'pointer' }}
                            >
                              {item.title}
                            </div>
                          ) : (
                            <div className="menu-item-title">{item.title}</div>
                          )}
                        </div>
                        <div className="menu-item-breadcrumb-row">
                          <Breadcrumb>
                            <BreadcrumbItem>
                              {getBreadcrumbIcon(item.breadcrumb1)}
                              {item.breadcrumb1}
                            </BreadcrumbItem>
                            <BreadcrumbItem>{item.breadcrumb2}</BreadcrumbItem>
                          </Breadcrumb>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center' }}>
                            {/* Show first 2 labels, then "(X) more" if needed */}
                            {item.labels.slice(0, 2).map((label, labelIdx) => (
                              <Label key={labelIdx} className="menu-item-label" color="grey" isCompact>
                                {label}
                              </Label>
                            ))}
                            {item.labels.length > 2 && (
                              <span style={{ display: 'inline-block' }}>
                                <Tooltip
                                  content={item.labels.slice(2).join(', ')}
                                >
                                  <Label 
                                    className="menu-item-label overflow-label" 
                                    color="grey" 
                                    isCompact 
                                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                  >
                                    ({item.labels.length - 2}) more
                                  </Label>
                                </Tooltip>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </MenuItem>
                  </React.Fragment>
                ));
              })()}
            </MenuList>
          </Menu>
          <div style={{ padding: '16px', borderTop: '1px solid var(--pf-v6-global--BorderColor--100)' }}>
            <Pagination
              itemCount={scopeFilter === 'bundle' && currentBundle ? allLearnContent.filter(item => item.labels.includes(currentBundle)).length : allLearnContent.length}
              perPage={perPage}
              page={page}
              onSetPage={(_event, pageNumber) => setPage(pageNumber)}
              onPerPageSelect={(_event, perPage) => setPerPage(perPage)}
              variant="bottom"
            />
          </div>
          <Divider inset={{ default: 'insetNone' }} />
          <div style={{ padding: '16px 16px 8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: 'var(--pf-t--global--font--size--body--lg, 18px)', fontWeight: '400' }}>
                Knowledgebase articles ({scopeFilter === 'bundle' && currentBundle ? allKnowledgebaseContent.filter(item => item.labels.includes(currentBundle)).length : allKnowledgebaseContent.length})
              </span>
              {currentBundle ? (
                <ToggleGroup aria-label="Knowledgebase scope filter" isCompact>
                  <ToggleGroupItem
                    text={currentBundle}
                    buttonId="kb-scope-bundle"
                    isSelected={scopeFilter === 'bundle'}
                    onChange={() => setScopeFilter('bundle')}
                  />
                  <ToggleGroupItem
                    text="All"
                    buttonId="kb-scope-all"
                    isSelected={scopeFilter === 'all'}
                    onChange={() => setScopeFilter('all')}
                  />
                </ToggleGroup>
              ) : (
                <ToggleGroup aria-label="Knowledgebase scope filter" isCompact>
                  <ToggleGroupItem
                    text="All"
                    buttonId="kb-scope-all-only"
                    isSelected={true}
                    onChange={() => {}}
                  />
                </ToggleGroup>
              )}
            </div>
            <Pagination
              itemCount={scopeFilter === 'bundle' && currentBundle ? allKnowledgebaseContent.filter(item => item.labels.includes(currentBundle)).length : allKnowledgebaseContent.length}
              perPage={kbPerPage}
              page={kbPage}
              onSetPage={(_event, pageNumber) => setKbPage(pageNumber)}
              onPerPageSelect={(_event, p) => setKbPerPage(p)}
              variant="top"
              isCompact
              toggleTemplate={() => <></>}
            />
          </div>
          <Menu>
            <MenuList>
              {(() => {
                const filteredKb = scopeFilter === 'bundle' && currentBundle
                  ? allKnowledgebaseContent.filter(item => item.labels.includes(currentBundle))
                  : allKnowledgebaseContent;
                const sortedKb = [...filteredKb].sort((a, b) => a.title.localeCompare(b.title));
                const kbStart = (kbPage - 1) * kbPerPage;
                const kbEnd = kbStart + kbPerPage;
                const paginatedKb = sortedKb.slice(kbStart, kbEnd);
                return paginatedKb.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    {idx > 0 && <Divider component="li" />}
                    <MenuItem itemId={item.id}>
                      <div className="menu-item-content">
                        <div className="menu-item-title-row">
                          <div className="menu-item-title">{item.title}</div>
                        </div>
                        <div className="menu-item-breadcrumb-row">
                          <Breadcrumb>
                            <BreadcrumbItem>
                              {getBreadcrumbIcon(item.breadcrumb1)}
                              {item.breadcrumb1}
                            </BreadcrumbItem>
                          </Breadcrumb>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center' }}>
                            {item.labels.slice(0, 2).map((label, labelIdx) => (
                              <Label key={labelIdx} className="menu-item-label" color="grey" isCompact>
                                {label}
                              </Label>
                            ))}
                            {item.labels.length > 2 && (
                              <span style={{ display: 'inline-block' }}>
                                <Tooltip content={item.labels.slice(2).join(', ')}>
                                  <Label
                                    className="menu-item-label overflow-label"
                                    color="grey"
                                    isCompact
                                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                  >
                                    ({item.labels.length - 2}) more
                                  </Label>
                                </Tooltip>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </MenuItem>
                  </React.Fragment>
                ));
              })()}
            </MenuList>
          </Menu>
          <div style={{ padding: '16px', borderTop: '1px solid var(--pf-v6-global--BorderColor--100)' }}>
            <Pagination
              itemCount={scopeFilter === 'bundle' && currentBundle ? allKnowledgebaseContent.filter(item => item.labels.includes(currentBundle)).length : allKnowledgebaseContent.length}
              perPage={kbPerPage}
              page={kbPage}
              onSetPage={(_event, pageNumber) => setKbPage(pageNumber)}
              onPerPageSelect={(_event, p) => setKbPerPage(p)}
              variant="bottom"
            />
          </div>
        </div>
      </Tab>
      <Tab 
        eventKey={2} 
        title={<TabTitleText>APIs</TabTitleText>}
        aria-label="APIs sub tab"
      >
        <style>{`
          .learn-menu .pf-v6-c-menu {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__list {
            padding: 0 !important;
          }
          .learn-menu .pf-v6-c-menu__list-item {
            width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__item-main {
            display: flex !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding-right: 0 !important;
          }
          .learn-menu .pf-v6-c-menu__item-text {
            padding-right: 0 !important;
          }
          .learn-menu .menu-item-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 4px;
            min-width: 0;
            width: 100%;
          }
          .learn-menu .menu-item-title-row {
            display: flex;
            align-items: center;
            gap: 4px;
            min-width: 0;
          }
          .learn-menu .menu-item-title-row button {
            padding: 4px !important;
          }
          .learn-menu .menu-item-breadcrumb-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .learn-menu .menu-item-title {
            color: var(--pf-v6-global--link--Color, #0066cc);
            cursor: pointer;
            text-decoration: none;
            flex: 1;
            min-width: 0;
            word-wrap: break-word;
            word-break: break-word;
          }
          .learn-menu .menu-item-title:hover {
            color: var(--pf-v6-global--link--Color--hover, #004080);
            text-decoration: underline;
          }
          .learn-menu .menu-item-label {
            pointer-events: none;
          }
          .learn-menu .menu-item-label.overflow-label:hover {
            filter: brightness(0.85);
            transition: filter 0.2s ease;
          }
          /* Remove hover background on menu items - multiple selectors for specificity */
          .learn-menu .pf-v6-c-menu__list-item:hover,
          .learn-menu .pf-v6-c-menu__list-item:hover .pf-v6-c-menu__item,
          .learn-menu .pf-v6-c-menu__item:hover,
          .learn-menu .pf-v6-c-menu__item-main:hover,
          .learn-menu .pf-v6-c-menu__list-item:hover .pf-v6-c-menu__item-main {
            background-color: transparent !important;
          }
          /* Override PatternFly CSS variables for hover */
          .learn-menu .pf-v6-c-menu__list-item {
            --pf-v6-c-menu__list-item--hover--BackgroundColor: transparent !important;
          }
          .learn-menu .pf-v6-c-menu__item {
            --pf-v6-c-menu__item--hover--BackgroundColor: transparent !important;
          }
          /* Make the menu item itself non-clickable */
          .learn-menu .pf-v6-c-menu__item {
            pointer-events: none !important;
          }
          /* Re-enable pointer events for specific clickable elements */
          .learn-menu .pf-v6-c-menu__item button,
          .learn-menu .pf-v6-c-menu__item .menu-item-title {
            pointer-events: auto !important;
          }
          /* Bookmark icon colors */
          .learn-menu .bookmark-icon {
            color: var(--pf-t--global--icon--color--disabled, #6a6e73);
            transition: color 0.2s ease;
          }
          .learn-menu .bookmark-icon.bookmarked {
            color: var(--pf-t--global--color--brand--default, #0066cc);
          }
          /* Hide pagination options menu toggle */
          .learn-menu .pf-v6-c-pagination .pf-v6-c-menu-toggle.pf-m-plain.pf-m-text {
            display: none !important;
          }
          /* Ensure menu items can wrap */
          .learn-menu .pf-v6-c-menu__item {
            width: 100% !important;
            max-width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__item-text {
            width: 100% !important;
            max-width: 100% !important;
          }
        `}</style>
        <div className="learn-menu">
          <div style={{ padding: '16px 16px 12px 16px', fontSize: '14px', lineHeight: '1.5', color: 'var(--pf-v6-global--Color--200)' }}>
            Browse the APIs for Hybrid Cloud Console services. See full API documentation on the <a href="https://developers.redhat.com/api-catalog/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pf-v6-global--link--Color, #0066cc)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>API documentation catalog</a>.
          </div>
          <div style={{ padding: '16px 16px 8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {(() => {
                const filteredContent = scopeFilter === 'bundle' && currentBundle
                  ? allApisContent.filter(item => item.labels.includes(currentBundle))
                  : allApisContent;
                
                return <span style={{ fontSize: 'var(--pf-t--global--font--size--body--lg, 18px)', fontWeight: '400' }}>API documentation ({filteredContent.length})</span>;
              })()}
              {currentBundle ? (
                <ToggleGroup aria-label="Scope filter" isCompact>
                  <ToggleGroupItem
                    text={currentBundle}
                    buttonId="scope-bundle"
                    isSelected={scopeFilter === 'bundle'}
                    onChange={() => setScopeFilter('bundle')}
                  />
                  <ToggleGroupItem
                    text="All"
                    buttonId="scope-all"
                    isSelected={scopeFilter === 'all'}
                    onChange={() => setScopeFilter('all')}
                  />
                </ToggleGroup>
              ) : (
                <ToggleGroup aria-label="Scope filter" isCompact>
                  <ToggleGroupItem
                    text="All"
                    buttonId="scope-all"
                    isSelected={true}
                    onChange={() => {}}
                  />
                </ToggleGroup>
              )}
            </div>
            {(() => {
              const filteredContent = scopeFilter === 'bundle' && currentBundle
                ? allApisContent.filter(item => item.labels.includes(currentBundle))
                : allApisContent;
              
              return (
                <Pagination
                  itemCount={filteredContent.length}
                  perPage={perPage}
                  page={page}
                  onSetPage={(_event, pageNumber) => setPage(pageNumber)}
                  onPerPageSelect={(_event, perPage) => setPerPage(perPage)}
                  variant="top"
                  isCompact
                  toggleTemplate={() => <></>}
                />
              );
            })()}
          </div>
          <Menu>
            <MenuList>
              {(() => {
                const filteredContent = scopeFilter === 'bundle' && currentBundle
                  ? allApisContent.filter(item => item.labels.includes(currentBundle))
                  : allApisContent;
                
                const sortedContent = [...filteredContent].sort((a, b) => a.title.localeCompare(b.title));
                
                // Pagination: show only 10 items per page
                const startIdx = (page - 1) * perPage;
                const endIdx = startIdx + perPage;
                const paginatedContent = sortedContent.slice(startIdx, endIdx);
                
                return paginatedContent.map((item, idx) => (
                  <React.Fragment key={item.id}>
                    {idx > 0 && <Divider component="li" />}
                    <MenuItem itemId={item.id}>
                      <div className="menu-item-content">
                        <div className="menu-item-title-row">
                          <div className="menu-item-title">{item.title}</div>
                        </div>
                        <div className="menu-item-breadcrumb-row">
                          <Breadcrumb>
                            <BreadcrumbItem>
                              {getBreadcrumbIcon(item.breadcrumb1)}
                              {item.breadcrumb1}
                            </BreadcrumbItem>
                          </Breadcrumb>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center' }}>
                            {/* Show first 2 labels, then "(X) more" if needed */}
                            {item.labels.slice(0, 2).map((label, labelIdx) => (
                              <Label key={labelIdx} className="menu-item-label" color="grey" isCompact>
                                {label}
                              </Label>
                            ))}
                            {item.labels.length > 2 && (
                              <span style={{ display: 'inline-block' }}>
                                <Tooltip
                                  content={item.labels.slice(2).join(', ')}
                                >
                                  <Label 
                                    className="menu-item-label overflow-label" 
                                    color="grey" 
                                    isCompact 
                                    style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                                  >
                                    ({item.labels.length - 2}) more
                                  </Label>
                                </Tooltip>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </MenuItem>
                  </React.Fragment>
                ));
              })()}
            </MenuList>
          </Menu>
          <div style={{ padding: '16px', borderTop: '1px solid var(--pf-v6-global--BorderColor--100)' }}>
            {(() => {
              const filteredContent = scopeFilter === 'bundle' && currentBundle
                ? allApisContent.filter(item => item.labels.includes(currentBundle))
                : allApisContent;
              
              return (
                <Pagination
                  itemCount={filteredContent.length}
                  perPage={perPage}
                  page={page}
                  onSetPage={(_event, pageNumber) => setPage(pageNumber)}
                  onPerPageSelect={(_event, perPage) => setPerPage(perPage)}
                  variant="bottom"
                />
              );
            })()}
          </div>
        </div>
      </Tab>
      <Tab 
        eventKey={3} 
        title={<TabTitleText>Support</TabTitleText>}
        aria-label="Support sub tab"
      >
        <style>{`
          .learn-menu .pf-v6-c-menu {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__list {
            padding: 0 !important;
          }
          .learn-menu .pf-v6-c-menu__list-item {
            width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__item-main {
            display: flex !important;
            align-items: flex-start !important;
            gap: 12px !important;
            padding-right: 0 !important;
          }
          .learn-menu .pf-v6-c-menu__item-text {
            padding-right: 0 !important;
          }
          .learn-menu .menu-item-content {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 4px;
            min-width: 0;
            width: 100%;
          }
          .learn-menu .menu-item-title-row {
            display: flex;
            align-items: center;
            gap: 4px;
            min-width: 0;
          }
          .learn-menu .menu-item-title-row button {
            padding: 4px !important;
          }
          .learn-menu .menu-item-breadcrumb-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
          }
          .learn-menu .menu-item-title {
            color: var(--pf-v6-global--link--Color, #0066cc);
            cursor: pointer;
            text-decoration: none;
            flex: 1;
            min-width: 0;
            word-wrap: break-word;
            word-break: break-word;
          }
          .learn-menu .menu-item-title:hover {
            color: var(--pf-v6-global--link--Color--hover, #004080);
            text-decoration: underline;
          }
          .learn-menu .menu-item-label {
            pointer-events: none;
          }
          /* Remove hover background on menu items - multiple selectors for specificity */
          .learn-menu .pf-v6-c-menu__list-item:hover,
          .learn-menu .pf-v6-c-menu__list-item:hover .pf-v6-c-menu__item,
          .learn-menu .pf-v6-c-menu__item:hover,
          .learn-menu .pf-v6-c-menu__item-main:hover,
          .learn-menu .pf-v6-c-menu__list-item:hover .pf-v6-c-menu__item-main {
            background-color: transparent !important;
          }
          /* Override PatternFly CSS variables for hover */
          .learn-menu .pf-v6-c-menu__list-item {
            --pf-v6-c-menu__list-item--hover--BackgroundColor: transparent !important;
          }
          .learn-menu .pf-v6-c-menu__item {
            --pf-v6-c-menu__item--hover--BackgroundColor: transparent !important;
          }
          /* Make the menu item itself non-clickable */
          .learn-menu .pf-v6-c-menu__item {
            pointer-events: none !important;
          }
          /* Re-enable pointer events for specific clickable elements */
          .learn-menu .pf-v6-c-menu__item button,
          .learn-menu .pf-v6-c-menu__item .menu-item-title {
            pointer-events: auto !important;
          }
          /* Bookmark icon colors */
          .learn-menu .bookmark-icon {
            color: var(--pf-t--global--icon--color--disabled, #6a6e73);
            transition: color 0.2s ease;
          }
          .learn-menu .bookmark-icon.bookmarked {
            color: var(--pf-t--global--color--brand--default, #0066cc);
          }
          /* Hide pagination options menu toggle */
          .learn-menu .pf-v6-c-pagination .pf-v6-c-menu-toggle.pf-m-plain.pf-m-text {
            display: none !important;
          }
          /* Ensure menu items can wrap */
          .learn-menu .pf-v6-c-menu__item {
            width: 100% !important;
            max-width: 100% !important;
          }
          .learn-menu .pf-v6-c-menu__item-text {
            width: 100% !important;
            max-width: 100% !important;
          }
        `}</style>
        <div className="learn-menu">
          <div style={{ padding: '16px 16px 12px 16px', fontSize: '14px', lineHeight: '1.5', color: 'var(--pf-v6-global--Color--200)' }}>
            Quickly see the status on all of your open support cases. To manage support case or open a new one, visit the{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                loadSupportTickets();
              }}
              style={{ color: 'var(--pf-v6-global--link--Color, #0066cc)', textDecoration: 'none', cursor: 'pointer' }} 
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} 
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Customer Portal
            </a>.
          </div>
          
          {supportTicketsLoading ? (
            <div style={{ padding: '64px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Spinner size="xl" aria-label="Loading support tickets" />
            </div>
          ) : supportTickets.length > 0 ? (
            <>
              <div style={{ padding: '16px 16px 8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 'var(--pf-t--global--font--size--body--lg, 18px)', fontWeight: '400' }}>My open support cases ({supportTickets.length})</span>
              </div>
              <Menu>
                <MenuList>
                  {supportTickets.map((ticket, idx) => (
                    <React.Fragment key={ticket.id}>
                      {idx > 0 && <Divider component="li" />}
                      <MenuItem itemId={ticket.id}>
                        <div className="menu-item-content">
                          <div className="menu-item-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                              <span className="menu-item-title" style={{ display: 'inline' }}>
                                {ticket.title}
                                <ExternalLinkAltIcon style={{ width: '12px', height: '12px', verticalAlign: 'middle', marginLeft: '6px', color: 'var(--pf-v6-global--link--Color, #0066cc)' }} />
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', marginLeft: '16px' }}>
                              {ticket.status === 'waiting-red-hat' ? (
                                <>
                                  <span style={{ fontSize: '14px', color: 'var(--pf-v6-global--Color--200)' }}>Waiting on Red Hat</span>
                                  <InProgressIcon style={{ width: '14px', height: '14px', color: '#151515' }} />
                                </>
                              ) : (
                                <>
                                  <span style={{ fontSize: '14px', color: 'var(--pf-v6-global--Color--200)' }}>Waiting on customer</span>
                                  <BellIcon style={{ width: '14px', height: '14px', color: '#6753AC' }} />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </MenuItem>
                    </React.Fragment>
                  ))}
                </MenuList>
              </Menu>
            </>
          ) : (
            <div style={{ padding: '64px 16px' }}>
              <EmptyState>
                <Title headingLevel="h4" size="lg">
                  No open support tickets filed by you.
                </Title>
              </EmptyState>
            </div>
          )}
        </div>
      </Tab>
      <Tab 
        eventKey={4} 
        title={<TabTitleText>Feedback</TabTitleText>}
        aria-label="Feedback sub tab"
      >
        {(() => {
          if (feedbackView === 'general') {
            return (
              <div style={{ padding: '16px 16px 24px 16px' }}>
                <Breadcrumb style={{ marginBottom: '16px' }}>
                  <BreadcrumbItem>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setFeedbackView('main'); }}
                      style={{ color: 'var(--pf-v6-global--link--Color, #0066cc)', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Share feedback
                    </a>
                  </BreadcrumbItem>
                  <BreadcrumbItem isActive>Share general feedback</BreadcrumbItem>
                </Breadcrumb>
                <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--pf-v6-global--Color--200)' }}>
                  [Content for Share general feedback will go here]
                </div>
              </div>
            );
          }

          if (feedbackView === 'bug') {
            return (
              <div style={{ padding: '16px 16px 24px 16px' }}>
                <Breadcrumb style={{ marginBottom: '16px' }}>
                  <BreadcrumbItem>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setFeedbackView('main'); }}
                      style={{ color: 'var(--pf-v6-global--link--Color, #0066cc)', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Share feedback
                    </a>
                  </BreadcrumbItem>
                  <BreadcrumbItem isActive>Report a bug</BreadcrumbItem>
                </Breadcrumb>
                <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--pf-v6-global--Color--200)' }}>
                  [Content for Report a bug will go here]
                </div>
              </div>
            );
          }

          if (feedbackView === 'direction') {
            return (
              <div style={{ padding: '16px 16px 24px 16px' }}>
                <Breadcrumb style={{ marginBottom: '16px' }}>
                  <BreadcrumbItem>
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); setFeedbackView('main'); }}
                      style={{ color: 'var(--pf-v6-global--link--Color, #0066cc)', textDecoration: 'none' }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      Share feedback
                    </a>
                  </BreadcrumbItem>
                  <BreadcrumbItem isActive>Inform the direction of Red Hat</BreadcrumbItem>
                </Breadcrumb>
                <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--pf-v6-global--Color--200)' }}>
                  [Content for Inform the direction of Red Hat will go here]
                </div>
              </div>
            );
          }

          // Main view
          return (
            <div style={{ padding: '16px 16px 24px 16px' }}>
              <style>{`
                .feedback-card {
                  cursor: pointer !important;
                }
                .feedback-card:hover {
                  border-color: #0066cc !important;
                  border-width: 2px !important;
                  border-style: solid !important;
                }
                .feedback-card.pf-v6-c-card:hover {
                  --pf-v6-c-card--BorderColor: #0066cc !important;
                  --pf-v6-c-card--BorderWidth: 2px !important;
                }
              `}</style>
              <div style={{ fontSize: '14px', lineHeight: '1.5', color: 'var(--pf-v6-global--Color--200)', marginBottom: '24px' }}>
                Help us improve the Red Hat Hybrid Cloud Console by sharing your experience. For urgent issues, <a href="https://access.redhat.com/support/cases/#/case/new/get-support?" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--pf-v6-global--link--Color, #0066cc)', textDecoration: 'none' }} onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}>open a support case</a>.
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
                {/* Card 1 */}
                <Card 
                  className="feedback-card"
                  variant="secondary"
                  isClickable 
                  isSelectable
                  onClick={() => setFeedbackView('general')}
                  style={{ cursor: 'pointer' }}
                >
                  <CardHeader style={{ paddingBottom: '8px' }}>
                    <img 
                      src={FeedbackIcon} 
                      alt="Share general feedback" 
                      style={{ 
                        height: '48px',
                        width: 'auto',
                        display: 'block'
                      }} 
                    />
                  </CardHeader>
                  <CardTitle style={{ paddingTop: 0 }}>Share general feedback</CardTitle>
                  <CardBody>
                    What has your console experience been like so far?
                  </CardBody>
                </Card>

                {/* Card 2 */}
                <Card 
                  className="feedback-card"
                  variant="secondary"
                  isClickable 
                  isSelectable
                  onClick={() => setFeedbackView('bug')}
                  style={{ cursor: 'pointer' }}
                >
                  <CardHeader style={{ paddingBottom: '8px' }}>
                    <img 
                      src={BugIcon} 
                      alt="Report a bug" 
                      style={{ 
                        height: '48px',
                        width: 'auto',
                        display: 'block'
                      }} 
                    />
                  </CardHeader>
                  <CardTitle style={{ paddingTop: 0 }}>Report a bug</CardTitle>
                  <CardBody>
                    Describe the bug you encountered.
                  </CardBody>
                </Card>

                {/* Card 3 */}
                <Card 
                  className="feedback-card"
                  variant="secondary"
                  isClickable 
                  isSelectable
                  onClick={() => setFeedbackView('direction')}
                  style={{ cursor: 'pointer' }}
                >
                  <CardHeader style={{ paddingBottom: '8px' }}>
                    <img 
                      src={DirectionIcon} 
                      alt="Inform the direction of Red Hat" 
                      style={{ 
                        height: '48px',
                        width: 'auto',
                        display: 'block'
                      }} 
                    />
                  </CardHeader>
                  <CardTitle style={{ paddingTop: 0 }}>Inform the direction of Red Hat</CardTitle>
                  <CardBody>
                    Learn about opportunities to share your feedback with our User Research Team.
                  </CardBody>
                </Card>
              </div>
            </div>
          );
        })()}
      </Tab>
      <Tab
        eventKey={5}
        className="help-panel-chat-tab"
        title={
          <TabTitleIcon>
            <img
              src={HappyRobotIcon}
              alt=""
              aria-hidden
              style={{
                width: '24px',
                height: 'auto',
                aspectRatio: '1 / 1',
                display: 'block',
                objectFit: 'contain'
              }}
            />
          </TabTitleIcon>
        }
        aria-label="Chat sub tab"
      >
        {renderHelpChatPanel()}
      </Tab>
    </Tabs>
      </div>
    );
  };

  const renderHelpPanelBody = () => (
    <div data-hcc-help-shell="top-tabs-v2" style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {renderHelpPanelTopTabs()}
      <Divider
        component="hr"
        inset={{ default: 'insetNone' }}
        className="help-panel-header-divider"
      />
      {customHelpTitle && customHelpVariant === 'quickstart' && (
        <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
          <Breadcrumb>
            <BreadcrumbItem component="button" onClick={() => selectHelpPanelSubTab(1)}>
              Learn
            </BreadcrumbItem>
            <BreadcrumbItem isActive>{customHelpTitle}</BreadcrumbItem>
          </Breadcrumb>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {customHelpTitle ? (
          <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>{renderCustomHelpByTitle(customHelpTitle)}</div>
        ) : (
          <div
            className="help-panel-hide-native-tab-list"
            style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {renderFindHelpSubTabs()}
          </div>
        )}
      </div>
    </div>
  );


  const masthead = (
    <Masthead>
      <MastheadMain>
        {!isPageWithoutNav && (
          <MastheadToggle>
            <Button
              icon={<BarsIcon />}
              variant="plain"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Global navigation"
            />
          </MastheadToggle>
        )}
        <MastheadBrand data-codemods>
          <MastheadLogo data-codemods onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Red_Hat_logo.svg/3840px-Red_Hat_logo.svg.png"
              alt="Red Hat Logo"
              style={{ height: '40px', width: 'auto' }}
            />
          </MastheadLogo>
        </MastheadBrand>
        {/* Application dropdown next to logo */}
        <div style={{ marginLeft: '4px', marginRight: '4px' }}>
          <Tooltip 
            content="Browse services" 
            position="bottom"
            {...(isLogoDropdownOpen ? { isVisible: false } : {})}
          >
            <MenuToggle
              onClick={() => setIsLogoDropdownOpen(!isLogoDropdownOpen)}
              isExpanded={isLogoDropdownOpen}
              aria-label="Red Hat Hybrid Cloud Console menu"
              style={{ 
                fontSize: '14px'
              }}
            >
              Red Hat Hybrid Cloud Console
            </MenuToggle>
          </Tooltip>
        </div>
        
        {/* Expandable Search Input */}
        <div 
          ref={searchContainerRef}
          style={{ 
            marginRight: '4px',
            width: isSearchExpanded ? '552px' : 'auto',
            minWidth: isSearchExpanded ? '552px' : 'auto',
            transition: 'all 0.3s ease',
            position: 'relative'
          }}
        >
          <style>{`
            .pf-v6-c-masthead__logo {
              width: auto !important;
            }
            .masthead-search-expanded {
              --pf-v6-c-search-input--Width: 552px !important;
              --pf-v6-c-search-input__text-input--Width: 552px !important;
              --pf-v6-c-search-input--MinWidth: 552px !important;
            }
            .masthead-search-expanded .pf-v6-c-search-input,
            .masthead-search-expanded .pf-v6-c-search-input__text-input,
            .masthead-search-expanded .pf-v6-c-form-control {
              width: 552px !important;
              min-width: 552px !important;
            }
            .search-results-dropdown {
              position: absolute;
              top: calc(100% + 4px);
              left: 0;
              right: 0;
              z-index: 1000;
              background: var(--pf-v6-global--BackgroundColor--100);
              border: var(--pf-v6-global--BorderWidth--sm) solid var(--pf-v6-global--BorderColor--200);
              border-radius: var(--pf-v6-global--BorderRadius--md);
              box-shadow: var(--pf-v6-global--BoxShadow--lg);
              max-height: 400px;
              overflow-y: auto;
              padding: 24px;
            }
            .search-result-category-badge {
              font-size: var(--pf-v6-global--FontSize--xs);
              font-weight: var(--pf-v6-global--FontWeight--semi-bold);
              color: var(--pf-v6-global--primary-color--100);
              background-color: var(--pf-v6-global--primary-color--200);
              padding: var(--pf-v6-global--spacer--xs) var(--pf-v6-global--spacer--sm);
              border-radius: var(--pf-v6-global--BorderRadius--sm);
              text-transform: uppercase;
              letter-spacing: 0.025em;
              white-space: nowrap;
              margin-left: auto;
            }
          `}</style>
          <Tooltip 
            content="Search services" 
            position="bottom"
            {...(isSearchExpanded ? { isVisible: false } : {})}
          >
            <div className={isSearchExpanded ? 'masthead-search-expanded' : ''}>
              <SearchInput
                placeholder="Search across all services..."
                value={mastheadSearchValue}
                onChange={onMastheadSearchChange}
                onClear={onMastheadSearchClear}
                expandableInput={{
                  isExpanded: isSearchExpanded,
                  onToggleExpand: onSearchToggle,
                  toggleAriaLabel: "Expandable search input toggle",
                  hasAnimations: true
                }}
                aria-label="Global search"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && isSearchExpanded && (
                <div className="search-results-dropdown">
                                      <Menu 
                        onSelect={(event, itemId) => {
                          console.log('Selected search result:', itemId);
                          setShowSearchResults(false);
                          // Find the result and navigate if it has a route
                          const selectedResult = searchResults.find(result => result.id === itemId);
                          if (selectedResult && selectedResult.route) {
                            navigate(selectedResult.route);
                          }
                        }}
                      >
                      <MenuList>
                        <MenuGroup label="Top 5 results">
                          {searchResults.map((result) => (
                            <MenuItem 
                              key={result.id}
                              itemId={result.id}
                              description={result.description}
                              onClick={() => {
                                console.log('Selected search result:', result);
                                setShowSearchResults(false);
                                // Navigate to the route if it exists
                                if (result.route) {
                                  navigate(result.route);
                                }
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <span>{result.title}</span>
                                <span className="search-result-category-badge">{result.category}</span>
                              </div>
                            </MenuItem>
                          ))}
                        </MenuGroup>
                      </MenuList>
                    </Menu>
                  </div>
                )}
              </div>
            </Tooltip>
        </div>
      </MastheadMain>
      <MastheadContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            {/* Settings */}
            <Tooltip 
              content="Settings" 
              position="bottom"
              {...(isUtilitiesDropdownOpen ? { isVisible: false } : {})}
            >
              <Dropdown
                isOpen={isUtilitiesDropdownOpen}
                onSelect={onUtilitiesDropdownSelect}
                onOpenChange={(isOpen: boolean) => setIsUtilitiesDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<any>) => (
                  <Button
                    ref={toggleRef}
                    onClick={onUtilitiesDropdownToggle}
                    variant="control"
                    aria-label="Settings"
                    aria-expanded={isUtilitiesDropdownOpen}
                    className={isUtilitiesDropdownOpen ? 'pf-m-clicked' : ''}
                  >
                    <CogIcon />
                  </Button>
                )}
                shouldFocusToggleOnSelect
              >
                <Menu>
                  <MenuList>
                    <MenuGroup label="Settings">
                      <MenuItem 
                        icon={<BellIcon />}
                        onClick={() => {
                          navigate('/alert-manager');
                          setIsUtilitiesDropdownOpen(false);
                        }}
                      >
                        Alert Manager
                      </MenuItem>
                      <MenuItem 
                        icon={<DatabaseIcon />}
                        onClick={() => {
                          navigate('/data-integration');
                          setIsUtilitiesDropdownOpen(false);
                        }}
                      >
                        Data Integration
                      </MenuItem>
                    </MenuGroup>
                    <MenuGroup label="Identity & Access Management">
                      <MenuItem 
                        icon={<UsersIcon />}
                        onClick={() => {
                          navigate('/user-access');
                          setIsUtilitiesDropdownOpen(false);
                        }}
                      >
                        User Access
                      </MenuItem>
                      <MenuItem 
                        icon={<ShieldAltIcon />}
                        onClick={() => {
                          navigate('/authentication-policy');
                          setIsUtilitiesDropdownOpen(false);
                        }}
                      >
                        Authentication Policy
                      </MenuItem>
                      <MenuItem 
                        icon={<ServerIcon />}
                        onClick={() => {
                          navigate('/service-accounts');
                          setIsUtilitiesDropdownOpen(false);
                        }}
                      >
                        Service Accounts
                      </MenuItem>
                    </MenuGroup>
                  </MenuList>
                </Menu>
              </Dropdown>
            </Tooltip>

            {/* Help Panel */}
            <Tooltip 
              content="Help" 
              position="bottom"
              {...(isDrawerExpanded ? { isVisible: false } : {})}
            >
              <Button
                variant="control"
                onClick={onDrawerToggle}
                aria-label="Help"
                aria-expanded={isDrawerExpanded}
                className={isDrawerExpanded ? 'pf-m-clicked' : ''}
                icon={
                  <img
                    src={SparkleIcon}
                    alt=""
                    aria-hidden
                    width={20}
                    height={20}
                    style={{ display: 'block' }}
                  />
                }
                iconPosition="start"
              >
                Help
              </Button>
            </Tooltip>

            {/* Alerts */}
            <Tooltip 
              content="Alerts" 
              position="bottom"
              {...(isNotificationDrawerOpen ? { isVisible: false } : {})}
            >
              <Button
                variant="control"
                onClick={onNotificationDrawerToggle}
                aria-label="Alerts"
                aria-expanded={isNotificationDrawerOpen}
                className={isNotificationDrawerOpen ? 'pf-m-clicked' : ''}
              >
                <BellIcon />
              </Button>
            </Tooltip>

            {/* User dropdown */}
            <Tooltip 
              content="User menu" 
              position="bottom"
              {...(isUserDropdownOpen ? { isVisible: false } : {})}
            >
              <Dropdown
                isOpen={isUserDropdownOpen}
                onSelect={onUserDropdownSelect}
                onOpenChange={(isOpen: boolean) => setIsUserDropdownOpen(isOpen)}
                toggle={(toggleRef: React.Ref<any>) => (
                  <MenuToggle
                    ref={toggleRef}
                    onClick={onUserDropdownToggle}
                    isExpanded={isUserDropdownOpen}
                    aria-label="User menu"
                    icon={<UserIcon />}
                  >
                    {MASTHEAD_USER_DISPLAY_NAME}
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
              >
              <DropdownList>
                <div style={{ padding: '16px' }}>
                  <DescriptionList isCompact>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Username:</DescriptionListTerm>
                      <DescriptionListDescription>
                        {MASTHEAD_USER_DISPLAY_NAME}
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Account number:</DescriptionListTerm>
                      <DescriptionListDescription>12345678</DescriptionListDescription>
                    </DescriptionListGroup>
                    <DescriptionListGroup>
                      <DescriptionListTerm>Org ID:</DescriptionListTerm>
                      <DescriptionListDescription>987654321</DescriptionListDescription>
                    </DescriptionListGroup>
                  </DescriptionList>
                </div>
                <div style={{ paddingBottom: '8px' }}>
                  <Divider />
                </div>
                <DropdownItem
                  component="a"
                  href="https://console.redhat.com/settings/profile"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  My profile
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    navigate('/my-user-access');
                    setIsUserDropdownOpen(false);
                  }}
                >
                  My User Access
                </DropdownItem>
                <DropdownItem
                  onClick={() => {
                    navigate('/alert-manager');
                    setIsUserDropdownOpen(false);
                  }}
                >
                  My Alert Preferences
                </DropdownItem>
                <div style={{ paddingTop: '8px', paddingBottom: '8px' }}>
                  <Divider />
                </div>
                <DropdownItem>
                  Logout
                </DropdownItem>
              </DropdownList>
              </Dropdown>
            </Tooltip>
        </div>
      </MastheadContent>
    </Masthead>
  );

  const renderNavItem = (route: IAppRoute, index: number) => (
    <NavItem
      key={`${route.label}-${index}`}
      id={`${route.label}-${index}`}
      isActive={route.path === location.pathname}
    >
      <NavLink to={route.path}>{route.label}</NavLink>
    </NavItem>
  );

  const renderNavGroup = (group: IAppRouteGroup, groupIndex: number) => (
    <NavExpandable
      key={`${group.label}-${groupIndex}`}
      id={`${group.label}-${groupIndex}`}
      title={group.label}
      isActive={group.routes.some((route) => route.path === location.pathname)}
    >
      {group.routes.map((route, idx) => route.label && renderNavItem(route, idx))}
    </NavExpandable>
  );

  // Define navigation groups
  const primaryNavPages = [
    '/overview',
    '/alert-manager',
    '/data-integration',
    '/event-log',
    '/learning-resources'
  ];
  const secondaryNavPages = ['/my-user-access', '/user-access', '/users', '/groups', '/roles', '/workspaces', '/red-hat-access-requests', '/authentication-policy', '/service-accounts', '/learning-resources-iam'];

  // Determine which navigation structure to show
  const getNavigationType = () => {
    const currentPath = location.pathname;
    
    if (primaryNavPages.includes(currentPath)) {
      return 'primary';
    } else if (secondaryNavPages.includes(currentPath)) {
      return 'secondary';
    }
    return 'primary'; // default fallback
  };

  const navigationType = getNavigationType();

  // Primary navigation structure (current navigation)
  const primaryNavRoutes = routes.filter((route): route is IAppRoute => {
    // Only individual routes, no expandable groups
    return !route.routes && !!route.label && ['Overview', 'Alert Manager', 'Data Integration', 'Event Log', 'Learning Resources'].includes(route.label);
  });

  // Secondary navigation structure (IAM bundle)
  const secondaryNavItems = [
    { label: 'My User Access', path: '/my-user-access', isActive: location.pathname === '/my-user-access' },
    { 
      label: 'User Access', 
      path: '/user-access', 
      isActive: ['/user-access', '/users', '/groups', '/roles', '/workspaces', '/red-hat-access-requests'].includes(location.pathname),
      isExpandable: true,
      subItems: [
        { label: 'Overview', path: '/user-access', isActive: location.pathname === '/user-access' },
        { label: 'Users', path: '/users', isActive: location.pathname === '/users' },
        { label: 'Groups', path: '/groups', isActive: location.pathname === '/groups' },
        { label: 'Roles', path: '/roles', isActive: location.pathname === '/roles' },
        { label: 'Workspaces', path: '/workspaces', isActive: location.pathname === '/workspaces' },
        { label: 'Red Hat Access Requests', path: '/red-hat-access-requests', isActive: location.pathname === '/red-hat-access-requests' },
      ]
    },
    { label: 'Authentication Policy', path: '/authentication-policy', isActive: location.pathname === '/authentication-policy' },
    { label: 'Service Accounts', path: '/service-accounts', isActive: location.pathname === '/service-accounts' },
    { label: 'IAM Learning', path: '/learning-resources-iam', isActive: location.pathname === '/learning-resources-iam' },
  ];

  const Navigation = (
    <Nav id="nav-primary-simple">
      <NavList id="nav-list-simple">
        {navigationType === 'primary' ? (
          // Show primary navigation
          primaryNavRoutes.map((route, idx) => 
            route.label && renderNavItem(route, idx)
          )
        ) : (
          // Show secondary navigation (IAM bundle)
          secondaryNavItems.map((item, idx) => (
            item.isExpandable ? (
              <NavExpandable
                key={`secondary-expandable-${idx}`}
                id={`secondary-expandable-${idx}`}
                title={item.label}
                isActive={item.isActive}
              >
                {item.subItems?.map((subItem, subIdx) => (
                  <NavItem key={`secondary-sub-${idx}-${subIdx}`} id={`secondary-sub-${idx}-${subIdx}`} isActive={subItem.isActive}>
                    <NavLink to={subItem.path}>
                      {subItem.label}
                    </NavLink>
                  </NavItem>
                ))}
              </NavExpandable>
            ) : (
              <NavItem key={`secondary-${idx}`} id={`secondary-${idx}`} isActive={item.isActive}>
                <NavLink to={item.path}>
                  {item.label}
                </NavLink>
              </NavItem>
            )
          ))
        )}
      </NavList>
    </Nav>
  );

  const Sidebar = (
    <PageSidebar>
      <PageSidebarBody>{Navigation}</PageSidebarBody>
    </PageSidebar>
  );

  const pageId = 'primary-app-container';

  const PageSkipToContent = (
    <SkipToContent
      onClick={(event) => {
        event.preventDefault();
        const primaryContentContainer = document.getElementById(pageId);
        primaryContentContainer?.focus();
      }}
      href={`#${pageId}`}
    >
      Skip to Content
    </SkipToContent>
  );

  const drawerContent = (
    <DrawerPanelContent 
      ref={helpPanelRef}
      defaultSize="580px"
      minSize="320px"
      maxSize="800px"
      isResizable
    >
      <DrawerHead>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
        <Title headingLevel="h2" size="lg">
            Help
        </Title>
          <Button
            variant="link"
            isInline
            component="a"
            href="https://status.redhat.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: '14px' }}
          >
            Red Hat status page
            <ExternalLinkAltIcon style={{ marginLeft: '4px' }} />
          </Button>
        </div>
        <DrawerActions>
          <DrawerCloseButton onClick={onDrawerClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerContentBody style={{ padding: 0 }}>
        <style>{`
          /* Force hidden drawer panels to not take up space */
          .pf-v6-c-drawer__panel[hidden] {
            display: none !important;
          }
          
          /* Force drawer panel to clip any overflow, except when menu is open */
          .pf-v6-c-drawer__panel {
            overflow: hidden !important;
          }
          
          /* Allow overflow when tabs overflow menu is open */
          .pf-v6-c-drawer__panel:has(.pf-v6-c-tabs [role="menu"]) {
            overflow: visible !important;
          }
          
          .pf-v6-c-drawer__panel-content {
            overflow: visible !important; /* Allow menus to escape */
          }
          
          /* Allow drawer body to overflow when menu is open */
          .pf-v6-c-drawer__body:has(.pf-v6-c-tabs [role="menu"]),
          .pf-v6-c-drawer__body {
            overflow: visible !important;
          }
          
          /* Override PatternFly's dynamic width variable to constrain tabs */
          .pf-v6-c-drawer__panel .pf-v6-c-tabs {
            --pf-v6-c-tabs--Width: 100% !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important; /* Allow dropdown menu to show */
          }
          
          /* Constrain the scrollable tab list area */
          .pf-v6-c-drawer__panel .pf-v6-c-tabs__scroll-container {
            max-width: 100%;
            overflow-x: auto;
          }
          
          .pf-v6-c-drawer__panel .pf-v6-c-tabs__list {
            max-width: 100%;
          }
          
          /* Constrain tab content areas */
          .pf-v6-c-drawer__panel .pf-v6-c-tabs__panel {
            overflow-x: hidden;
          }
          
          /* Target all dropdown menus within tabs overflow */
          [data-popper-placement] .pf-v6-c-menu,
          .pf-v6-c-dropdown__menu,
          .pf-v6-c-menu {
            min-width: 300px !important;
            width: 300px !important;
          }
          
          /* Allow dynamic positioning for tabs overflow menu */
          .pf-v6-c-tabs [role="menu"] {
            /* Positioning will be set dynamically via JavaScript */
            max-width: 300px !important;
          }
          
          /* Adjust popper positioning for tabs overflow menu */
          .pf-v6-c-tabs [data-popper-placement] {
            /* Positioning will be set dynamically via JavaScript */
            max-width: 300px !important;
          }
          
          /* Ensure menu stays within drawer panel bounds */
          .pf-v6-c-drawer__panel .pf-v6-c-tabs [role="menu"] {
            position: absolute !important;
          }
          
          /* Target menu items specifically */
          .pf-v6-c-menu__list-item,
          .pf-v6-c-dropdown__menu-item {
            min-width: 280px !important;
            white-space: nowrap !important;
          }
          
          /* Ensure tabs overflow menu items show ellipsis when truncated */
          .pf-v6-c-tabs [role="menu"] button[role="menuitem"] {
            display: flex !important;
            align-items: center !important;
            max-width: 300px !important;
            overflow: hidden !important;
          }
          
          .pf-v6-c-tabs [role="menu"] .menu-item-text-wrapper {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: block !important;
          }
          
          /* Truncate visible tab titles */
          .pf-v6-c-tabs__item .pf-v6-c-tabs__item-text {
            max-width: 180px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: inline-block !important;
          }
          
          /* Add extra padding for check icons */
          .pf-v6-c-menu__item-text {
            padding-right: 32px !important;
          }
          
          /* Target the tabs overflow container specifically */
          .pf-v6-c-tabs [role="menu"] {
            min-width: 300px !important;
            width: 300px !important;
          }
          
          /* Top strip uses its own Tabs row; hide empty tab panels rendered by that duplicate Tabs */
          .help-panel-top-tabs-strip .pf-v6-c-tab-content {
            display: none !important;
          }

          /*
           * Avoid horizontal scroll + PatternFly scroll Buttons (plain Button chevrons) on the top strip.
           * Full-width flex row so margin-inline-start: auto on Chat absorbs remaining space and pins it right.
           */
          .help-panel-top-tabs-strip .pf-v6-c-tabs {
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .help-panel-top-tabs-strip .pf-v6-c-tabs__list {
            display: flex !important;
            flex-wrap: wrap !important;
            row-gap: var(--pf-t--global--spacer--xs);
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            justify-content: flex-start !important;
            overflow-x: visible !important;
            overflow-y: visible !important;
          }
          .help-panel-top-tabs-strip .pf-v6-c-tabs__item.help-panel-chat-tab {
            margin-inline-start: auto !important;
            flex-shrink: 0 !important;
          }
          .help-panel-top-tabs-strip .pf-v6-c-tabs__item.help-panel-chat-tab .pf-v6-c-tabs__link {
            min-width: 2.75rem !important;
            justify-content: center !important;
          }
          .help-panel-top-tabs-strip .pf-v6-c-tabs.pf-m-scrollable .pf-v6-c-tabs__scroll-button {
            display: none !important;
          }

          /* Full-bleed grey rule under tab strip (separator from scroll content; insetNone = panel width) */
          .help-panel-header-divider.pf-v6-c-divider {
            width: 100% !important;
            align-self: stretch !important;
            flex-shrink: 0 !important;
          }

          /* Duplicate tab row is rendered above; hide PatternFly's tab buttons inside the scroll region */
          .help-panel-hide-native-tab-list .pf-v6-c-tabs__scroll-buttons,
          .help-panel-hide-native-tab-list .pf-v6-c-tabs__list {
            display: none !important;
          }

          /*
           * PF merges Tabs style prop onto .pf-v6-c-tabs (the nav), not the panels.
           * flex:1 on Tabs stretched the empty nav and caused a large gap above tab body (APIs, Support, etc.).
           * Shell wraps Tabs; collapse the hidden nav and let the active tab panel fill height.
           */
          .help-panel-inner-tabs-shell > .pf-v6-c-tabs {
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            height: 0 !important;
            max-height: 0 !important;
            min-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
          .help-panel-inner-tabs-shell > .pf-v6-c-tab-content:not([hidden]) {
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow: auto !important;
          }
          
          /* Chat sub-tab content fills available height */
          .pf-v6-c-tabs__panel:has([data-help-panel="chat"]) {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          [data-help-panel="chat"] {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          /* Style the overflow button to look like a persistent tab */
          .pf-v6-c-tabs__scroll-button[data-overflowing] {
            border: 1px solid var(--pf-v6-global--BorderColor--100) !important;
            border-bottom: none !important;
            background: var(--pf-v6-global--BackgroundColor--100) !important;
            padding: 8px 16px !important;
            min-width: auto !important;
            font-size: var(--pf-v6-global--FontSize--sm) !important;
            font-weight: 500 !important;
            color: var(--pf-v6-global--Color--100) !important;
            border-radius: var(--pf-v6-global--BorderRadius--sm) var(--pf-v6-global--BorderRadius--sm) 0 0 !important;
            margin-left: 4px !important;
            order: 999 !important;
            position: relative !important;
          }
          
          .pf-v6-c-tabs__scroll-button[data-overflowing]:hover {
            background: var(--pf-v6-global--BackgroundColor--200) !important;
            cursor: pointer !important;
          }
          
          .pf-v6-c-tabs__scroll-button[data-overflowing] svg {
            display: none !important;
          }
          
          /* Allow overflow menu to escape tabs boundaries - only apply to tabs, not drawer */
          .pf-v6-c-tabs,
          .pf-v6-c-tabs__list {
            overflow: visible !important;
          }
          
          /* Make sure tabs container doesn't create scroll region */
          .pf-v6-c-tabs__scroll-button {
            overflow: visible !important;
          }
          
          /* Ensure overflow menu has high z-index and can overlay content */
          .pf-v6-c-tabs [role="menu"] {
            z-index: 9999 !important;
            position: fixed !important;
            background-color: var(--pf-v6-global--BackgroundColor--100, #ffffff) !important;
            box-shadow: 0 0.25rem 0.5rem 0rem rgba(3, 3, 3, 0.16), 0 0 0.375rem 0 rgba(3, 3, 3, 0.08) !important;
            border-radius: var(--pf-v6-global--BorderRadius--sm, 4px) !important;
          }
          
          /* Prevent any parent from creating a scroll container for the menu */
          .pf-v6-c-tabs .pf-v6-c-menu {
            overflow: visible !important;
            background-color: var(--pf-v6-global--BackgroundColor--100, #ffffff) !important;
          }
          
          /* Ensure menu items have proper background */
          .pf-v6-c-tabs [role="menu"] [role="menuitem"] {
            background-color: var(--pf-v6-global--BackgroundColor--100, #ffffff) !important;
          }
          
          /* Menu item hover state */
          .pf-v6-c-tabs [role="menu"] [role="menuitem"]:hover {
            background-color: var(--pf-v6-global--BackgroundColor--200, #f5f5f5) !important;
          }
          
          /* Close all button styling */
          .pf-v6-c-tabs [role="menu"] .close-all-tabs-button {
            color: var(--pf-v6-global--danger-color--100, #c9190b) !important;
            font-weight: 500 !important;
          }
          
          .pf-v6-c-tabs [role="menu"] .close-all-tabs-button:hover {
            color: var(--pf-v6-global--danger-color--200, #a30000) !important;
            background-color: var(--pf-v6-global--BackgroundColor--200, #f5f5f5) !important;
          }
        `}</style>
        {renderHelpPanelBody()}
      </DrawerContentBody>
    </DrawerPanelContent>
  );



  // Create notification drawer content
  const notificationDrawerContent = (
    <DrawerPanelContent defaultSize="580px">
      <DrawerHead>
        <span style={{ fontWeight: 'bold' }}>Notifications</span>
        <DrawerActions>
          <Dropdown
            isOpen={isNotificationActionsOpen}
            onOpenChange={(isOpen: boolean) => setIsNotificationActionsOpen(isOpen)}
            popperProps={{
              position: 'right'
            }}
            toggle={(toggleRef: React.Ref<any>) => (
              <MenuToggle
                ref={toggleRef}
                aria-label="Notification actions menu"
                variant="plain"
                onClick={() => setIsNotificationActionsOpen(!isNotificationActionsOpen)}
              >
                <EllipsisVIcon />
              </MenuToggle>
            )}
            shouldFocusToggleOnSelect
          >
            <DropdownList>
              <DropdownItem
                onClick={() => {
                  navigate('/event-log');
                  setIsNotificationActionsOpen(false);
                }}
              >
                Event log
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  navigate('/alert-manager');
                  setIsNotificationActionsOpen(false);
                }}
              >
                My alert preferences
              </DropdownItem>
              <DropdownItem
                onClick={() => {
                  navigate('/alert-manager');
                  setIsNotificationActionsOpen(false);
                }}
              >
                Organization defaults
              </DropdownItem>
            </DropdownList>
          </Dropdown>
          <DrawerCloseButton onClick={onNotificationDrawerClose} />
        </DrawerActions>
      </DrawerHead>
      <DrawerContentBody>
        <NotificationDrawer>
          <NotificationDrawerBody>
            <NotificationDrawerList>
              <NotificationDrawerListItem variant="info">
                <NotificationDrawerListItemHeader
                  variant="info"
                  title="System Update Available"
                  srTitle="Info notification:"
                />
                <NotificationDrawerListItemBody timestamp="5 minutes ago">
                  A new system update is available for installation. Click to view details.
                </NotificationDrawerListItemBody>
              </NotificationDrawerListItem>
              <NotificationDrawerListItem variant="warning">
                <NotificationDrawerListItemHeader
                  variant="warning"
                  title="Storage Space Low"
                  srTitle="Warning notification:"
                />
                <NotificationDrawerListItemBody timestamp="15 minutes ago">
                  Your storage space is running low. Consider removing unused files.
                </NotificationDrawerListItemBody>
              </NotificationDrawerListItem>
              <NotificationDrawerListItem variant="success">
                <NotificationDrawerListItemHeader
                  variant="success"
                  title="Backup Completed"
                  srTitle="Success notification:"
                />
                <NotificationDrawerListItemBody timestamp="1 hour ago">
                  Your scheduled backup has completed successfully.
                </NotificationDrawerListItemBody>
              </NotificationDrawerListItem>
            </NotificationDrawerList>
          </NotificationDrawerBody>
        </NotificationDrawer>
      </DrawerContentBody>
    </DrawerPanelContent>
  );

  return (
    <>
      <Page
        mainContainerId={pageId}
        masthead={masthead}
        sidebar={sidebarOpen && !isPageWithoutNav && Sidebar}
        skipToContent={PageSkipToContent}
      >
        {/* Notification Drawer (outer, right-side) */}
        <Drawer isExpanded={isNotificationDrawerOpen} isInline position="right">
          <DrawerContent panelContent={notificationDrawerContent}>
            {/* Help Drawer (inner, left-side) */}
            <Drawer isExpanded={isDrawerExpanded} isInline>
              <HelpPanelContext.Provider value={{ openHelpPanelWithTab, openHelpPanelToShareGeneralFeedback }}>
                {/* Provider wraps DrawerContent so help panel tab bodies (e.g. Dashboard widgets) receive context, not only route children */}
                <DrawerContent panelContent={drawerContent}>{children}</DrawerContent>
              </HelpPanelContext.Provider>
            </Drawer>
          </DrawerContent>
        </Drawer>
      </Page>
      
      {/* Full-width Services Drawer under Masthead */}
      {isLogoDropdownOpen && (
        <div
          ref={servicesDropdownRef}
          style={{
            position: 'fixed',
            top: '72px',
            left: '24px',
            right: '24px',
            backgroundColor: 'white',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            padding: '24px',
            borderRadius: '12px',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          {/* Close button */}
          <Button
            variant="plain"
            aria-label="Close services panel"
            onClick={() => setIsLogoDropdownOpen(false)}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              zIndex: 10000
            }}
          >
            <TimesIcon />
          </Button>
          <style>
            {`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .pf-v6-c-menu {
                box-shadow: none !important;
              }
              /* Custom selected state for primary-detail menu items */
              .pf-v6-c-menu__item.pf-m-selected,
              .pf-v6-c-menu__item[aria-selected="true"],
              .pf-v6-c-menu__item.pf-m-current {
                background-color: var(--pf-v6-global--BackgroundColor--200) !important;
                color: var(--pf-v6-global--Color--100) !important;
              }
              /* Hide the checkmark icon for selected menu items */
              .pf-v6-c-menu__item.pf-m-selected .pf-v6-c-menu__item-select-icon,
              .pf-v6-c-menu__item[aria-selected="true"] .pf-v6-c-menu__item-select-icon,
              .pf-v6-c-menu__item.pf-m-current .pf-v6-c-menu__item-select-icon {
                display: none !important;
              }
              /* Ensure hover state works correctly with selected state */
              .pf-v6-c-menu__item.pf-m-selected:hover,
              .pf-v6-c-menu__item[aria-selected="true"]:hover,
              .pf-v6-c-menu__item.pf-m-current:hover {
                background-color: var(--pf-v6-global--BackgroundColor--200) !important;
              }
              /* Force default selected styling for menu items by data attribute */
              .pf-v6-c-menu__item[data-selected="true"] {
                background-color: var(--pf-v6-global--BackgroundColor--200) !important;
                color: var(--pf-v6-global--Color--100) !important;
              }
              .pf-v6-c-menu__item[data-selected="true"] .pf-v6-c-menu__item-select-icon {
                display: none !important;
              }
              .pf-v6-c-menu__item[data-selected="true"]:hover {
                background-color: var(--pf-v6-global--BackgroundColor--200) !important;
              }
              /* Explicit styling for My Favorite Services when selected */
              .pf-v6-c-menu__item[data-item-id="my-favorite-services"][data-selected="true"],
              .pf-v6-c-menu__item[itemid="my-favorite-services"].pf-m-selected,
              .pf-v6-c-menu__item[itemid="my-favorite-services"][aria-selected="true"] {
                background-color: var(--pf-v6-global--BackgroundColor--200) !important;
                color: var(--pf-v6-global--Color--100) !important;
              }
              /* Force My Favorite Services to show default selected background - HIGHEST PRIORITY */
              .pf-v6-c-menu .pf-v6-c-menu__list .pf-v6-c-menu__item[data-item-id="my-favorite-services"] {
                background-color: #f0f0f0 !important;
                color: #151515 !important;
              }
              .pf-v6-c-menu .pf-v6-c-menu__list .pf-v6-c-menu__item[data-item-id="my-favorite-services"]:hover {
                background-color: #e7e7e7 !important;
                color: #151515 !important;
              }
              /* Override when other items are selected */
              .pf-v6-c-menu .pf-v6-c-menu__list .pf-v6-c-menu__item[data-item-id="my-favorite-services"][data-selected="false"] {
                background-color: transparent !important;
                color: var(--pf-v6-global--Color--100) !important;
              }
              /* Customize star icon color in My Favorite Services - Multiple targeting approaches */
              .pf-v6-c-menu .pf-v6-c-menu__list .pf-v6-c-menu__item[data-item-id="my-favorite-services"] .pf-v6-c-menu__item-icon svg,
              .pf-v6-c-menu__item[data-item-id="my-favorite-services"] .pf-v6-c-menu__item-icon svg,
              .pf-v6-c-menu__item[data-item-id="my-favorite-services"] svg,
              .pf-v6-c-menu__item[data-item-id="my-favorite-services"] .pf-v6-c-menu__item-icon,
              [data-item-id="my-favorite-services"] svg {
                color: #f39200 !important;
                fill: #f39200 !important;
              }
              /* Try with PatternFly variable as fallback */
              .pf-v6-c-menu__item[data-item-id="my-favorite-services"] svg {
                color: var(--pf-v6-c-button--m-favorited--hover__icon--Color, #f39200) !important;
                fill: var(--pf-v6-c-button--m-favorited--hover__icon--Color, #f39200) !important;
              }
              /* Style link items differently - increased specificity */
              .pf-v6-c-menu__item[data-is-link="true"] .pf-v6-c-menu__item-main {
                color: var(--pf-v6-global--link--Color) !important;
              }
              .pf-v6-c-menu__item[data-is-link="true"]:hover .pf-v6-c-menu__item-main {
                background-color: var(--pf-v6-global--BackgroundColor--100) !important;
                color: var(--pf-v6-global--link--Color--hover) !important;
                text-decoration: underline;
              }
              .pf-v6-c-menu__item[data-is-link="true"]:hover {
                background-color: var(--pf-v6-global--BackgroundColor--100) !important;
              }
              /* Maximum specificity targeting for link items */
              .pf-v6-c-menu .pf-v6-c-menu__list .pf-v6-c-menu__item[data-is-link="true"] {
                color: #0066cc !important;
              }
              .pf-v6-c-menu .pf-v6-c-menu__list .pf-v6-c-menu__item[data-is-link="true"]:hover {
                color: #004080 !important;
                background-color: #f0f0f0 !important;
              }
              /* Target all possible child elements and text content */
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"] *,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"] .pf-v6-c-menu__item-text,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"] .pf-v6-c-menu__item-main,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"] button,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"] a,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"] span,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"] div {
                color: #0066cc !important;
              }
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"]:hover *,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"]:hover .pf-v6-c-menu__item-text,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"]:hover .pf-v6-c-menu__item-main,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"]:hover button,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"]:hover a,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"]:hover span,
              .pf-v6-c-menu .pf-v6-c-menu__item[data-is-link="true"]:hover div {
                color: #004080 !important;
              }
              /* Nuclear option - override everything within link items */
              [data-is-link="true"] {
                color: #0066cc !important;
              }
              [data-is-link="true"]:hover {
                color: #004080 !important;
              }
              /* Ultimate specificity - target the exact component structure */
              .pf-v6-c-menu__list .pf-v6-c-menu__item[data-is-link="true"] {
                color: #0066cc !important;
              }
              .pf-v6-c-menu__list .pf-v6-c-menu__item[data-is-link="true"]:hover {
                color: #004080 !important;
              }
              /* Override PatternFly's CSS custom properties */
              .pf-v6-c-menu__item[data-is-link="true"] {
                --pf-v6-c-menu__item--Color: #0066cc !important;
                --pf-v6-c-menu__item--m-current--Color: #0066cc !important;
                --pf-v6-c-menu__item--hover--Color: #004080 !important;
              }
              /* CSS class targeting for link items */
              .custom-link-menu-item {
                color: #0066cc !important;
              }
              .custom-link-menu-item:hover {
                color: #004080 !important;
                background-color: #f0f0f0 !important;
              }
              .custom-link-menu-item * {
                color: #0066cc !important;
              }
              .custom-link-menu-item:hover * {
                color: #004080 !important;
              }
              /* Prevent link items from showing selected state */
              .pf-v6-c-menu__item[data-is-link="true"].pf-m-selected {
                background-color: transparent !important;
                color: #0066cc !important;
              }
              .pf-v6-c-menu__item[data-is-link="true"] .pf-v6-c-menu__item-select-icon {
                display: none !important;
              }

            `}
          </style>
          <div style={{ maxWidth: '1200px', margin: '0 auto', height: '800px' }}>
            <Card style={{ height: '100%' }}>
              <CardBody style={{ padding: 0, height: '100%' }}>
                <Split style={{ height: '100%' }}>
                  {/* Primary (Menu) Side */}
                  <SplitItem style={{ 
                    width: '450px', 
                    minWidth: '450px', 
                    maxWidth: '450px', 
                    flexShrink: 0, 
                    flexGrow: 0, 
                    borderRight: '1px solid #d2d2d2' 
                  }}>
                    <div style={{ height: '100%' }}>
                      <Menu 
                        key={`menu-${isLogoDropdownOpen}-${selectedMenuItem}`}
                        aria-label="Services menu"
                        activeItemId={selectedMenuItem}
                        selected={selectedMenuItem}
                        onSelect={(event, itemId) => {
                          // Find the clicked item across all groups
                          let clickedItem: MenuItem | null = null;
                          for (const groupItems of Object.values(menuGroupsData)) {
                            const found = groupItems.find(item => item.id === itemId);
                            if (found) {
                              clickedItem = found;
                              break;
                            }
                          }
                          
                          if (clickedItem?.isLink && clickedItem?.url) {
                            // Navigate to URL for link items
                            window.location.href = clickedItem.url;
                          } else {
                            // Set selection for non-link items
                            setSelectedMenuItem(itemId as string);
                          }
                        }}
                      >
                        <MenuList>
                          {Object.entries(menuGroupsData).map(([groupTitle, groupItems], groupIndex, groupsArray) => (
                            <React.Fragment key={groupTitle}>
                              {groupTitle === 'Services' ? (
                                <MenuGroup>
                                  <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    padding: '8px 16px 8px 16px',
                                    fontSize: 'var(--pf-v6-global--FontSize--sm)',
                                    fontWeight: 'var(--pf-v6-global--FontWeight--bold)',
                                    color: 'var(--pf-v6-global--Color--200)'
                                  }}>
                                    <span>Services</span>
                                    <a 
                                      href="/all-services"
                                      style={{ 
                                        fontSize: 'var(--pf-v6-global--FontSize--xs)',
                                        fontWeight: 'var(--pf-v6-global--FontWeight--normal)',
                                        color: '#0066cc',
                                        textDecoration: 'none'
                                      }}
                                      onMouseEnter={(e) => (e.target as HTMLElement).style.textDecoration = 'underline'}
                                      onMouseLeave={(e) => (e.target as HTMLElement).style.textDecoration = 'none'}
                                    >
                                      View all services
                                    </a>
                                  </div>
                                  {groupItems.map((item) => (
                                    <MenuItem 
                                      key={item.id}
                                      itemId={item.id}
                                      icon={!item.isLink ? item.icon : undefined}
                                      isSelected={!item.isLink && selectedMenuItem === item.id}
                                      data-item-id={item.id}
                                      data-selected={!item.isLink && selectedMenuItem === item.id ? "true" : "false"}
                                      data-is-link={item.isLink ? "true" : "false"}
                                      className={`${item.isLink ? 'custom-link-menu-item' : ''} ${!item.isLink && selectedMenuItem === item.id ? 'pf-m-selected' : ''}`.trim()}
                                      style={item.isLink ? { 
                                        color: '#0066cc', 
                                        cursor: 'pointer',
                                        ['--pf-v6-c-menu__item--Color' as any]: '#0066cc',
                                        ['--pf-v6-c-menu__item--m-current--Color' as any]: '#0066cc',
                                        ['--pf-v6-c-menu__item--hover--Color' as any]: '#004080'
                                      } : (!item.isLink && selectedMenuItem === item.id ? {
                                        backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)',
                                        color: 'var(--pf-v6-global--Color--100)'
                                      } : undefined)}
                                    >
                                      {item.name}
                                    </MenuItem>
                                  ))}
                                </MenuGroup>
                              ) : (
                                <MenuGroup label={groupTitle}>
                                  {groupItems.map((item) => (
                                    <MenuItem 
                                      key={item.id}
                                      itemId={item.id}
                                      icon={!item.isLink ? item.icon : undefined}
                                      isSelected={!item.isLink && selectedMenuItem === item.id}
                                      data-item-id={item.id}
                                      data-selected={!item.isLink && selectedMenuItem === item.id ? "true" : "false"}
                                      data-is-link={item.isLink ? "true" : "false"}
                                      className={`${item.isLink ? 'custom-link-menu-item' : ''} ${!item.isLink && selectedMenuItem === item.id ? 'pf-m-selected' : ''}`.trim()}
                                      style={item.isLink ? { 
                                        color: '#0066cc', 
                                        cursor: 'pointer',
                                        ['--pf-v6-c-menu__item--Color' as any]: '#0066cc',
                                        ['--pf-v6-c-menu__item--m-current--Color' as any]: '#0066cc',
                                        ['--pf-v6-c-menu__item--hover--Color' as any]: '#004080'
                                      } : (!item.isLink && selectedMenuItem === item.id ? {
                                        backgroundColor: 'var(--pf-v6-global--BackgroundColor--200)',
                                        color: 'var(--pf-v6-global--Color--100)'
                                      } : undefined)}
                                    >
                                      {item.name}
                                    </MenuItem>
                                  ))}
                                </MenuGroup>
                              )}
                              {groupIndex < groupsArray.length - 1 && (
                                <Divider component="li" />
                              )}
                            </React.Fragment>
                          ))}
                        </MenuList>
                      </Menu>
                    </div>
                  </SplitItem>

                  {/* Detail Side */}
                  <SplitItem isFilled>
                    <div style={{ padding: '24px', height: '100%', overflow: 'auto' }}>
                      {(() => {
                        // Find the selected menu item only among non-link items
                        let currentMenuItem: MenuItem | null = null;
                        for (const groupItems of Object.values(menuGroupsData)) {
                          const found = groupItems.find(item => item.id === selectedMenuItem && !item.isLink);
                          if (found) {
                            currentMenuItem = found;
                            break;
                          }
                        }
                        if (!currentMenuItem) return null;
                        
                        return (
                          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
                            <FlexItem>
                              <Title headingLevel="h3" size="xl">
                                {currentMenuItem.name}
                              </Title>
                            </FlexItem>
                            
                            <FlexItem>
                              {currentMenuItem.id === 'my-favorite-services' ? (
                                // Dynamic My Favorite Services content based on user's favorites
                                favoritedItems.size === 0 ? (
                                  <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--pf-v6-global--Color--200)' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                      <img 
                                        src="https://console.redhat.com/apps/frontend-assets/favoritedservices/favoriting-emptystate.svg"
                                        alt="No favorited services"
                                        style={{ width: '80px', height: '80px' }}
                                      />
                                            </div>
                                    <Title headingLevel="h4" size="lg" style={{ marginBottom: '8px' }}>No favorited services</Title>
                                    <p style={{ marginBottom: '24px' }}>Add a service to your favorites to get started here.</p>
                                    <Button 
                                      variant="primary" 
                                      onClick={() => {
                                        navigate('/all-services');
                                        setIsLogoDropdownOpen(false);
                                      }}
                                    >
                                      View all services
                                    </Button>
                                  </div>
                                ) : (
                                  <Menu>
                                    {(() => {
                                      // Map of itemId to display information with category grouping
                                      const itemMapping: { [key: string]: { name: string, description: string, onClick: () => void, category: string } } = {
                                            'alert-manager-settings': {
                                              name: 'Alert Manager | Settings',
                                              description: 'Configure and manage system alerts and notifications',
                                              category: 'Console Settings',
                                              onClick: () => {
                                                navigate('/alert-manager');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            'data-integration-settings': {
                                              name: 'Data Integration | Settings', 
                                              description: 'Manage data integration workflows and connectors',
                                              category: 'Console Settings',
                                              onClick: () => {
                                                navigate('/data-integrations');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            'event-log-settings': {
                                              name: 'Event Log | Settings',
                                              description: 'View and configure system event logging',
                                              category: 'Console Settings',
                                              onClick: () => {
                                                navigate('/event-log');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            'overview-settings': {
                                              name: 'Overview | Settings',
                                              description: 'Access the main console overview and dashboard',
                                              category: 'Console Settings',
                                              onClick: () => {
                                                navigate('/overview');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            'users': {
                                              name: 'Users',
                                              description: 'Manage user accounts and their access permissions',
                                              category: 'Identity & Access Management (IAM)',
                                              onClick: () => {
                                                navigate('/users');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            'groups': {
                                              name: 'Groups',
                                              description: 'Create and manage user groups and permissions',
                                              category: 'Identity & Access Management (IAM)',
                                              onClick: () => {
                                                navigate('/groups');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            'roles': {
                                              name: 'Roles',
                                              description: 'Define and manage user roles with specific permissions',
                                              category: 'Identity & Access Management (IAM)',
                                              onClick: () => {
                                                navigate('/roles');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            '60day-trial-openshift-ai': {
                                              name: '60-Day Product Trial | OpenShift AI',
                                              description: 'Create, train, and service AI/ML models',
                                              category: 'Red Hat OpenShift',
                                              onClick: () => console.log('60-Day Product Trial | OpenShift AI clicked')
                                            },
                                            'developer-sandbox-openshift-ai': {
                                              name: 'Developer Sandbox | OpenShift AI',
                                              description: 'Create, train, and service AI/ML models',
                                              category: 'Red Hat OpenShift',
                                              onClick: () => console.log('Developer Sandbox | OpenShift AI clicked')
                                            },
                                            'authentication-factors': {
                                              name: 'Authentication Factors',
                                              description: 'Configure multi-factor authentication and security settings',
                                              category: 'Identity & Access Management (IAM)',
                                              onClick: () => console.log('Authentication Factors clicked')
                                            },
                                            'service-accounts': {
                                              name: 'Service Accounts',
                                              description: 'Create and manage service accounts for automated systems',
                                              category: 'Identity & Access Management (IAM)',
                                              onClick: () => console.log('Service Accounts clicked')
                                            },
                                            'identity-provider-information': {
                                              name: 'Identity Provider Information',
                                              description: 'Configure and manage external identity providers',
                                              category: 'Identity & Access Management (IAM)',
                                              onClick: () => console.log('Identity Provider Information clicked')
                                            },
                                            'workspaces': {
                                              name: 'Workspaces',
                                              description: 'Manage organizational workspaces and their access controls',
                                              category: 'Identity & Access Management (IAM)',
                                              onClick: () => console.log('Workspaces clicked')
                                            },
                                            'directory-domain-services': {
                                              name: 'Directory and Domain Services',
                                              description: 'Configure directory services and domain management',
                                              category: 'Console Settings',
                                              onClick: () => console.log('Directory and Domain Services clicked')
                                            },
                                            'rhel-rhc': {
                                              name: 'Remote Host Configuration (RHC)',
                                              description: 'Configure and manage remote host connections',
                                              category: 'Red Hat Enterprise Linux',
                                              onClick: () => console.log('Remote Host Configuration (RHC) clicked')
                                            },
                                            'rhel-activation-keys': {
                                              name: 'Activation Keys',
                                              description: 'Manage activation keys for system registration',
                                              category: 'Red Hat Enterprise Linux',
                                              onClick: () => console.log('Activation Keys clicked')
                                            },
                                            'rhel-registration-assistant': {
                                              name: 'Registration Assistant',
                                              description: 'Step-by-step guidance for registering systems',
                                              category: 'Red Hat Enterprise Linux',
                                              onClick: () => console.log('Registration Assistant clicked')
                                            },
                                            'rhel-staleness-deletion': {
                                              name: 'Staleness & Deletion',
                                              description: 'Configure system staleness detection and automated deletion',
                                              category: 'Red Hat Enterprise Linux',
                                              onClick: () => console.log('Staleness & Deletion clicked')
                                            },
                                            'ansible-registration-assistant': {
                                              name: 'Registration Assistant',
                                              description: 'Guided setup for Ansible automation workflows',
                                              category: 'Red Hat Ansible Automation Platform',
                                              onClick: () => console.log('Ansible Registration Assistant clicked')
                                            },
                                            'console-alert-manager': {
                                              name: 'Alert Manager',
                                              description: 'Configure and manage system alerts and notifications',
                                              category: 'Console Settings',
                                              onClick: () => {
                                                navigate('/alert-manager');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            'console-data-integration': {
                                              name: 'Data Integration',
                                              description: 'Manage data integration workflows and connectors',
                                              category: 'Console Settings',
                                              onClick: () => {
                                                navigate('/data-integrations');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            'console-dashboard-hub': {
                                              name: 'Dashboard Hub',
                                              description: 'Browse, create, and organize dashboards for your workspace',
                                              category: 'Console Settings',
                                              onClick: () => {
                                                navigate('/dashboard-hub');
                                                setIsLogoDropdownOpen(false);
                                              }
                                            },
                                            // Additional items from default System Configuration menu
                                            'rhel-insights': {
                                              name: 'Red Hat Insights',
                                              description: 'Proactive identification and remediation of threats',
                                              category: 'Red Hat Enterprise Linux',
                                              onClick: () => console.log('Red Hat Insights clicked')
                                            },
                                            'rhel-patch': {
                                              name: 'Patch Management',
                                              description: 'Automated patching and system updates for RHEL environments',
                                              category: 'Red Hat Enterprise Linux',
                                              onClick: () => console.log('Patch Management clicked')
                                            },
                                            'openshift-clusters': {
                                              name: 'OpenShift Clusters',
                                              description: 'Manage and monitor your OpenShift Kubernetes clusters',
                                              category: 'Red Hat OpenShift',
                                              onClick: () => console.log('OpenShift Clusters clicked')
                                            },
                                            'container-registry': {
                                              name: 'Container Registry',
                                              description: 'Secure container image registry for storing and managing images',
                                              category: 'Red Hat OpenShift',
                                              onClick: () => console.log('Container Registry clicked')
                                            },
                                            'automation-hub': {
                                              name: 'Automation Hub',
                                              description: 'Centralized repository for Ansible content collections',
                                              category: 'Red Hat Ansible Automation Platform',
                                              onClick: () => console.log('Automation Hub clicked')
                                            },
                                            'automation-controller': {
                                              name: 'Automation Controller',
                                              description: 'Enterprise automation control plane for Ansible playbooks',
                                              category: 'Red Hat Ansible Automation Platform',
                                              onClick: () => console.log('Automation Controller clicked')
                                            },
                                            'user-access-item': {
                                              name: 'User Access',
                                              description: 'Manage user permissions, roles, and access controls',
                                              category: 'Identity & Access Management (IAM)',
                                              onClick: () => console.log('User Access clicked')
                                            },
                                            'service-accounts-item': {
                                              name: 'Service Accounts',
                                              description: 'Create and manage service accounts for automated systems',
                                              category: 'Identity & Access Management (IAM)',
                                              onClick: () => console.log('Service Accounts clicked')
                                            },
                                            'preferences': {
                                              name: 'Preferences',
                                              description: 'Customize your console experience, themes, and settings',
                                              category: 'Console Settings',
                                              onClick: () => console.log('Preferences clicked')
                                            },
                                            'notifications': {
                                              name: 'Notifications',
                                              description: 'Configure alert preferences and notification settings',
                                              category: 'Console Settings',
                                              onClick: () => console.log('Notifications clicked')
                                            },
                                            'subscriptions': {
                                              name: 'Subscriptions',
                                              description: 'View and manage your Red Hat product subscriptions',
                                              category: 'Subscription Services',
                                              onClick: () => console.log('Subscriptions clicked')
                                            },
                                            'billing': {
                                              name: 'Billing',
                                              description: 'Access billing information, invoices, and payment methods',
                                              category: 'Subscription Services',
                                              onClick: () => console.log('Billing clicked')
                                            },
                                            'documentation': {
                                              name: 'Documentation',
                                              description: 'Access comprehensive guides and technical documentation',
                                              category: 'Other',
                                              onClick: () => console.log('Documentation clicked')
                                            },
                                            'support': {
                                              name: 'Support',
                                              description: 'Get help from Red Hat support team and submit cases',
                                              category: 'Other',
                                              onClick: () => console.log('Support clicked')
                                            }
                                          };

                                          // Group favorited items by category
                                          const favoritesByCategory: { [category: string]: Array<{ id: string, item: typeof itemMapping[string] }> } = {};
                                          
                                          Array.from(favoritedItems).forEach(itemId => {
                                            const item = itemMapping[itemId];
                                            if (item) {
                                              if (!favoritesByCategory[item.category]) {
                                                favoritesByCategory[item.category] = [];
                                              }
                                              favoritesByCategory[item.category].push({ id: itemId, item });
                                            }
                                          });

                                          // Define category order for consistent display
                                          const categoryOrder = [
                                            'Red Hat Enterprise Linux',
                                            'Red Hat OpenShift', 
                                            'Red Hat Ansible Automation Platform',
                                            'Identity & Access Management (IAM)',
                                            'Console Settings',
                                            'Subscription Services',
                                            'Other'
                                          ];

                                          return (
                                            <>
                                              {categoryOrder.map((category, categoryIndex) => {
                                                const categoryItems = favoritesByCategory[category];
                                                if (!categoryItems || categoryItems.length === 0) return null;

                                                return (
                                                  <div key={category} style={categoryIndex > 0 ? { marginTop: '24px' } : {}}>
                                                    <MenuGroup label={category} labelHeadingLevel="h2">
                                                      <Divider />
                                                      <MenuList>
                                                        {categoryItems.map(({ id, item }) => (
                                                          <MenuItem
                                                            key={id}
                                                            itemId={`favorite-${id}`}
                                                            description={item.description}
                                                            onClick={item.onClick}
                                                            actions={
                                                              <MenuItemAction
                                                                icon={<StarIcon />}
                                                                actionId="unfavorite"
                                                                onClick={(e) => {
                                                                  e.stopPropagation();
                                                                  toggleFavorite(id);
                                                                }}
                                                                isFavorited={true}
                                                                aria-label="Remove from favorites"
                                                              />
                                                            }
                                                          >
                                                            {item.name}
                                                          </MenuItem>
                                                        ))}
                                                      </MenuList>
                                                    </MenuGroup>
                                                  </div>
                                                );
                                              })}
                                            </>
                                          );
                                        })()}
                                  </Menu>
                                )
                              ) : currentMenuItem.id === 'ai-ml' ? (
                                <Menu>
                                  <MenuGroup label="Red Hat OpenShift" labelHeadingLevel="h2">
                                    <Divider />
                                    <MenuList>
                                      <MenuItem 
                                        itemId="60day-trial-openshift-ai"
                                        description="Create, train, and service artificial intelligence and machine learning (AI/ML) models."
                                        onClick={() => console.log('60-Day Product Trial | OpenShift AI clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('60day-trial-openshift-ai');
                                            }}
                                            isFavorited={favoritedItems.has('60day-trial-openshift-ai')}
                                            aria-label={favoritedItems.has('60day-trial-openshift-ai') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        60-Day Product Trial | OpenShift AI
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="developer-sandbox-openshift-ai"
                                        description="Create, train, and service artificial intelligence and machine learning (AI/ML) models."
                                        onClick={() => console.log('Developer Sandbox | OpenShift AI clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('developer-sandbox-openshift-ai');
                                            }}
                                            isFavorited={favoritedItems.has('developer-sandbox-openshift-ai')}
                                            aria-label={favoritedItems.has('developer-sandbox-openshift-ai') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Developer Sandbox | OpenShift AI
                                      </MenuItem>
                                    </MenuList>
                                  </MenuGroup>
                                </Menu>
                              ) : currentMenuItem.id === 'alerting-data-integrations' ? (
                                <Menu>
                                  <MenuGroup label="Console Settings" labelHeadingLevel="h2">
                                    <Divider />
                                    <MenuList>
                                      <MenuItem 
                                        itemId="alert-manager-settings"
                                        description="Mary to add a description here eventually"
                                        onClick={() => {
                                          navigate('/alert-manager');
                                          setIsLogoDropdownOpen(false);
                                        }}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('alert-manager-settings');
                                            }}
                                            isFavorited={favoritedItems.has('alert-manager-settings')}
                                            aria-label={favoritedItems.has('alert-manager-settings') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Alert Manager | Settings
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="data-integration-settings"
                                        description="Mary to add a description here eventually"
                                        onClick={() => {
                                          navigate('/data-integrations');
                                          setIsLogoDropdownOpen(false);
                                        }}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('data-integration-settings');
                                            }}
                                            isFavorited={favoritedItems.has('data-integration-settings')}
                                            aria-label={favoritedItems.has('data-integration-settings') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Data Integration | Settings
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="event-log-settings"
                                        description="Mary to add a description here eventually"
                                        onClick={() => {
                                          navigate('/event-log');
                                          setIsLogoDropdownOpen(false);
                                        }}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('event-log-settings');
                                            }}
                                            isFavorited={favoritedItems.has('event-log-settings')}
                                            aria-label={favoritedItems.has('event-log-settings') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Event Log | Settings
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="overview-settings"
                                        description="Mary to add a description here evenually"
                                        onClick={() => {
                                          navigate('/overview');
                                          setIsLogoDropdownOpen(false);
                                        }}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('overview-settings');
                                            }}
                                            isFavorited={favoritedItems.has('overview-settings')}
                                            aria-label={favoritedItems.has('overview-settings') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Overview | Settings
                                      </MenuItem>
                                    </MenuList>
                                  </MenuGroup>
                                </Menu>
                              ) : currentMenuItem.id === 'identity-access-mgmt' ? (
                                <Menu>
                                  <MenuGroup label="Identity & Access Management (IAM)" labelHeadingLevel="h2">
                                    <Divider />
                                    <MenuList>
                                      <MenuItem 
                                        itemId="users"
                                        description="Manage user accounts and their access permissions"
                                        onClick={() => {
                                          navigate('/users');
                                          setIsLogoDropdownOpen(false);
                                        }}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('users');
                                            }}
                                            isFavorited={favoritedItems.has('users')}
                                            aria-label={favoritedItems.has('users') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Users
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="groups"
                                        description="Create and manage user groups and group-based permissions"
                                        onClick={() => {
                                          navigate('/groups');
                                          setIsLogoDropdownOpen(false);
                                        }}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('groups');
                                            }}
                                            isFavorited={favoritedItems.has('groups')}
                                            aria-label={favoritedItems.has('groups') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Groups
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="roles"
                                        description="Define and manage user roles with specific permissions and access levels"
                                        onClick={() => {
                                          navigate('/roles');
                                          setIsLogoDropdownOpen(false);
                                        }}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('roles');
                                            }}
                                            isFavorited={favoritedItems.has('roles')}
                                            aria-label={favoritedItems.has('roles') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Roles
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="authentication-factors"
                                        description="Configure multi-factor authentication and security settings"
                                        onClick={() => console.log('Authentication Factors clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('authentication-factors');
                                            }}
                                            isFavorited={favoritedItems.has('authentication-factors')}
                                            aria-label={favoritedItems.has('authentication-factors') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Authentication Factors
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="service-accounts"
                                        description="Create and manage service accounts for automated systems and application integrations"
                                        onClick={() => console.log('Service Accounts clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('service-accounts');
                                            }}
                                            isFavorited={favoritedItems.has('service-accounts')}
                                            aria-label={favoritedItems.has('service-accounts') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Service Accounts
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="identity-provider-information"
                                        description="Configure and manage external identity providers and federation settings"
                                        onClick={() => console.log('Identity Provider Information clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('identity-provider-information');
                                            }}
                                            isFavorited={favoritedItems.has('identity-provider-information')}
                                            aria-label={favoritedItems.has('identity-provider-information') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Identity Provider Information
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="workspaces"
                                        description="Manage organizational workspaces and their access controls"
                                        onClick={() => console.log('Workspaces clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('workspaces');
                                            }}
                                            isFavorited={favoritedItems.has('workspaces')}
                                            aria-label={favoritedItems.has('workspaces') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Workspaces
                                      </MenuItem>
                                    </MenuList>
                                  </MenuGroup>
                                  
                                  <div style={{ marginTop: '24px' }}>
                                    <MenuGroup label="Console Settings" labelHeadingLevel="h2">
                                      <Divider />
                                      <MenuList>
                                        <MenuItem 
                                                                                  itemId="directory-domain-services"
                                        description="Configure directory services and domain management settings"
                                        onClick={() => console.log('Directory and Domain Services clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('directory-domain-services');
                                            }}
                                            isFavorited={favoritedItems.has('directory-domain-services')}
                                            aria-label={favoritedItems.has('directory-domain-services') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Directory and Domain Services
                                        </MenuItem>
                                      </MenuList>
                                    </MenuGroup>
                                            </div>
                                </Menu>
                              ) : currentMenuItem.id === 'system-configuration' ? (
                                <Menu>
                                  <MenuGroup label="Red Hat Enterprise Linux" labelHeadingLevel="h2">
                                    <Divider />
                                    <MenuList>
                                      <MenuItem 
                                        itemId="rhel-rhc"
                                        description="Configure and manage remote host connections and system configurations"
                                        onClick={() => console.log('Remote Host Configuration (RHC) clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('rhel-rhc');
                                            }}
                                            isFavorited={favoritedItems.has('rhel-rhc')}
                                            aria-label={favoritedItems.has('rhel-rhc') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Remote Host Configuration (RHC)
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="rhel-activation-keys"
                                        description="Manage activation keys for system registration and subscription management"
                                        onClick={() => console.log('Activation Keys clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('rhel-activation-keys');
                                            }}
                                            isFavorited={favoritedItems.has('rhel-activation-keys')}
                                            aria-label={favoritedItems.has('rhel-activation-keys') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Activation Keys
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="rhel-registration-assistant"
                                        description="Step-by-step guidance for registering systems to Red Hat services"
                                        onClick={() => console.log('Registration Assistant clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('rhel-registration-assistant');
                                            }}
                                            isFavorited={favoritedItems.has('rhel-registration-assistant')}
                                            aria-label={favoritedItems.has('rhel-registration-assistant') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Registration Assistant
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="rhel-staleness-deletion"
                                        description="Configure system staleness detection and automated deletion policies"
                                        onClick={() => console.log('Staleness & Deletion clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('rhel-staleness-deletion');
                                            }}
                                            isFavorited={favoritedItems.has('rhel-staleness-deletion')}
                                            aria-label={favoritedItems.has('rhel-staleness-deletion') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Staleness & Deletion
                                      </MenuItem>
                                    </MenuList>
                                  </MenuGroup>
                                  
                                  <div style={{ marginTop: '24px' }}>
                                    <MenuGroup label="Red Hat Ansible Automation Platform" labelHeadingLevel="h2">
                                      <Divider />
                                      <MenuList>
                                        <MenuItem 
                                                                                  itemId="ansible-registration-assistant"
                                        description="Guided setup for registering and configuring Ansible automation workflows"
                                        onClick={() => console.log('Ansible Registration Assistant clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('ansible-registration-assistant');
                                            }}
                                            isFavorited={favoritedItems.has('ansible-registration-assistant')}
                                            aria-label={favoritedItems.has('ansible-registration-assistant') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Registration Assistant
                                        </MenuItem>
                                      </MenuList>
                                    </MenuGroup>
                                  </div>
                                  
                                  <div style={{ marginTop: '24px' }}>
                                    <MenuGroup label="Console Settings" labelHeadingLevel="h2">
                                      <Divider />
                                      <MenuList>
                                        <MenuItem 
                                                                                  itemId="console-alert-manager"
                                        description="Configure and manage system alerts, notifications, and escalation policies"
                                        onClick={() => {
                                          navigate('/alert-manager');
                                          setIsLogoDropdownOpen(false);
                                        }}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('console-alert-manager');
                                            }}
                                            isFavorited={favoritedItems.has('console-alert-manager')}
                                            aria-label={favoritedItems.has('console-alert-manager') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Alert Manager
                                        </MenuItem>
                                        <MenuItem 
                                                                                  itemId="console-data-integration"
                                        description="Manage data integration workflows, connectors, and synchronization settings"
                                        onClick={() => {
                                          navigate('/data-integrations');
                                          setIsLogoDropdownOpen(false);
                                        }}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('console-data-integration');
                                            }}
                                            isFavorited={favoritedItems.has('console-data-integration')}
                                            aria-label={favoritedItems.has('console-data-integration') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Data Integration
                                        </MenuItem>
                                        <MenuItem
                                          itemId="console-dashboard-hub"
                                          description="Browse, create, and organize dashboards for your workspace"
                                          onClick={() => {
                                            navigate('/dashboard-hub');
                                            setIsLogoDropdownOpen(false);
                                          }}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite('console-dashboard-hub');
                                              }}
                                              isFavorited={favoritedItems.has('console-dashboard-hub')}
                                              aria-label={
                                                favoritedItems.has('console-dashboard-hub')
                                                  ? 'Remove from favorites'
                                                  : 'Add to favorites'
                                              }
                                            />
                                          }
                                        >
                                          Dashboard Hub
                                        </MenuItem>
                                      </MenuList>
                                    </MenuGroup>
                                  </div>
                                </Menu>
                              ) : (
                                <Menu>
                                  <MenuGroup label="Red Hat Enterprise Linux" labelHeadingLevel="h2">
                                    <Divider />
                                    <MenuList>
                                      <MenuItem 
                                        itemId="rhel-insights"
                                        description="Proactive identification and remediation of threats to security, performance, availability, and stability"
                                        onClick={() => console.log('Red Hat Insights clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('rhel-insights');
                                            }}
                                            isFavorited={favoritedItems.has('rhel-insights')}
                                            aria-label={favoritedItems.has('rhel-insights') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Red Hat Insights
                                      </MenuItem>
                                      <MenuItem 
                                        itemId="rhel-patch"
                                        description="Automated patching and system updates for Red Hat Enterprise Linux environments"
                                        onClick={() => console.log('Patch Management clicked')}
                                        actions={
                                          <MenuItemAction
                                            icon={<StarIcon />}
                                            actionId="favorite"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('rhel-patch');
                                            }}
                                            isFavorited={favoritedItems.has('rhel-patch')}
                                            aria-label={favoritedItems.has('rhel-patch') ? "Remove from favorites" : "Add to favorites"}
                                          />
                                        }
                                      >
                                        Patch Management
                                      </MenuItem>
                                    </MenuList>
                                  </MenuGroup>
                                  
                                  <div style={{ marginTop: '24px' }}>
                                    <MenuGroup label="Red Hat OpenShift" labelHeadingLevel="h2">
                                      <Divider />
                                      <MenuList>
                                        <MenuItem 
                                          itemId="openshift-clusters"
                                          description="Manage and monitor your OpenShift Kubernetes clusters across hybrid cloud environments"
                                          onClick={() => console.log('OpenShift Clusters clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('openshift-clusters');
                                            }}
                                              isFavorited={favoritedItems.has('openshift-clusters')}
                                            aria-label={favoritedItems.has('openshift-clusters') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          OpenShift Clusters
                                        </MenuItem>
                                        <MenuItem 
                                          itemId="container-registry"
                                          description="Secure container image registry for storing, managing, and deploying container images"
                                          onClick={() => console.log('Container Registry clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('container-registry');
                                            }}
                                              isFavorited={favoritedItems.has('container-registry')}
                                            aria-label={favoritedItems.has('container-registry') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Container Registry
                                        </MenuItem>
                                      </MenuList>
                                    </MenuGroup>
                                  </div>
                                  
                                  <div style={{ marginTop: '24px' }}>
                                    <MenuGroup label="Red Hat Ansible Automation Platform" labelHeadingLevel="h2">
                                      <Divider />
                                      <MenuList>
                                        <MenuItem 
                                          itemId="automation-hub"
                                          description="Centralized repository for discovering, downloading, and sharing Ansible content collections"
                                          onClick={() => console.log('Automation Hub clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('automation-hub');
                                            }}
                                              isFavorited={favoritedItems.has('automation-hub')}
                                            aria-label={favoritedItems.has('automation-hub') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Automation Hub
                                        </MenuItem>
                                        <MenuItem 
                                          itemId="automation-controller"
                                          description="Enterprise automation control plane for scheduling, scaling, and managing Ansible playbooks"
                                          onClick={() => console.log('Automation Controller clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('automation-controller');
                                            }}
                                              isFavorited={favoritedItems.has('automation-controller')}
                                            aria-label={favoritedItems.has('automation-controller') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Automation Controller
                                        </MenuItem>
                                      </MenuList>
                                    </MenuGroup>
                                  </div>
                                  
                                  <div style={{ marginTop: '24px' }}>
                                    <MenuGroup label="Identity & Access Management (IAM)" labelHeadingLevel="h2">
                                      <Divider />
                                      <MenuList>
                                        <MenuItem 
                                          itemId="user-access"
                                          description="Manage user permissions, roles, and access controls across Red Hat services"
                                          onClick={() => console.log('User Access clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('user-access-item');
                                            }}
                                              isFavorited={favoritedItems.has('user-access-item')}
                                            aria-label={favoritedItems.has('user-access-item') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          User Access
                                        </MenuItem>
                                        <MenuItem 
                                          itemId="service-accounts"
                                          description="Create and manage service accounts for automated systems and application integrations"
                                          onClick={() => console.log('Service Accounts clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('service-accounts-item');
                                            }}
                                              isFavorited={favoritedItems.has('service-accounts-item')}
                                            aria-label={favoritedItems.has('service-accounts-item') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Service Accounts
                                        </MenuItem>
                                      </MenuList>
                                    </MenuGroup>
                                  </div>
                                  
                                  <div style={{ marginTop: '24px' }}>
                                    <MenuGroup label="Console Settings" labelHeadingLevel="h2">
                                      <Divider />
                                      <MenuList>
                                        <MenuItem 
                                          itemId="preferences"
                                          description="Customize your console experience, themes, and personal settings"
                                          onClick={() => console.log('Preferences clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('preferences');
                                            }}
                                              isFavorited={favoritedItems.has('preferences')}
                                            aria-label={favoritedItems.has('preferences') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Preferences
                                        </MenuItem>
                                        <MenuItem 
                                          itemId="notifications"
                                          description="Configure alert preferences and notification settings for system events"
                                          onClick={() => console.log('Notifications clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('notifications');
                                            }}
                                              isFavorited={favoritedItems.has('notifications')}
                                            aria-label={favoritedItems.has('notifications') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Notifications
                                        </MenuItem>
                                      </MenuList>
                                    </MenuGroup>
                                  </div>
                                  
                                  <div style={{ marginTop: '24px' }}>
                                    <MenuGroup label="Subscription Services" labelHeadingLevel="h2">
                                      <Divider />
                                      <MenuList>
                                        <MenuItem 
                                          itemId="subscriptions"
                                          description="View and manage your Red Hat product subscriptions and entitlements"
                                          onClick={() => console.log('Subscriptions clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('subscriptions');
                                            }}
                                              isFavorited={favoritedItems.has('subscriptions')}
                                            aria-label={favoritedItems.has('subscriptions') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Subscriptions
                                        </MenuItem>
                                        <MenuItem 
                                          itemId="billing"
                                          description="Access billing information, invoices, and payment methods for Red Hat services"
                                          onClick={() => console.log('Billing clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('billing');
                                            }}
                                              isFavorited={favoritedItems.has('billing')}
                                            aria-label={favoritedItems.has('billing') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Billing
                                        </MenuItem>
                                      </MenuList>
                                    </MenuGroup>
                                  </div>
                                  
                                  <div style={{ marginTop: '24px' }}>
                                    <MenuGroup label="Other" labelHeadingLevel="h2">
                                      <Divider />
                                      <MenuList>
                                        <MenuItem 
                                          itemId="documentation"
                                          description="Access comprehensive guides, tutorials, and technical documentation for Red Hat products"
                                          onClick={() => console.log('Documentation clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('documentation');
                                            }}
                                              isFavorited={favoritedItems.has('documentation')}
                                            aria-label={favoritedItems.has('documentation') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Documentation
                                        </MenuItem>
                                        <MenuItem 
                                          itemId="support"
                                          description="Get help from Red Hat support team, submit cases, and access community resources"
                                          onClick={() => console.log('Support clicked')}
                                          actions={
                                            <MenuItemAction
                                              icon={<StarIcon />}
                                              actionId="favorite"
                                              onClick={(e) => {
                                              e.stopPropagation();
                                              toggleFavorite('support');
                                            }}
                                              isFavorited={favoritedItems.has('support')}
                                            aria-label={favoritedItems.has('support') ? "Remove from favorites" : "Add to favorites"}
                                            />
                                          }
                                        >
                                          Support
                                        </MenuItem>
                                      </MenuList>
                                    </MenuGroup>
                                  </div>
                                </Menu>
                              )}
                            </FlexItem>
                          </Flex>
                        );
                      })()}
                    </div>
                  </SplitItem>
                </Split>
              </CardBody>
            </Card>
          </div>
        </div>
      )}
      
      {/* Floating Comments Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '32px',
          right: isDrawerExpanded ? `${helpPanelWidth + 32}px` : '32px', // 32px from panel edge when open, 32px from viewport edge when closed
          width: '56px',
          height: '56px',
          zIndex: 1000,
          transition: 'right 0.2s ease-in-out',
        }}
      >
        <Button
          variant="plain"
          onClick={() => {
            setCustomHelpTitle(null);
            setCustomHelpVariant(null);
            setHelpPanelSubTab(5);
            setIsDrawerExpanded(true);
          }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#ee0000',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          aria-label="Open help chat"
        >
          <img
            src={HappyRobotIcon}
            alt=""
            aria-hidden
            style={{
              width: '28px',
              height: 'auto',
              aspectRatio: '1 / 1',
              display: 'block',
              objectFit: 'contain',
              flexShrink: 0,
              filter: 'brightness(0) invert(1)'
            }}
          />
        </Button>
      </div>

      {/* PatternFly Tooltips for truncated overflow menu items */}
      {overflowTooltips.map((tooltip, index) => (
        <Tooltip
          key={`overflow-${tooltip.text}-${index}`}
          content={tooltip.text}
          triggerRef={() => document.querySelector(tooltip.selector) as HTMLElement}
          entryDelay={100}
          exitDelay={0}
          animationDuration={100}
          position="top"
        />
      ))}
      
    </>
  );
};

export { AppLayout };
