import * as React from 'react';
import { Button, Flex, FlexItem } from '@patternfly/react-core';
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

export function CustomBuilderWidgetBody({ blocks }: { blocks: PreviewBlock[] }) {
  return (
    <Flex
      className="custom-builder-widget__body"
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
              <Button variant={block.variant} size="sm" type="button">
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
  );
}

export const CUSTOM_BUILDER_WIDGET_STYLES = `
  .custom-builder-widget__body {
    width: 100%;
    padding-block: var(--pf-t--global--spacer--md);
  }
`;
