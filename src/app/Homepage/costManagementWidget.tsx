import * as React from 'react';
import { useState } from 'react';
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
import { CostManagementChart } from '@app/Homepage/costManagementChart';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

const CURRENCY_OPTIONS = [
  {
    id: 'usd',
    label: 'USD ($)',
    symbol: '$',
    toggleLabel: 'Currency: USD ($) - United States Dollar'
  },
  {
    id: 'eur',
    label: 'EUR (€)',
    symbol: '€',
    toggleLabel: 'Currency: EUR (€) - Euro'
  },
  {
    id: 'gbp',
    label: 'GBP (£)',
    symbol: '£',
    toggleLabel: 'Currency: GBP (£) - British Pound Sterling'
  }
] as const;

const DEFAULT_CURRENCY = 'usd';
const DEFAULT_DAY_COUNT = 30;

const COST_VIEW_TABS = [
  { eventKey: 'openshift', title: 'OpenShift' },
  { eventKey: 'infrastructure', title: 'Infrastructure' }
] as const;

export function CostManagementWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="openshift-cost-management"
      title={title}
      toolbar={toolbar}
      titleClassName="cost-management-widget-header__title"
      inlineLink={
        <Button variant="link" isInline component="button" type="button">
          View details
        </Button>
      }
    />
  );
}

export function CostManagementWidgetBody() {
  const colSpan = useWidgetColSpan();
  const isWideToolbar = colSpan >= 2;
  const [activeTabKey, setActiveTabKey] = useState<string>(COST_VIEW_TABS[0].eventKey);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const currencyLabel =
    CURRENCY_OPTIONS.find((option) => option.id === selectedCurrency)?.label ?? 'USD ($)';
  const currencySymbol =
    CURRENCY_OPTIONS.find((option) => option.id === selectedCurrency)?.symbol ?? '$';
  const currencyToggleLabel =
    CURRENCY_OPTIONS.find((option) => option.id === selectedCurrency)?.toggleLabel ??
    'Currency: USD ($) - United States Dollar';

  const handleTabSelect = (
    _event: React.MouseEvent<HTMLElement> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    setActiveTabKey(String(tabIndex));
  };

  return (
    <div className="cost-management-widget">
      <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabSelect}
        aria-label="OpenShift cost management views"
        className="cost-management-widget__tabs"
        component="div"
        usePageInsets
      >
        {COST_VIEW_TABS.map((tab) => (
          <Tab key={tab.eventKey} eventKey={tab.eventKey} title={<TabTitleText>{tab.title}</TabTitleText>} />
        ))}
      </Tabs>

      <div className="cost-management-widget__panel">
        <Toolbar className="cost-management-widget__toolbar" inset={{ default: 'insetNone' }}>
          <ToolbarContent>
            <ToolbarItem>
              <Flex
                className="cost-management-widget__toolbar-controls"
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsMd' }}
              >
                <FlexItem className="cost-management-widget__perspective-item">
                  <MenuToggle
                    size="sm"
                    isDisabled
                    className="cost-management-widget__perspective-toggle"
                    aria-label="Perspective: All OpenShift"
                  >
                    <span className="cost-management-widget__perspective-toggle-text">
                      Perspective: All OpenShift
                    </span>
                  </MenuToggle>
                </FlexItem>
                <FlexItem
                  className={
                    isWideToolbar
                      ? 'cost-management-widget__currency-item cost-management-widget__currency-item--wide'
                      : 'cost-management-widget__currency-item'
                  }
                >
                  <Dropdown
                    isOpen={isCurrencyOpen}
                    onOpenChange={setIsCurrencyOpen}
                    onSelect={(_event, selection) => {
                      if (typeof selection === 'string') {
                        setSelectedCurrency(selection);
                      }
                      setIsCurrencyOpen(false);
                    }}
                    popperProps={{ position: 'right' }}
                    toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
                      <MenuToggle
                        ref={toggleRef}
                        variant={isWideToolbar ? 'default' : 'plain'}
                        size="sm"
                        isExpanded={isCurrencyOpen}
                        onClick={() => setIsCurrencyOpen((open) => !open)}
                        className={
                          isWideToolbar
                            ? 'cost-management-widget__currency-toggle'
                            : 'cost-management-widget__currency-toggle cost-management-widget__currency-toggle--icon'
                        }
                        aria-label={`Currency: ${currencyLabel}`}
                      >
                        {isWideToolbar ? (
                          <span className="cost-management-widget__currency-toggle-text">
                            {currencyToggleLabel}
                          </span>
                        ) : (
                          <span className="cost-management-widget__currency-toggle-icon" aria-hidden>
                            {currencySymbol}
                          </span>
                        )}
                      </MenuToggle>
                    )}
                  >
                    <DropdownList>
                      {CURRENCY_OPTIONS.map((option) => (
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

        <CostManagementChart
          dayCount={DEFAULT_DAY_COUNT}
          view={activeTabKey === 'infrastructure' ? 'infrastructure' : 'openshift'}
        />
      </div>
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const COST_MANAGEMENT_WIDGET_STYLES = `
  .cost-management-widget-header__title {
    margin: 0;
  }

  .widget-card--cost-management .widget-card__body,
  .widget-card--cost-management .pf-v6-c-card__body {
    padding: 0;
  }

  .widget-card.widget-card--cost-management.pf-v6-c-card > .pf-v6-c-divider + .pf-v6-c-card__body {
    padding-block-start: 0;
  }

  .widget-card--cost-management .widget-card__body-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .cost-management-widget {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .cost-management-widget__tabs.pf-v6-c-tabs {
    flex-shrink: 0;
    width: 100%;
    --pf-v6-c-tabs__item-link--PaddingBlockStart: var(--pf-t--global--spacer--sm);
    --pf-v6-c-tabs__item-link--PaddingBlockEnd: var(--pf-t--global--spacer--sm);
  }

  .cost-management-widget__tabs.pf-v6-c-tabs .pf-v6-c-tab-content {
    display: none;
  }

  .cost-management-widget__panel {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    padding-inline: var(--pf-t--global--spacer--md);
    padding-block-end: var(--pf-t--global--spacer--md);
  }

  .cost-management-widget__toolbar {
    flex-shrink: 0;
    padding-block-start: var(--pf-t--global--spacer--md);
    padding-block-end: var(--pf-t--global--spacer--sm);
  }

  .cost-management-widget__toolbar .pf-v6-c-toolbar__content {
    row-gap: 0;
  }

  .cost-management-widget__toolbar-controls {
    min-width: 0;
  }

  .cost-management-widget__perspective-item {
    min-width: 0;
    max-width: 100%;
  }

  .cost-management-widget__currency-item {
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .cost-management-widget__currency-item--wide {
    min-width: 0;
    max-width: 100%;
    flex-shrink: 1;
  }

  .cost-management-widget__perspective-toggle,
  .cost-management-widget__currency-toggle {
    max-width: min(100%, 20rem);
  }

  .cost-management-widget__perspective-toggle-text,
  .cost-management-widget__currency-toggle-text {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cost-management-widget__currency-toggle--icon.pf-v6-c-menu-toggle.pf-m-plain {
    --pf-v6-c-menu-toggle--PaddingBlockStart: var(--pf-t--global--spacer--xs);
    --pf-v6-c-menu-toggle--PaddingBlockEnd: var(--pf-t--global--spacer--xs);
    --pf-v6-c-menu-toggle--PaddingInlineStart: var(--pf-t--global--spacer--sm);
    --pf-v6-c-menu-toggle--PaddingInlineEnd: var(--pf-t--global--spacer--sm);
  }

  .cost-management-widget__currency-toggle-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1em;
    font-family: var(--pf-t--global--font--family--body);
    font-size: var(--pf-t--global--icon--size--font--body--default, 1rem);
    font-weight: var(--pf-t--global--font--weight--body--bold);
    line-height: 1;
    color: var(--pf-t--global--icon--color--regular);
  }

  .cost-management-widget__currency-toggle.pf-v6-c-menu-toggle.pf-m-plain:not(:disabled):hover
    .cost-management-widget__currency-toggle-icon {
    color: var(--pf-t--global--icon--color--regular);
  }

  .cost-management-widget__chart-frame {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    width: 100%;
  }
`;
