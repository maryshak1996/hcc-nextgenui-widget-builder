import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Tab,
  Tabs,
  TabTitleText
} from '@patternfly/react-core';
import {
  RhUiListIcon,
  RhUiSecurityAdvisoryIcon,
  RhUiSeverityCriticalIcon,
  RhUiSeverityImportantIcon
} from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import {
  getHorizontalFluidDescriptionListLayout,
  WidgetDescriptionList
} from '@app/Homepage/widgetDescriptionList';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

const VULNERABILITIES_VIEW_TABS = [
  { eventKey: 'rhel', title: 'RHEL' },
  { eventKey: 'openshift', title: 'OpenShift' }
] as const;

type VulnerabilityIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface VulnerabilityRow {
  id: string;
  label: string;
  linkText: string;
  icon: VulnerabilityIcon;
  iconTone: 'danger' | 'warning';
}

const VULNERABILITY_ROWS: VulnerabilityRow[] = [
  {
    id: 'critical',
    label: 'Critical',
    linkText: '91',
    icon: RhUiSeverityCriticalIcon,
    iconTone: 'danger'
  },
  {
    id: 'important',
    label: 'Important',
    linkText: '1105',
    icon: RhUiSeverityImportantIcon,
    iconTone: 'warning'
  },
  {
    id: 'known-exploits',
    label: 'Known exploits',
    linkText: '80',
    icon: RhUiSecurityAdvisoryIcon,
    iconTone: 'danger'
  },
  {
    id: 'security-rules',
    label: 'Security rules',
    linkText: '62',
    icon: RhUiListIcon,
    iconTone: 'warning'
  }
];

function VulnerabilityRowIcon({
  icon: Icon,
  iconTone
}: {
  icon: VulnerabilityIcon;
  iconTone: VulnerabilityRow['iconTone'];
}) {
  return (
    <span
      className={`vulnerabilities-widget__row-icon vulnerabilities-widget__row-icon--${iconTone}`}
      aria-hidden
    >
      <Icon />
    </span>
  );
}

function VulnerabilityDescriptionGroups() {
  return (
    <>
      {VULNERABILITY_ROWS.map((row) => (
        <DescriptionListGroup key={row.id}>
          <DescriptionListTerm>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <FlexItem>
                <VulnerabilityRowIcon icon={row.icon} iconTone={row.iconTone} />
              </FlexItem>
              <FlexItem>{row.label}</FlexItem>
            </Flex>
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Button variant="link" isInline size="sm" component="button" type="button">
              {row.linkText}
            </Button>
          </DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </>
  );
}

export function VulnerabilitiesWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="vulnerabilities"
      title={title}
      toolbar={toolbar}
      titleClassName="vulnerabilities-widget-header__title"
    />
  );
}

const VULNERABILITY_PAIR_COUNT = VULNERABILITY_ROWS.length;

export function VulnerabilitiesWidgetBody() {
  const colSpan = useWidgetColSpan();
  const fluidLayout = getHorizontalFluidDescriptionListLayout(colSpan, VULNERABILITY_PAIR_COUNT);
  const [activeTabKey, setActiveTabKey] = useState<string>(VULNERABILITIES_VIEW_TABS[0].eventKey);

  const handleTabSelect = (
    _event: React.MouseEvent<HTMLElement> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    setActiveTabKey(String(tabIndex));
  };

  const footerLabel =
    activeTabKey === 'openshift' ? 'View OpenShift CVEs' : 'View RHEL CVEs';

  const descriptionList = (
    <WidgetDescriptionList
      horizontalFluid
      horizontalColumnModifier={fluidLayout.columnModifier}
      horizontalGridClassName={fluidLayout.className}
      aria-label="Vulnerabilities summary"
      className="vulnerabilities-widget__description-list"
    >
      <VulnerabilityDescriptionGroups />
    </WidgetDescriptionList>
  );

  return (
    <div className="vulnerabilities-widget">
      <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabSelect}
        aria-label="Vulnerabilities product views"
        className="vulnerabilities-widget__tabs"
        component="div"
        usePageInsets
      >
        {VULNERABILITIES_VIEW_TABS.map((tab) => (
          <Tab key={tab.eventKey} eventKey={tab.eventKey} title={<TabTitleText>{tab.title}</TabTitleText>} />
        ))}
      </Tabs>

      <div className="vulnerabilities-widget__panel">
        <div className="vulnerabilities-widget__content">{descriptionList}</div>
        <div className="vulnerabilities-widget__footer">
          <Button variant="secondary" size="sm" component="button" type="button">
            {footerLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const VULNERABILITIES_WIDGET_STYLES = `
  .vulnerabilities-widget-header__title {
    margin: 0;
  }

  .widget-card--vulnerabilities .widget-card__body,
  .widget-card--vulnerabilities .pf-v6-c-card__body {
    padding: 0;
  }

  .widget-card.widget-card--vulnerabilities.pf-v6-c-card > .pf-v6-c-divider + .pf-v6-c-card__body {
    padding-block-start: 0;
  }

  .widget-card--vulnerabilities .widget-card__body-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .vulnerabilities-widget {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .vulnerabilities-widget__tabs.pf-v6-c-tabs {
    flex-shrink: 0;
    width: 100%;
    --pf-v6-c-tabs__item-link--PaddingBlockStart: var(--pf-t--global--spacer--sm);
    --pf-v6-c-tabs__item-link--PaddingBlockEnd: var(--pf-t--global--spacer--sm);
  }

  .vulnerabilities-widget__tabs.pf-v6-c-tabs .pf-v6-c-tab-content {
    display: none;
  }

  .vulnerabilities-widget__panel {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    padding-inline: var(--pf-t--global--spacer--md);
    padding-block-end: var(--pf-t--global--spacer--md);
  }

  .vulnerabilities-widget__content {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    padding-block-start: var(--pf-t--global--spacer--md);
  }

  .vulnerabilities-widget__description-list {
    --pf-v6-c-description-list--GridTemplateColumns--min: 0;
  }

  .vulnerabilities-widget__row-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  .vulnerabilities-widget__row-icon svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }

  .vulnerabilities-widget__row-icon--danger {
    color: var(--pf-t--global--icon--color--status--danger--default);
  }

  .vulnerabilities-widget__row-icon--warning {
    color: var(--pf-t--global--icon--color--status--warning--default);
  }

  .vulnerabilities-widget__footer {
    flex-shrink: 0;
    width: fit-content;
  }
`;
