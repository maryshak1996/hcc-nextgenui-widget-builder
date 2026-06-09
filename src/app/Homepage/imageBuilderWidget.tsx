import * as React from 'react';
import { Button, Content, Flex, FlexItem, Stack } from '@patternfly/react-core';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';

export const IMAGE_BUILDER_WIDGET_LINKS = {
  images: 'https://console.redhat.com/insights/image-builder/manage',
  createImages: 'https://console.redhat.com/insights/image-builder/imagewizard',
  manageImages: 'https://console.redhat.com/insights/image-builder/manage'
} as const;

export const IMAGE_BUILDER_IMAGE_COUNT = 0;

const WIDGET_ACTION_BUTTON_PROPS = { size: 'sm' as const };

export function ImageBuilderWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="image-builder"
      title={title}
      toolbar={toolbar}
      titleClassName="image-builder-widget-header__title"
    />
  );
}

export function ImageBuilderWidgetBody() {
  return (
    <Flex className="big-three-product-widget" direction={{ default: 'column' }}>
      <FlexItem className="big-three-product-widget__content">
        <Stack className="image-builder-widget__summary" hasGutter>
          <Content component="p" className="image-builder-widget__intro">
            You have{' '}
            <Button
              variant="link"
              isInline
              component="a"
              href={IMAGE_BUILDER_WIDGET_LINKS.images}
            >
              {IMAGE_BUILDER_IMAGE_COUNT} images
            </Button>{' '}
            associated with RHEL Image Builder.
          </Content>
          <Content component="p" className="image-builder-widget__description">
            Automate the creation of consistent, deployment-ready system images for disks, VMs, and cloud
            platforms.
          </Content>
        </Stack>
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
              href={IMAGE_BUILDER_WIDGET_LINKS.createImages}
            >
              Create images
            </Button>
          </FlexItem>
          <FlexItem>
            <Button
              variant="link"
              component="a"
              href={IMAGE_BUILDER_WIDGET_LINKS.manageImages}
            >
              Manage images
            </Button>
          </FlexItem>
        </Flex>
      </FlexItem>
    </Flex>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const IMAGE_BUILDER_WIDGET_STYLES = `
  .image-builder-widget-header__title {
    margin: 0;
  }

  .image-builder-widget__summary.pf-v6-l-stack.pf-m-gutter {
    --pf-v6-l-stack--m-gutter--Gap: var(--pf-t--global--spacer--sm);
  }

  .image-builder-widget__intro,
  .image-builder-widget__description {
    margin: 0;
  }
`;
