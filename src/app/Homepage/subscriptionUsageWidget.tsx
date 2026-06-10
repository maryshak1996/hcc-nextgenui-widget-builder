import * as React from 'react';
import { useMemo, useState } from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement,
  Tab,
  Tabs,
  TabTitleText,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';
import {
  AnsibleSubscriptionUsageSkeletonChart,
  OpenshiftSubscriptionUsageChart,
  RhelSubscriptionUsageChart
} from '@app/Homepage/subscriptionUsageCharts';
import { ClockIcon } from '@app/icons/rhUiIcons';

export type SubscriptionUsageWidgetId =
  | 'openshift-subscription-usage'
  | 'rhel-subscription-usage'
  | 'ansible-subscription-usage';

interface SubscriptionUsageTab {
  eventKey: string;
  title: string;
}

interface SubscriptionUsageWidgetConfig {
  widgetId: SubscriptionUsageWidgetId;
  tabs?: SubscriptionUsageTab[];
  variantLabel: string;
  variantOptions: string[];
  variantIsPlaceholder?: boolean;
  chartKind: 'openshift' | 'rhel' | 'ansible-skeleton';
}

const TIME_FRAME_OPTIONS = [
  { id: '7', label: '7 days', toggleLabel: 'Past 7 days (daily)' },
  { id: '30', label: '30 days', toggleLabel: 'Past 30 days (daily)' },
  { id: '90', label: '90 days', toggleLabel: 'Past 90 days (daily)' },
  { id: '180', label: '180 days', toggleLabel: 'Past 180 days (weekly)' },
  { id: '365', label: '1 year', toggleLabel: 'Past 1 year (monthly)' }
] as const;

const DEFAULT_TIME_FRAME = '30';

const OPENSHIFT_SUBSCRIPTION_USAGE_CONFIG: SubscriptionUsageWidgetConfig = {
  widgetId: 'openshift-subscription-usage',
  tabs: [
    { eventKey: 'core', title: 'Core usage' },
    { eventKey: 'sockets', title: 'Socket usage' }
  ],
  variantLabel: 'Container Platform (annual)',
  variantOptions: ['Container Platform (annual)', 'Advanced Cluster Management (annual)'],
  chartKind: 'openshift'
};

const RHEL_SUBSCRIPTION_USAGE_CONFIG: SubscriptionUsageWidgetConfig = {
  widgetId: 'rhel-subscription-usage',
  variantLabel: 'RHEL for x86',
  variantOptions: ['RHEL for x86', 'RHEL for IBM Power', 'RHEL for IBM Z'],
  chartKind: 'rhel'
};

const ANSIBLE_SUBSCRIPTION_USAGE_CONFIG: SubscriptionUsageWidgetConfig = {
  widgetId: 'ansible-subscription-usage',
  tabs: [
    { eventKey: 'managed-nodes', title: 'Managed nodes' },
    { eventKey: 'infrastructure-hours', title: 'Infrastructure hours' }
  ],
  variantLabel: 'Select one',
  variantOptions: ['Select one'],
  variantIsPlaceholder: true,
  chartKind: 'ansible-skeleton'
};

function SubscriptionUsageWidgetHeader({
  widgetId,
  title,
  toolbar
}: {
  widgetId: SubscriptionUsageWidgetId;
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId={widgetId}
      title={title}
      toolbar={toolbar}
      titleClassName="subscription-usage-widget-header__title"
      inlineLink={
        <Button variant="link" isInline component="button" type="button">
          View details
        </Button>
      }
    />
  );
}

function SubscriptionUsageChartPanel({
  config,
  activeTabKey,
  dayCount
}: {
  config: SubscriptionUsageWidgetConfig;
  activeTabKey: string;
  dayCount: number;
}) {
  if (config.chartKind === 'ansible-skeleton') {
    return (
      <div className="subscription-usage-widget__chart-skeleton">
        <AnsibleSubscriptionUsageSkeletonChart />
      </div>
    );
  }

  if (config.chartKind === 'rhel') {
    return <RhelSubscriptionUsageChart dayCount={dayCount} />;
  }

  const seriesLabel = activeTabKey === 'sockets' ? 'Sockets' : 'Cores';
  return <OpenshiftSubscriptionUsageChart seriesLabel={seriesLabel} dayCount={dayCount} />;
}

function SubscriptionUsageWidgetBody({ config }: { config: SubscriptionUsageWidgetConfig }) {
  const colSpan = useWidgetColSpan();
  const isWideToolbar = colSpan >= 2;
  const initialTabKey = config.tabs?.[0]?.eventKey ?? 'default';
  const [activeTabKey, setActiveTabKey] = useState(initialTabKey);
  const [selectedVariant, setSelectedVariant] = useState(config.variantLabel);
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>(DEFAULT_TIME_FRAME);
  const [isVariantOpen, setIsVariantOpen] = useState(false);
  const [isTimeFrameOpen, setIsTimeFrameOpen] = useState(false);

  const dayCount = Number.parseInt(selectedTimeFrame, 10);
  const selectedTimeFrameLabel =
    TIME_FRAME_OPTIONS.find((option) => option.id === selectedTimeFrame)?.label ?? '30 days';
  const selectedTimeFrameToggleLabel =
    TIME_FRAME_OPTIONS.find((option) => option.id === selectedTimeFrame)?.toggleLabel ??
    'Past 30 days (daily)';

  const variantToggleText = useMemo(
    () => `Variant: ${selectedVariant}`,
    [selectedVariant]
  );

  const handleTabSelect = (
    _event: React.MouseEvent<HTMLElement> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    setActiveTabKey(String(tabIndex));
  };

  return (
    <div className="subscription-usage-widget">
      {config.tabs ? (
        <Tabs
          activeKey={activeTabKey}
          onSelect={handleTabSelect}
          aria-label={`${config.widgetId} usage views`}
          className="subscription-usage-widget__tabs"
          component="div"
          usePageInsets
        >
          {config.tabs.map((tab) => (
            <Tab key={tab.eventKey} eventKey={tab.eventKey} title={<TabTitleText>{tab.title}</TabTitleText>} />
          ))}
        </Tabs>
      ) : null}

      <div className="subscription-usage-widget__panel">
        <Toolbar className="subscription-usage-widget__toolbar" inset={{ default: 'insetNone' }}>
          <ToolbarContent>
            <ToolbarItem>
              <Flex
                className="subscription-usage-widget__toolbar-controls"
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsMd' }}
              >
                <FlexItem className="subscription-usage-widget__variant-item">
                  <Dropdown
                    isOpen={isVariantOpen}
                    onOpenChange={setIsVariantOpen}
                    onSelect={(_event, selection) => {
                      if (typeof selection === 'string') {
                        setSelectedVariant(selection);
                      }
                      setIsVariantOpen(false);
                    }}
                    popperProps={{ position: 'right' }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        size="sm"
                        isExpanded={isVariantOpen}
                        onClick={() => setIsVariantOpen((open) => !open)}
                        className="subscription-usage-widget__variant-toggle"
                        isPlaceholder={config.variantIsPlaceholder && selectedVariant === 'Select one'}
                      >
                        <span className="subscription-usage-widget__variant-toggle-text">{variantToggleText}</span>
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      {config.variantOptions.map((option) => (
                        <DropdownItem key={option} value={option}>
                          {option}
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  </Dropdown>
                </FlexItem>
                <FlexItem
                  className={
                    isWideToolbar
                      ? 'subscription-usage-widget__time-frame-item subscription-usage-widget__time-frame-item--wide'
                      : 'subscription-usage-widget__time-frame-item'
                  }
                >
                  <Dropdown
                    isOpen={isTimeFrameOpen}
                    onOpenChange={setIsTimeFrameOpen}
                    onSelect={(_event, selection) => {
                      if (typeof selection === 'string') {
                        setSelectedTimeFrame(selection);
                      }
                      setIsTimeFrameOpen(false);
                    }}
                    popperProps={{ position: 'right' }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        variant={isWideToolbar ? 'default' : 'plain'}
                        size="sm"
                        isExpanded={isTimeFrameOpen}
                        onClick={() => setIsTimeFrameOpen((open) => !open)}
                        className={
                          isWideToolbar
                            ? 'subscription-usage-widget__time-frame-toggle'
                            : 'subscription-usage-widget__time-frame-toggle subscription-usage-widget__time-frame-toggle--icon'
                        }
                        aria-label={`Time frame: ${selectedTimeFrameLabel}`}
                      >
                        {isWideToolbar ? (
                          <span className="subscription-usage-widget__time-frame-toggle-text">
                            {selectedTimeFrameToggleLabel}
                          </span>
                        ) : (
                          <ClockIcon aria-hidden />
                        )}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      {TIME_FRAME_OPTIONS.map((option) => (
                        <DropdownItem key={option.id} value={option.id}>
                          {option.label}
                        </DropdownItem>
                      ))}
                    </DropdownList>
                  </Dropdown>
                </FlexItem>
              </Flex>
            </ToolbarItem>
          </ToolbarContent>
        </Toolbar>

        <SubscriptionUsageChartPanel
          config={config}
          activeTabKey={activeTabKey}
          dayCount={dayCount}
        />
      </div>
    </div>
  );
}

export function OpenshiftSubscriptionUsageWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <SubscriptionUsageWidgetHeader
      widgetId="openshift-subscription-usage"
      title={title}
      toolbar={toolbar}
    />
  );
}

export function OpenshiftSubscriptionUsageWidgetBody() {
  return <SubscriptionUsageWidgetBody config={OPENSHIFT_SUBSCRIPTION_USAGE_CONFIG} />;
}

export function RhelSubscriptionUsageWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <SubscriptionUsageWidgetHeader
      widgetId="rhel-subscription-usage"
      title={title}
      toolbar={toolbar}
    />
  );
}

export function RhelSubscriptionUsageWidgetBody() {
  return <SubscriptionUsageWidgetBody config={RHEL_SUBSCRIPTION_USAGE_CONFIG} />;
}

export function AnsibleSubscriptionUsageWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <SubscriptionUsageWidgetHeader
      widgetId="ansible-subscription-usage"
      title={title}
      toolbar={toolbar}
    />
  );
}

export function AnsibleSubscriptionUsageWidgetBody() {
  return <SubscriptionUsageWidgetBody config={ANSIBLE_SUBSCRIPTION_USAGE_CONFIG} />;
}

/** Styles injected with dashboard widget grid styles. */
export const SUBSCRIPTION_USAGE_WIDGET_STYLES = `
  .subscription-usage-widget-header__title {
    margin: 0;
  }

  .widget-card--subscription-usage .widget-card__body,
  .widget-card--subscription-usage .pf-v6-c-card__body {
    padding: 0;
  }

  .widget-card.widget-card--subscription-usage.pf-v6-c-card > .pf-v6-c-divider + .pf-v6-c-card__body {
    padding-block-start: 0;
  }

  .widget-card--subscription-usage .widget-card__body-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .subscription-usage-widget {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .subscription-usage-widget__tabs.pf-v6-c-tabs {
    flex-shrink: 0;
    width: 100%;
    --pf-v6-c-tabs__item-link--PaddingBlockStart: var(--pf-t--global--spacer--sm);
    --pf-v6-c-tabs__item-link--PaddingBlockEnd: var(--pf-t--global--spacer--sm);
  }

  .subscription-usage-widget__tabs.pf-v6-c-tabs .pf-v6-c-tab-content {
    display: none;
  }

  .subscription-usage-widget__panel {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    padding-inline: var(--pf-t--global--spacer--md);
    padding-block-end: var(--pf-t--global--spacer--md);
  }

  .subscription-usage-widget__toolbar {
    flex-shrink: 0;
    padding-block-start: var(--pf-t--global--spacer--md);
    padding-block-end: var(--pf-t--global--spacer--sm);
  }

  .subscription-usage-widget__toolbar-controls {
    min-width: 0;
  }

  .subscription-usage-widget__variant-item {
    min-width: 0;
    max-width: 100%;
  }

  .subscription-usage-widget__time-frame-item {
    flex-shrink: 0;
  }

  .subscription-usage-widget__time-frame-item--wide {
    min-width: 0;
    max-width: 100%;
    flex-shrink: 1;
  }

  .subscription-usage-widget__variant-toggle,
  .subscription-usage-widget__time-frame-toggle {
    max-width: min(100%, 20rem);
  }

  .subscription-usage-widget__variant-toggle-text,
  .subscription-usage-widget__time-frame-toggle-text {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .subscription-usage-widget__time-frame-toggle--icon.pf-v6-c-menu-toggle.pf-m-plain {
    --pf-v6-c-menu-toggle--PaddingBlockStart: var(--pf-t--global--spacer--xs);
    --pf-v6-c-menu-toggle--PaddingBlockEnd: var(--pf-t--global--spacer--xs);
    --pf-v6-c-menu-toggle--PaddingInlineStart: var(--pf-t--global--spacer--sm);
    --pf-v6-c-menu-toggle--PaddingInlineEnd: var(--pf-t--global--spacer--sm);
  }

  .subscription-usage-widget__chart-frame {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    width: 100%;
  }

  .subscription-usage-widget__chart-skeleton {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    pointer-events: none;
  }

  .subscription-usage-widget__chart-skeleton .subscription-usage-widget__chart-frame {
    opacity: 0.72;
  }
`;
