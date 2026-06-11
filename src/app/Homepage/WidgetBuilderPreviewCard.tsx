import * as React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FlexItem,
  Title
} from '@patternfly/react-core';
import { CustomBuilderWidgetBody } from '@app/Homepage/customBuilderWidget';
import { getWidgetBuilderHeaderIconComponent } from '@app/Homepage/widgetBuilderHeaderIcons';
import type { PreviewBlock } from '@app/Homepage/widgetBuilderPreviewParser';

export interface WidgetBuilderPreviewCardProps {
  title: string;
  headerIconId: string;
  blocks: PreviewBlock[];
}

const WidgetBuilderPreviewCard: React.FC<WidgetBuilderPreviewCardProps> = ({ title, headerIconId, blocks }) => {
  const brandIcon = 'var(--pf-t--global--icon--color--brand--default)';
  const HeaderIcon = getWidgetBuilderHeaderIconComponent(headerIconId);

  return (
    <Card className="widget-builder-sample-preview-card">
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
          <FlexItem style={{ color: brandIcon, lineHeight: 0 }}>
            <HeaderIcon style={{ width: '1.25rem', height: '1.25rem' }} aria-hidden />
          </FlexItem>
          <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: 0 }}>
            <Title headingLevel="h4" className="pf-v6-c-card__title">
              {title}
            </Title>
          </FlexItem>
        </Flex>
      </CardHeader>
      <Divider />
      <CardBody isFilled={false} style={{ paddingBlock: 'var(--pf-t--global--spacer--md)' }}>
        <CustomBuilderWidgetBody blocks={blocks} />
      </CardBody>
    </Card>
  );
};

export { WidgetBuilderPreviewCard };
