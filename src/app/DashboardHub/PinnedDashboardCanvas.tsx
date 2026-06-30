import * as React from 'react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  EmptyState,
  EmptyStateBody,
  PageSection,
  Title
} from '@patternfly/react-core';
import { useDashboardData } from '@app/DashboardHub/DashboardDataContext';
import { DASHBOARD_CANVAS_LAYOUT_CLASS } from '@app/DashboardHub/dashboardCanvasLayout';
import { getBundleLabel } from '@app/DashboardHub/pinnedDashboardNavigation';
import type { PinDashboardServiceTypeId } from '@app/DashboardHub/pinDashboardServiceTypes';
import {
  getPrebuiltDashboardAutoSizeWidgetIds,
  isPrebuiltHubRow
} from '@app/DashboardHub/prebuiltDashboards';
import {
  mergeCanvasWidgetsWithCatalog,
  onDashboardCanvasUpdated,
  resolveDashboardCanvasWidgets
} from '@app/DashboardHub/dashboardCanvasStorage';
import type { ColumnSpan, RowSpan, Widget } from '@app/Homepage/widgetTypes';
import {
  computeDashboardWidgetPlacements,
  getDashboardGridColumnCount,
  getWidgetsGridColumnStyle,
  ReadOnlyHomepageWidgetFrame,
  renderHomepageWidgetContent,
  WIDGET_GRID_STYLES
} from '@app/Homepage/homepageWidgetGrid';
import { useDeferredResizeObserverOffsetWidth } from '@app/useDeferredResizeObserver';

export type PinnedDashboardCanvasProps = {
  dashboardId: string;
  serviceTypeId: PinDashboardServiceTypeId;
};

const PinnedDashboardCanvas: React.FunctionComponent<PinnedDashboardCanvasProps> = ({
  dashboardId,
  serviceTypeId
}) => {
  const navigate = useNavigate();
  const { rows } = useDashboardData();
  const [displayWidgets, setDisplayWidgets] = React.useState<Widget[]>([]);
  const [autoSizeWidgetIds, setAutoSizeWidgetIds] = React.useState<Set<string>>(() => new Set());
  const [gridEl, setGridEl] = React.useState<HTMLDivElement | null>(null);

  const dashboard = useMemo(
    () => rows.find((row) => row.id === dashboardId),
    [dashboardId, rows]
  );
  const bundleLabel = getBundleLabel(serviceTypeId);
  const canvasTitle = dashboard ? (dashboard.canvasTitle ?? dashboard.name) : '';

  const gridWidth = useDeferredResizeObserverOffsetWidth(() => gridEl, [gridEl, displayWidgets.length]);
  const widgetsGridColumnStyle = useMemo(() => getWidgetsGridColumnStyle(gridWidth), [gridWidth]);
  const widgetPlacements = useMemo(() => {
    const columnCount = getDashboardGridColumnCount(gridWidth);
    return computeDashboardWidgetPlacements(displayWidgets, columnCount);
  }, [displayWidgets, gridWidth]);

  const refreshFromStorage = React.useCallback(() => {
    if (!dashboard) {
      setDisplayWidgets([]);
      setAutoSizeWidgetIds(new Set());
      return;
    }
    const raw = resolveDashboardCanvasWidgets(dashboard);
    if (raw && raw.length > 0) {
      setDisplayWidgets(mergeCanvasWidgetsWithCatalog(raw));
      setAutoSizeWidgetIds(
        isPrebuiltHubRow(dashboard)
          ? new Set(getPrebuiltDashboardAutoSizeWidgetIds(dashboard.id))
          : new Set()
      );
    } else {
      setDisplayWidgets([]);
      setAutoSizeWidgetIds(new Set());
    }
  }, [dashboard]);

  const handleAutoSizeFit = React.useCallback(
    (id: string, colSpan: ColumnSpan, rowSpan: RowSpan, complete: boolean) => {
      setDisplayWidgets((prev) => prev.map((widget) => (widget.id === id ? { ...widget, colSpan, rowSpan } : widget)));
      if (!complete) {
        return;
      }
      setAutoSizeWidgetIds((ids) => {
        if (!ids.has(id)) {
          return ids;
        }
        const next = new Set(ids);
        next.delete(id);
        return next;
      });
    },
    []
  );

  React.useEffect(() => {
    refreshFromStorage();
  }, [refreshFromStorage]);

  React.useEffect(() => {
    return onDashboardCanvasUpdated((detail) => {
      if (detail?.dashboardId && detail.dashboardId === dashboard?.id) {
        refreshFromStorage();
      }
    });
  }, [dashboard?.id, refreshFromStorage]);

  if (!dashboard) {
    return (
      <PageSection hasBodyWrapper={false}>
        <EmptyState variant="lg" titleText="Dashboard not found">
          <EmptyStateBody>This pinned dashboard is no longer available in Dashboard Hub.</EmptyStateBody>
        </EmptyState>
      </PageSection>
    );
  }

  return (
    <>
      <style>{WIDGET_GRID_STYLES}</style>
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb>
          <BreadcrumbItem>{bundleLabel}</BreadcrumbItem>
          <BreadcrumbItem isActive>{canvasTitle}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection className="homepage-dashboard-page-section">
        <div className={DASHBOARD_CANVAS_LAYOUT_CLASS}>
          <Title headingLevel="h2" size="2xl" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
            {canvasTitle}
          </Title>
          {displayWidgets.length > 0 ? (
            <div
              ref={setGridEl}
              className="widgets-grid homepage-readonly-grid"
              style={{ minWidth: 0, width: '100%', ...widgetsGridColumnStyle }}
              aria-label={`Pinned dashboard in ${bundleLabel}`}
            >
              {displayWidgets.map((widget) => (
                <ReadOnlyHomepageWidgetFrame
                  key={widget.id}
                  widget={widget}
                  gridWidth={gridWidth}
                  placement={widgetPlacements.get(widget.id) ?? { columnStart: 1, rowStart: 1 }}
                  autoSize={autoSizeWidgetIds.has(widget.id)}
                  onAutoSizeFit={handleAutoSizeFit}
                >
                  {renderHomepageWidgetContent(widget, {
                    navigate,
                    readOnly: true
                  })}
                </ReadOnlyHomepageWidgetFrame>
              ))}
            </div>
          ) : (
            <EmptyState variant="lg" titleText="This dashboard has no widgets yet">
              <EmptyStateBody>Add widgets in Dashboard Hub to populate this pinned view.</EmptyStateBody>
            </EmptyState>
          )}
        </div>
      </PageSection>
    </>
  );
};

export { PinnedDashboardCanvas };
