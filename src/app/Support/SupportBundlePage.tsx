import * as React from 'react';
import { Breadcrumb, BreadcrumbItem, Flex, FlexItem, PageSection, Title } from '@patternfly/react-core';

export interface ISupportBundlePageProps {
  /** Page `<h1>` text. */
  pageTitle: string;
  /** When set, breadcrumb is `Support` → parent → active crumb (three levels). */
  breadcrumbParent?: { label: string; to: string };
  /** Active breadcrumb label when `breadcrumbParent` is set (e.g. `New case`). Defaults to `pageTitle`. */
  breadcrumbCurrent?: string;
  /** Primary actions in the page header row (e.g. Open support case). */
  actions?: React.ReactNode;
  /** When false, breadcrumbs only — no `<h1>` row (use when the child provides its own title, e.g. a wizard). */
  showPageHeading?: boolean;
  children?: React.ReactNode;
}

/**
 * Shared masthead area for Support bundle pages: breadcrumb + page title (+ optional header actions).
 */
const SupportBundlePage: React.FunctionComponent<ISupportBundlePageProps> = ({
  pageTitle,
  breadcrumbParent,
  breadcrumbCurrent,
  actions,
  showPageHeading = true,
  children,
}) => (
  <>
    <PageSection hasBodyWrapper={false}>
      <Breadcrumb>
        <BreadcrumbItem to="/support">Support</BreadcrumbItem>
        {breadcrumbParent ? (
          <>
            <BreadcrumbItem to={breadcrumbParent.to}>{breadcrumbParent.label}</BreadcrumbItem>
            <BreadcrumbItem isActive>{breadcrumbCurrent ?? pageTitle}</BreadcrumbItem>
          </>
        ) : (
          <BreadcrumbItem isActive>{pageTitle}</BreadcrumbItem>
        )}
      </Breadcrumb>
    </PageSection>
    {showPageHeading ? (
      <PageSection hasBodyWrapper={false}>
        <Flex
          justifyContent={{ default: 'justifyContentSpaceBetween' }}
          alignItems={{ default: 'alignItemsFlexStart' }}
          flexWrap={{ default: 'wrap' }}
          spaceItems={{ default: 'spaceItemsMd' }}
        >
          <FlexItem flex={{ default: 'flex_1' }}>
            <Title headingLevel="h1">{pageTitle}</Title>
          </FlexItem>
          {actions ? <FlexItem>{actions}</FlexItem> : null}
        </Flex>
        {children ? <div style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>{children}</div> : null}
      </PageSection>
    ) : (
      <PageSection hasBodyWrapper={false} padding={{ default: 'noPadding' }}>
        {children}
      </PageSection>
    )}
  </>
);

export { SupportBundlePage };
