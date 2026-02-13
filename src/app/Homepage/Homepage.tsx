import * as React from 'react';
import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  Flex,
  FlexItem,
  Icon,
  List,
  ListItem,
  MenuToggle,
  MenuToggleElement,
  PageSection,
  Panel,
  PanelMain,
  PanelMainBody,
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
  CubesIcon,
  DesktopIcon,
  EllipsisVIcon,
  ExternalLinkAltIcon,
  GripVerticalIcon,
  HeadsetIcon,
  PlugIcon,
  SearchIcon,
  ServerIcon,
  ShieldAltIcon,
  TimesIcon
} from '@patternfly/react-icons';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Resizable, ResizeCallback } from 're-resizable';

// Column span type (1-4 columns)
type ColumnSpan = 1 | 2 | 3 | 4;

// Row span type (1-6 rows, each row is ~80px)
type RowSpan = 1 | 2 | 3 | 4 | 5 | 6;

const ROW_HEIGHT = 80; // Base row height in pixels
const GAP = 16; // Grid gap

// Widget type definition
interface Widget {
  id: string;
  title: string;
  type: 'product' | 'settings' | 'recently-visited' | 'explore-capabilities' | 'subscriptions' | 'placeholder';
  colSpan: ColumnSpan;
  rowSpan: RowSpan;
  content?: React.ReactNode;
  footerLink?: string;
  footerText?: string;
  footerIcon?: React.ReactNode;
  navigateTo?: string;
}

// Draggable Bank Widget Card Component (for widgets in the drawer/bank)
interface DraggableBankWidgetProps {
  widget: Widget;
}

const DraggableBankWidget: React.FC<DraggableBankWidgetProps> = ({ widget }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `bank-${widget.id}`,
    data: {
      widget,
      fromBank: true,
    },
  });

  const style: React.CSSProperties = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bank-widget-wrapper"
    >
      <Card 
        className="bank-widget-card"
        isCompact
      >
        <CardBody>
          <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem flex={{ default: 'flex_1' }}>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                <FlexItem>
                  <Title headingLevel="h4" size="md">{widget.title}</Title>
                </FlexItem>
                <FlexItem>
                  <Content component="small" style={{ color: 'var(--pf-v6-global--Color--200)' }}>
                    Drag to add to dashboard
                  </Content>
                </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem>
              <div style={{ cursor: 'grab', padding: '8px' }}>
                <GripVerticalIcon />
              </div>
            </FlexItem>
          </Flex>
        </CardBody>
      </Card>
    </div>
  );
};

// Sortable Widget Card Component with Resizable
interface SortableWidgetCardProps {
  widget: Widget;
  children: React.ReactElement<{
    dragHandleProps?: Record<string, unknown>;
    onRemove?: () => void;
  }>;
  onSizeChange: (id: string, colSpan: ColumnSpan, rowSpan: RowSpan) => void;
  onRemove: (id: string) => void;
  gridWidth: number;
}

const SortableWidgetCard: React.FC<SortableWidgetCardProps> = ({ widget, children, onSizeChange, onRemove, gridWidth }) => {
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

  // Calculate column width (accounting for gaps)
  const columnWidth = (gridWidth - (GAP * 3)) / 4;

  // Calculate width for column span
  const getWidthForSpan = (span: ColumnSpan): number => {
    return (columnWidth * span) + (GAP * (span - 1));
  };

  // Calculate height for row span
  const getHeightForSpan = (span: RowSpan): number => {
    return (ROW_HEIGHT * span) + (GAP * (span - 1));
  };

  // Determine column span from width
  const getColSpanFromWidth = (width: number): ColumnSpan => {
    const spans: ColumnSpan[] = [1, 2, 3, 4];
    let closestSpan: ColumnSpan = 1;
    let minDiff = Infinity;

    for (const span of spans) {
      const spanWidth = getWidthForSpan(span);
      const diff = Math.abs(width - spanWidth);
      if (diff < minDiff) {
        minDiff = diff;
        closestSpan = span;
      }
    }

    return closestSpan;
  };

  // Determine row span from height
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
    gridColumn: `span ${widget.colSpan}`,
    gridRow: `span ${widget.rowSpan}`,
  };

  const currentWidth = getWidthForSpan(widget.colSpan);
  const currentHeight = getHeightForSpan(widget.rowSpan);

  return (
    <div ref={setNodeRef} style={style} className={`widget-wrapper`}>
      <Resizable
        size={{
          width: currentWidth,
          height: currentHeight,
        }}
        minWidth={columnWidth}
        maxWidth={gridWidth}
        minHeight={ROW_HEIGHT}
        maxHeight={getHeightForSpan(6)}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeStop={handleResizeStop}
        enable={{
          top: false,
          right: true,
          bottom: true,
          left: false,
          topRight: false,
          bottomRight: true,
          bottomLeft: false,
          topLeft: false,
        }}
        handleStyles={{
          right: {
            width: '12px',
            right: '-6px',
            cursor: 'ew-resize',
          },
          bottom: {
            height: '12px',
            bottom: '-6px',
            cursor: 'ns-resize',
          },
          bottomRight: {
            width: '20px',
            height: '20px',
            right: '-6px',
            bottom: '-6px',
            cursor: 'nwse-resize',
          },
        }}
        handleClasses={{
          right: 'resize-handle resize-handle-right',
          bottom: 'resize-handle resize-handle-bottom',
          bottomRight: 'resize-handle resize-handle-corner',
        }}
        className={isResizing ? 'resizing' : ''}
        snap={{
          x: [1, 2, 3, 4].map(span => getWidthForSpan(span as ColumnSpan)),
          y: [1, 2, 3, 4, 5, 6].map(span => getHeightForSpan(span as RowSpan)),
        }}
        snapGap={20}
      >
        <div className={`resize-preview-indicator ${isResizing ? 'visible' : ''}`}>
          {previewColSpan}×{previewRowSpan}
        </div>
        {React.cloneElement(children, {
          dragHandleProps: { ...attributes, ...listeners },
          onRemove: () => onRemove(widget.id),
        } as { dragHandleProps: Record<string, unknown>; onRemove: () => void })}
      </Resizable>
    </div>
  );
};

// Generic Widget Card Component
interface WidgetCardProps {
  title: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  headerExtra?: React.ReactNode;
  className?: string;
  dragHandleProps?: Record<string, unknown>;
  isFullHeight?: boolean;
  onRemove?: () => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ 
  title, 
  children, 
  footerContent, 
  headerExtra, 
  className = '',
  dragHandleProps,
  isFullHeight = true,
  onRemove,
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

  return (
    <Card isFullHeight={isFullHeight} className={`widget-card ${className}`}>
      <CardHeader>
        <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
          <FlexItem>
            {headerExtra || (
              <Title headingLevel="h4" className="pf-v6-c-card__title">
                {title}
              </Title>
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

const Homepage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(1200);
  
  // Get user name (currently hardcoded, matching the username dropdown)
  const userName = "Ned";

  // Measure grid width for column calculations
  useEffect(() => {
    const updateGridWidth = () => {
      if (gridRef.current) {
        setGridWidth(gridRef.current.offsetWidth);
      }
    };

    updateGridWidth();
    window.addEventListener('resize', updateGridWidth);
    return () => window.removeEventListener('resize', updateGridWidth);
  }, []);

  // Initial widget configuration
  const initialWidgets: Widget[] = [
    {
      id: 'rhel',
      title: 'Red Hat Enterprise Linux',
      type: 'product',
      colSpan: 1,
      rowSpan: 3,
    },
    {
      id: 'openshift',
      title: 'Red Hat OpenShift',
      type: 'product',
      colSpan: 1,
      rowSpan: 3,
    },
    {
      id: 'ansible',
      title: 'Ansible Automation Platform',
      type: 'product',
      colSpan: 1,
      rowSpan: 3,
    },
    {
      id: 'recently-visited',
      title: 'Recently Visited',
      type: 'recently-visited',
      colSpan: 1,
      rowSpan: 4,
    },
    {
      id: 'settings',
      title: 'Settings',
      type: 'settings',
      colSpan: 1,
      rowSpan: 2,
    },
    {
      id: 'image-builder',
      title: 'Image Builder',
      type: 'product',
      colSpan: 1,
      rowSpan: 3,
    },
    {
      id: 'explore-capabilities',
      title: 'Explore capabilities',
      type: 'explore-capabilities',
      colSpan: 3,
      rowSpan: 5,
    },
    {
      id: 'acs',
      title: 'Advanced Cluster Security',
      type: 'product',
      colSpan: 1,
      rowSpan: 2,
    },
    {
      id: 'openshift-ai',
      title: 'Red Hat OpenShift AI',
      type: 'product',
      colSpan: 1,
      rowSpan: 2,
    },
    {
      id: 'data-integrations',
      title: 'Data Integrations',
      type: 'placeholder',
      colSpan: 1,
      rowSpan: 2,
      navigateTo: '/data-integration',
      footerText: 'View integrations',
    },
    {
      id: 'alert-manager',
      title: 'Alert Manager',
      type: 'placeholder',
      colSpan: 1,
      rowSpan: 2,
      navigateTo: '/alert-manager',
      footerText: 'Manage alerts',
    },
    {
      id: 'bookmarked-resources',
      title: 'Bookmarked Resources',
      type: 'placeholder',
      colSpan: 1,
      rowSpan: 2,
      navigateTo: '/bookmarks',
      footerText: 'View bookmarks',
    },
    {
      id: 'events',
      title: 'Events',
      type: 'placeholder',
      colSpan: 1,
      rowSpan: 2,
      navigateTo: '/event-log',
      footerText: 'View events',
    },
    {
      id: 'support-cases',
      title: 'My Support Cases',
      type: 'placeholder',
      colSpan: 1,
      rowSpan: 2,
      navigateTo: '/support',
      footerText: 'View support cases',
    },
    {
      id: 'ask-red-hat',
      title: 'Ask Red Hat',
      type: 'placeholder',
      colSpan: 1,
      rowSpan: 2,
      footerText: 'Ask a question',
    },
    {
      id: 'subscriptions',
      title: 'Subscriptions',
      type: 'subscriptions',
      colSpan: 4,
      rowSpan: 2,
    },
  ];

  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isWidgetDrawerOpen, setIsWidgetDrawerOpen] = useState(false);
  const [removedWidgets, setRemovedWidgets] = useState<Widget[]>([]);

  const toggleWidgetDrawer = () => {
    setIsWidgetDrawerOpen(!isWidgetDrawerOpen);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    const activeIdStr = String(active.id);
    
    // Check if dragging from the bank
    if (activeIdStr.startsWith('bank-')) {
      const widgetId = activeIdStr.replace('bank-', '');
      const widgetToAdd = removedWidgets.find((w) => w.id === widgetId);
      
      if (widgetToAdd) {
        // Remove from bank
        setRemovedWidgets((prev) => prev.filter((w) => w.id !== widgetId));
        
        // Add to dashboard
        if (over) {
          const overIdStr = String(over.id);
          // If dropped over a dashboard widget, insert near it
          if (!overIdStr.startsWith('bank-')) {
            const overIndex = widgets.findIndex((item) => item.id === overIdStr);
            if (overIndex !== -1) {
              setWidgets((prev) => {
                const newWidgets = [...prev];
                newWidgets.splice(overIndex, 0, widgetToAdd);
                return newWidgets;
              });
              return;
            }
          }
        }
        // Default: add to end
        setWidgets((prev) => [...prev, widgetToAdd]);
      }
      return;
    }

    // Regular reorder within dashboard
    if (over && active.id !== over.id) {
      const overIdStr = String(over.id);
      // Only reorder if dropping on another dashboard widget
      if (!overIdStr.startsWith('bank-')) {
        setWidgets((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === overIdStr);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    }
  };

  const handleSizeChange = useCallback((id: string, colSpan: ColumnSpan, rowSpan: RowSpan) => {
    setWidgets((prev) =>
      prev.map((widget) =>
        widget.id === id
          ? { ...widget, colSpan, rowSpan }
          : widget
      )
    );
  }, []);

  const handleResetToDefault = () => {
    setWidgets(initialWidgets);
    setRemovedWidgets([]);
  };

  const handleRemoveWidget = useCallback((widgetId: string) => {
    const widgetToRemove = widgets.find((w) => w.id === widgetId);
    if (widgetToRemove) {
      setWidgets((prev) => prev.filter((w) => w.id !== widgetId));
      setRemovedWidgets((prev) => [...prev, widgetToRemove]);
    }
  }, [widgets]);

  const activeWidget = useMemo(() => {
    if (!activeId) return null;
    
    // Check if it's a bank widget
    if (activeId.startsWith('bank-')) {
      const widgetId = activeId.replace('bank-', '');
      return removedWidgets.find((w) => w.id === widgetId);
    }
    
    return widgets.find((w) => w.id === activeId);
  }, [activeId, widgets, removedWidgets]);

  const isFromBank = activeId?.startsWith('bank-') ?? false;

  // Render widget content based on type
  const renderWidgetContent = (widget: Widget, dragHandleProps?: Record<string, unknown>, onRemove?: () => void) => {
    switch (widget.id) {
      case 'rhel':
        return (
          <WidgetCard
            onRemove={onRemove} 
            title={widget.title} 
            dragHandleProps={dragHandleProps}
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
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
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
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
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
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
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
                    <Button variant="link" onClick={() => navigate('/dashboard')}>
                      Dashboard
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

      case 'settings':
        return (
          <WidgetCard 
            title={widget.title}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            headerExtra={
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsNone' }}>
                <FlexItem>
                  <Title headingLevel="h4" className="pf-v6-c-card__title">
                    Settings
                  </Title>
                </FlexItem>
                <FlexItem>
                  <Button variant="link" size="sm" onClick={() => navigate('/overview')}>
                    Manage settings
                  </Button>
                </FlexItem>
              </Flex>
            }
          >
            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                      <FlexItem>
                        <Content component="small" style={{ color: 'var(--pf-v6-global--Color--200)' }}>
                          Recently fired events
                        </Content>
                      </FlexItem>
                      <FlexItem>
                        <Content component="p" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                          7
                        </Content>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                  <FlexItem>
                    <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                      <FlexItem>
                        <Content component="small" style={{ color: 'var(--pf-v6-global--Color--200)' }}>
                          All data integrations
                        </Content>
                      </FlexItem>
                      <FlexItem>
                        <Content component="p" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                          12
                        </Content>
                      </FlexItem>
                    </Flex>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </WidgetCard>
        );

      case 'image-builder':
        return (
          <WidgetCard 
            title={widget.title}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
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
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
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

      case 'acs':
        return (
          <WidgetCard 
            title={widget.title}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            footerContent={
              <Button variant="link" iconPosition="end" icon={<ArrowRightIcon />}>
                RHACS Cloud Service
              </Button>
            }
          >
            <Content>
              Fully hosted software as a service for protecting cloud-native applications and Kubernetes.
            </Content>
          </WidgetCard>
        );

      case 'openshift-ai':
        return (
          <WidgetCard 
            title={widget.title}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
            footerContent={
              <Button variant="link" iconPosition="end" icon={<ExternalLinkAltIcon />}>
                OpenShift AI
              </Button>
            }
          >
            <Content>
              Create, train, and serve artificial intelligence and machine learning (AI/ML) models.
            </Content>
          </WidgetCard>
        );

      case 'subscriptions':
        return (
          <WidgetCard 
            title={widget.title}
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
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
            dragHandleProps={dragHandleProps}
            onRemove={onRemove}
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
            <Content>
              {/* Content to be provided */}
            </Content>
          </WidgetCard>
        );
    }
  };

  // CSS styles for the grid layout
  const gridStyles = `
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
    
    /* 4-column grid layout with auto rows */
    .widgets-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-auto-rows: ${ROW_HEIGHT}px;
      grid-auto-flow: dense;
      gap: ${GAP}px;
      align-items: stretch;
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
    
    /* Drag and drop styles */
    .drag-overlay {
      opacity: 0.9;
      box-shadow: var(--pf-v6-global--BoxShadow--xl) !important;
      cursor: grabbing !important;
    }
    
    /* Responsive: 2 columns on medium screens */
    @media (max-width: 1200px) {
      .widgets-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    /* Responsive: 1 column on small screens */
    @media (max-width: 768px) {
      .widgets-grid {
        grid-template-columns: 1fr;
      }
    }
    
    /* Widget Drawer Styles */
    .widget-drawer {
      display: none;
      opacity: 0;
      margin-bottom: 0;
      position: relative;
      z-index: 100;
    }
    
    .widget-drawer.open {
      display: block;
      opacity: 1;
      margin-bottom: 16px;
      animation: slideDown 0.3s ease-out;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .widget-drawer-panel {
      background-color: var(--pf-v6-global--BackgroundColor--200);
      border-radius: 8px;
      position: relative;
      z-index: 100;
    }
    
    .widget-drawer-panel .pf-v6-c-panel__main-body {
      padding: 24px;
    }
    
    .removed-widgets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }
    
    .removed-widget-card {
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      border: 2px dashed var(--pf-v6-global--BorderColor--100);
      background-color: var(--pf-v6-global--BackgroundColor--100);
    }
    
    .removed-widget-card:hover {
      border-color: var(--pf-v6-global--primary-color--100);
      box-shadow: var(--pf-v6-global--BoxShadow--sm);
      transform: translateY(-2px);
    }
    
    /* Bank widget wrapper and card styles */
    .bank-widget-wrapper {
      cursor: grab;
    }
    
    .bank-widget-wrapper:active {
      cursor: grabbing;
    }
    
    .bank-widget-card {
      transition: all 0.2s ease-in-out;
      border: 2px dashed var(--pf-v6-global--BorderColor--100);
      background-color: var(--pf-v6-global--BackgroundColor--100);
      pointer-events: none;
    }
    
    .bank-widget-wrapper:hover .bank-widget-card {
      border-color: var(--pf-v6-global--primary-color--100);
      box-shadow: var(--pf-v6-global--BoxShadow--sm);
    }
  `;

  return (
    <>
      <style>{gridStyles}</style>
      <PageSection>
        {/* Header Section */}
        <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
          <FlexItem>
            <div style={{ maxWidth: '1566px', margin: '0 auto', width: '100%' }}>
              <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                <FlexItem flex={{ default: 'flex_1' }}>
                  <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsXs' }}>
                    <FlexItem>
                      <Title headingLevel="h1" size="2xl">
                        Hi, {userName}
                      </Title>
                    </FlexItem>
                    <FlexItem>
                      <Title headingLevel="h2" size="lg">
                        Welcome to your Hybrid Cloud Console.
                      </Title>
                    </FlexItem>
                  </Flex>
                </FlexItem>
                <FlexItem>
                  <Flex spaceItems={{ default: 'spaceItemsSm' }}>
                    <FlexItem>
                      <Button variant="link" onClick={handleResetToDefault}>
                        Reset to default
                      </Button>
                    </FlexItem>
                    <FlexItem>
                      <Button 
                        variant={isWidgetDrawerOpen ? "secondary" : "primary"}
                        onClick={toggleWidgetDrawer}
                      >
                        {isWidgetDrawerOpen ? "Close drawer" : "+ Add widgets"}
                      </Button>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
            </div>
          </FlexItem>
          
          {/* Divider */}
          <FlexItem>
            <div style={{ maxWidth: '1566px', margin: '0 auto', width: '100%' }}>
              <Divider />
            </div>
          </FlexItem>
          
          {/* DndContext wraps both drawer and dashboard for drag between them */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Widget Drawer */}
            <FlexItem>
              <div 
                className={`widget-drawer ${isWidgetDrawerOpen ? 'open' : ''}`}
                style={{ maxWidth: '1566px', margin: '0 auto', width: '100%' }}
              >
                <Panel variant="bordered" className="widget-drawer-panel">
                  <PanelMain>
                    <PanelMainBody>
                      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }} alignItems={{ default: 'alignItemsCenter' }}>
                        <FlexItem>
                          <Title headingLevel="h3" size="lg">Available Widgets</Title>
                        </FlexItem>
                        <FlexItem>
                          <Button variant="plain" aria-label="Close drawer" onClick={toggleWidgetDrawer}>
                            <TimesIcon />
                          </Button>
                        </FlexItem>
                      </Flex>
                      <Divider style={{ margin: '16px 0' }} />
                      {removedWidgets.length === 0 ? (
                        <EmptyState 
                          headingLevel="h4" 
                          titleText="No widgets available"
                          icon={CubesIcon}
                        >
                          <EmptyStateBody>
                            Remove widgets from your dashboard to see them here. You can then add them back anytime.
                          </EmptyStateBody>
                        </EmptyState>
                      ) : (
                        <div className="removed-widgets-grid">
                          {removedWidgets.map((widget) => (
                            <DraggableBankWidget key={widget.id} widget={widget} />
                          ))}
                        </div>
                      )}
                    </PanelMainBody>
                  </PanelMain>
                </Panel>
              </div>
            </FlexItem>
            
            {/* Service Cards Section */}
            <FlexItem>
              <div style={{ maxWidth: '1566px', margin: '0 auto', width: '100%' }} ref={gridRef}>
                <SortableContext items={widgets.map(w => w.id)} strategy={rectSortingStrategy}>
                  <div className="widgets-grid">
                    {widgets.map((widget) => (
                      <SortableWidgetCard 
                        key={widget.id} 
                        widget={widget}
                        onSizeChange={handleSizeChange}
                        onRemove={handleRemoveWidget}
                        gridWidth={gridWidth}
                      >
                        {renderWidgetContent(widget)}
                      </SortableWidgetCard>
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeWidget ? (
                    isFromBank ? (
                      // Compact preview for bank widgets being dragged
                      <Card className="bank-widget-card drag-overlay" isCompact style={{ width: '250px' }}>
                        <CardBody>
                          <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                            <FlexItem>
                              <GripVerticalIcon />
                            </FlexItem>
                            <FlexItem>
                              <Title headingLevel="h4" size="md">{activeWidget.title}</Title>
                            </FlexItem>
                          </Flex>
                        </CardBody>
                      </Card>
                    ) : (
                      // Full preview for dashboard widgets being dragged
                      <div className="drag-overlay" style={{ 
                        width: `calc(${activeWidget.colSpan * 25}% - ${GAP}px)`,
                        height: (ROW_HEIGHT * activeWidget.rowSpan) + (GAP * (activeWidget.rowSpan - 1)),
                        minWidth: '280px',
                      }}>
                        {renderWidgetContent(activeWidget)}
                      </div>
                    )
                  ) : null}
                </DragOverlay>
              </div>
            </FlexItem>
          </DndContext>
          
          {/* Bottom Action Section */}
          <FlexItem>
            <div style={{ maxWidth: '1566px', margin: '0 auto', width: '100%' }}>
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <Button variant="secondary" onClick={() => navigate('/all-services')} size="lg">
                  Explore All Services
                </Button>
              </div>
            </div>
          </FlexItem>
        </Flex>
      </PageSection>
    </>
  );
};

export { Homepage };
