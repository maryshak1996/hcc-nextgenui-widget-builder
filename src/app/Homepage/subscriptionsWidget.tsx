import * as React from 'react';
import { Alert, Button } from '@patternfly/react-core';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon
} from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

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

function getSubscriptionsStatusGridColumns(colSpan: number): number {
  if (colSpan >= 4) {
    return 4;
  }
  if (colSpan >= 3) {
    return 4;
  }
  if (colSpan === 2) {
    return 2;
  }
  return 1;
}

export function SubscriptionsWidgetBody() {
  const colSpan = useWidgetColSpan();
  const statusGridColumns = getSubscriptionsStatusGridColumns(colSpan);
  const isWideLayout = colSpan >= 4;

  return (
    <div
      className={`subscriptions-widget-body${isWideLayout ? ' subscriptions-widget-body--wide' : ''}`}
      style={{ gridTemplateColumns: `repeat(${statusGridColumns}, minmax(0, 1fr))` }}
    >
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
    flex-grow: 0 !important;
  }

  .widget-card--subscriptions .widget-card__body-content {
    flex: 0 1 auto;
    align-items: flex-start;
  }

  .subscriptions-widget-body {
    flex: 0 1 auto;
    display: grid;
    grid-auto-rows: auto;
    gap: var(--pf-t--global--spacer--md);
    width: 100%;
    align-content: start;
  }

  .subscriptions-widget-body .subscriptions-status-alert {
    --pf-v6-c-alert--GridTemplateColumns: minmax(0, 1fr);
    --pf-v6-c-alert--GridTemplateAreas:
      "icon"
      "title"
      "description";
    justify-items: center;
    align-content: start;
    text-align: center;
    height: auto;
    min-height: 0;
    margin: 0;
    padding-block: var(--pf-t--global--spacer--md);
  }

  .subscriptions-widget-body .subscriptions-status-alert .pf-v6-c-alert__icon {
    margin-inline-end: 0;
    margin-block: 0;
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
    font-size: var(--pf-t--global--font--size--heading--md);
    font-weight: var(--pf-t--global--font--weight--heading--heading);
    line-height: var(--pf-t--global--font--line-height--heading--md);
  }

  /* Full-width (4-col) — one row of status cards; size to content, grid gap only below */
  .widget-wrapper:has(.widget-card--subscriptions .subscriptions-widget-body--wide) {
    align-self: start;
  }

  .widget-wrapper:has(.widget-card--subscriptions .subscriptions-widget-body--wide) .widget-resizable-root {
    height: auto !important;
  }

  .widget-wrapper:has(.widget-card--subscriptions .subscriptions-widget-body--wide) .widget-card {
    height: auto !important;
  }
`;
