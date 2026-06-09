import * as React from 'react';
import { Button, Content, Flex, FlexItem } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';

export const RED_HAT_AI_WIDGET_LINKS = {
  explore: 'https://www.redhat.com/en/products/ai'
} as const;

export const RED_HAT_AI_WIDGET_IMAGE =
  'https://www.redhat.com/rhdc/managed-files/AI-tech-icon-hybrid-style%402x-v2_0.webp';

const WIDGET_ACTION_BUTTON_PROPS = { size: 'sm' as const };

export function RedHatAiWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="red-hat-ai"
      title={title}
      toolbar={toolbar}
      titleClassName="red-hat-ai-widget-header__title"
    />
  );
}

export function RedHatAiWidgetBody() {
  return (
    <Flex className="big-three-product-widget" direction={{ default: 'column' }}>
      <FlexItem className="big-three-product-widget__content">
        <Flex
          className="big-three-product-empty-state"
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsMd' }}
          flexWrap={{ default: 'nowrap' }}
        >
          <FlexItem shrink={{ default: 'shrink' }}>
            <img
              className="big-three-product-empty-state__icon"
              src={RED_HAT_AI_WIDGET_IMAGE}
              alt="Red Hat AI"
            />
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: 0 }}>
            <Content component="p" className="big-three-product-empty-state__text">
              Build and run AI solutions with our Red Hat AI product portfolio - Enterprise AI, RHEL AI,
              OpenShift AI, and AI Inference Server.
            </Content>
          </FlexItem>
        </Flex>
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
              href={RED_HAT_AI_WIDGET_LINKS.explore}
              target="_blank"
              rel="noopener noreferrer"
              icon={<ExternalLinkAltIcon aria-hidden />}
              iconPosition="end"
            >
              Explore Red Hat AI
            </Button>
          </FlexItem>
        </Flex>
      </FlexItem>
    </Flex>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const RED_HAT_AI_WIDGET_STYLES = `
  .red-hat-ai-widget-header__title {
    margin: 0;
  }
`;
