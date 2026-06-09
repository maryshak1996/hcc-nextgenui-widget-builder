import * as React from 'react';
import { useMemo, useState } from 'react';
import {
  Button,
  Label,
  Pagination,
  type LabelProps
} from '@patternfly/react-core';
import { Table, Tbody, Td, Tr } from '@patternfly/react-table';
import { WidgetCardHeaderLayout } from '@app/Homepage/widgetCardHeaderLayout';

export const BOOKMARKED_LEARNING_RESOURCES_WIDGET_LINKS = {
  viewAll: '/learning-resources'
} as const;

export const BOOKMARKED_LEARNING_RESOURCES_WIDGET_TOTAL = 523;

type BookmarkContentType = 'Quick start' | 'Documentation' | 'Learning path' | 'Other';

interface BookmarkedLearningResource {
  id: string;
  title: string;
  href: string;
  contentType: BookmarkContentType;
}

const BOOKMARK_CONTENT_TYPE_COLORS: Record<BookmarkContentType, NonNullable<LabelProps['color']>> = {
  'Quick start': 'green',
  Documentation: 'orange',
  'Learning path': 'teal',
  Other: 'purple'
};

const BOOKMARKED_LEARNING_RESOURCE_TEMPLATES: ReadonlyArray<Omit<BookmarkedLearningResource, 'id'>> = [
  {
    title: 'Adding a machine pool to your managed OpenShift cluster',
    href: '#',
    contentType: 'Quick start'
  },
  {
    title: 'Configuring console event notifications in Slack',
    href: '#',
    contentType: 'Quick start'
  },
  {
    title: 'Creating a blueprint',
    href: '#',
    contentType: 'Learning path'
  },
  {
    title: 'Getting started with automation hub',
    href: '#',
    contentType: 'Documentation'
  },
  {
    title: 'Introduction to the OpenShift Developer Sandbox Series',
    href: '#',
    contentType: 'Other'
  },
  {
    title: 'Adding an integration: Amazon Web Services',
    href: '#',
    contentType: 'Documentation'
  },
  {
    title: 'Deploy a Java application on Kubernetes in minutes',
    href: '#',
    contentType: 'Learning path'
  },
  {
    title: 'Configuring granular permissions by service',
    href: '#',
    contentType: 'Quick start'
  }
];

function BookmarkContentTypeLabel({ contentType }: { contentType: BookmarkContentType }) {
  return (
    <Label color={BOOKMARK_CONTENT_TYPE_COLORS[contentType]} isCompact>
      {contentType}
    </Label>
  );
}

function getBookmarkedLearningResourcesForPage(
  page: number,
  perPage: number
): BookmarkedLearningResource[] {
  const start = (page - 1) * perPage;

  return Array.from({ length: perPage }, (_, index) => {
    const template =
      BOOKMARKED_LEARNING_RESOURCE_TEMPLATES[
        (start + index) % BOOKMARKED_LEARNING_RESOURCE_TEMPLATES.length
      ];

    return {
      id: String(start + index + 1),
      ...template
    };
  });
}

export function BookmarkedLearningResourcesWidgetHeader({
  title,
  toolbar
}: {
  title: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <WidgetCardHeaderLayout
      widgetId="bookmarked-learning-resources"
      title={title}
      toolbar={toolbar}
      titleClassName="bookmarked-learning-resources-widget-header__title"
      inlineLink={
        <Button
          variant="link"
          isInline
          component="a"
          href={BOOKMARKED_LEARNING_RESOURCES_WIDGET_LINKS.viewAll}
        >
          View all
        </Button>
      }
    />
  );
}

export function BookmarkedLearningResourcesWidgetBody() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const rows = useMemo(
    () => getBookmarkedLearningResourcesForPage(page, perPage),
    [page, perPage]
  );

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
    <div className="bookmarked-learning-resources-widget">
      <div className="bookmarked-learning-resources-widget__table-wrap">
        <Table
          variant="compact"
          aria-label="Bookmarked learning resources"
          className="bookmarked-learning-resources-widget__table"
        >
          <Tbody>
            {rows.map((resource) => (
              <Tr key={resource.id}>
                <Td dataLabel="Resource" className="bookmarked-learning-resources-widget__title-cell">
                  <Button variant="link" isInline component="a" href={resource.href}>
                    {resource.title}
                  </Button>
                </Td>
                <Td dataLabel="Type" className="bookmarked-learning-resources-widget__type-cell">
                  <BookmarkContentTypeLabel contentType={resource.contentType} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
      <Pagination
        className="bookmarked-learning-resources-widget__pagination"
        widgetId="bookmarked-learning-resources-widget-pagination"
        isCompact
        itemCount={BOOKMARKED_LEARNING_RESOURCES_WIDGET_TOTAL}
        page={page}
        perPage={perPage}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
      />
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const BOOKMARKED_LEARNING_RESOURCES_WIDGET_STYLES = `
  .bookmarked-learning-resources-widget-header__title {
    margin: 0;
  }

  .bookmarked-learning-resources-widget {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    min-height: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    gap: var(--pf-t--global--spacer--md);
  }

  .bookmarked-learning-resources-widget__table-wrap {
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .bookmarked-learning-resources-widget__table-wrap .bookmarked-learning-resources-widget__table {
    --pf-v6-c-table--cell--PaddingBlock: var(--pf-t--global--spacer--sm);
    width: 100%;
  }

  .bookmarked-learning-resources-widget__table-wrap .bookmarked-learning-resources-widget__title-cell {
    min-width: 0;
    width: auto;
    padding-inline-end: var(--pf-t--global--spacer--lg);
  }

  .bookmarked-learning-resources-widget__table-wrap .bookmarked-learning-resources-widget__title-cell .pf-v6-c-button.pf-m-link {
    text-align: start;
    white-space: normal;
  }

  .bookmarked-learning-resources-widget__table-wrap .bookmarked-learning-resources-widget__type-cell {
    width: 1%;
    min-width: 0;
    white-space: nowrap;
    text-align: end;
    vertical-align: top;
  }

  .bookmarked-learning-resources-widget__pagination {
    flex: 0 0 auto;
    margin-block: 0;
    margin-top: auto;
    padding-block-start: 0;
    padding-inline-end: var(--pf-t--global--spacer--md);
  }
`;
