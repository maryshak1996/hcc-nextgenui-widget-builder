import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  FlexItem,
  Title
} from '@patternfly/react-core';
import { getWidgetBuilderHeaderIconComponent } from '@app/Homepage/widgetBuilderHeaderIcons';
import type { PreviewBlock } from '@app/Homepage/widgetBuilderPreviewParser';

function renderRichSegments(block: Extract<PreviewBlock, { type: 'richText' }>) {
  return (
    <span>
      {block.segments.map((s, i) =>
        s.type === 'inlineCode' ? (
          <code
            key={i}
            style={{
              fontFamily: 'var(--pf-t--global--font--family--mono)',
              fontSize: 'var(--pf-t--global--font--size--body--default)',
              padding: '0.125rem 0.375rem',
              borderRadius: 'var(--pf-t--global--border--radius--small)',
              backgroundColor: 'var(--pf-t--global--background--color--secondary--default)'
            }}
          >
            {s.text}
          </code>
        ) : (
          <React.Fragment key={i}>{s.text}</React.Fragment>
        )
      )}
    </span>
  );
}

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
        <Flex
          direction={{ default: 'column' }}
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsMd' }}
          style={{ textAlign: 'center' }}
        >
          {blocks.map((block, index) => {
            if (block.type === 'text') {
              return <FlexItem key={index}>{block.text}</FlexItem>;
            }
            if (block.type === 'button') {
              return (
                <FlexItem key={index}>
                  <Button variant={block.variant} size="sm">
                    {block.label}
                  </Button>
                </FlexItem>
              );
            }
            return (
              <FlexItem key={index}>
                {renderRichSegments(block)}
              </FlexItem>
            );
          })}
        </Flex>
      </CardBody>
    </Card>
  );
};

export { WidgetBuilderPreviewCard };
