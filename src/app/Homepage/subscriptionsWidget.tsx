import * as React from 'react';
import { Alert, Button } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon
} from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';

export const SUBSCRIPTIONS_WIDGET_LINKS = {
  manageSubscriptions: 'https://console.redhat.com/subscriptions'
} as const;

const SUBSCRIPTION_STATUS_COUNTS = {
  active: 217,
  expiringSoon: 2,
  expired: 4,
  futureDated: 0
} as const;

export function SubscriptionsWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="subscriptions"
      title={title}
      toolbar={toolbar}
      titleClassName="subscriptions-widget-header__title"
      inlineLink={
        <Button
          variant="link"
          isInline
          component="a"
          href={SUBSCRIPTIONS_WIDGET_LINKS.manageSubscriptions}
          target="_blank"
          rel="noopener noreferrer"
        >
          Manage subscriptions
        </Button>
      }
    />
  );
}

export function SubscriptionsWidgetBody() {
  return (
    <div className="subscriptions-widget-body">
      <Alert
        variant="success"
        isInline
        title="Active"
        className="subscriptions-status-alert"
        customIcon={<CheckCircleIcon aria-hidden />}
      >
        {SUBSCRIPTION_STATUS_COUNTS.active}
      </Alert>
      <Alert
        variant="warning"
        isInline
        title="Expiring soon"
        className="subscriptions-status-alert"
        customIcon={<ExclamationTriangleIcon aria-hidden />}
      >
        {SUBSCRIPTION_STATUS_COUNTS.expiringSoon}
      </Alert>
      <Alert
        variant="danger"
        isInline
        title="Expired"
        className="subscriptions-status-alert"
        customIcon={<ExclamationCircleIcon aria-hidden />}
      >
        {SUBSCRIPTION_STATUS_COUNTS.expired}
      </Alert>
      <Alert
        variant="info"
        isInline
        title="Future dated"
        className="subscriptions-status-alert"
        customIcon={<InfoCircleIcon aria-hidden />}
      >
        {SUBSCRIPTION_STATUS_COUNTS.futureDated}
      </Alert>
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const SUBSCRIPTIONS_WIDGET_STYLES = `
  .subscriptions-widget-header__title {
    margin: 0;
  }

  .widget-card--subscriptions .pf-v6-c-card__body {
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    overflow: hidden !important;
  }

  .subscriptions-widget-body {
    flex: 1 1 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(9.375rem, 1fr));
    grid-auto-rows: 1fr;
    gap: var(--pf-t--global--spacer--md);
    min-height: 0;
    height: 100%;
    width: 100%;
    align-content: stretch;
  }

  .subscriptions-widget-body .subscriptions-status-alert {
    --pf-v6-c-alert--GridTemplateColumns: minmax(0, 1fr);
    --pf-v6-c-alert--GridTemplateAreas:
      "icon"
      "title"
      "description";
    justify-items: center;
    align-content: center;
    text-align: center;
    height: 100%;
    min-height: 0;
    margin: 0;
  }

  .subscriptions-widget-body .subscriptions-status-alert .pf-v6-c-alert__icon {
    margin-inline-end: 0;
    margin-block-start: 0;
    align-self: center;
  }

  .subscriptions-widget-body .subscriptions-status-alert .pf-v6-c-alert__title {
    text-align: center;
    align-self: center;
  }

  .subscriptions-widget-body .subscriptions-status-alert .pf-v6-c-alert__description {
    padding-block-start: var(--pf-t--global--spacer--xs);
    text-align: center;
    align-self: center;
  }
`;
