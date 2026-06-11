import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Content,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Skeleton,
  Stack
} from '@patternfly/react-core';
import {
  AnalyzeIcon,
  AutomationIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ExternalLinkAltIcon,
  RhUiSeverityCriticalIcon,
  RhUiSeverityImportantIcon,
  RhUiSeverityMinorIcon,
  RhUiSeverityModerateIcon
} from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { WidgetDescriptionList } from '@app/Homepage/widgetDescriptionList';

/** Product artwork for empty-state widgets. */
export const BIG_THREE_PRODUCT_IMAGES = {
  rhel: 'https://www.redhat.com/rhdc/managed-files/RHEL-tech-icon-hybrid-style-v2_0.png',
  openshift: 'https://www.redhat.com/rhdc/managed-files/OS-tech-icon-hybrid-style_0.png',
  ansible: 'https://www.redhat.com/rhdc/managed-files/Ansible-tech-icon-hybrid-style_0.png'
} as const;

const BIG_THREE_PRODUCT_LOADING_MS = 1500;

const WIDGET_ACTION_BUTTON_PROPS = { size: 'sm' as const };

type BigThreeProductSummaryIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type BigThreeProductSummaryIconTone = 'danger' | 'warning' | 'moderate' | 'info' | 'brand' | 'default';

interface BigThreeProductSummaryRow {
  id: string;
  label: string;
  linkText: string;
  href: string;
  icon: BigThreeProductSummaryIcon;
  iconTone: BigThreeProductSummaryIconTone;
}

function useBigThreeProductWidgetTransition() {
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const startTransition = useCallback(() => {
    setIsLoading(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setIsComplete(true);
      setIsLoading(false);
    }, BIG_THREE_PRODUCT_LOADING_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoading]);

  return { isComplete, isLoading, startTransition };
}

function BigThreeProductSummaryRowIcon({
  icon: Icon,
  iconTone
}: {
  icon: BigThreeProductSummaryIcon;
  iconTone: BigThreeProductSummaryIconTone;
}) {
  return (
    <span
      className={`big-three-product-summary-row-icon big-three-product-summary-row-icon--${iconTone}`}
      aria-hidden
    >
      <Icon />
    </span>
  );
}

function BigThreeProductSummaryRows({ rows }: { rows: BigThreeProductSummaryRow[] }) {
  return (
    <>
      {rows.map((row) => (
        <DescriptionListGroup key={row.id}>
          <DescriptionListTerm>
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <BigThreeProductSummaryRowIcon icon={row.icon} iconTone={row.iconTone} />
              </FlexItem>
              <FlexItem>{row.label}</FlexItem>
            </Flex>
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Button
              variant="link"
              isInline
              component="a"
              href={row.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {row.linkText}
            </Button>
          </DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </>
  );
}

function BigThreeProductLoadingWidgetBody({
  screenreaderText,
  introLineCount = 2,
  listRowCount = 2,
  footerActionCount = 2
}: {
  screenreaderText: string;
  introLineCount?: number;
  listRowCount?: number;
  footerActionCount?: number;
}) {
  return (
    <BigThreeProductWidgetLayout
      content={
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          {introLineCount > 0 ? (
            <>
              <Skeleton screenreaderText={screenreaderText} width="85%" />
              {introLineCount > 1 ? <Skeleton width="55%" /> : null}
            </>
          ) : null}
          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
            {Array.from({ length: listRowCount }).map((_, index) => (
              <Flex key={index} spaceItems={{ default: 'spaceItemsMd' }} flexWrap={{ default: 'wrap' }}>
                <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '6rem' }}>
                  <Skeleton width="55%" />
                </FlexItem>
                <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '6rem' }}>
                  <Skeleton width="65%" />
                </FlexItem>
              </Flex>
            ))}
          </Flex>
        </Flex>
      }
      actions={
        footerActionCount > 0 ? (
          <Flex spaceItems={{ default: 'spaceItemsSm' }} flexWrap={{ default: 'wrap' }}>
            {Array.from({ length: footerActionCount }).map((_, index) => (
              <Skeleton
                key={index}
                width={index === 0 ? '7.5rem' : '7rem'}
                height="2rem"
                screenreaderText={index === 0 ? 'Loading actions' : undefined}
              />
            ))}
          </Flex>
        ) : null
      }
    />
  );
}

function WidgetActionGroup({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      className="widget-actions"
      alignItems={{ default: 'alignItemsCenter' }}
      spaceItems={{ default: 'spaceItemsSm' }}
      flexWrap={{ default: 'wrap' }}
    >
      {React.Children.map(children, (child) => (child ? <FlexItem>{child}</FlexItem> : null))}
    </Flex>
  );
}

function BigThreeProductWidgetLayout({
  content,
  actions
}: {
  content: React.ReactNode;
  actions: React.ReactNode;
}) {
  return (
    <Flex className="big-three-product-widget" direction={{ default: 'column' }}>
      <FlexItem className="big-three-product-widget__content">{content}</FlexItem>
      <FlexItem className="big-three-product-widget__actions">{actions}</FlexItem>
    </Flex>
  );
}

/** Prototype URLs from product widget design spec. */
export const BIG_THREE_PRODUCT_LINKS = {
  rhel: {
    dashboard: 'https://console.redhat.com/insights/dashboard',
    registerSystems: 'https://console.redhat.com/insights/registration',
    manageSystems: 'https://console.redhat.com/insights/inventory',
    learnMore:
      'https://docs.redhat.com/en/documentation/red_hat_lightspeed/1-latest/html-single/registering_rhel_systems_and_configuring_client_tools_with_red_hat_lightspeed/index'
  },
  openshift: {
    dashboard: 'https://console.redhat.com/openshift/dashboard',
    createClusters: 'https://console.redhat.com/openshift/create',
    manageClusters: 'https://console.redhat.com/openshift',
    learnMore:
      'https://docs.redhat.com/en/documentation/openshift_cluster_manager/1-latest'
  },
  ansible: {
    dashboard: 'https://console.redhat.com/ansible/ansible-dashboard',
    configure: 'https://console.redhat.com/iam/service-accounts/',
    automationAnalytics: 'https://console.redhat.com/ansible/automation-analytics',
    automationHub: 'https://console.redhat.com/ansible/automation-hub',
    viewSubscription: 'https://console.redhat.com/subscriptions',
    learnMore:
      'https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.6/html/configuring_automation_execution/controller-usability-analytics-data-collection#ref-controller-automation-analytics'
  }
} as const;

const OPENSHIFT_RECOMMENDATION_ROWS: BigThreeProductSummaryRow[] = [
  {
    id: 'critical',
    label: 'Critical',
    linkText: '0 recommendations',
    href: BIG_THREE_PRODUCT_LINKS.openshift.dashboard,
    icon: RhUiSeverityCriticalIcon,
    iconTone: 'danger'
  },
  {
    id: 'important',
    label: 'Important',
    linkText: '18 recommendations',
    href: BIG_THREE_PRODUCT_LINKS.openshift.dashboard,
    icon: RhUiSeverityImportantIcon,
    iconTone: 'warning'
  },
  {
    id: 'moderate',
    label: 'Moderate',
    linkText: '20 recommendations',
    href: BIG_THREE_PRODUCT_LINKS.openshift.dashboard,
    icon: RhUiSeverityModerateIcon,
    iconTone: 'moderate'
  },
  {
    id: 'low',
    label: 'Low',
    linkText: '2 recommendations',
    href: BIG_THREE_PRODUCT_LINKS.openshift.dashboard,
    icon: RhUiSeverityMinorIcon,
    iconTone: 'info'
  }
];

const ANSIBLE_FEATURE_ROWS: BigThreeProductSummaryRow[] = [
  {
    id: 'automation-analytics',
    label: 'Automation Analytics',
    linkText: '27 clusters',
    href: BIG_THREE_PRODUCT_LINKS.ansible.automationAnalytics,
    icon: AnalyzeIcon,
    iconTone: 'brand'
  },
  {
    id: 'automation-hub',
    label: 'Automation Hub',
    linkText: '0 items',
    href: BIG_THREE_PRODUCT_LINKS.ansible.automationHub,
    icon: AutomationIcon,
    iconTone: 'brand'
  }
];

export function BigThreeProductHeader({
  widgetId,
  title,
  dashboardHref,
  toolbar
}: {
  widgetId: string;
  title: string;
  dashboardHref: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId={widgetId}
      title={title}
      toolbar={toolbar}
      titleClassName="big-three-product-header__title"
      inlineLink={
        <Button
          variant="link"
          isInline
          component="a"
          href={dashboardHref}
          target="_blank"
          rel="noopener noreferrer"
        >
          Dashboard
        </Button>
      }
    />
  );
}

function ProductEmptyStateMessage({
  message,
  imageSrc,
  imageAlt
}: {
  message: string;
  imageSrc: string;
  imageAlt: string;
}) {
  return (
    <Flex
      className="big-three-product-empty-state"
      alignItems={{ default: 'alignItemsCenter' }}
      spaceItems={{ default: 'spaceItemsMd' }}
      flexWrap={{ default: 'nowrap' }}
    >
      <FlexItem shrink={{ default: 'shrink' }}>
        <img className="big-three-product-empty-state__icon" src={imageSrc} alt={imageAlt} />
      </FlexItem>
      <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: 0 }}>
        <Content component="p" className="big-three-product-empty-state__text">
          {message}
        </Content>
      </FlexItem>
    </Flex>
  );
}

export function OpenshiftEmptyWidgetBody({ onCreateClusters }: { onCreateClusters: () => void }) {
  return (
    <BigThreeProductWidgetLayout
      content={
        <ProductEmptyStateMessage
          message="You have not connected any clusters with OpenShift Cluster Manager."
          imageSrc={BIG_THREE_PRODUCT_IMAGES.openshift}
          imageAlt="Red Hat OpenShift"
        />
      }
      actions={
        <WidgetActionGroup>
          <Button
            {...WIDGET_ACTION_BUTTON_PROPS}
            variant="primary"
            component="button"
            type="button"
            onClick={onCreateClusters}
          >
            Create clusters
          </Button>
          <Button
            variant="link"
            component="a"
            href={BIG_THREE_PRODUCT_LINKS.openshift.learnMore}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            Learn more
          </Button>
        </WidgetActionGroup>
      }
    />
  );
}

export function OpenshiftNonEmptyWidgetBody() {
  return (
    <BigThreeProductWidgetLayout
      content={
        <Stack className="big-three-product-summary" hasGutter>
          <Content component="p" className="big-three-product-summary__intro">
            You have{' '}
            <Button
              variant="link"
              isInline
              component="a"
              href={BIG_THREE_PRODUCT_LINKS.openshift.manageClusters}
              target="_blank"
              rel="noopener noreferrer"
            >
              12 clusters
            </Button>{' '}
            connected to the OpenShift Cluster Manager.
          </Content>
          <WidgetDescriptionList horizontalFluid horizontalColumnModifier={{ default: '1Col' }}>
            <BigThreeProductSummaryRows rows={OPENSHIFT_RECOMMENDATION_ROWS} />
          </WidgetDescriptionList>
        </Stack>
      }
      actions={
        <WidgetActionGroup>
          <Button
            {...WIDGET_ACTION_BUTTON_PROPS}
            variant="secondary"
            component="a"
            href={BIG_THREE_PRODUCT_LINKS.openshift.createClusters}
            target="_blank"
            rel="noopener noreferrer"
          >
            Create clusters
          </Button>
          <Button
            variant="link"
            component="a"
            href={BIG_THREE_PRODUCT_LINKS.openshift.manageClusters}
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage clusters
          </Button>
        </WidgetActionGroup>
      }
    />
  );
}

export function OpenshiftWidgetBody() {
  const { isComplete, isLoading, startTransition } = useBigThreeProductWidgetTransition();

  if (isLoading) {
    return (
      <BigThreeProductLoadingWidgetBody
        screenreaderText="Loading OpenShift clusters summary"
        introLineCount={2}
        listRowCount={4}
        footerActionCount={2}
      />
    );
  }

  if (!isComplete) {
    return <OpenshiftEmptyWidgetBody onCreateClusters={startTransition} />;
  }

  return <OpenshiftNonEmptyWidgetBody />;
}

export function AnsibleEmptyWidgetBody({ onConfigure }: { onConfigure: () => void }) {
  return (
    <BigThreeProductWidgetLayout
      content={
        <ProductEmptyStateMessage
          message="You have not configured your Automation Analytics feature."
          imageSrc={BIG_THREE_PRODUCT_IMAGES.ansible}
          imageAlt="Red Hat Ansible"
        />
      }
      actions={
        <WidgetActionGroup>
          <Button
            {...WIDGET_ACTION_BUTTON_PROPS}
            variant="primary"
            component="button"
            type="button"
            onClick={onConfigure}
          >
            Configure
          </Button>
          <Button
            variant="link"
            component="a"
            href={BIG_THREE_PRODUCT_LINKS.ansible.learnMore}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            Learn more
          </Button>
        </WidgetActionGroup>
      }
    />
  );
}

export function AnsibleNonEmptyWidgetBody() {
  return (
    <BigThreeProductWidgetLayout
      content={
        <WidgetDescriptionList horizontalFluid horizontalColumnModifier={{ default: '1Col' }}>
          <BigThreeProductSummaryRows rows={ANSIBLE_FEATURE_ROWS} />
        </WidgetDescriptionList>
      }
      actions={
        <WidgetActionGroup>
          <Button
            {...WIDGET_ACTION_BUTTON_PROPS}
            variant="secondary"
            component="a"
            href={BIG_THREE_PRODUCT_LINKS.ansible.viewSubscription}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Ansible subscription
          </Button>
        </WidgetActionGroup>
      }
    />
  );
}

export function AnsibleWidgetBody() {
  const { isComplete, isLoading, startTransition } = useBigThreeProductWidgetTransition();

  if (isLoading) {
    return (
      <BigThreeProductLoadingWidgetBody
        screenreaderText="Loading Ansible automation summary"
        introLineCount={0}
        listRowCount={2}
        footerActionCount={1}
      />
    );
  }

  if (!isComplete) {
    return <AnsibleEmptyWidgetBody onConfigure={startTransition} />;
  }

  return <AnsibleNonEmptyWidgetBody />;
}

export function RhelEmptyWidgetBody({ onRegisterSystems }: { onRegisterSystems: () => void }) {
  return (
    <BigThreeProductWidgetLayout
      content={
        <ProductEmptyStateMessage
          message="You have not registered any RHEL systems with Red Hat Lightspeed."
          imageSrc={BIG_THREE_PRODUCT_IMAGES.rhel}
          imageAlt="Red Hat Enterprise Linux"
        />
      }
      actions={
        <WidgetActionGroup>
          <Button
            {...WIDGET_ACTION_BUTTON_PROPS}
            variant="primary"
            component="button"
            type="button"
            onClick={onRegisterSystems}
          >
            Register systems
          </Button>
          <Button
            variant="link"
            component="a"
            href={BIG_THREE_PRODUCT_LINKS.rhel.learnMore}
            target="_blank"
            rel="noopener noreferrer"
            icon={<ExternalLinkAltIcon />}
            iconPosition="end"
          >
            Learn more
          </Button>
        </WidgetActionGroup>
      }
    />
  );
}

function RhelLoadingWidgetBody() {
  return (
    <BigThreeProductLoadingWidgetBody
      screenreaderText="Loading RHEL systems summary"
      introLineCount={2}
      listRowCount={2}
      footerActionCount={2}
    />
  );
}

export function RhelWidgetBody() {
  const { isComplete, isLoading, startTransition } = useBigThreeProductWidgetTransition();

  if (isLoading) {
    return <RhelLoadingWidgetBody />;
  }

  if (!isComplete) {
    return <RhelEmptyWidgetBody onRegisterSystems={startTransition} />;
  }

  return <RhelNonEmptyWidgetBody />;
}

export function RhelNonEmptyWidgetBody() {
  return (
    <BigThreeProductWidgetLayout
      content={
        <Stack className="big-three-product-summary" hasGutter>
          <Content component="p" className="big-three-product-summary__intro">
            You have{' '}
            <Button
              variant="link"
              isInline
              component="a"
              href={BIG_THREE_PRODUCT_LINKS.rhel.manageSystems}
              target="_blank"
              rel="noopener noreferrer"
            >
              16,299 systems
            </Button>{' '}
            registered with Red Hat Lightspeed.
          </Content>
          <WidgetDescriptionList horizontalFluid>
            <DescriptionListGroup>
              <DescriptionListTerm
                icon={
                  <ExclamationTriangleIcon
                    className="big-three-product-status-icon big-three-product-status-icon--warning"
                    aria-hidden
                  />
                }
              >
                Stale
              </DescriptionListTerm>
              <DescriptionListDescription>
                <Button variant="link" isInline component="a" href="#" onClick={(e) => e.preventDefault()}>
                  3,674 systems
                </Button>
              </DescriptionListDescription>
            </DescriptionListGroup>
            <DescriptionListGroup>
              <DescriptionListTerm
                icon={
                  <ExclamationCircleIcon
                    className="big-three-product-status-icon big-three-product-status-icon--danger"
                    aria-hidden
                  />
                }
              >
                To be removed
              </DescriptionListTerm>
              <DescriptionListDescription>
                <Button variant="link" isInline component="a" href="#" onClick={(e) => e.preventDefault()}>
                  3,899 systems
                </Button>
              </DescriptionListDescription>
            </DescriptionListGroup>
          </WidgetDescriptionList>
        </Stack>
      }
      actions={
        <WidgetActionGroup>
          <Button
            {...WIDGET_ACTION_BUTTON_PROPS}
            variant="secondary"
            component="a"
            href={BIG_THREE_PRODUCT_LINKS.rhel.registerSystems}
            target="_blank"
            rel="noopener noreferrer"
          >
            Register systems
          </Button>
          <Button
            variant="link"
            component="a"
            href={BIG_THREE_PRODUCT_LINKS.rhel.manageSystems}
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage systems
          </Button>
        </WidgetActionGroup>
      }
    />
  );
}

/** Styles injected with dashboard widget grid styles. */
export const BIG_THREE_PRODUCT_WIDGET_STYLES = `
  .big-three-product-empty-state {
    flex-wrap: nowrap;
    align-items: center;
  }

  .big-three-product-empty-state__icon {
    display: block;
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    object-fit: contain;
  }

  .big-three-product-header__title {
    margin: 0;
  }

  .big-three-product-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    width: 100%;
    gap: var(--pf-t--global--spacer--xs);
  }

  .big-three-product-widget__content {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  /* Compact height when the card does not pin actions to the bottom (e.g. Ansible dashboard). */
  .widget-card:not(.widget-card--pinned-body-footer) .big-three-product-widget:has(.big-three-product-empty-state) {
    height: auto;
    flex: 0 1 auto;
  }

  .widget-card:not(.widget-card--pinned-body-footer)
    .big-three-product-widget:has(.big-three-product-empty-state)
    .big-three-product-widget__content {
    flex: 0 1 auto;
    overflow-y: visible;
  }

  /* Pinned-footer cards: keep actions at the bottom even for empty product states. */
  .widget-card--pinned-body-footer .big-three-product-widget:has(.big-three-product-empty-state) {
    height: 100%;
    flex: 1 1 auto;
  }

  .widget-card--pinned-body-footer
    .big-three-product-widget:has(.big-three-product-empty-state)
    .big-three-product-widget__content {
    flex: 1 1 0;
    min-height: 0;
    overflow-y: auto;
  }

  .big-three-product-widget__actions {
    flex: 0 0 auto;
  }

  .big-three-product-empty-state__text {
    margin: 0;
    color: var(--pf-t--global--text--color--subtle, var(--pf-v6-global--Color--200));
  }

  .big-three-product-summary.pf-v6-l-stack.pf-m-gutter {
    --pf-v6-l-stack--m-gutter--Gap: var(--pf-t--global--spacer--sm);
  }

  .big-three-product-summary__intro {
    margin: 0;
  }

  .big-three-product-summary-row-icon {
    display: inline-flex;
    font-size: 1rem;
    line-height: 1;
  }

  .big-three-product-summary-row-icon--danger {
    color: var(--pf-t--global--icon--color--status--danger--default);
  }

  .big-three-product-summary-row-icon--warning {
    color: var(--pf-t--global--icon--color--status--warning--default);
  }

  .big-three-product-summary-row-icon--moderate {
    color: var(--pf-t--global--icon--color--status--warning--default);
  }

  .big-three-product-summary-row-icon--info {
    color: var(--pf-t--global--icon--color--status--info--default);
  }

  .big-three-product-summary-row-icon--brand {
    color: var(--pf-t--global--icon--color--brand--default);
  }

  .big-three-product-summary-row-icon--default {
    color: var(--pf-t--global--icon--color--regular);
  }

  .widget-card .widget-actions {
    width: 100%;
  }

  .widget-card .widget-actions .pf-v6-c-button.pf-m-primary.pf-m-small,
  .widget-card .widget-actions .pf-v6-c-button.pf-m-secondary.pf-m-small {
    --pf-v6-c-button--AlignItems: center;
    --pf-v6-c-button--PaddingBlockStart: var(--pf-t--global--spacer--control--vertical--compact);
    --pf-v6-c-button--PaddingBlockEnd: var(--pf-t--global--spacer--control--vertical--compact);
    --pf-v6-c-button--PaddingInlineStart: var(--pf-t--global--spacer--action--horizontal--compact);
    --pf-v6-c-button--PaddingInlineEnd: var(--pf-t--global--spacer--action--horizontal--compact);
  }

  .big-three-product-status-icon {
    font-size: 1rem;
  }

  .big-three-product-status-icon--warning {
    color: var(--pf-t--global--icon--color--status--warning--default);
  }

  .big-three-product-status-icon--danger {
    color: var(--pf-t--global--icon--color--status--danger--default);
  }
`;
