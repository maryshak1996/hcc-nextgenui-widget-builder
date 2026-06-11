import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  Button,
  Content,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  Spinner,
  Switch
} from '@patternfly/react-core';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';

export const SIMPLE_CONTENT_ACCESS_WIDGET_LINKS = {
  viewUsage: '#',
  manageConfiguration: '#',
  scaDocumentation:
    'https://docs.redhat.com/en/documentation/subscription_central/1-latest/html-single/getting_started_with_simple_content_access/index'
} as const;

const SCA_STATUS_SWITCH_ID = 'simple-content-access-widget-sca-status';
const ENABLE_SCA_LOADING_MS = 1500;

export function SimpleContentAccessWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="simple-content-access-sca"
      title={title}
      toolbar={toolbar}
      titleClassName="simple-content-access-widget-header__title"
      inlineLink={
        <Button variant="link" isInline component="a" href={SIMPLE_CONTENT_ACCESS_WIDGET_LINKS.viewUsage}>
          View usage
        </Button>
      }
    />
  );
}

export function SimpleContentAccessWidgetBody() {
  const [scaEnabled, setScaEnabled] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnableSca = useCallback(() => {
    setIsEnabling(true);
  }, []);

  useEffect(() => {
    if (!isEnabling) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setScaEnabled(true);
      setIsEnabling(false);
    }, ENABLE_SCA_LOADING_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isEnabling]);

  const statusForm = (
    <Form
      className="simple-content-access-widget__status-form"
      onSubmit={(event) => event.preventDefault()}
    >
      <FormGroup label="Status" fieldId={SCA_STATUS_SWITCH_ID}>
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsMd' }}
          flexWrap={{ default: 'wrap' }}
        >
          <FlexItem>
            <Switch
              id={SCA_STATUS_SWITCH_ID}
              aria-label="Simple content access status"
              isChecked={scaEnabled}
              isDisabled={!scaEnabled}
              onChange={(_event, checked) => setScaEnabled(checked)}
            />
          </FlexItem>
          <FlexItem>
            <span className="simple-content-access-widget__status-label">
              {scaEnabled ? 'SCA enabled' : 'SCA disabled'}
            </span>
          </FlexItem>
        </Flex>
      </FormGroup>
    </Form>
  );

  return (
    <Flex
      className="simple-content-access-widget"
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsMd' }}
    >
      <FlexItem className="simple-content-access-widget__content">
        <Content component="p" className="simple-content-access-widget__intro">
          <Button
            variant="link"
            isInline
            component="a"
            href={SIMPLE_CONTENT_ACCESS_WIDGET_LINKS.scaDocumentation}
            target="_blank"
            rel="noopener noreferrer"
          >
            Simple content access
          </Button>{' '}
          lets your organization consume Red Hat subscription content without attaching subscriptions to each
          registered system.
        </Content>

        {isEnabling ? (
          <Flex
            className="simple-content-access-widget__loading"
            alignItems={{ default: 'alignItemsCenter' }}
            justifyContent={{ default: 'justifyContentFlexStart' }}
          >
            <Spinner size="md" aria-label="Enabling simple content access" />
          </Flex>
        ) : (
          statusForm
        )}
      </FlexItem>

      <FlexItem className="simple-content-access-widget__footer">
        {scaEnabled ? (
          <Button
            variant="secondary"
            size="sm"
            component="a"
            href={SIMPLE_CONTENT_ACCESS_WIDGET_LINKS.manageConfiguration}
          >
            Manage configuration
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            component="button"
            type="button"
            isDisabled={isEnabling}
            onClick={handleEnableSca}
          >
            Enable SCA for this org
          </Button>
        )}
      </FlexItem>
    </Flex>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const SIMPLE_CONTENT_ACCESS_WIDGET_STYLES = `
  .simple-content-access-widget-header__title {
    margin: 0;
  }

  .simple-content-access-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .simple-content-access-widget__content {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--pf-t--global--spacer--sm);
  }

  .simple-content-access-widget__intro {
    margin: 0;
    color: var(--pf-t--global--text--color--subtle);
  }

  .simple-content-access-widget__loading {
    min-height: 2.25rem;
    width: 100%;
  }

  .simple-content-access-widget__status-form.pf-v6-c-form {
    --pf-v6-c-form--m-horizontal__group-label--md--GridColumnWidth: max-content;
    --pf-v6-c-form--m-horizontal__group-label--md--GridColumnGap: var(--pf-t--global--spacer--md);
    --pf-v6-c-form--m-horizontal__group-control--md--GridColumnWidth: 1fr;
  }

  .simple-content-access-widget__status-form .pf-v6-c-form__group {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: var(--pf-t--global--spacer--md);
    align-items: center;
  }

  .simple-content-access-widget__status-form .pf-v6-c-form__label {
    margin: 0;
    padding: 0;
  }

  .simple-content-access-widget__status-form .pf-v6-c-form__group-control {
    grid-column: 2;
  }

  .simple-content-access-widget__status-label {
    color: var(--pf-t--global--text--color--subtle);
  }

  .simple-content-access-widget__footer {
    flex-shrink: 0;
    width: fit-content;
  }
`;
