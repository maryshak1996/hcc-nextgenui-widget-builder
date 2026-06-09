import * as React from 'react';
import { useState } from 'react';
import {
  Badge,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  MenuToggleElement
} from '@patternfly/react-core';
import {
  ExpandableRowContent,
  Table,
  Tbody,
  Td,
  Tr,
  type CustomActionsToggleProps
} from '@patternfly/react-table';
import { PlusCircleIcon } from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

export const INTEGRATIONS_WIDGET_LINKS = {
  manageIntegrations: '/data-integrations'
} as const;

interface IntegrationItem {
  id: string;
  name: string;
  count: number;
  iconSrc: string;
  iconAlt: string;
}

interface IntegrationCategory {
  id: string;
  name: string;
  count: number;
  expandable: boolean;
  items: IntegrationItem[];
}

const INTEGRATION_CATEGORIES: IntegrationCategory[] = [
  {
    id: 'communications',
    name: 'Communications',
    count: 5,
    expandable: true,
    items: [
      {
        id: 'google-chat',
        name: 'Google Chat',
        count: 2,
        iconSrc: 'https://www.gstatic.com/images/branding/product/2x/chat_2020q4_48dp.png',
        iconAlt: 'Google Chat'
      },
      {
        id: 'microsoft-teams',
        name: 'Microsoft Office Teams',
        count: 1,
        iconSrc: 'https://1000logos.net/wp-content/uploads/2021/12/Microsoft-Teams-Logo.png',
        iconAlt: 'Microsoft Office Teams'
      },
      {
        id: 'slack',
        name: 'Slack',
        count: 2,
        iconSrc: 'https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png',
        iconAlt: 'Slack'
      }
    ]
  },
  {
    id: 'reporting-automation',
    name: 'Reporting & automation',
    count: 0,
    expandable: true,
    items: []
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    count: 14,
    expandable: false,
    items: []
  },
  {
    id: 'cloud',
    name: 'Cloud',
    count: 32,
    expandable: true,
    items: []
  },
  {
    id: 'red-hat',
    name: 'Red Hat',
    count: 50,
    expandable: true,
    items: []
  }
];

function IntegrationCountBadge({ count }: { count: number }) {
  return (
    <Badge isRead={count === 0} aria-label={`${count} integrations`}>
      {count}
    </Badge>
  );
}

function manageIntegrationActionsToggle(categoryName: string) {
  return ({ toggleRef, isOpen, onToggle, isDisabled }: CustomActionsToggleProps) => (
    <MenuToggle
      ref={toggleRef}
      size="sm"
      onClick={onToggle}
      isExpanded={isOpen}
      isDisabled={isDisabled}
      aria-label={`Manage ${categoryName} integrations`}
    >
      Manage
    </MenuToggle>
  );
}

function getManageIntegrationActions(categoryName: string) {
  return {
    items: [
      { title: 'View integrations', onClick: () => undefined },
      { title: 'Add integration', onClick: () => undefined }
    ],
    menuAppendTo: () => document.body,
    actionsToggle: manageIntegrationActionsToggle(categoryName)
  };
}

export function IntegrationsWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="integrations"
      title={title}
      toolbar={toolbar}
      titleClassName="integrations-widget-header__title"
      inlineLink={
        <Button
          variant="link"
          isInline
          component="a"
          href={INTEGRATIONS_WIDGET_LINKS.manageIntegrations}
        >
          Manage integrations
        </Button>
      }
    />
  );
}

export function IntegrationsWidgetBody() {
  const colSpan = useWidgetColSpan();
  const isNarrowLayout = colSpan === 1;
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(['communications'])
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  return (
    <div className={`integrations-widget${isNarrowLayout ? ' integrations-widget--narrow' : ''}`}>
      <div className="integrations-widget__table-wrap">
        <Table aria-label="Integrations" isExpandable>
          {INTEGRATION_CATEGORIES.map((category, rowIndex) => {
            const isExpanded = expandedCategories.has(category.id);
            const hasExpandableContent = category.expandable && category.items.length > 0;
            const isCategoryExpanded = hasExpandableContent && isExpanded;

            return (
              <Tbody key={category.id} isExpanded={isCategoryExpanded}>
                <Tr isContentExpanded={isCategoryExpanded}>
                  <Td
                    {...(category.expandable
                      ? {
                          expand: {
                            rowIndex,
                            isExpanded,
                            onToggle: () => toggleCategory(category.id)
                          }
                        }
                      : {})}
                  />
                  <Td dataLabel={category.name}>
                    <Flex
                      alignItems={{ default: 'alignItemsCenter' }}
                      spaceItems={{ default: 'spaceItemsSm' }}
                      flexWrap={{ default: 'wrap' }}
                    >
                      <FlexItem>
                        <Button variant="link" isInline component="a" href="#">
                          {category.name}
                        </Button>
                      </FlexItem>
                      <FlexItem>
                        <IntegrationCountBadge count={category.count} />
                      </FlexItem>
                    </Flex>
                  </Td>
                  <Td isActionCell actions={getManageIntegrationActions(category.name)} />
                </Tr>
                {hasExpandableContent ? (
                  <Tr isExpanded={isExpanded}>
                    <Td noPadding colSpan={3} dataLabel={`${category.name} integrations`}>
                      <ExpandableRowContent hasNoBackground>
                        <Flex
                          className="integrations-widget__items"
                          spaceItems={{ default: 'spaceItemsMd' }}
                          flexWrap={{ default: 'wrap' }}
                        >
                          {category.items.map((item) => (
                            <FlexItem key={item.id}>
                              <Flex
                                alignItems={{ default: 'alignItemsCenter' }}
                                spaceItems={{ default: 'spaceItemsSm' }}
                              >
                                <FlexItem>
                                  <img
                                    className="integrations-widget__item-icon"
                                    src={item.iconSrc}
                                    alt={item.iconAlt}
                                  />
                                </FlexItem>
                                <FlexItem>
                                  <Button variant="link" isInline component="a" href="#">
                                    {item.name} ({item.count})
                                  </Button>
                                </FlexItem>
                              </Flex>
                            </FlexItem>
                          ))}
                        </Flex>
                      </ExpandableRowContent>
                    </Td>
                  </Tr>
                ) : null}
              </Tbody>
            );
          })}
        </Table>
      </div>
      <div className="integrations-widget__create">
        <Dropdown
          isOpen={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSelect={() => setIsCreateOpen(false)}
          popperProps={{ position: 'right' }}
          toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
            <MenuToggle
              ref={toggleRef}
              variant="secondary"
              icon={<PlusCircleIcon aria-hidden />}
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              isExpanded={isCreateOpen}
              aria-label="Create integration"
            >
              Create integration
            </MenuToggle>
          )}
        >
          <DropdownList>
            <DropdownItem key="new">New integration</DropdownItem>
            <DropdownItem key="template">From template</DropdownItem>
          </DropdownList>
        </Dropdown>
      </div>
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const INTEGRATIONS_WIDGET_STYLES = `
  .integrations-widget-header__title {
    margin: 0;
  }

  .integrations-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    gap: var(--pf-t--global--spacer--md);
  }

  .integrations-widget__table-wrap {
    flex: 1 1 0;
    min-height: 0;
    overflow: auto;
  }

  .integrations-widget__table-wrap .pf-v6-c-table tbody > tr > td {
    vertical-align: middle;
  }

  .integrations-widget--narrow .integrations-widget__table-wrap .pf-v6-c-table__toggle {
    --pf-v6-c-table__toggle--PaddingInlineStart: 0;
    --pf-v6-c-table__toggle--PaddingInlineEnd: var(--pf-t--global--spacer--xs);
    width: 1%;
  }

  .integrations-widget--narrow .integrations-widget__table-wrap .pf-v6-c-table__tr > .pf-v6-c-table__td:first-child {
    width: 1%;
    padding-inline-start: 0;
  }

  .integrations-widget__items {
    padding-block-start: var(--pf-t--global--spacer--xs);
    padding-block-end: var(--pf-t--global--spacer--md);
    padding-inline-start: var(--pf-t--global--spacer--md);
  }

  .integrations-widget__item-icon {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    object-fit: contain;
  }

  .integrations-widget__create {
    flex: 0 0 auto;
    margin-top: auto;
    width: fit-content;
  }
`;
