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
import {
  CheckCircleIcon,
  RhUiSeverityCriticalIcon,
  RhUiSeverityImportantIcon
} from '@app/icons/rhUiIcons';
import { RedHatSatelliteSystemsChart } from '@app/Homepage/redHatSatelliteChart';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import {
  getHorizontalFluidDescriptionListLayout,
  WidgetDescriptionList
} from '@app/Homepage/widgetDescriptionList';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

export const RED_HAT_SATELLITE_WIDGET_LINKS = {
  viewAllRemediations: '#'
} as const;

const CONNECTED_SYSTEMS_PERCENT = 55;

type SatelliteMetricIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

interface SatelliteMetricRow {
  id: string;
  label: string;
  value: string;
  icon: SatelliteMetricIcon;
  iconTone: 'danger' | 'warning';
}

const SATELLITE_METRIC_ROWS: SatelliteMetricRow[] = [
  {
    id: 'critical-risks',
    label: 'Critical risks',
    value: '1',
    icon: RhUiSeverityCriticalIcon,
    iconTone: 'danger'
  },
  {
    id: 'systems-to-remediate',
    label: 'Systems to remediate',
    value: '2',
    icon: RhUiSeverityImportantIcon,
    iconTone: 'warning'
  }
];

function SatelliteMetricRowIcon({
  icon: Icon,
  iconTone
}: {
  icon: SatelliteMetricIcon;
  iconTone: SatelliteMetricRow['iconTone'];
}) {
  return (
    <span
      className={`red-hat-satellite-widget__row-icon red-hat-satellite-widget__row-icon--${iconTone}`}
      aria-hidden
    >
      <Icon />
    </span>
  );
}

function SatelliteMetricDescriptionGroups() {
  return (
    <>
      {SATELLITE_METRIC_ROWS.map((row) => (
        <DescriptionListGroup key={row.id}>
          <DescriptionListTerm icon={<SatelliteMetricRowIcon icon={row.icon} iconTone={row.iconTone} />}>
            {row.label}
          </DescriptionListTerm>
          <DescriptionListDescription>
            <Button variant="link" isInline size="sm" component="button" type="button">
              {row.value}
            </Button>
          </DescriptionListDescription>
        </DescriptionListGroup>
      ))}
    </>
  );
}

export function RedHatSatelliteWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="red-hat-satellite"
      title={title}
      toolbar={toolbar}
      titleClassName="red-hat-satellite-widget-header__title"
      inlineLink={
        <Button
          variant="link"
          isInline
          component="a"
          href={RED_HAT_SATELLITE_WIDGET_LINKS.viewAllRemediations}
        >
          View all remediations
        </Button>
      }
    />
  );
}

const SATELLITE_PAIR_COUNT = SATELLITE_METRIC_ROWS.length;

export function RedHatSatelliteWidgetBody() {
  const colSpan = useWidgetColSpan();
  const fluidLayout = getHorizontalFluidDescriptionListLayout(colSpan, SATELLITE_PAIR_COUNT);

  const descriptionList = (
    <WidgetDescriptionList
      horizontalFluid
      horizontalColumnModifier={fluidLayout.columnModifier}
      horizontalGridClassName={fluidLayout.className}
      horizontalTermWidthModifier={
        colSpan <= 1 ? { default: 'min(100%, 22ch)' } : undefined
      }
      aria-label="Satellite remediation summary"
      className={[
        'red-hat-satellite-widget__description-list',
        colSpan <= 1 ? 'red-hat-satellite-widget__description-list--1-col' : ''
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <SatelliteMetricDescriptionGroups />
    </WidgetDescriptionList>
  );

  return (
    <div className="red-hat-satellite-widget">
      <div className="red-hat-satellite-widget__status">
        <Flex
          alignItems={{ default: 'alignItemsCenter' }}
          spaceItems={{ default: 'spaceItemsSm' }}
          className="red-hat-satellite-widget__status-heading"
        >
          <FlexItem className="red-hat-satellite-widget__status-icon" aria-hidden>
            <CheckCircleIcon />
          </FlexItem>
          <FlexItem>
            <Content component="p" className="red-hat-satellite-widget__status-label">
              Connected
            </Content>
          </FlexItem>
        </Flex>
        <Content component="p" className="red-hat-satellite-widget__status-description">
          The satellite instances are connected to HCC
        </Content>
      </div>

      <RedHatSatelliteSystemsChart connectedPercent={CONNECTED_SYSTEMS_PERCENT} />

      {descriptionList}
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const RED_HAT_SATELLITE_WIDGET_STYLES = `
  .red-hat-satellite-widget-header__title {
    margin: 0;
  }

  .red-hat-satellite-widget {
    display: flex;
    flex-direction: column;
    gap: var(--pf-t--global--spacer--md);
    width: 100%;
  }

  .red-hat-satellite-widget__status {
    flex-shrink: 0;
    width: 100%;
  }

  .red-hat-satellite-widget__status-heading {
    margin: 0;
  }

  .red-hat-satellite-widget__status-icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    line-height: 0;
    color: var(--pf-t--global--icon--color--status--success--default);
  }

  .red-hat-satellite-widget__status-icon svg {
    width: 1rem;
    height: 1rem;
    fill: currentColor;
  }

  .red-hat-satellite-widget__status-label {
    margin: 0;
    font-weight: var(--pf-t--global--font--weight--body--bold);
  }

  .red-hat-satellite-widget__status-description {
    margin: var(--pf-t--global--spacer--xs) 0 0;
    color: var(--pf-t--global--text--color--subtle);
  }

  .red-hat-satellite-widget__chart-frame {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .red-hat-satellite-widget__chart-shell {
    position: relative;
    flex-shrink: 0;
    margin-inline: auto;
  }

  .red-hat-satellite-widget__chart-shell .pf-v6-c-chart,
  .red-hat-satellite-widget__chart-shell svg {
    display: block;
  }

  .red-hat-satellite-widget__chart-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--pf-t--global--spacer--xs);
    padding: 30%;
    text-align: center;
    pointer-events: none;
  }

  .red-hat-satellite-widget__chart-percent {
    font-family: var(--pf-t--global--font--family--heading);
    font-size: var(--pf-t--global--font--size--heading--h1);
    font-weight: var(--pf-t--global--font--weight--heading--default);
    line-height: var(--pf-t--global--font--line-height--heading);
    color: var(--pf-t--global--text--color--regular);
  }

  .red-hat-satellite-widget__chart-caption {
    font-family: var(--pf-t--global--font--family--body);
    font-size: var(--pf-t--global--font--size--body--sm);
    font-weight: var(--pf-t--global--font--weight--body--default);
    line-height: var(--pf-t--global--font--line-height--body);
    color: var(--pf-t--global--text--color--subtle);
    text-wrap: balance;
  }

  .red-hat-satellite-widget__description-list {
    --pf-v6-c-description-list--GridTemplateColumns--min: 0;
    flex-shrink: 0;
    width: 100%;
  }

  .red-hat-satellite-widget__description-list--1-col {
    --pf-v6-c-description-list--m-horizontal__term--width: min(100%, 22ch);
  }

  .red-hat-satellite-widget__description-list .pf-v6-c-description-list__group {
    align-items: start;
  }

  .red-hat-satellite-widget__description-list .pf-v6-c-description-list__term {
    display: flex;
    align-items: center;
  }

  .red-hat-satellite-widget__description-list .pf-v6-c-description-list__description {
    align-self: center;
  }

  .red-hat-satellite-widget__row-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }

  .red-hat-satellite-widget__row-icon svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }

  .red-hat-satellite-widget__row-icon--danger {
    color: var(--pf-t--global--icon--color--status--danger--default);
  }

  .red-hat-satellite-widget__row-icon--warning {
    color: var(--pf-t--global--icon--color--status--warning--default);
  }
`;
