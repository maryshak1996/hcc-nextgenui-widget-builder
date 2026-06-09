import * as React from 'react';
import {
  Button,
  Content,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Stack
} from '@patternfly/react-core';
import { ExclamationCircleIcon, ExclamationTriangleIcon } from '@app/icons/rhUiIcons';
import { ExternalLinkAltIcon } from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';

/** Product artwork for empty-state widgets. */
export const BIG_THREE_PRODUCT_IMAGES = {
  openshift: 'https://www.redhat.com/rhdc/managed-files/OS-tech-icon-hybrid-style_0.png',
  ansible: 'https://www.redhat.com/rhdc/managed-files/Ansible-tech-icon-hybrid-style_0.png'
} as const;

const WIDGET_ACTION_BUTTON_PROPS = { size: 'sm' as const };

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
    manageSystems: 'https://console.redhat.com/insights/inventory'
  },
  openshift: {
    dashboard: 'https://console.redhat.com/openshift/dashboard',
    createClusters: 'https://console.redhat.com/openshift/create',
    learnMore:
      'https://docs.redhat.com/en/documentation/openshift_cluster_manager/1-latest'
  },
  ansible: {
    dashboard: 'https://console.redhat.com/ansible/ansible-dashboard',
    configure: 'https://console.redhat.com/iam/service-accounts/',
    learnMore:
      'https://docs.redhat.com/en/documentation/red_hat_ansible_automation_platform/2.6/html/configuring_automation_execution/controller-usability-analytics-data-collection#ref-controller-automation-analytics'
  }
} as const;

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

export function OpenshiftEmptyWidgetBody() {
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

export function AnsibleEmptyWidgetBody() {
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
            component="a"
            href={BIG_THREE_PRODUCT_LINKS.ansible.configure}
            target="_blank"
            rel="noopener noreferrer"
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

export function RhelNonEmptyWidgetBody() {
  return (
    <BigThreeProductWidgetLayout
      content={
        <Stack className="big-three-product-rhel-summary" hasGutter>
          <Content component="p" className="big-three-product-rhel-summary__intro">
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
          <DescriptionList isHorizontal isCompact isFluid>
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
          </DescriptionList>
        </Stack>
      }
      actions={
        <WidgetActionGroup>
          <Button
            {...WIDGET_ACTION_BUTTON_PROPS}
            variant="primary"
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
    gap: var(--pf-t--global--spacer--md);
  }

  .big-three-product-widget__content {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .big-three-product-widget__actions {
    flex: 0 0 auto;
    margin-top: auto;
  }

  .big-three-product-empty-state__text {
    margin: 0;
    color: var(--pf-t--global--text--color--subtle, var(--pf-v6-global--Color--200));
  }

  .big-three-product-rhel-summary.pf-v6-l-stack.pf-m-gutter {
    --pf-v6-l-stack--m-gutter--Gap: var(--pf-t--global--spacer--sm);
  }

  .big-three-product-rhel-summary__intro {
    margin: 0;
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
