import * as React from 'react';
import { Button, Content, Flex, FlexItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';

export const QUAY_IO_WIDGET_LINKS = {
  manageOrganizations: 'https://console.redhat.com/quay/organizations',
  learnMore:
    'https://docs.redhat.com/en/documentation/red_hat_quay/'
} as const;

const WIDGET_ACTION_BUTTON_PROPS = { size: 'sm' as const };

export function QuayIoWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="quay-io"
      title={title}
      toolbar={toolbar}
      titleClassName="quay-io-widget-header__title"
    />
  );
}

export function QuayIoWidgetBody() {
  return (
    <Flex className="big-three-product-widget" direction={{ default: 'column' }}>
      <FlexItem className="big-three-product-widget__content">
        <Content component="p" className="quay-io-widget__description">
          Build, analyze, and distribute your container images.
        </Content>
      </FlexItem>
      <FlexItem className="big-three-product-widget__actions">
        <Flex
          className="widget-actions"
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          flexWrap={{ default: 'wrap' }}
        >
          <FlexItem>
            <Button
              {...WIDGET_ACTION_BUTTON_PROPS}
              variant="primary"
              component="a"
              href={QUAY_IO_WIDGET_LINKS.manageOrganizations}
            >
              Manage organizations
            </Button>
          </FlexItem>
          <FlexItem>
            <Button
              variant="link"
              component="a"
              href={QUAY_IO_WIDGET_LINKS.learnMore}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExternalLinkAltIcon aria-hidden />}
              iconPosition="end"
            >
              Learn more
            </Button>
          </FlexItem>
        </Flex>
      </FlexItem>
    </Flex>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const QUAY_IO_WIDGET_STYLES = `
  .quay-io-widget-header__title {
    margin: 0;
  }

  .quay-io-widget__description {
    margin: 0;
  }
`;
