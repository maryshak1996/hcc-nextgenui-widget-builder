import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import {
  Alert,
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
import {
  ArrowRightIcon,
  BellIcon,
  BookmarkIcon,
  ChartLineIcon,
  ClockIcon,
  CloudIcon,
  CogIcon,
  CommentsIcon,
  CreditCardIcon,
  DesktopIcon,
  EllipsisVIcon,
  ExternalLinkAltIcon,
  GripVerticalIcon,
  HeadsetIcon,
  PlugIcon,
  SearchIcon,
  ServerIcon,
  ShieldAltIcon
} from '@patternfly/react-icons';
import { WidgetTitleLeadIcon } from '@app/Homepage/homepageWidgetHeaderIcons';
import type { ColumnSpan, RowSpan, Widget } from '@app/Homepage/widgetTypes';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Resizable, type ResizeCallback } from 're-resizable';


export const ROW_HEIGHT = 80; // Base row height in pixels

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

/**
 * First-fit packing in DOM order: assigns non-overlapping grid starts so resize/reflow shifts later widgets
 * instead of painting on top of each other.
 */
export function computeDashboardWidgetPlacements(
  widgets: readonly Widget[],
  columnCount: number
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

  for (const w of widgets) {
    const cw = Math.min(w.colSpan, cols);
    const rh = w.rowSpan;
    let placed = false;
    for (let row = 0; row < maxScanRows && !placed; row++) {
      for (let col = 0; col <= cols - cw; col++) {
        if (canPlace(row, col, cw, rh)) {
          mark(row, col, cw, rh);
          placements.set(w.id, { columnStart: col + 1, rowStart: row + 1 });
          placed = true;
          break;
        }
      }
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
  onRemove: (id: string) => void;
  gridWidth: number;
}

export const SortableWidgetCard: React.FC<SortableWidgetCardProps> = ({
  widget,
  placement,
  children,
  onSizeChange,
  onRemove,
  gridWidth
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const [isResizing, setIsResizing] = useState(false);
  const [previewColSpan, setPreviewColSpan] = useState<ColumnSpan>(widget.colSpan);
  const [previewRowSpan, setPreviewRowSpan] = useState<RowSpan>(widget.rowSpan);

  const columnCount = getDashboardGridColumnCount(gridWidth);
  const effectiveColSpan = getEffectiveColumnSpan(gridWidth, widget.colSpan);

  const allowedColSpans = useMemo((): ColumnSpan[] => {
    const max = Math.min(4, columnCount);
    return [1, 2, 3, 4].filter((s) => s <= max) as ColumnSpan[];
  }, [columnCount]);

  const getHeightForSpan = (span: RowSpan): number => {
    return ROW_HEIGHT * span + GAP * (span - 1);
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
    const spans: RowSpan[] = [1, 2, 3, 4, 5, 6];
    let closestSpan: RowSpan = 2;
    let minDiff = Infinity;

    for (const span of spans) {
      const spanHeight = getHeightForSpan(span);
      const diff = Math.abs(height - spanHeight);
      if (diff < minDiff) {
        minDiff = diff;
        closestSpan = span;
      }
    }

    return closestSpan;
  };

  useEffect(() => {
    setPreviewColSpan(widget.colSpan);
    setPreviewRowSpan(widget.rowSpan);
  }, [widget.colSpan, widget.rowSpan]);

  const handleResizeStart = () => {
    setIsResizing(true);
    setPreviewColSpan(widget.colSpan);
    setPreviewRowSpan(widget.rowSpan);
  };

  const handleResize: ResizeCallback = (_e, _direction, ref) => {
    const newWidth = ref.offsetWidth;
    const newHeight = ref.offsetHeight;
    setPreviewColSpan(getColSpanFromWidth(newWidth));
    setPreviewRowSpan(getRowSpanFromHeight(newHeight));
  };

  const handleResizeStop: ResizeCallback = (_e, _direction, ref) => {
    const newWidth = ref.offsetWidth;
    const newHeight = ref.offsetHeight;
    const newColSpan = getColSpanFromWidth(newWidth);
    const newRowSpan = getRowSpanFromHeight(newHeight);
    onSizeChange(widget.id, newColSpan, newRowSpan);
    setIsResizing(false);
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isResizing ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : isResizing ? 999 : 'auto',
    gridColumn: `${placement.columnStart} / span ${effectiveColSpan}`,
    gridRow: `${placement.rowStart} / span ${widget.rowSpan}`,
    minWidth: 0,
    minHeight: 0,
    boxSizing: 'border-box'
  };

  const currentWidth = getWidthForSpan(effectiveColSpan);
  const currentHeight = getHeightForSpan(widget.rowSpan);

  return (
    <div ref={setNodeRef} style={style} className={`widget-wrapper`}>
      <Resizable
        className={`widget-resizable-root ${isResizing ? 'resizing' : ''}`}
        size={{ width: currentWidth, height: currentHeight }}
        handleClasses={{
          right: 'resize-handle resize-handle-right',
          bottom: 'resize-handle resize-handle-bottom',
          bottomRight: 'resize-handle resize-handle-corner'
        }}
        snap={{
          x: allowedColSpans.map((span) => getWidthForSpan(span)),
          y: [1, 2, 3, 4, 5, 6].map((span) => getHeightForSpan(span as RowSpan))
        }}
        snapGap={GAP}
      >
        <div className={`resize-preview-indicator ${isResizing ? 'visible' : ''}`}>
          {previewColSpan}×{previewRowSpan}
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

  if (readOnly) {
    return (
      <Card isFullHeight={isFullHeight} className={`widget-card ${className}`}>
        <CardHeader>
          {headerExtra || (
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <WidgetTitleLeadIcon widgetId={widgetId} />
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }}>
                <Title headingLevel="h4" className="pf-v6-c-card__title">
                  {title}
                </Title>
              </FlexItem>
            </Flex>
          )}
        </CardHeader>
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
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            {headerExtra || (
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <WidgetTitleLeadIcon widgetId={widgetId} />
                </FlexItem>
                <FlexItem flex={{ default: 'flex_1' }}>
                  <Title headingLevel="h4" className="pf-v6-c-card__title">
                    {title}
                  </Title>
                </FlexItem>
              </Flex>
            )}
          </FlexItem>
          <FlexItem>
            <Flex spaceItems={{ default: 'spaceItemsXs' }} alignItems={{ default: 'alignItemsCenter' }}>
              <FlexItem>
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
              </FlexItem>
              <FlexItem>
                <Button 
                  variant="plain" 
                  aria-label="Drag to reorder"
                  style={{ cursor: 'grab' }}
                  {...dragHandleProps}
                >
                  <GripVerticalIcon />
                </Button>
              </FlexItem>
            </Flex>
          </FlexItem>
        </Flex>
      </CardHeader>
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
            footerContent={
              <Button variant="link" iconPosition="end" icon={<ArrowRightIcon />}>
                Insights for RHEL
              </Button>
            }
          >
            <Content>
              Proactively assess, secure, and stabilize the business-critical services that you scale from your RHEL systems.
            </Content>
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
            footerContent={
              <Button variant="link" iconPosition="end" icon={<ArrowRightIcon />}>
                OpenShift
              </Button>
            }
          >
            <Content>
              Build, run, and scale container-based applications - now with developer tools, CI/CD, and release management.
            </Content>
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
            footerContent={
              <Button variant="link" iconPosition="end" icon={<ArrowRightIcon />}>
                Ansible
              </Button>
            }
          >
            <Content>
              Create, share, and manage automations - from development and operations, to security and network teams.
            </Content>
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
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
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
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            readOnly={readOnly}
          >
            <Flex direction={{ default: 'row' }} spaceItems={{ default: 'spaceItemsMd' }} flexWrap={{ default: 'wrap' }}>
              <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '150px' }}>
                <Alert title="Active Subscriptions" variant="info" isInline>
                  15 active
                </Alert>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '150px' }}>
                <Alert title="Expiring Soon" variant="warning" isInline>
                  3 expiring
                </Alert>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '150px' }}>
                <Alert title="Usage Alerts" variant="danger" isInline>
                  2 alerts
                </Alert>
              </FlexItem>
              <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: '150px' }}>
                <Alert title="Available Credits" variant="success" isInline>
                  $12,500
                </Alert>
              </FlexItem>
            </Flex>
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
    <div className="widget-wrapper read-only-homepage-widget" style={style}>
      {children}
    </div>
  );
}

export const WIDGET_GRID_STYLES = `
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
      grid-auto-rows: ${ROW_HEIGHT}px;
      grid-auto-flow: row;
      gap: var(--pf-t--global--spacer--md);
      align-items: stretch;
      width: 100%;
      min-width: 0;
    }

    .widgets-grid > .widget-wrapper {
      min-width: 0;
      min-height: 0;
      box-sizing: border-box;
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
    
    /* Widget card fills its container */
    .widget-card {
      height: 100% !important;
      display: flex !important;
      flex-direction: column !important;
    }
    
    .widget-card .pf-v6-c-card__body {
      flex-grow: 1 !important;
      overflow: auto !important;
    }
    
    .widget-card .pf-v6-c-card__header,
    .widget-card .pf-v6-c-card__footer {
      flex-shrink: 0 !important;
    }
    
    /* Resize handle styles */
    .resize-handle {
      background: transparent !important;
      z-index: 10;
      transition: background-color 0.2s ease;
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
