import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Title, Tooltip } from '@patternfly/react-core';
import { WidgetTitleLeadIcon } from '@app/Homepage/homepageWidgetHeaderIcons';
import { scheduleDeferredResizeObserverWork } from '@app/useDeferredResizeObserver';

export interface WidgetCardHeaderLayoutProps {
  widgetId: string;
  title: string;
  /** Overrides the catalog lead icon (e.g. widget builder custom icon). */
  headerLeadIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Rendered after the title; stays on the same line when space allows, otherwise wraps below */
  inlineLink?: React.ReactNode;
  /** Kebab menu and drag handle — supplied by WidgetCard on editable surfaces */
  toolbar?: React.ReactNode;
  titleClassName?: string;
}

function WidgetCardHeaderTitle({ title, titleClassName }: { title: string; titleClassName?: string }) {
  const titleWrapRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const measureTruncation = useCallback(() => {
    const wrap = titleWrapRef.current;
    if (!wrap || !title.trim()) {
      setIsTruncated(false);
      return;
    }

    const titleElement = wrap.querySelector('h4') ?? wrap;
    setIsTruncated(Math.ceil(titleElement.scrollWidth) > Math.floor(titleElement.clientWidth));
  }, [title]);

  useLayoutEffect(() => {
    measureTruncation();
  }, [measureTruncation]);

  useEffect(() => {
    const wrap = titleWrapRef.current;
    if (!wrap) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      scheduleDeferredResizeObserverWork(measureTruncation);
    });

    observer.observe(wrap);

    const headerText = wrap.closest('.widget-card__header-text');
    if (headerText instanceof HTMLElement) {
      observer.observe(headerText);
    }

    const headerLayout = wrap.closest('.widget-card__header-layout');
    if (headerLayout instanceof HTMLElement) {
      observer.observe(headerLayout);
    }

    return () => observer.disconnect();
  }, [measureTruncation]);

  const titleClassNames = ['pf-v6-c-card__title', titleClassName].filter(Boolean).join(' ');

  return (
    <Tooltip
      content={title}
      position="top"
      aria="none"
      trigger={isTruncated ? 'mouseenter focus' : 'manual'}
    >
      <span ref={titleWrapRef} className="widget-card__header-title-wrap">
        <Title headingLevel="h4" className={titleClassNames}>
          {title}
        </Title>
      </span>
    </Tooltip>
  );
}

export function WidgetCardHeaderLayout({
  widgetId,
  title,
  headerLeadIcon: HeaderLeadIcon,
  inlineLink,
  toolbar,
  titleClassName
}: WidgetCardHeaderLayoutProps) {
  return (
    <div className="widget-card__header-layout">
      <div className="widget-card__header-lead">
        {HeaderLeadIcon ? (
          <span className="widget-title-lead-icon" aria-hidden>
            <HeaderLeadIcon />
          </span>
        ) : (
          <WidgetTitleLeadIcon widgetId={widgetId} />
        )}
      </div>
      <div className="widget-card__header-text">
        <WidgetCardHeaderTitle title={title} titleClassName={titleClassName} />
        {inlineLink ? (
          <span className="widget-card__header-inline-link">{inlineLink}</span>
        ) : null}
      </div>
      {toolbar ? <div className="widget-card__header-toolbar">{toolbar}</div> : null}
    </div>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const WIDGET_CARD_HEADER_LAYOUT_STYLES = `
  .widget-card__header-layout {
    position: relative;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: var(--pf-t--global--spacer--sm);
    align-items: center;
    width: 100%;
    min-width: 0;
  }

  .widget-card__header-layout:has(.widget-card__header-toolbar) {
    padding-inline-end: 4.25rem;
  }

  .widget-card__header-lead {
    grid-column: 1;
    grid-row: 1;
    line-height: 0;
    align-self: center;
  }

  .widget-card__header-text {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
    align-self: center;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    column-gap: var(--pf-t--global--spacer--sm);
  }

  .widget-card__header-text .widget-card__header-title-wrap {
    display: block;
    min-width: 0;
    flex: 0 1 auto;
    max-width: 100%;
    overflow: hidden;
  }

  .widget-card__header-text .widget-card__header-title-wrap .pf-v6-c-card__title {
    display: block;
    margin: 0;
    padding: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .widget-card__header-text .widget-card__header-inline-link {
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .widget-card__header-text .widget-card__header-inline-link .pf-v6-c-button.pf-m-link {
    display: inline;
    vertical-align: baseline;
    white-space: nowrap;
  }

  .widget-card__header-toolbar {
    position: absolute;
    top: 50%;
    inset-inline-end: 0;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    transform: translateY(-50%);
    gap: 0;
  }

  .widget-card__header-toolbar .pf-v6-c-menu-toggle,
  .widget-card__header-toolbar .pf-v6-c-button {
    margin-block: 0;
  }
`;
