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
  RhUiPathIcon,
  RhUiSeverityCriticalIcon,
  RhUiSeverityImportantIcon,
  RhUiWarningIcon
} from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import {
  getHorizontalFluidDescriptionListLayout,
  WidgetDescriptionList
} from '@app/Homepage/widgetDescriptionList';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

const ADVISOR_VIEW_TABS = [
  { eventKey: 'rhel', title: 'RHEL' },
  { eventKey: 'openshift', title: 'OpenShift' }
] as const;

type AdvisorRecommendationIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface AdvisorRecommendationRow {
  id: string;
  label: string;
  linkText: string;
  icon: AdvisorRecommendationIcon;
  iconTone: 'brand' | 'danger' | 'warning';
}

const ADVISOR_RECOMMENDATION_ROWS: AdvisorRecommendationRow[] = [
  {
    id: 'pathways',
    label: 'Pathways',
    linkText: '2 recommendation groups',
    icon: RhUiPathIcon,
    iconTone: 'brand'
  },
  {
    id: 'incidents',
    label: 'Incidents',
    linkText: '5 incidents',
    icon: RhUiWarningIcon,
    iconTone: 'danger'
  },
  {
    id: 'critical',
    label: 'Critical',
    linkText: '2 recommendations',
    icon: RhUiSeverityCriticalIcon,
    iconTone: 'danger'
  },
  {
    id: 'important',
    label: 'Important',
    linkText: '18 recommendations',
    icon: RhUiSeverityImportantIcon,
    iconTone: 'warning'
  }
];

function AdvisorRecommendationRowIcon({
  icon: Icon,
  iconTone
}: {
  icon: AdvisorRecommendationIcon;
  iconTone: AdvisorRecommendationRow['iconTone'];
}) {
  return (
    <span
      className={`advisor-recommendations-widget__row-icon advisor-recommendations-widget__row-icon--${iconTone}`}
      aria-hidden
    >
      <Icon />
    </span>
  );
}

function AdvisorRecommendationDescriptionGroups() {
  return (
    <>
      {ADVISOR_RECOMMENDATION_ROWS.map((row) => (
        <DescriptionListGroup key={row.id}>
          <DescriptionListTerm>
            <Flex
              alignItems={{ default: 'alignItemsCenter' }}
              spaceItems={{ default: 'spaceItemsSm' }}
            >
              <FlexItem>
                <AdvisorRecommendationRowIcon icon={row.icon} iconTone={row.iconTone} />
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

export function AdvisorRecommendationsWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="advisor-recommendations"
      title={title}
      toolbar={toolbar}
      titleClassName="advisor-recommendations-widget-header__title"
    />
  );
}

const ADVISOR_RECOMMENDATION_PAIR_COUNT = ADVISOR_RECOMMENDATION_ROWS.length;

export function AdvisorRecommendationsWidgetBody() {
  const colSpan = useWidgetColSpan();
  const fluidLayout = getHorizontalFluidDescriptionListLayout(colSpan, ADVISOR_RECOMMENDATION_PAIR_COUNT);
  const [activeTabKey, setActiveTabKey] = useState<string>(ADVISOR_VIEW_TABS[0].eventKey);

  const handleTabSelect = (
    _event: React.MouseEvent<HTMLElement> | React.KeyboardEvent | MouseEvent,
    tabIndex: string | number
  ) => {
    setActiveTabKey(String(tabIndex));
  };

  const footerLabel =
    activeTabKey === 'openshift' ? 'View OpenShift recommendations' : 'View RHEL recommendations';

  const descriptionList = (
    <WidgetDescriptionList
      horizontalFluid
      horizontalColumnModifier={fluidLayout.columnModifier}
      horizontalGridClassName={fluidLayout.className}
      aria-label="Advisor recommendations summary"
      className="advisor-recommendations-widget__description-list"
    >
      <AdvisorRecommendationDescriptionGroups />
    </WidgetDescriptionList>
  );

  return (
    <div className="advisor-recommendations-widget">
      <Tabs
        activeKey={activeTabKey}
        onSelect={handleTabSelect}
        aria-label="Advisor recommendations product views"
        className="advisor-recommendations-widget__tabs"
        component="div"
        usePageInsets
      >
        {ADVISOR_VIEW_TABS.map((tab) => (
          <Tab key={tab.eventKey} eventKey={tab.eventKey} title={<TabTitleText>{tab.title}</TabTitleText>} />
        ))}
      </Tabs>

      <div className="advisor-recommendations-widget__panel">
        <div className="advisor-recommendations-widget__content">{descriptionList}</div>
        <div className="advisor-recommendations-widget__footer">
          <Button variant="secondary" size="sm" component="button" type="button">
            {footerLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const ADVISOR_RECOMMENDATIONS_WIDGET_STYLES = `
  .advisor-recommendations-widget-header__title {
    margin: 0;
  }

  .widget-card--advisor-recommendations .widget-card__body,
  .widget-card--advisor-recommendations .pf-v6-c-card__body {
    padding: 0;
  }

  .widget-card.widget-card--advisor-recommendations.pf-v6-c-card > .pf-v6-c-divider + .pf-v6-c-card__body {
    padding-block-start: 0;
  }

  .widget-card--advisor-recommendations .widget-card__body-content {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .advisor-recommendations-widget {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .advisor-recommendations-widget__tabs.pf-v6-c-tabs {
    flex-shrink: 0;
    width: 100%;
    --pf-v6-c-tabs__item-link--PaddingBlockStart: var(--pf-t--global--spacer--sm);
    --pf-v6-c-tabs__item-link--PaddingBlockEnd: var(--pf-t--global--spacer--sm);
  }

  .advisor-recommendations-widget__tabs.pf-v6-c-tabs .pf-v6-c-tab-content {
    display: none;
  }

  .advisor-recommendations-widget__panel {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    padding-inline: var(--pf-t--global--spacer--md);
    padding-block-end: var(--pf-t--global--spacer--md);
  }

  .advisor-recommendations-widget__content {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
    padding-block-start: var(--pf-t--global--spacer--md);
  }

  .advisor-recommendations-widget__description-list {
    --pf-v6-c-description-list--GridTemplateColumns--min: 0;
  }

  .advisor-recommendations-widget__row-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  .advisor-recommendations-widget__row-icon svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }

  .advisor-recommendations-widget__row-icon--brand {
    color: var(--pf-t--global--icon--color--brand--default);
  }

  .advisor-recommendations-widget__row-icon--danger {
    color: var(--pf-t--global--icon--color--status--danger--default);
  }

  .advisor-recommendations-widget__row-icon--warning {
    color: var(--pf-t--global--icon--color--status--warning--default);
  }

  .advisor-recommendations-widget__footer {
    flex-shrink: 0;
    width: fit-content;
  }
`;
