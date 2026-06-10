import * as React from 'react';
import {
  Button,
  Content,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import {
  getHorizontalFluidDescriptionListLayout,
  WidgetDescriptionList
} from '@app/Homepage/widgetDescriptionList';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

export const ACTIVATION_KEYS_WIDGET_LINKS = {
  viewAllKeys: '#',
  createActivationKey: '#'
} as const;

const ACTIVATION_KEYS_ORG_ID = '11789772';

const TOP_ACTIVATION_KEYS = [
  { id: 'production-server-key', label: 'production-server-key', href: '#' },
  { id: 'dev-stack-key', label: 'dev-stack-key', href: '#' },
  { id: 'ansible-automation-key', label: 'ansible-automation-key', href: '#' }
] as const;

const ACTIVATION_KEYS_PAIR_COUNT = 1;

export function ActivationKeysWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="activation-keys"
      title={title}
      toolbar={toolbar}
      titleClassName="activation-keys-widget-header__title"
      inlineLink={
        <Button
          variant="link"
          isInline
          component="a"
          href={ACTIVATION_KEYS_WIDGET_LINKS.viewAllKeys}
        >
          View all keys
        </Button>
      }
    />
  );
}

export function ActivationKeysWidgetBody() {
  const colSpan = useWidgetColSpan();
  const fluidLayout = getHorizontalFluidDescriptionListLayout(colSpan, ACTIVATION_KEYS_PAIR_COUNT);

  return (
    <Flex
      className="activation-keys-widget"
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsMd' }}
    >
      <FlexItem className="activation-keys-widget__content">
        <WidgetDescriptionList
          horizontalFluid
          horizontalColumnModifier={fluidLayout.columnModifier}
          horizontalGridClassName={fluidLayout.className}
          aria-label="Activation keys organization"
          className="activation-keys-widget__description-list"
        >
          <DescriptionListGroup>
            <DescriptionListTerm>Org ID</DescriptionListTerm>
            <DescriptionListDescription>{ACTIVATION_KEYS_ORG_ID}</DescriptionListDescription>
          </DescriptionListGroup>
        </WidgetDescriptionList>

        <div className="activation-keys-widget__keys-section">
          <Content component="p" className="activation-keys-widget__summary">
            Showing your top <strong>3</strong> activation keys
          </Content>

          <Flex
            className="activation-keys-widget__key-links"
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            {TOP_ACTIVATION_KEYS.map((key) => (
              <FlexItem key={key.id}>
                <Button variant="link" isInline size="sm" component="a" href={key.href}>
                  {key.label}
                </Button>
              </FlexItem>
            ))}
          </Flex>
        </div>
      </FlexItem>

      <FlexItem className="activation-keys-widget__footer">
        <Button
          variant="secondary"
          size="sm"
          component="a"
          href={ACTIVATION_KEYS_WIDGET_LINKS.createActivationKey}
          icon={<PlusCircleIcon aria-hidden />}
        >
          Create activation key
        </Button>
      </FlexItem>
    </Flex>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const ACTIVATION_KEYS_WIDGET_STYLES = `
  .activation-keys-widget-header__title {
    margin: 0;
  }

  .activation-keys-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .activation-keys-widget__content {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--pf-t--global--spacer--md);
  }

  .activation-keys-widget__description-list {
    --pf-v6-c-description-list--GridTemplateColumns--min: 0;
  }

  .activation-keys-widget__keys-section {
    display: flex;
    flex-direction: column;
    gap: var(--pf-t--global--spacer--xs);
    width: 100%;
  }

  .activation-keys-widget__summary {
    margin: 0;
    color: var(--pf-t--global--text--color--subtle);
  }

  .activation-keys-widget__key-links {
    width: 100%;
  }

  .activation-keys-widget__footer {
    flex-shrink: 0;
    margin-top: auto;
    width: fit-content;
  }
`;
