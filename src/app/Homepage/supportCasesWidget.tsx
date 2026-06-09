import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button, Flex, FlexItem, Pagination } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import {
  AttentionBellIcon,
  CheckCircleIcon,
  EnhancementIcon,
  ExternalLinkAltIcon,
  PendingIcon
} from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';
import { useWidgetColSpan } from '@app/Homepage/widgetColSpanContext';

export const SUPPORT_CASES_WIDGET_LINKS = {
  supportCases: '#'
} as const;

export const SUPPORT_CASES_WIDGET_TOTAL = 523;

type SupportCaseStatus = 'Waiting on Red Hat' | 'New' | 'Waiting on customer' | 'Closed';

const SUPPORT_CASE_STATUS_CONFIG: Record<
  SupportCaseStatus,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    iconClassName: string;
  }
> = {
  'Waiting on Red Hat': {
    icon: PendingIcon,
    iconClassName: 'support-cases-widget__status-icon--pending'
  },
  'Waiting on customer': {
    icon: AttentionBellIcon,
    iconClassName: 'support-cases-widget__status-icon--info'
  },
  New: {
    icon: EnhancementIcon,
    iconClassName: 'support-cases-widget__status-icon--new'
  },
  Closed: {
    icon: CheckCircleIcon,
    iconClassName: 'support-cases-widget__status-icon--closed'
  }
};

function SupportCaseStatus({ status }: { status: SupportCaseStatus }) {
  const colSpan = useWidgetColSpan();
  const showIcon = colSpan > 1;
  const { icon: Icon, iconClassName } = SUPPORT_CASE_STATUS_CONFIG[status];

  return (
    <Flex
      className="support-cases-widget__status"
      alignItems={{ default: 'alignItemsCenter' }}
      spaceItems={{ default: 'spaceItemsSm' }}
    >
      {showIcon ? (
        <FlexItem className={`support-cases-widget__status-icon ${iconClassName}`} aria-hidden>
          <Icon />
        </FlexItem>
      ) : null}
      <FlexItem className="support-cases-widget__status-label">{status}</FlexItem>
    </Flex>
  );
}

const SUPPORT_CASE_ROW_TEMPLATES: ReadonlyArray<{
  caseId: string;
  caseHref: string;
  issueSummary: string;
  status: SupportCaseStatus;
}> = [
  {
    caseId: '040012345',
    caseHref: '#',
    issueSummary:
      'Critical production outage affecting database connection timeouts across multiple availability zones in the primary cluster.',
    status: 'Waiting on Red Hat'
  },
  {
    caseId: '040098765',
    caseHref: '#',
    issueSummary:
      'Performance degradation in API response times observed after the most recent platform update and configuration change.',
    status: 'New'
  },
  {
    caseId: '040045678',
    caseHref: '#',
    issueSummary:
      'SSL certificate expiration warning reported for several edge endpoints that serve customer-facing applications.',
    status: 'Waiting on customer'
  },
  {
    caseId: '040067891',
    caseHref: '#',
    issueSummary:
      'Unable to access the admin console after a recent update; users receive intermittent authentication failures at login.',
    status: 'Closed'
  },
  {
    caseId: '040023456',
    caseHref: '#',
    issueSummary:
      'Cluster nodes failing health checks during peak traffic periods, causing uneven workload distribution and pod restarts.',
    status: 'Waiting on Red Hat'
  }
];

interface SupportCaseRow {
  id: string;
  caseId: string;
  caseHref: string;
  issueSummary: string;
  status: SupportCaseStatus;
}

function getSupportCasesForPage(page: number, perPage: number): SupportCaseRow[] {
  const start = (page - 1) * perPage;

  return Array.from({ length: perPage }, (_, index) => {
    const template = SUPPORT_CASE_ROW_TEMPLATES[(start + index) % SUPPORT_CASE_ROW_TEMPLATES.length];

    return {
      id: String(start + index + 1),
      caseId: template.caseId,
      caseHref: template.caseHref,
      issueSummary: template.issueSummary,
      status: template.status
    };
  });
}

export function SupportCasesWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="support-cases"
      title={title}
      toolbar={toolbar}
      titleClassName="support-cases-widget-header__title"
      inlineLink={
        <Button variant="link" isInline component="a" href={SUPPORT_CASES_WIDGET_LINKS.supportCases}>
          View cases
        </Button>
      }
    />
  );
}

export function SupportCasesWidgetBody() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const rows = useMemo(() => getSupportCasesForPage(page, perPage), [page, perPage]);

  const onSetPage = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const onPerPageSelect = (
    _event: React.MouseEvent | React.KeyboardEvent | MouseEvent,
    newPerPage: number,
    newPage: number
  ) => {
    setPerPage(newPerPage);
    setPage(newPage);
  };

  return (
    <div className="support-cases-widget">
      <div className="support-cases-widget__table-wrap">
        <Table variant="compact" aria-label="Support cases" className="support-cases-widget__table">
          <Thead>
            <Tr>
              <Th>Case ID</Th>
              <Th>Issue summary</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td dataLabel="Case ID" className="support-cases-widget__case-id-cell">
                  <Button
                    variant="link"
                    isInline
                    component="a"
                    href={row.caseHref}
                    icon={<ExternalLinkAltIcon aria-hidden />}
                    iconPosition="end"
                  >
                    {row.caseId}
                  </Button>
                </Td>
                <Td dataLabel="Issue summary" className="support-cases-widget__issue-summary-cell">
                  <p className="support-cases-widget__issue-summary">{row.issueSummary}</p>
                </Td>
                <Td dataLabel="Status" className="support-cases-widget__status-cell">
                  <SupportCaseStatus status={row.status} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
      <Pagination
        className="support-cases-widget__pagination"
        widgetId="support-cases-widget-pagination"
        isCompact
        itemCount={SUPPORT_CASES_WIDGET_TOTAL}
        page={page}
        perPage={perPage}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const SUPPORT_CASES_WIDGET_STYLES = `
  .support-cases-widget-header__title {
    margin: 0;
  }

  .support-cases-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    gap: var(--pf-t--global--spacer--md);
  }

  .support-cases-widget__table-wrap {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .support-cases-widget__table-wrap .support-cases-widget__table {
    --pf-v6-c-table--cell--PaddingBlock: var(--pf-t--global--spacer--sm);
    table-layout: fixed;
    width: 100%;
  }

  .support-cases-widget__table-wrap .support-cases-widget__case-id-cell {
    width: 28%;
    white-space: nowrap;
  }

  .support-cases-widget__table-wrap .support-cases-widget__issue-summary-cell {
    width: 47%;
    min-width: 0;
  }

  .support-cases-widget__table-wrap .support-cases-widget__status-cell {
    min-width: 0;
  }

  .support-cases-widget__status {
    min-width: 0;
  }

  .support-cases-widget__status-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
  }

  .support-cases-widget__status-icon svg {
    width: 1rem;
    height: 1rem;
  }

  .support-cases-widget__status-icon--info,
  .support-cases-widget__status-icon--info svg {
    color: #6753ac;
    fill: currentColor;
  }

  .support-cases-widget__status-label {
    min-width: 0;
  }

  .support-cases-widget__issue-summary {
    margin: 0;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .support-cases-widget__pagination {
    flex: 0 0 auto;
    margin-block: 0;
    margin-top: auto;
    padding-block-start: 0;
    padding-inline-end: var(--pf-t--global--spacer--md);
  }
`;
