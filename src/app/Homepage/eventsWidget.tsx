import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button, Flex, FlexItem, Pagination } from '@patternfly/react-core';
import { Table, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';

export const EVENTS_WIDGET_LINKS = {
  eventLog: '/event-log'
} as const;

export const EVENTS_WIDGET_TOTAL = 523;

const EVENT_ROW_TEMPLATES = [
  {
    event: 'System deleted',
    eventHref: '#',
    service: 'Inventory - Red Hat Enterprise Linux'
  },
  {
    event: 'New recommendation',
    eventHref: '#',
    service: 'Advisor - Red Hat Enterprise Linux'
  },
  {
    event: 'New system registered',
    eventHref: '#',
    service: 'Inventory - Red Hat Enterprise Linux'
  },
  {
    event: 'New recommendation',
    eventHref: '#',
    service: 'Advisor - OpenShift'
  },
  {
    event: 'Policy update',
    eventHref: '#',
    service: 'Compliance - Red Hat Enterprise Linux'
  }
] as const;

interface EventRow {
  id: string;
  event: string;
  eventHref: string;
  service: string;
  date: string;
}

function getEventsForPage(page: number, perPage: number): EventRow[] {
  const start = (page - 1) * perPage;

  return Array.from({ length: perPage }, (_, index) => {
    const template = EVENT_ROW_TEMPLATES[(start + index) % EVENT_ROW_TEMPLATES.length];

    return {
      id: String(start + index + 1),
      event: template.event,
      eventHref: template.eventHref,
      service: template.service,
      date: 'Just now'
    };
  });
}

export function EventsWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="events"
      title={title}
      toolbar={toolbar}
      titleClassName="events-widget-header__title"
      inlineLink={
        <Button variant="link" isInline component="a" href={EVENTS_WIDGET_LINKS.eventLog}>
          View event log
        </Button>
      }
    />
  );
}

export function EventsWidgetBody() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const rows = useMemo(() => getEventsForPage(page, perPage), [page, perPage]);

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
    <div className="events-widget">
      <div className="events-widget__table-wrap">
        <Table variant="compact" aria-label="Events">
          <Thead>
            <Tr>
              <Th>Event</Th>
              <Th>Service</Th>
              <Th>Date</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.id}>
                <Td dataLabel="Event">
                  <Button variant="link" isInline component="a" href={row.eventHref}>
                    {row.event}
                  </Button>
                </Td>
                <Td dataLabel="Service">
                  <Button variant="link" isInline component="a" href="#">
                    {row.service}
                  </Button>
                </Td>
                <Td dataLabel="Date">{row.date}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
      <Pagination
        className="events-widget__pagination"
        widgetId="events-widget-pagination"
        isCompact
        itemCount={EVENTS_WIDGET_TOTAL}
        page={page}
        perPage={perPage}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const EVENTS_WIDGET_STYLES = `
  .events-widget-header__title {
    margin: 0;
  }

  .events-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    gap: var(--pf-t--global--spacer--xs);
  }

  .events-widget__table-wrap {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .events-widget__table-wrap .pf-v6-c-table {
    --pf-v6-c-table--cell--PaddingBlock: var(--pf-t--global--spacer--sm);
  }

  .events-widget__pagination {
    flex: 0 0 auto;
    margin-block: 0;
    padding-block-start: 0;
    padding-inline-end: var(--pf-t--global--spacer--md);
  }
`;
