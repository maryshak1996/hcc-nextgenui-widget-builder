import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Switch
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import {
  getHorizontalFluidDescriptionListLayout,
  WIDGET_DESCRIPTION_LIST_4_COL_CLASS,
  WidgetDescriptionList
} from '@app/Homepage/widgetDescriptionList';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

export const MANIFESTS_WIDGET_LINKS = {
  manageAllManifests: '#',
  updateAvailable: '#',
  exportManifest: '#'
} as const;

const MANIFEST_DETAILS = {
  primaryManifest: 'Prod_East_Satellite',
  lastExport: 'April 28, 2026 by admin_user'
} as const;

const MANIFEST_PAIR_COUNT = 4;

function ManifestsDescriptionGroups({
  scaEnabled,
  onScaChange
}: {
  scaEnabled: boolean;
  onScaChange: (checked: boolean) => void;
}) {
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>Primary manifest</DescriptionListTerm>
        <DescriptionListDescription>{MANIFEST_DETAILS.primaryManifest}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Status</DescriptionListTerm>
        <DescriptionListDescription>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            flexWrap={{ default: 'wrap' }}
          >
            <FlexItem className="manifests-widget__status-icon" aria-hidden>
              <ExclamationTriangleIcon />
            </FlexItem>
            <FlexItem>
              <Button
                variant="link"
                isInline
                size="sm"
                component="a"
                href={MANIFESTS_WIDGET_LINKS.updateAvailable}
              >
                Update available
              </Button>
            </FlexItem>
          </Flex>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>SCA mode</DescriptionListTerm>
        <DescriptionListDescription>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            flexWrap={{ default: 'wrap' }}
          >
            <FlexItem>{scaEnabled ? 'Enabled' : 'Disabled'}</FlexItem>
            <FlexItem>
              <Switch
                id="manifests-widget-sca-mode"
                aria-label="SCA mode"
                isChecked={scaEnabled}
                onChange={(_event, checked) => onScaChange(checked)}
              />
            </FlexItem>
          </Flex>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Last export</DescriptionListTerm>
        <DescriptionListDescription>{MANIFEST_DETAILS.lastExport}</DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
}

export function ManifestsWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="manifests"
      title={title}
      toolbar={toolbar}
      titleClassName="manifests-widget-header__title"
      inlineLink={
        <Button
          variant="link"
          isInline
          component="a"
          href={MANIFESTS_WIDGET_LINKS.manageAllManifests}
        >
          Manage all manifests
        </Button>
      }
    />
  );
}

export function ManifestsWidgetBody() {
  const colSpan = useWidgetColSpan();
  const useStackedFourColLayout = colSpan === 3;
  const fluidLayout = getHorizontalFluidDescriptionListLayout(colSpan, MANIFEST_PAIR_COUNT);
  const [scaEnabled, setScaEnabled] = useState(true);

  const descriptionListClassName = [
    'manifests-widget__description-list',
    useStackedFourColLayout ? 'manifests-widget__description-list--stacked' : '',
    useStackedFourColLayout ? WIDGET_DESCRIPTION_LIST_4_COL_CLASS : ''
  ]
    .filter(Boolean)
    .join(' ');

  const descriptionList = (
    <WidgetDescriptionList
      horizontalFluid={!useStackedFourColLayout}
      horizontalColumnModifier={fluidLayout.columnModifier}
      horizontalGridClassName={fluidLayout.className}
      aria-label="Subscription manifest details"
      className={descriptionListClassName}
    >
      <ManifestsDescriptionGroups scaEnabled={scaEnabled} onScaChange={setScaEnabled} />
    </WidgetDescriptionList>
  );

  return (
    <Flex
      className="manifests-widget"
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsMd' }}
    >
      <FlexItem className="manifests-widget__content">{descriptionList}</FlexItem>
      <FlexItem className="manifests-widget__footer">
        <Button
          variant="secondary"
          size="sm"
          component="a"
          href={MANIFESTS_WIDGET_LINKS.exportManifest}
        >
          Export manifest (zip)
        </Button>
      </FlexItem>
    </Flex>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const MANIFESTS_WIDGET_STYLES = `
  .manifests-widget-header__title {
    margin: 0;
  }

  .manifests-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .manifests-widget__content {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    width: 100%;
  }

  .manifests-widget__description-list {
    --pf-v6-c-description-list--GridTemplateColumns--min: 0;
  }

  .manifests-widget__description-list--stacked .pf-v6-c-description-list__group {
    align-items: stretch;
  }

  .manifests-widget__description-list--stacked .pf-v6-c-description-list__term {
    display: block;
  }

  .manifests-widget__description-list--stacked .pf-v6-c-description-list__description {
    align-self: auto;
  }

  .manifests-widget__description-list:not(.manifests-widget__description-list--stacked) .pf-v6-c-description-list__group {
    align-items: start;
  }

  .manifests-widget__description-list:not(.manifests-widget__description-list--stacked) .pf-v6-c-description-list__term {
    display: flex;
    align-items: center;
  }

  .manifests-widget__description-list:not(.manifests-widget__description-list--stacked) .pf-v6-c-description-list__description {
    align-self: center;
  }

  .manifests-widget__status-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    color: var(--pf-t--global--icon--color--status--warning--default);
  }

  .manifests-widget__status-icon svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }

  .manifests-widget__footer {
    flex-shrink: 0;
    width: fit-content;
  }
`;
