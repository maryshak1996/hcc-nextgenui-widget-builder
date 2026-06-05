import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  Icon,
  List,
  ListItem,
  MenuToggle,
  MenuToggleElement,
  Title
} from '@patternfly/react-core';
import { ArrowRightIcon, EllipsisVIcon, ExternalLinkAltIcon, GripVerticalIcon } from '@app/icons/rhUiIcons';
import { WidgetCardHeaderLayout, WIDGET_CARD_HEADER_LAYOUT_STYLES } from '@app/Homepage/widgetCardHeaderLayout';
import {
  AnsibleEmptyWidgetBody,
  BIG_THREE_PRODUCT_LINKS,
  BIG_THREE_PRODUCT_WIDGET_STYLES,
  BigThreeProductHeader,
  OpenshiftEmptyWidgetBody,
  RhelNonEmptyWidgetBody
} from '@app/Homepage/bigThreeProductWidgets';
import { EventsWidgetBody, EventsWidgetHeader, EVENTS_WIDGET_STYLES } from '@app/Homepage/eventsWidget';
import {
  IntegrationsWidgetBody,
  IntegrationsWidgetHeader,
  INTEGRATIONS_WIDGET_STYLES
} from '@app/Homepage/integrationsWidget';
import {
  MyAccountWidgetBody,
  MyAccountWidgetHeader,
  MY_ACCOUNT_WIDGET_STYLES
} from '@app/Homepage/myAccountWidget';
import { SubscriptionsWidgetBody, SubscriptionsWidgetHeader, SUBSCRIPTIONS_WIDGET_STYLES } from '@app/Homepage/subscriptionsWidget';
import { WidgetColSpanContext } from '@app/Homepage/widgetColSpanContext';
import { MAX_ROW_SPAN, MIN_ROW_SPAN, type ColumnSpan, type RowSpan, type Widget } from '@app/Homepage/widgetTypes';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Resizable, type ResizeCallback, type ResizeStartCallback } from 're-resizable';


export const ROW_HEIGHT = 80; // Logical row height in pixels (two grid sub-rows)

/** Grid track height — half of {@link ROW_HEIGHT} for finer vertical resize steps. */
export const GRID_ROW_HEIGHT = ROW_HEIGHT / 2;

/**
 * Pixel gap between grid tracks — must match `gap` in `WIDGET_GRID_STYLES`
 * (`var(--pf-t--global--spacer--md)`, 16px in default PatternFly tokens).
 */
export const GAP = 16;

/** Matches `.widgets-grid` responsive `grid-template-columns` breakpoints. */
export function getDashboardGridColumnCount(gridWidth: number): number {
  if (gridWidth <= 768) {
    return 1;
  }
  if (gridWidth <= 1200) {
    return 2;
  }
  return 4;
}

export function getWidgetGridSingleColumnWidth(gridWidth: number): number {
  const n = getDashboardGridColumnCount(gridWidth);
  return (gridWidth - GAP * (n - 1)) / n;
}

/** Pixel width for `colSpan` consecutive columns at this grid width (incl. internal gaps). */
export function getPixelWidthForColSpan(gridWidth: number, colSpan: ColumnSpan): number {
  const cw = getWidgetGridSingleColumnWidth(gridWidth);
  return cw * colSpan + GAP * (colSpan - 1);
}

/** Clamp catalog column span to the live grid so we never span past implicit columns (prevents overlap). */
export function getEffectiveColumnSpan(gridWidth: number, colSpan: ColumnSpan): ColumnSpan {
  const n = getDashboardGridColumnCount(gridWidth);
  const capped = Math.min(colSpan, n);
  return (capped >= 1 ? capped : 1) as ColumnSpan;
}

/** 1-based CSS grid line where the widget’s top-left cell starts (computed packing). */
export interface DashboardWidgetPlacement {
  columnStart: number;
  rowStart: number;
}

/** Bias toward the next row span when dragging height (0.5 = midpoint; lower = snap sooner). */
export const ROW_HEIGHT_SNAP_RATIO = 0.06;

const ALL_ROW_SPANS: RowSpan[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

/** Pixel height for `rowSpan` grid tracks — must match CSS grid span sizing (`grid-auto-rows` + `gap`). */
export function getPixelHeightForRowSpan(rowSpan: RowSpan): number {
  return GRID_ROW_HEIGHT * rowSpan + GAP * Math.max(0, rowSpan - 1);
}

/** Human-readable logical row count for resize preview (e.g. 5 units → "2.5"). */
export function formatWidgetRowSpanLabel(rowSpan: RowSpan): string {
  if (rowSpan % 2 === 0) {
    return String(rowSpan / 2);
  }
  return (rowSpan / 2).toFixed(1);
}

/** Row span from pixel height using tighter snap thresholds than a pure midpoint. */
export function getRowSpanFromPixelHeight(height: number): RowSpan {
  for (let i = 0; i < ALL_ROW_SPANS.length; i++) {
    const current = getPixelHeightForRowSpan(ALL_ROW_SPANS[i]);
    const next = ALL_ROW_SPANS[i + 1] ? getPixelHeightForRowSpan(ALL_ROW_SPANS[i + 1]) : Infinity;
    const threshold = current + (next - current) * ROW_HEIGHT_SNAP_RATIO;
    if (height < threshold) {
      return ALL_ROW_SPANS[i];
    }
  }

  return MAX_ROW_SPAN;
}

/** Clamp and coerce persisted row span values. */
export function clampRowSpan(value: number): RowSpan {
  const rounded = Math.round(value);
  const clamped = Math.max(MIN_ROW_SPAN, Math.min(MAX_ROW_SPAN, rounded));
  return clamped as RowSpan;
}

/** Migrate v1 full-row spans (1–6) to half-row units (2–12). */
export function migrateLegacyRowSpan(rowSpan: number): RowSpan {
  const n = Math.round(rowSpan);
  if (n >= 1 && n <= 6) {
    return (n * 2) as RowSpan;
  }
  return clampRowSpan(n);
}

/** Live resize preview — used to reflow displaced widgets while dragging. */
export interface WidgetResizePreview {
  widgetId: string;
  colSpan: ColumnSpan;
  rowSpan: RowSpan;
  anchorPlacement: DashboardWidgetPlacement;
}

function getWidgetGridSize(
  widget: Widget,
  columnCount: number,
  resizePreview?: WidgetResizePreview | null
): { cw: number; rh: number } {
  const cols = Math.max(1, columnCount);
  if (resizePreview?.widgetId === widget.id) {
    return {
      cw: Math.min(resizePreview.colSpan, cols),
      rh: resizePreview.rowSpan
    };
  }
  return {
    cw: Math.min(widget.colSpan, cols),
    rh: widget.rowSpan
  };
}

function placementsOverlap(
  a: DashboardWidgetPlacement,
  aCols: number,
  aRows: number,
  b: DashboardWidgetPlacement,
  bCols: number,
  bRows: number
): boolean {
  const aColEnd = a.columnStart + aCols;
  const aRowEnd = a.rowStart + aRows;
  const bColEnd = b.columnStart + bCols;
  const bRowEnd = b.rowStart + bRows;

  return (
    a.columnStart < bColEnd &&
    b.columnStart < aColEnd &&
    a.rowStart < bRowEnd &&
    b.rowStart < aRowEnd
  );
}

function unmarkPlacement(
  occupied: boolean[][],
  placement: DashboardWidgetPlacement,
  cols: number,
  rows: number
) {
  const startCol = placement.columnStart - 1;
  const startRow = placement.rowStart - 1;
  for (let r = startRow; r < startRow + rows; r++) {
    for (let c = startCol; c < startCol + cols; c++) {
      if (occupied[r]?.[c]) {
        occupied[r][c] = false;
      }
    }
  }
}

/**
 * First-fit packing in DOM order: assigns non-overlapping grid starts so resize/reflow shifts later widgets
 * instead of painting on top of each other.
 */
export function computeDashboardWidgetPlacements(
  widgets: readonly Widget[],
  columnCount: number,
  resizePreview?: WidgetResizePreview | null
): Map<string, DashboardWidgetPlacement> {
  const placements = new Map<string, DashboardWidgetPlacement>();
  const cols = Math.max(1, columnCount);
  const occupied: boolean[][] = [];
  const maxScanRows = 1000;

  const ensureRow = (r: number) => {
    while (occupied.length <= r) {
      occupied.push(Array.from({ length: cols }, () => false));
    }
  };

  const canPlace = (row: number, col: number, cw: number, rh: number): boolean => {
    if (col + cw > cols) {
      return false;
    }
    for (let r = row; r < row + rh; r++) {
      ensureRow(r);
      for (let c = col; c < col + cw; c++) {
        if (occupied[r][c]) {
          return false;
        }
      }
    }
    return true;
  };

  const mark = (row: number, col: number, cw: number, rh: number) => {
    for (let r = row; r < row + rh; r++) {
      ensureRow(r);
      for (let c = col; c < col + cw; c++) {
        occupied[r][c] = true;
      }
    }
  };

  const placeFirstFit = (widget: Widget): boolean => {
    const { cw, rh } = getWidgetGridSize(widget, cols, resizePreview);
    for (let row = 0; row < maxScanRows; row++) {
      for (let col = 0; col <= cols - cw; col++) {
        if (canPlace(row, col, cw, rh)) {
          mark(row, col, cw, rh);
          placements.set(widget.id, { columnStart: col + 1, rowStart: row + 1 });
          return true;
        }
      }
    }
    return false;
  };

  const resizeIndex = resizePreview
    ? widgets.findIndex((widget) => widget.id === resizePreview.widgetId)
    : -1;

  if (resizePreview && resizeIndex >= 0) {
    for (let i = 0; i < resizeIndex; i++) {
      placeFirstFit(widgets[i]);
    }

    const resizedWidget = widgets[resizeIndex];
    const { cw, rh } = getWidgetGridSize(resizedWidget, cols, resizePreview);
    const anchorCol = resizePreview.anchorPlacement.columnStart - 1;
    const anchorRow = resizePreview.anchorPlacement.rowStart - 1;

    if (anchorCol + cw <= cols && canPlace(anchorRow, anchorCol, cw, rh)) {
      mark(anchorRow, anchorCol, cw, rh);
      placements.set(resizedWidget.id, resizePreview.anchorPlacement);
    } else {
      placeFirstFit(resizedWidget);
    }

    const resizedPlacement = placements.get(resizedWidget.id);
    const displaced: Widget[] = [];

    if (resizedPlacement) {
      for (let i = 0; i < resizeIndex; i++) {
        const earlier = widgets[i];
        const earlierPlacement = placements.get(earlier.id);
        if (!earlierPlacement) {
          continue;
        }
        const earlierSize = getWidgetGridSize(earlier, cols, null);
        if (
          placementsOverlap(
            resizedPlacement,
            cw,
            rh,
            earlierPlacement,
            earlierSize.cw,
            earlierSize.rh
          )
        ) {
          unmarkPlacement(occupied, earlierPlacement, earlierSize.cw, earlierSize.rh);
          placements.delete(earlier.id);
          displaced.push(earlier);
        }
      }
    }

    for (let i = resizeIndex + 1; i < widgets.length; i++) {
      displaced.push(widgets[i]);
    }

    for (const widget of displaced) {
      const existingPlacement = placements.get(widget.id);
      if (existingPlacement) {
        const size = getWidgetGridSize(widget, cols, null);
        unmarkPlacement(occupied, existingPlacement, size.cw, size.rh);
        placements.delete(widget.id);
      }
      placeFirstFit(widget);
    }
  } else {
    for (const widget of widgets) {
      placeFirstFit(widget);
    }
  }

  return placements;
}

// Sortable Widget Card Component with Resizable
interface SortableWidgetCardProps {
  widget: Widget;
  /** Pinned grid position from {@link computeDashboardWidgetPlacements} (reflows when sizes change). */
  placement: DashboardWidgetPlacement;
  children: React.ReactElement<{
    dragHandleProps?: Record<string, unknown>;
    onRemove?: () => void;
  }>;
  onSizeChange: (id: string, colSpan: ColumnSpan, rowSpan: RowSpan) => void;
  onResizePreviewStart: (
    preview: WidgetResizePreview
  ) => void;
  onResizePreviewChange: (colSpan: ColumnSpan, rowSpan: RowSpan) => void;
  onResizePreviewEnd: () => void;
  onRemove: (id: string) => void;
  gridWidth: number;
}

export const SortableWidgetCard: React.FC<SortableWidgetCardProps> = ({
  widget,
  placement,
  children,
  onSizeChange,
  onResizePreviewStart,
  onResizePreviewChange,
  onResizePreviewEnd,
  onRemove,
  gridWidth
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [previewColSpan, setPreviewColSpan] = useState<ColumnSpan>(widget.colSpan);
  const [previewRowSpan, setPreviewRowSpan] = useState<RowSpan>(widget.rowSpan);
  const [liveSize, setLiveSize] = useState<{ width: number; height: number } | null>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    disabled: isResizing,
    animateLayoutChanges: () => false
  });

  const columnCount = getDashboardGridColumnCount(gridWidth);
  const effectiveColSpan = getEffectiveColumnSpan(gridWidth, widget.colSpan);

  const allowedColSpans = useMemo((): ColumnSpan[] => {
    const max = Math.min(4, columnCount);
    return [1, 2, 3, 4].filter((s) => s <= max) as ColumnSpan[];
  }, [columnCount]);

  const getHeightForSpan = (span: RowSpan): number => {
    return getPixelHeightForRowSpan(span);
  };

  const getWidthForSpan = (span: ColumnSpan): number => {
    return getPixelWidthForColSpan(gridWidth, span);
  };

  const getColSpanFromWidth = (width: number): ColumnSpan => {
    let closestSpan: ColumnSpan = allowedColSpans[0] ?? 1;
    let minDiff = Infinity;

    for (const span of allowedColSpans) {
      const spanWidth = getWidthForSpan(span);
      const diff = Math.abs(width - spanWidth);
      if (diff < minDiff) {
        minDiff = diff;
        closestSpan = span;
      }
    }

    return closestSpan;
  };

  const getRowSpanFromHeight = (height: number): RowSpan => {
    return getRowSpanFromPixelHeight(height);
  };

  useEffect(() => {
    if (!isResizing) {
      setPreviewColSpan(widget.colSpan);
      setPreviewRowSpan(widget.rowSpan);
      setLiveSize(null);
    }
  }, [widget.colSpan, widget.rowSpan, isResizing]);

  const handleResizeStart: ResizeStartCallback = (_e, _direction, ref) => {
    const startWidth = ref.offsetWidth;
    const startHeight = ref.offsetHeight;
    setIsResizing(true);
    setPreviewColSpan(widget.colSpan);
    setPreviewRowSpan(widget.rowSpan);
    setLiveSize({ width: startWidth, height: startHeight });
    onResizePreviewStart({
      widgetId: widget.id,
      colSpan: widget.colSpan,
      rowSpan: widget.rowSpan,
      anchorPlacement: placement
    });
  };

  const handleResize: ResizeCallback = (_e, _direction, ref) => {
    const newWidth = ref.offsetWidth;
    const newHeight = ref.offsetHeight;
    const nextColSpan = getColSpanFromWidth(newWidth);
    const nextRowSpan = getRowSpanFromHeight(newHeight);
    setLiveSize({ width: newWidth, height: newHeight });
    setPreviewColSpan(nextColSpan);
    setPreviewRowSpan(nextRowSpan);
    onResizePreviewChange(nextColSpan, nextRowSpan);
  };

  const handleResizeStop: ResizeCallback = (_e, _direction, ref) => {
    const newWidth = ref.offsetWidth;
    const newHeight = ref.offsetHeight;
    const newColSpan = getColSpanFromWidth(newWidth);
    const newRowSpan = getRowSpanFromHeight(newHeight);
    onSizeChange(widget.id, newColSpan, newRowSpan);
    onResizePreviewEnd();
    setIsResizing(false);
    setLiveSize(null);
  };

  const displayColSpan = isResizing
    ? getEffectiveColumnSpan(gridWidth, previewColSpan)
    : effectiveColSpan;
  const displayRowSpan = isResizing ? previewRowSpan : widget.rowSpan;

  const style: React.CSSProperties = {
    transform: isDragging ? undefined : CSS.Transform.toString(transform),
    transition: isResizing || isDragging ? 'none' : transition,
    zIndex: isDragging ? 1000 : isResizing ? 999 : 'auto',
    gridColumn: `${placement.columnStart} / span ${displayColSpan}`,
    gridRow: `${placement.rowStart} / span ${displayRowSpan}`,
    alignSelf: isResizing ? 'start' : undefined,
    minWidth: 0,
    minHeight: 0,
    boxSizing: 'border-box'
  };

  const snappedWidth = getWidthForSpan(displayColSpan);
  const snappedHeight = getHeightForSpan(displayRowSpan);
  const currentWidth = liveSize?.width ?? snappedWidth;
  const currentHeight = liveSize?.height ?? snappedHeight;
  const minColSpan = allowedColSpans[0] ?? 1;
  const maxColSpan = allowedColSpans[allowedColSpans.length - 1] ?? 4;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`widget-wrapper${isDragging ? ' is-dragging' : ''}${isResizing ? ' is-resizing' : ''}`}
    >
      <WidgetColSpanContext.Provider value={displayColSpan}>
        <Resizable
        className={`widget-resizable-root ${isResizing ? 'resizing' : ''}`}
        size={{ width: currentWidth, height: currentHeight }}
        minWidth={getWidthForSpan(minColSpan)}
        maxWidth={getWidthForSpan(maxColSpan)}
        minHeight={getHeightForSpan(MIN_ROW_SPAN)}
        maxHeight={getHeightForSpan(MAX_ROW_SPAN)}
        enable={{
          top: false,
          right: true,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: true,
          bottomLeft: false,
          topLeft: false
        }}
        handleClasses={{
          right: 'resize-handle resize-handle-right',
          bottom: 'resize-handle resize-handle-bottom',
          bottomRight: 'resize-handle resize-handle-corner'
        }}
        snap={{
          x: allowedColSpans.map((span) => getWidthForSpan(span)),
          y: ALL_ROW_SPANS.map((span) => getHeightForSpan(span))
        }}
        snapGap={2}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeStop={handleResizeStop}
      >
        <div className={`resize-preview-indicator ${isResizing ? 'visible' : ''}`}>
          {previewColSpan}×{formatWidgetRowSpanLabel(previewRowSpan)}
        </div>

        {(() => {
          type InjectedChildProps = {
            dragHandleProps?: Record<string, unknown>;
            onRemove?: () => void;
          };

          return React.isValidElement<InjectedChildProps>(children)
            ? React.cloneElement(children, {
                dragHandleProps: { ...attributes, ...listeners },
                onRemove: () => onRemove(widget.id)
              })
            : children;
        })()}
      </Resizable>
      </WidgetColSpanContext.Provider>
    </div>
  );
};

// Generic Widget Card Component
interface WidgetCardProps {
  title: string;
  /** Catalog widget id — used for header lead icon */
  widgetId: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  headerExtra?: React.ReactNode;
  className?: string;
  dragHandleProps?: Record<string, unknown>;
  isFullHeight?: boolean;
  onRemove?: () => void;
  /** Hides kebab, drag, and remove — for read-only surfaces (e.g. console home). */
  readOnly?: boolean;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ 
  title,
  widgetId,
  children, 
  footerContent, 
  headerExtra, 
  className = '',
  dragHandleProps,
  isFullHeight = true,
  onRemove,
  readOnly = false,
}) => {
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const onActionsToggle = () => {
    setIsActionsOpen(!isActionsOpen);
  };

  const onActionsSelect = () => {
    setIsActionsOpen(false);
  };

  const handleRemove = () => {
    setIsActionsOpen(false);
    if (onRemove) {
      onRemove();
    }
  };

  const widgetHeaderToolbar = (
    <>
      <Dropdown
        isOpen={isActionsOpen}
        onSelect={onActionsSelect}
        onOpenChange={setIsActionsOpen}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            onClick={onActionsToggle}
            variant="plain"
            isExpanded={isActionsOpen}
            aria-label="Widget actions"
          >
            <EllipsisVIcon />
          </MenuToggle>
        )}
        popperProps={{ position: 'right' }}
      >
        <DropdownList>
          <DropdownItem key="remove" onClick={handleRemove}>
            Remove widget
          </DropdownItem>
        </DropdownList>
      </Dropdown>
      <Button
        variant="plain"
        aria-label="Drag to reorder"
        style={{ cursor: 'grab', touchAction: 'none' }}
        {...dragHandleProps}
      >
        <GripVerticalIcon />
      </Button>
    </>
  );

  const renderCardHeader = () => {
    const toolbar = readOnly ? undefined : widgetHeaderToolbar;

    if (headerExtra && React.isValidElement(headerExtra)) {
      return React.cloneElement(
        headerExtra as React.ReactElement<{ toolbar?: React.ReactNode }>,
        { toolbar }
      );
    }

    return <WidgetCardHeaderLayout widgetId={widgetId} title={title} toolbar={toolbar} />;
  };

  if (readOnly) {
    return (
      <Card isFullHeight={isFullHeight} className={`widget-card ${className}`}>
        <CardHeader>{renderCardHeader()}</CardHeader>
        <Divider />
        <CardBody style={{ overflow: 'auto' }}>
          {children}
        </CardBody>
        {footerContent && <CardFooter>{footerContent}</CardFooter>}
      </Card>
    );
  }

  return (
    <Card isFullHeight={isFullHeight} className={`widget-card ${className}`}>
      <CardHeader>{renderCardHeader()}</CardHeader>
      <Divider />
      <CardBody style={{ overflow: 'auto' }}>
        {children}
      </CardBody>
      {footerContent && (
        <CardFooter>
          {footerContent}
        </CardFooter>
      )}
    </Card>
  );
};

export function renderHomepageWidgetContent(
  widget: Widget,
  context: {
    navigate: NavigateFunction;
    dragHandleProps?: Record<string, unknown>;
    onRemove?: () => void;
    readOnly?: boolean;
  }
) {
  const { navigate, dragHandleProps, onRemove, readOnly } = context;
    switch (widget.id) {
      case 'rhel':
        return (
          <WidgetCard
            onRemove={onRemove}
            title={widget.title}
            widgetId={widget.id}
            dragHandleProps={dragHandleProps}
            readOnly={readOnly}
            headerExtra={
              <BigThreeProductHeader
                widgetId={widget.id}
                title={widget.title}
                dashboardHref={BIG_THREE_PRODUCT_LINKS.rhel.dashboard}
              />
            }
          >
            <RhelNonEmptyWidgetBody />
          </WidgetCard>
        );

      case 'openshift':
        return (
          <WidgetCard
            title={widget.title}
            widgetId={widget.id}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
            headerExtra={
              <BigThreeProductHeader
                widgetId={widget.id}
                title={widget.title}
                dashboardHref={BIG_THREE_PRODUCT_LINKS.openshift.dashboard}
              />
            }
          >
            <OpenshiftEmptyWidgetBody />
          </WidgetCard>
        );

      case 'ansible':
        return (
          <WidgetCard
            title={widget.title}
            widgetId={widget.id}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
            headerExtra={
              <BigThreeProductHeader
                widgetId={widget.id}
                title={widget.title}
                dashboardHref={BIG_THREE_PRODUCT_LINKS.ansible.dashboard}
              />
            }
          >
            <AnsibleEmptyWidgetBody />
          </WidgetCard>
        );

      case 'recently-visited':
        return (
          <WidgetCard 
            title={widget.title}
            widgetId={widget.id}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
          >
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <Content>
                  Quick access to your most recently visited services and resources.
                </Content>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }}>
                <List isPlain>
                  <ListItem>
                    <Button variant="link" onClick={() => navigate('/dashboard-hub')}>
                      Dashboard Hub
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button variant="link" onClick={() => navigate('/alert-manager')}>
                      Alert Manager
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button variant="link" onClick={() => navigate('/data-integration')}>
                      Data Integration
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button variant="link" onClick={() => navigate('/my-user-access')}>
                      My User Access
                    </Button>
                  </ListItem>
                  <ListItem>
                    <Button variant="link" onClick={() => navigate('/event-log')}>
                      Event Log
                    </Button>
                  </ListItem>
                </List>
              </FlexItem>
            </Flex>
          </WidgetCard>
        );

      case 'image-builder':
        return (
          <WidgetCard 
            title={widget.title}
            widgetId={widget.id}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
            footerContent={
              <Button variant="link" iconPosition="end" icon={<ArrowRightIcon />}>
                Images
              </Button>
            }
          >
            <Content>
              Create customized system images for disks, VMs, and cloud platforms. Image Builder automates configurations, saving you time and ensuring consistent, deployment-ready images every time.
            </Content>
          </WidgetCard>
        );

      case 'explore-capabilities':
        return (
          <WidgetCard 
            title={widget.title}
            widgetId={widget.id}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
          >
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
              {/* First row - 3 cards */}
              <FlexItem>
                <Flex direction={{ default: 'row' }} spaceItems={{ default: 'spaceItemsMd' }} flexWrap={{ default: 'wrap' }}>
                  <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '180px' }}>
                    <Card 
                      onClick={() => navigate('/tour')} 
                      className="explore-capability-card"
                      isCompact
                      variant="secondary"
                    >
                      <CardBody>
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                          <FlexItem>
                            <Title headingLevel="h4" size="md">
                              Get started with a tour
                            </Title>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small">
                              Take a quick guided tour to understand how the Red Hat Hybrid Cloud Console's capabilities will increase your efficiency
                            </Content>
                          </FlexItem>
                        </Flex>
                      </CardBody>
                    </Card>
                  </FlexItem>
                  <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '180px' }}>
                    <Card 
                      onClick={() => navigate('/openshift-aws')} 
                      className="explore-capability-card"
                      isCompact
                      variant="secondary"
                    >
                      <CardBody>
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                          <FlexItem>
                            <Title headingLevel="h4" size="md">
                              Try OpenShift on AWS
                            </Title>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small">
                              Quickly build, deploy, and scale applications with Red Hat OpenShift Service on AWS (ROSA), our fully-managed turnkey application platform.
                            </Content>
                          </FlexItem>
                        </Flex>
                      </CardBody>
                    </Card>
                  </FlexItem>
                  <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '180px' }}>
                    <Card 
                      onClick={() => navigate('/developer-sandbox')} 
                      className="explore-capability-card"
                      isCompact
                      variant="secondary"
                    >
                      <CardBody>
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                          <FlexItem>
                            <Title headingLevel="h4" size="md">
                              Try our products in the Developer Sandbox
                            </Title>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small">
                              The Developer Sandbox offers no-cost access to Red Hat products and technologies for trial use - no setup or configuration necessary.
                            </Content>
                          </FlexItem>
                        </Flex>
                      </CardBody>
                    </Card>
                  </FlexItem>
                </Flex>
              </FlexItem>
              {/* Second row - 2 cards */}
              <FlexItem>
                <Flex direction={{ default: 'row' }} spaceItems={{ default: 'spaceItemsMd' }} justifyContent={{ default: 'justifyContentFlexStart' }} flexWrap={{ default: 'wrap' }}>
                  <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '180px', maxWidth: 'calc(33.333% - 8px)' }}>
                    <Card 
                      onClick={() => navigate('/rhel-analysis')} 
                      className="explore-capability-card"
                      isCompact
                      variant="secondary"
                    >
                      <CardBody>
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                          <FlexItem>
                            <Title headingLevel="h4" size="md">
                              Analyze RHEL environments
                            </Title>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small">
                              Analyze platforms and applications from the console to better manage your hybrid cloud environments.
                            </Content>
                          </FlexItem>
                        </Flex>
                      </CardBody>
                    </Card>
                  </FlexItem>
                  <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '180px', maxWidth: 'calc(33.333% - 8px)' }}>
                    <Card 
                      onClick={() => navigate('/centos-rhel-conversion')} 
                      className="explore-capability-card"
                      isCompact
                      variant="secondary"
                    >
                      <CardBody>
                        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
                          <FlexItem>
                            <Title headingLevel="h4" size="md">
                              Convert from CentOS to RHEL
                            </Title>
                          </FlexItem>
                          <FlexItem>
                            <Content component="small">
                              Seamlessly migrate your CentOS systems to Red Hat Enterprise Linux with our conversion tools and guidance.
                            </Content>
                          </FlexItem>
                        </Flex>
                      </CardBody>
                    </Card>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </WidgetCard>
        );

      case 'red-hat-ai':
        return (
          <WidgetCard
            title={widget.title}
            widgetId={widget.id}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
            footerContent={
              <Button variant="link" iconPosition="end" icon={<ExternalLinkAltIcon />}>
                Red Hat AI
              </Button>
            }
          >
            <Content>
              Create, train, and serve artificial intelligence and machine learning (AI/ML) models. Detailed widget
              content can be provided next.
            </Content>
          </WidgetCard>
        );

      case 'subscriptions':
        return (
          <WidgetCard
            title={widget.title}
            widgetId={widget.id}
            className="widget-card--subscriptions"
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
            headerExtra={
              <SubscriptionsWidgetHeader title={widget.title} />
            }
          >
            <SubscriptionsWidgetBody />
          </WidgetCard>
        );

      case 'events':
        return (
          <WidgetCard
            title={widget.title}
            widgetId={widget.id}
            className="widget-card--events"
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
            headerExtra={<EventsWidgetHeader title={widget.title} />}
          >
            <EventsWidgetBody />
          </WidgetCard>
        );

      case 'integrations':
        return (
          <WidgetCard
            title={widget.title}
            widgetId={widget.id}
            className="widget-card--integrations"
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
            headerExtra={<IntegrationsWidgetHeader title={widget.title} />}
          >
            <IntegrationsWidgetBody />
          </WidgetCard>
        );

      case 'my-account':
        return (
          <WidgetCard
            title={widget.title}
            widgetId={widget.id}
            className="widget-card--my-account"
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
            headerExtra={<MyAccountWidgetHeader title={widget.title} />}
          >
            <MyAccountWidgetBody />
          </WidgetCard>
        );

      // Placeholder widgets (Data Integrations, Alert Manager, etc.)
      default:
        return (
          <WidgetCard 
            title={widget.title}
            widgetId={widget.id}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
            footerContent={
              widget.footerText && (
                <Button 
                  variant="link" 
                  iconPosition="end" 
                  icon={<ArrowRightIcon />}
                  onClick={() => widget.navigateTo && navigate(widget.navigateTo)}
                >
                  {widget.footerText}
                </Button>
              )
            }
          >
            <Content component="p" style={{ color: 'var(--pf-t--global--text--color--subtle, var(--pf-v6-global--Color--200))' }}>
              Widget content will be added in a follow-up.
            </Content>
          </WidgetCard>
        );
    }
}

/** Non-interactive grid cell — same grid placement as sortable widgets, without DnD or resize. */
export function ReadOnlyHomepageWidgetFrame({
  widget,
  gridWidth,
  placement,
  children
}: {
  widget: Widget;
  /** Width of `.widgets-grid` (ResizeObserver); omit only if unavailable (falls back to wide desktop). */
  gridWidth?: number;
  placement: DashboardWidgetPlacement;
  children: React.ReactNode;
}) {
  const w = gridWidth ?? 1600;
  const effectiveColSpan = getEffectiveColumnSpan(w, widget.colSpan);
  const style: React.CSSProperties = {
    gridColumn: `${placement.columnStart} / span ${effectiveColSpan}`,
    gridRow: `${placement.rowStart} / span ${widget.rowSpan}`,
    minWidth: 0,
    minHeight: 0,
    boxSizing: 'border-box'
  };
  return (
    <WidgetColSpanContext.Provider value={effectiveColSpan}>
      <div className="widget-wrapper read-only-homepage-widget" style={style}>
        {children}
      </div>
    </WidgetColSpanContext.Provider>
  );
}

export const WIDGET_GRID_STYLES = `
    ${BIG_THREE_PRODUCT_WIDGET_STYLES}
    ${SUBSCRIPTIONS_WIDGET_STYLES}
    ${EVENTS_WIDGET_STYLES}
    ${INTEGRATIONS_WIDGET_STYLES}
    ${MY_ACCOUNT_WIDGET_STYLES}
    ${WIDGET_CARD_HEADER_LAYOUT_STYLES}
    .pf-v6-c-card.explore-capability-card {
      cursor: pointer !important;
      border: 1px solid var(--pf-v6-global--BorderColor--100) !important;
      transition: all 0.2s ease-in-out !important;
    }
    .pf-v6-c-card.explore-capability-card:hover {
      border: 1px solid var(--pf-v6-global--primary-color--100) !important;
      box-shadow: var(--pf-v6-global--BoxShadow--md) !important;
      background-color: var(--pf-v6-global--BackgroundColor--300) !important;
      transform: translateY(-2px) !important;
    }
    .pf-v6-c-card.explore-capability-card:active {
      transform: translateY(0px) !important;
    }
    
    /* Responsive columns — breakpoints must match getDashboardGridColumnCount() */
    .widgets-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      grid-auto-rows: ${GRID_ROW_HEIGHT}px;
      grid-auto-flow: row;
      gap: ${GAP}px;
      align-items: stretch;
      width: 100%;
      min-width: 0;
    }

    .widgets-grid > .widget-wrapper {
      min-width: 0;
      min-height: 0;
      box-sizing: border-box;
    }

    .widgets-grid > .widget-wrapper.is-resizing {
      align-self: start;
    }

    .widgets-grid.is-resize-active > .widget-wrapper:not(.is-resizing) {
      transition:
        grid-row-start 180ms ease,
        grid-column-start 180ms ease,
        grid-row-end 180ms ease,
        grid-column-end 180ms ease;
    }

    .widget-resizable-root {
      box-sizing: border-box;
      min-width: 0 !important;
      min-height: 0 !important;
      max-width: 100%;
    }

    .widget-resizable-root .widget-card {
      min-width: 0;
    }
    
    /* Widget wrapper */
    .widget-wrapper {
      position: relative;
    }

    .widget-wrapper.read-only-homepage-widget {
      height: 100%;
    }

    .widget-wrapper.is-dragging {
      z-index: 1;
    }

    .widget-wrapper.is-dragging .widget-card {
      opacity: 0.35;
      outline: 2px dashed var(--pf-v6-global--BorderColor--200);
      outline-offset: -2px;
    }

    .widget-wrapper.is-resizing {
      z-index: 999;
    }

    .widget-grid-drag-overlay {
      opacity: 0.96;
      box-shadow: var(--pf-v6-global--BoxShadow--xl);
      cursor: grabbing;
      pointer-events: none;
    }

    .widget-grid-drag-overlay .widget-card {
      border-color: var(--pf-v6-global--primary-color--100);
      box-shadow: var(--pf-v6-global--BoxShadow--xl);
    }
    
    /* Widget card fills its container */
    .widget-card {
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
      --pf-v6-c-card--first-child--PaddingBlockStart: var(--pf-t--global--spacer--sm);
    }
    
    .widget-card .pf-v6-c-card__body {
      flex-grow: 1 !important;
      overflow: auto !important;
      padding-block-end: var(--pf-t--global--spacer--md);
      padding-inline-start: var(--pf-t--global--spacer--md);
      padding-inline-end: var(--pf-t--global--spacer--md);
    }

    .widget-card.pf-v6-c-card > .pf-v6-c-divider + .pf-v6-c-card__body {
      padding-block-start: var(--pf-t--global--spacer--md);
    }
    
    .widget-card .pf-v6-c-card__header,
    .widget-card .pf-v6-c-card__footer {
      flex-shrink: 0 !important;
    }

    .widget-card .pf-v6-c-card__header {
      align-items: flex-start;
      padding-block-start: calc(var(--pf-t--global--spacer--sm) + var(--pf-t--global--spacer--xs));
      padding-block-end: calc(var(--pf-t--global--spacer--sm) + var(--pf-t--global--spacer--xs));
    }

    .widget-card .pf-v6-c-card__header:not(:last-child) {
      padding-block-end: calc(var(--pf-t--global--spacer--sm) + var(--pf-t--global--spacer--xs));
    }

    .widget-card .pf-v6-c-card__header-main {
      min-width: 0;
      width: 100%;
    }
    
    /* Resize handle styles */
    .resize-handle {
      background: transparent !important;
      z-index: 10;
      transition: background-color 0.2s ease;
      touch-action: none;
    }
    
    .resize-handle-right {
      cursor: ew-resize !important;
    }
    
    .resize-handle-right:hover {
      background: linear-gradient(to right, transparent, var(--pf-v6-global--primary-color--100), transparent) !important;
      opacity: 0.5;
    }
    
    .resize-handle-bottom {
      cursor: ns-resize !important;
    }
    
    .resize-handle-bottom:hover {
      background: linear-gradient(to bottom, transparent, var(--pf-v6-global--primary-color--100), transparent) !important;
      opacity: 0.5;
    }
    
    .resize-handle-corner {
      cursor: nwse-resize !important;
      position: relative;
    }
    
    .resize-handle-corner::before {
      content: '';
      position: absolute;
      right: 6px;
      bottom: 6px;
      width: 10px;
      height: 10px;
      border-right: 2px solid var(--pf-v6-global--BorderColor--200);
      border-bottom: 2px solid var(--pf-v6-global--BorderColor--200);
      opacity: 0.6;
      transition: all 0.2s ease;
    }
    
    .resize-handle-corner:hover::before {
      border-color: var(--pf-v6-global--primary-color--100);
      opacity: 1;
    }
    
    /* Resizing state */
    .resizing {
      z-index: 999 !important;
    }
    
    .resizing .widget-card {
      box-shadow: var(--pf-v6-global--BoxShadow--lg) !important;
      border-color: var(--pf-v6-global--primary-color--100) !important;
    }
    
    /* Preview indicator */
    .resize-preview-indicator {
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      background: var(--pf-v6-global--primary-color--100);
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
      z-index: 1000;
      white-space: nowrap;
    }
    
    .resize-preview-indicator.visible {
      opacity: 1;
    }
    
    /* Responsive: 2 columns on medium screens */
    @media (max-width: 1200px) {
      .widgets-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }
    
    /* Responsive: 1 column on small screens */
    @media (max-width: 768px) {
      .widgets-grid {
        grid-template-columns: minmax(0, 1fr);
      }
    }
`;
