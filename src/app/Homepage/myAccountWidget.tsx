import * as React from 'react';
import {
  Button,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label
} from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

export const MY_ACCOUNT_WIDGET_LINKS = {
  viewMyAccess: '/my-user-access',
  manageProfile: 'https://access.redhat.com/user/profile'
} as const;

const MY_ACCOUNT_DETAILS = {
  username: 'insights-qa',
  accountNumber: '12345678',
  orgId: '987654321',
  roleLabel: 'Org admin'
} as const;

function MyAccountDescriptionGroups() {
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>Username</DescriptionListTerm>
        <DescriptionListDescription>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            flexWrap={{ default: 'wrap' }}
          >
            <FlexItem>{MY_ACCOUNT_DETAILS.username}</FlexItem>
            <FlexItem>
              <Label color="grey" isCompact>
                {MY_ACCOUNT_DETAILS.roleLabel}
              </Label>
            </FlexItem>
          </Flex>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Account number</DescriptionListTerm>
        <DescriptionListDescription>{MY_ACCOUNT_DETAILS.accountNumber}</DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListTerm>Org ID</DescriptionListTerm>
        <DescriptionListDescription>
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            flexWrap={{ default: 'wrap' }}
          >
            <FlexItem>{MY_ACCOUNT_DETAILS.orgId}</FlexItem>
            <FlexItem>
              <Button variant="link" isInline size="sm">
                Contact org admin
              </Button>
            </FlexItem>
          </Flex>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
}

export function MyAccountWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="my-account"
      title={title}
      toolbar={toolbar}
      titleClassName="my-account-widget-header__title"
      inlineLink={
        <Button
          variant="link"
          isInline
          component="a"
          href={MY_ACCOUNT_WIDGET_LINKS.viewMyAccess}
        >
          View my access
        </Button>
      }
    />
  );
}

export function MyAccountWidgetBody() {
  const colSpan = useWidgetColSpan();
  const isWideLayout = colSpan >= 2;

  const descriptionList = isWideLayout ? (
    <DescriptionList
      isCompact
      columnModifier={{ default: '3Col' }}
      aria-label="Account details"
      className="my-account-widget__description-list"
    >
      <MyAccountDescriptionGroups />
    </DescriptionList>
  ) : (
    <DescriptionList
      isHorizontal
      isCompact
      isFluid
      columnModifier={{ default: '1Col' }}
      aria-label="Account details"
      className="my-account-widget__description-list"
    >
      <MyAccountDescriptionGroups />
    </DescriptionList>
  );

  return (
    <Flex
      className="my-account-widget"
      direction={{ default: 'column' }}
      spaceItems={{ default: 'spaceItemsMd' }}
    >
      <FlexItem className="my-account-widget__content">{descriptionList}</FlexItem>
      <FlexItem className="my-account-widget__footer">
        <Button
          variant="secondary"
          size="sm"
          component="a"
          href={MY_ACCOUNT_WIDGET_LINKS.manageProfile}
          target="_blank"
          rel="noopener noreferrer"
          icon={<ExternalLinkAltIcon aria-hidden />}
          iconPosition="end"
        >
          Manage profile
        </Button>
      </FlexItem>
    </Flex>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const MY_ACCOUNT_WIDGET_STYLES = `
  .my-account-widget-header__title {
    margin: 0;
  }

  .widget-card--my-account .pf-v6-c-card__body {
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
  }

  .my-account-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    min-height: 0;
    height: 100%;
    width: 100%;
  }

  .my-account-widget__content {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
  }

  .my-account-widget__description-list {
    --pf-v6-c-description-list--GridTemplateColumns--min: 0;
  }

  .my-account-widget__footer {
    flex-shrink: 0;
    margin-top: auto;
    width: fit-content;
  }
`;
