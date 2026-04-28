import * as React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Content,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Form,
  MenuToggle,
  PageSection,
  Spinner,
  Switch,
  FormGroup,
  HelperText,
  HelperTextItem,
  Tab,
  Tabs,
  TabTitleText,
  TextInput,
  Title,
  Tooltip
} from '@patternfly/react-core';
import {
  CheckCircleIcon,
  CheckIcon,
  CodeIcon,
  EllipsisVIcon,
  HomeIcon,
  OutlinedCloneIcon,
  OutlinedTrashAltIcon,
  PencilAltIcon,
  PlusCircleIcon,
  ShareAltIcon,
  TimesCircleIcon,
  TimesIcon
} from '@patternfly/react-icons';
import { AddWidgetsDrawer } from '@app/Homepage/AddWidgetsDrawer';
import { setDashboardBankBridgeState } from '@app/Homepage/dashboardBankBridge';
import { createHomepageWidgetClones } from '@app/Homepage/homepageWidgetCatalog';
import {
  GAP,
  ReadOnlyHomepageWidgetFrame,
  renderHomepageWidgetContent,
  ROW_HEIGHT,
  SortableWidgetCard,
  WIDGET_GRID_STYLES
} from '@app/Homepage/homepageWidgetGrid';
import type { ColumnSpan, RowSpan, Widget } from '@app/Homepage/widgetTypes';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useDashboardData } from '@app/DashboardHub/DashboardDataContext';
import {
  CONSOLE_DEFAULT_BODY_TITLE,
  getConsoleDefaultWidgets,
  isConsoleDefaultHubRow
} from '@app/DashboardHub/consoleDefaultDashboard';
import { DASHBOARD_DUPLICATE_NAME_ERROR } from '@app/DashboardHub/dashboardHubMockData';
import {
  mergeCanvasWidgetsWithCatalog,
  readDashboardCanvasWidgets,
  resolveDashboardCanvasWidgets,
  writeDashboardCanvasWidgets
} from '@app/DashboardHub/dashboardCanvasStorage';
import { DeleteDashboardModal } from '@app/DashboardHub/DeleteDashboardModal';
import { DuplicateDashboardModal } from '@app/DashboardHub/DuplicateDashboardModal';
import { ShareDashboardModal } from '@app/DashboardHub/ShareDashboardModal';

type PersistIndicator = 'saved' | 'saving';

interface EditableDashboardCanvasProps {
  /** Persisted in-canvas hero title (usually matched `name` at creation, then independent). */
  canvasTitle: string;
  /** Used when the user saves an empty trimmed value (e.g. dashboard name as safe default). */
  titleFallback: string;
  onCanvasTitleCommit: (title: string) => void;
  canvasWidgets: Widget[];
  onOpenAddWidgets: () => void;
  onSizeChange: (id: string, colSpan: ColumnSpan, rowSpan: RowSpan) => void;
  onRemoveWidget: (id: string) => void;
  onReorder: (next: Widget[]) => void;
  /** Built-in console default: show widgets without drag, resize, or title edit. */
  readOnly?: boolean;
}

const EditableDashboardCanvas: React.FC<EditableDashboardCanvasProps> = ({
  canvasTitle,
  titleFallback,
  onCanvasTitleCommit,
  canvasWidgets,
  onOpenAddWidgets,
  onSizeChange,
  onRemoveWidget,
  onReorder,
  readOnly = false
}) => {
  const navigate = useNavigate();
  const gridRef = React.useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = React.useState(1200);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  React.useEffect(() => {
    const el = gridRef.current;
    if (!el) {
      return;
    }
    const update = () => setGridWidth(el.offsetWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [canvasWidgets.length]);

  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (over && active.id !== over.id) {
        const overId = String(over.id);
        onReorder(
          arrayMove(
            canvasWidgets,
            canvasWidgets.findIndex((w) => w.id === active.id),
            canvasWidgets.findIndex((w) => w.id === overId)
          )
        );
      }
    },
    [canvasWidgets, onReorder]
  );

  const activeWidget = React.useMemo(
    () => (activeId ? canvasWidgets.find((w) => w.id === activeId) : null),
    [activeId, canvasWidgets]
  );

  const [isEditingSectionTitle, setIsEditingSectionTitle] = React.useState(false);
  const [draftSectionTitle, setDraftSectionTitle] = React.useState(() => canvasTitle);
  const sectionTitleEditorRef = React.useRef<HTMLDivElement>(null);
  const sectionTitleInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isEditingSectionTitle) {
      setDraftSectionTitle(canvasTitle);
    }
  }, [canvasTitle, isEditingSectionTitle]);

  const applySectionTitle = React.useCallback(() => {
    const next = draftSectionTitle.trim() || titleFallback;
    onCanvasTitleCommit(next);
    setIsEditingSectionTitle(false);
  }, [draftSectionTitle, titleFallback, onCanvasTitleCommit]);

  const cancelSectionTitle = React.useCallback(() => {
    setDraftSectionTitle(canvasTitle);
    setIsEditingSectionTitle(false);
  }, [canvasTitle]);

  const handleSectionTitleEditorBlur = React.useCallback(() => {
    window.setTimeout(() => {
      if (!sectionTitleEditorRef.current?.contains(document.activeElement)) {
        setDraftSectionTitle(canvasTitle);
        setIsEditingSectionTitle(false);
      }
    }, 0);
  }, [canvasTitle]);

  const startEditSectionTitle = React.useCallback(() => {
    setDraftSectionTitle(canvasTitle);
    setIsEditingSectionTitle(true);
  }, [canvasTitle]);

  React.useEffect(() => {
    if (isEditingSectionTitle) {
      sectionTitleInputRef.current?.focus();
      sectionTitleInputRef.current?.select();
    }
  }, [isEditingSectionTitle]);

  return (
    <Card
      isFullHeight
      style={{
        minHeight: 'min(72vh, 720px)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}
    >
      <CardHeader>
        {readOnly ? (
          <Title headingLevel="h1" size="2xl">
            {canvasTitle}
          </Title>
        ) : !isEditingSectionTitle ? (
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            flexWrap={{ default: 'wrap' }}
            style={{ minWidth: 0, width: '100%' }}
          >
            <FlexItem style={{ minWidth: 0 }}>
              <Title headingLevel="h1" size="2xl">
                {canvasTitle}
              </Title>
            </FlexItem>
            <FlexItem>
              <Button
                variant="plain"
                type="button"
                aria-label="Edit canvas title"
                onClick={startEditSectionTitle}
                icon={<PencilAltIcon />}
              />
            </FlexItem>
          </Flex>
        ) : (
          <div
            ref={sectionTitleEditorRef}
            onBlur={handleSectionTitleEditorBlur}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 'var(--pf-t--global--spacer--xs)',
              minWidth: 0,
              width: '100%',
              maxWidth: '100%'
            }}
          >
            <TextInput
              ref={sectionTitleInputRef}
              id="dashboard-canvas-section-title-input"
              type="text"
              value={draftSectionTitle}
              onChange={(_event, value) => setDraftSectionTitle(value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applySectionTitle();
                }
              }}
              aria-label="Canvas title"
              style={{
                minWidth: 0,
                flex: '1 1 12rem',
                maxWidth: 'min(24rem, 100%)'
              }}
            />
            <Button
              variant="plain"
              type="button"
              aria-label="Apply canvas title"
              onMouseDown={(e) => e.preventDefault()}
              onClick={applySectionTitle}
              icon={<CheckIcon />}
            />
            <Button
              variant="plain"
              type="button"
              aria-label="Cancel canvas title edit"
              onMouseDown={(e) => e.preventDefault()}
              onClick={cancelSectionTitle}
              icon={<TimesIcon />}
            />
          </div>
        )}
      </CardHeader>
      <CardBody style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'min(56vh, 560px)',
            justifyContent: canvasWidgets.length === 0 ? 'flex-start' : undefined
          }}
        >
          {readOnly ? (
            canvasWidgets.length === 0 ? (
              <EmptyState
                variant={EmptyStateVariant.full}
                headingLevel="h2"
                titleText="No widgets"
                icon={PlusCircleIcon}
              >
                <EmptyStateBody>This dashboard does not display any widgets.</EmptyStateBody>
              </EmptyState>
            ) : (
              <>
                <style>{WIDGET_GRID_STYLES}</style>
                <div
                  className="widgets-grid homepage-readonly-grid"
                  style={{ width: '100%', minWidth: 0 }}
                  aria-label="Dashboard widgets (read-only)"
                >
                  {canvasWidgets.map((widget) => (
                    <ReadOnlyHomepageWidgetFrame key={widget.id} widget={widget}>
                      {renderHomepageWidgetContent(widget, {
                        navigate,
                        readOnly: true
                      })}
                    </ReadOnlyHomepageWidgetFrame>
                  ))}
                </div>
              </>
            )
          ) : canvasWidgets.length === 0 ? (
            <EmptyState
              variant={EmptyStateVariant.full}
              headingLevel="h2"
              titleText="No widgets yet"
              icon={PlusCircleIcon}
            >
              <EmptyStateBody>
                Add widgets to your dashboard to monitor and take action on the things that are most important to you.
              </EmptyStateBody>
              <EmptyStateFooter>
                <Button variant="primary" icon={<PlusCircleIcon />} onClick={onOpenAddWidgets}>
                  Add widgets
                </Button>
              </EmptyStateFooter>
            </EmptyState>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <style>{WIDGET_GRID_STYLES}</style>
              <div ref={gridRef} style={{ width: '100%', minWidth: 0 }}>
                <SortableContext items={canvasWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
                  <div className="widgets-grid">
                    {canvasWidgets.map((widget) => (
                      <SortableWidgetCard
                        key={widget.id}
                        widget={widget}
                        onSizeChange={onSizeChange}
                        onRemove={onRemoveWidget}
                        gridWidth={gridWidth}
                      >
                        {renderHomepageWidgetContent(widget, { navigate })}
                      </SortableWidgetCard>
                    ))}
                  </div>
                </SortableContext>
                <DragOverlay>
                  {activeWidget ? (
                    <div
                      className="drag-overlay"
                      style={{
                        width: `calc(${activeWidget.colSpan * 25}% - ${GAP}px)`,
                        height: (ROW_HEIGHT * activeWidget.rowSpan) + (GAP * (activeWidget.rowSpan - 1)),
                        minWidth: '280px'
                      }}
                    >
                      {renderHomepageWidgetContent(activeWidget, { navigate })}
                    </div>
                  ) : null}
                </DragOverlay>
              </div>
            </DndContext>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * Shell for editing a single dashboard. Wire layout, save, widgets, etc. per product spec.
 */
type DashboardLocationState = { openShare?: boolean } | null;

const EditableDashboard: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const {
    rows,
    updateDashboardName,
    updateDashboardDescription,
    updateCanvasTitle,
    isDashboardNameTaken,
    setDashboardAsHomepage,
    removeDashboard
  } = useDashboardData();
  const dashboard = dashboardId ? rows.find((r) => r.id === dashboardId) : undefined;
  const isConsoleDefault = Boolean(dashboard && isConsoleDefaultHubRow(dashboard));
  const homepageRow = React.useMemo(() => rows.find((r) => r.isHomepage), [rows]);
  const currentHomepageLabel = homepageRow
    ? (homepageRow.canvasTitle ?? homepageRow.name)
    : 'None';
  const breadcrumbLabel = dashboard?.name ?? 'Dashboard';
  const resolvedCanvasTitle = dashboard ? dashboard.canvasTitle ?? dashboard.name : '';
  const canvasSectionTitle = isConsoleDefault ? CONSOLE_DEFAULT_BODY_TITLE : resolvedCanvasTitle;

  const [autosaveEnabled, setAutosaveEnabled] = React.useState(true);
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    const s = (location.state ?? null) as DashboardLocationState;
    if (!s?.openShare) {
      return;
    }
    navigate(location.pathname, { replace: true, state: null });
    if (dashboard) {
      setIsShareModalOpen(true);
    }
  }, [dashboard, location.pathname, location.state, navigate]);

  const [localName, setLocalName] = React.useState('');
  const [localDescription, setLocalDescription] = React.useState('');
  const [isNameFieldFocused, setIsNameFieldFocused] = React.useState(false);
  const [isDescriptionFieldFocused, setIsDescriptionFieldFocused] = React.useState(false);
  const [persistIndicator, setPersistIndicator] = React.useState<PersistIndicator>('saved');
  const savingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const nameEditorRef = React.useRef<HTMLDivElement>(null);
  const descriptionInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionFieldWrapRef = React.useRef<HTMLDivElement>(null);
  const [isDescriptionTruncated, setIsDescriptionTruncated] = React.useState(false);

  const [isWidgetDrawerOpen, setIsWidgetDrawerOpen] = React.useState(false);
  /** Unified grey behind toolbar + widget bank (inline styles avoid PF cascade hiding app.css). */
  const isAddWidgetsDrawerChromeOpen = !isConsoleDefault && isWidgetDrawerOpen;
  const [removedWidgets, setRemovedWidgets] = React.useState<Widget[]>(() => createHomepageWidgetClones());
  const [canvasWidgets, setCanvasWidgets] = React.useState<Widget[]>([]);

  React.useEffect(() => {
    if (dashboard) {
      setLocalName(dashboard.name);
      setLocalDescription(dashboard.description ?? '');
    }
  }, [dashboard?.id, dashboard?.name, dashboard?.description]);

  const measureDescriptionTruncation = React.useCallback(() => {
    const el = descriptionInputRef.current;
    if (!el || !localDescription.trim()) {
      setIsDescriptionTruncated(false);
      return;
    }
    setIsDescriptionTruncated(Math.ceil(el.scrollWidth) > Math.floor(el.clientWidth));
  }, [localDescription]);

  React.useLayoutEffect(() => {
    measureDescriptionTruncation();
  }, [measureDescriptionTruncation]);

  React.useEffect(() => {
    const wrap = descriptionFieldWrapRef.current;
    if (!wrap) {
      return;
    }
    const ro = new ResizeObserver(() => {
      measureDescriptionTruncation();
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [measureDescriptionTruncation]);

  /** Load per-dashboard widget layout (session storage) before paint; keeps hub ↔ homepage in sync. */
  React.useLayoutEffect(() => {
    if (!dashboardId) {
      return;
    }
    const all = createHomepageWidgetClones();
    if (isConsoleDefault && dashboard) {
      const merged = mergeCanvasWidgetsWithCatalog(getConsoleDefaultWidgets(), all);
      setCanvasWidgets(merged);
      const onCanvas = new Set(merged.map((w) => w.id));
      setRemovedWidgets(all.filter((w) => !onCanvas.has(w.id)));
      skipNextCanvasPersist.current = true;
      return;
    }
    const stored = readDashboardCanvasWidgets(dashboardId);
    if (stored && stored.length > 0) {
      const merged = mergeCanvasWidgetsWithCatalog(stored, all);
      setCanvasWidgets(merged);
      const onCanvas = new Set(merged.map((w) => w.id));
      setRemovedWidgets(all.filter((w) => !onCanvas.has(w.id)));
    } else {
      setCanvasWidgets([]);
      setRemovedWidgets(all);
    }
    skipNextCanvasPersist.current = true;
  }, [isConsoleDefault, dashboardId, dashboard]);

  const skipNextCanvasPersist = React.useRef(false);

  /** Persist layout so the console home can show a read-only replica. */
  React.useEffect(() => {
    if (!dashboardId || isConsoleDefault) {
      if (isConsoleDefault) {
        skipNextCanvasPersist.current = true;
      }
      return;
    }
    if (skipNextCanvasPersist.current) {
      skipNextCanvasPersist.current = false;
      return;
    }
    writeDashboardCanvasWidgets(dashboardId, canvasWidgets);
  }, [dashboardId, isConsoleDefault, canvasWidgets]);

  React.useEffect(
    () => () => {
      if (savingTimerRef.current) {
        clearTimeout(savingTimerRef.current);
      }
    },
    []
  );

  const isDirty = dashboard
    ? localName !== dashboard.name ||
      localDescription.trim() !== (dashboard.description ?? '').trim()
    : false;

  const toolbarNameIsDuplicate = Boolean(
    dashboard && localName.trim() && isDashboardNameTaken(localName, dashboard.id)
  );

  const runAutosavePersistFlow = React.useCallback(() => {
    setPersistIndicator('saving');
    if (savingTimerRef.current) {
      clearTimeout(savingTimerRef.current);
    }
    savingTimerRef.current = setTimeout(() => {
      setPersistIndicator('saved');
      savingTimerRef.current = null;
    }, 650);
  }, []);

  const applyNameChange = React.useCallback(() => {
    if (!dashboard) {
      return;
    }
    const next = localName.trim();
    if (!next) {
      return;
    }
    if (isDashboardNameTaken(next, dashboard.id)) {
      return;
    }
    updateDashboardName(dashboard.id, next);
    if (autosaveEnabled) {
      runAutosavePersistFlow();
    }
    setIsNameFieldFocused(false);
  }, [dashboard, localName, isDashboardNameTaken, updateDashboardName, autosaveEnabled, runAutosavePersistFlow]);

  const applyDescriptionIfDirty = React.useCallback(() => {
    if (!dashboard || isConsoleDefault) {
      return;
    }
    const next = localDescription.trim();
    const current = (dashboard.description ?? '').trim();
    if (next === current) {
      return;
    }
    updateDashboardDescription(dashboard.id, next);
    if (autosaveEnabled) {
      runAutosavePersistFlow();
    }
  }, [
    autosaveEnabled,
    dashboard,
    isConsoleDefault,
    localDescription,
    runAutosavePersistFlow,
    updateDashboardDescription
  ]);

  const applyDescriptionChange = React.useCallback(() => {
    applyDescriptionIfDirty();
    setIsDescriptionFieldFocused(false);
  }, [applyDescriptionIfDirty]);

  const handleDescriptionBlur = React.useCallback(() => {
    if (!dashboard || isConsoleDefault || !autosaveEnabled) {
      return;
    }
    const next = localDescription.trim();
    const current = (dashboard.description ?? '').trim();
    if (next === current) {
      return;
    }
    updateDashboardDescription(dashboard.id, next);
    runAutosavePersistFlow();
  }, [
    autosaveEnabled,
    dashboard,
    isConsoleDefault,
    localDescription,
    runAutosavePersistFlow,
    updateDashboardDescription
  ]);

  const cancelNameChange = React.useCallback(() => {
    if (!dashboard) {
      return;
    }
    setLocalName(dashboard.name);
    setIsNameFieldFocused(false);
  }, [dashboard]);

  const cancelDescriptionChange = React.useCallback(() => {
    if (!dashboard) {
      return;
    }
    setLocalDescription(dashboard.description ?? '');
    setIsDescriptionFieldFocused(false);
  }, [dashboard]);

  const handleNameEditorBlur = React.useCallback(() => {
    window.setTimeout(() => {
      if (!nameEditorRef.current?.contains(document.activeElement)) {
        setIsNameFieldFocused(false);
        setIsDescriptionFieldFocused(false);
        if (autosaveEnabled) {
          if (dashboard) {
            setLocalName(dashboard.name);
            setLocalDescription(dashboard.description ?? '');
          }
        }
      }
    }, 0);
  }, [autosaveEnabled, dashboard]);

  const handleSaveManual = React.useCallback(() => {
    applyNameChange();
    applyDescriptionIfDirty();
  }, [applyDescriptionIfDirty, applyNameChange]);

  const handleCancelManual = React.useCallback(() => {
    cancelNameChange();
    if (dashboard) {
      setLocalDescription(dashboard.description ?? '');
    }
  }, [cancelNameChange, dashboard]);

  const handleAddWidgetFromBank = React.useCallback((widget: Widget) => {
    setRemovedWidgets((prev) => prev.filter((w) => w.id !== widget.id));
    setCanvasWidgets((prev) => (prev.some((w) => w.id === widget.id) ? prev : [...prev, widget]));
  }, []);

  React.useEffect(() => {
    if (!dashboardId) {
      setDashboardBankBridgeState(null);
      return;
    }
    setDashboardBankBridgeState({
      canvasWidgetIds: new Set(canvasWidgets.map((w) => w.id)),
      addWidgetToDashboard: handleAddWidgetFromBank,
      canAddWidgets: !isConsoleDefault,
    });
  }, [dashboardId, canvasWidgets, handleAddWidgetFromBank, isConsoleDefault]);

  React.useEffect(
    () => () => {
      setDashboardBankBridgeState(null);
    },
    []
  );

  const handleCanvasSizeChange = React.useCallback((id: string, colSpan: ColumnSpan, rowSpan: RowSpan) => {
    setCanvasWidgets((prev) => prev.map((w) => (w.id === id ? { ...w, colSpan, rowSpan } : w)));
  }, []);

  const handleRemoveFromCanvas = React.useCallback(
    (widgetId: string) => {
      const w = canvasWidgets.find((x) => x.id === widgetId);
      if (w) {
        setCanvasWidgets((prev) => prev.filter((x) => x.id !== widgetId));
        setRemovedWidgets((prev) => [...prev, w]);
      }
    },
    [canvasWidgets]
  );

  const handleCanvasReorder = React.useCallback((next: Widget[]) => {
    setCanvasWidgets(next);
  }, []);

  const toggleWidgetDrawer = React.useCallback(() => {
    if (isConsoleDefault) {
      return;
    }
    setIsWidgetDrawerOpen((open) => !open);
  }, [isConsoleDefault]);

  const handleCopyConfigurationString = React.useCallback(() => {
    if (!dashboard) {
      return;
    }
    const raw = resolveDashboardCanvasWidgets(dashboard);
    const payload = { dashboardId: dashboard.id, name: dashboard.name, widgets: raw ?? [] };
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setIsKebabOpen(false);
  }, [dashboard]);

  const handleKebabDuplicate = React.useCallback(() => {
    if (!dashboard) {
      return;
    }
    setIsKebabOpen(false);
    setIsDuplicateModalOpen(true);
  }, [dashboard]);

  const handleDuplicateModalSuccess = React.useCallback(
    (newId: string) => {
      setIsDuplicateModalOpen(false);
      navigate(`/dashboard-hub/${newId}`);
    },
    [navigate]
  );

  const handleKebabDelete = React.useCallback(() => {
    if (!dashboard || isConsoleDefaultHubRow(dashboard)) {
      return;
    }
    setIsKebabOpen(false);
    setIsDeleteModalOpen(true);
  }, [dashboard]);

  const handleDeleteDashboardConfirm = React.useCallback(() => {
    if (!dashboard || isConsoleDefaultHubRow(dashboard)) {
      return;
    }
    removeDashboard(dashboard.id);
    setIsDeleteModalOpen(false);
    navigate('/dashboard-hub');
  }, [dashboard, navigate, removeDashboard]);

  const dashboardBody = dashboard ? (
    <>
        <PageSection
          hasBodyWrapper={false}
          className="hcc-editable-dashboard-toolbar-section"
          style={{
            paddingTop: 0,
            paddingBottom: isAddWidgetsDrawerChromeOpen ? 0 : undefined,
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              boxSizing: 'border-box'
            }}
          >
          <div
            role="toolbar"
            aria-label="Dashboard editor"
            className="editable-dashboard-toolbar"
          >
            <div className="editable-dashboard-toolbar__meta">
              <div
                ref={nameEditorRef}
                className="editable-dashboard-meta-editor"
                onBlur={handleNameEditorBlur}
              >
                <div className="editable-dashboard-name-editor">
                  <Form
                    className="editable-dashboard-toolbar-meta-form editable-dashboard-name-group"
                    onSubmit={(event) => event.preventDefault()}
                  >
                    <div className="editable-dashboard-toolbar-field editable-dashboard-toolbar-field--name">
                      <div className="editable-dashboard-toolbar-field__row">
                        <div className="editable-dashboard-name-input-wrap">
                    <FormGroup
                      fieldId="dashboard-name-input"
                      label="Name"
                      className="editable-dashboard-toolbar-form-group"
                    >
                      <div
                        className={
                          dashboard.isHomepage
                            ? 'editable-dashboard-name-input-inner editable-dashboard-name-input-inner--home'
                            : 'editable-dashboard-name-input-inner'
                        }
                      >
                        {dashboard.isHomepage ? (
                          <span
                            className="editable-dashboard-name-input__home-icon"
                            title="Console homepage"
                            aria-hidden
                          >
                            <HomeIcon />
                          </span>
                        ) : null}
                        <TextInput
                          className={
                            isConsoleDefault
                              ? 'editable-dashboard-name-input editable-dashboard-name-input--non-interactive'
                              : 'editable-dashboard-name-input'
                          }
                          id="dashboard-name-input"
                          type="text"
                          value={localName}
                          readOnlyVariant={isConsoleDefault ? 'default' : undefined}
                          tabIndex={isConsoleDefault ? -1 : undefined}
                          onMouseDown={
                            isConsoleDefault
                              ? (e: React.MouseEvent<HTMLInputElement>) => {
                                  e.preventDefault();
                                }
                              : undefined
                          }
                          onChange={(_event, value) => setLocalName(value)}
                          onFocus={() => {
                            if (!isConsoleDefault) {
                              setIsNameFieldFocused(true);
                              setIsDescriptionFieldFocused(false);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key !== 'Enter') {
                              return;
                            }
                            e.preventDefault();
                            if (!dashboard) {
                              return;
                            }
                            if (!localName.trim() || localName.trim() === dashboard.name) {
                              return;
                            }
                            if (isDashboardNameTaken(localName, dashboard.id)) {
                              return;
                            }
                            applyNameChange();
                          }}
                          validated={toolbarNameIsDuplicate ? 'error' : 'default'}
                          aria-describedby={
                            toolbarNameIsDuplicate ? 'dashboard-name-duplicate-error' : undefined
                          }
                        />
                      </div>
                    </FormGroup>
                        </div>
                        {!isConsoleDefault && isNameFieldFocused && (
                          <span className="editable-dashboard-meta-inline-actions">
                            <Button
                              variant="plain"
                              type="button"
                              aria-label="Apply dashboard name"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={applyNameChange}
                              isDisabled={
                                !localName.trim() ||
                                localName.trim() === dashboard.name ||
                                toolbarNameIsDuplicate
                              }
                            >
                              <CheckIcon />
                            </Button>
                            <Button
                              variant="plain"
                              type="button"
                              aria-label="Cancel dashboard name edit"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={cancelNameChange}
                            >
                              <TimesIcon />
                            </Button>
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      ref={descriptionFieldWrapRef}
                      className="editable-dashboard-toolbar-field editable-dashboard-toolbar-field--description"
                    >
                      <div className="editable-dashboard-toolbar-field__row">
                        <div className="editable-dashboard-description-input-wrap">
                      <FormGroup
                        fieldId="dashboard-description-input"
                        label="Description"
                        className="editable-dashboard-toolbar-form-group"
                      >
                      <TextInput
                        ref={descriptionInputRef}
                        id="dashboard-description-input"
                        type="text"
                        value={localDescription}
                        onChange={(_event, value) => setLocalDescription(value)}
                        onFocus={() => {
                          if (!isConsoleDefault) {
                            setIsDescriptionFieldFocused(true);
                            setIsNameFieldFocused(false);
                          }
                        }}
                        onBlur={handleDescriptionBlur}
                        onKeyDown={(e) => {
                          if (e.key !== 'Enter') {
                            return;
                          }
                          e.preventDefault();
                          if (!dashboard || isConsoleDefault) {
                            return;
                          }
                          const next = localDescription.trim();
                          const current = (dashboard.description ?? '').trim();
                          if (next === current) {
                            return;
                          }
                          applyDescriptionChange();
                        }}
                        onMouseDown={
                          isConsoleDefault
                            ? (e: React.MouseEvent<HTMLInputElement>) => {
                                e.preventDefault();
                              }
                            : undefined
                        }
                        maxLength={500}
                        readOnly={isConsoleDefault}
                        readOnlyVariant={isConsoleDefault ? 'default' : undefined}
                        tabIndex={isConsoleDefault ? -1 : undefined}
                        placeholder="(Optional) Short description of the dashboard"
                        className={
                          isConsoleDefault
                            ? 'editable-dashboard-description-input editable-dashboard-description-input--readonly'
                            : 'editable-dashboard-description-input'
                        }
                      />
                      </FormGroup>
                      {isDescriptionTruncated && localDescription.trim() ? (
                        <Tooltip
                          triggerRef={descriptionInputRef}
                          content={localDescription}
                          position="bottom"
                          aria="none"
                        />
                      ) : null}
                        </div>
                        {!isConsoleDefault && isDescriptionFieldFocused && (
                          <span className="editable-dashboard-meta-inline-actions">
                            <Button
                              variant="plain"
                              type="button"
                              aria-label="Apply dashboard description"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={applyDescriptionChange}
                              isDisabled={
                                localDescription.trim() === (dashboard.description ?? '').trim()
                              }
                            >
                              <CheckIcon />
                            </Button>
                            <Button
                              variant="plain"
                              type="button"
                              aria-label="Cancel dashboard description edit"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={cancelDescriptionChange}
                            >
                              <TimesIcon />
                            </Button>
                          </span>
                        )}
                      </div>
                    </div>
                  </Form>
                  {toolbarNameIsDuplicate && (
                    <HelperText isLiveRegion>
                      <HelperTextItem
                        id="dashboard-name-duplicate-error"
                        variant="error"
                        component="div"
                      >
                        {DASHBOARD_DUPLICATE_NAME_ERROR}
                      </HelperTextItem>
                    </HelperText>
                  )}
                </div>
              </div>
            </div>
            <div className="editable-dashboard-toolbar__actions">
              <Flex
                flexWrap={{ default: 'wrap' }}
                justifyContent={{ default: 'justifyContentFlexEnd' }}
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsMd' }}
                style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
              >
                  {!isConsoleDefault && !autosaveEnabled && (
                    <>
                      <FlexItem>
                        <Button variant="secondary" onClick={handleSaveManual} isDisabled={!isDirty}>
                          Save
                        </Button>
                      </FlexItem>
                      <FlexItem>
                        <Button variant="link" onClick={handleCancelManual} isDisabled={!isDirty}>
                          Cancel
                        </Button>
                      </FlexItem>
                    </>
                  )}
                  {autosaveEnabled && (
                    <FlexItem>
                      <Flex
                        spaceItems={{ default: 'spaceItemsSm' }}
                        alignItems={{ default: 'alignItemsCenter' }}
                        style={{ minHeight: '32px' }}
                      >
                        {persistIndicator === 'saving' ? (
                          <>
                            <Spinner size="sm" aria-label="Saving" />
                            <span
                              style={{
                                color: 'var(--pf-t--global--text--color--subtle)',
                                fontSize: 'var(--pf-t--global--font--size--body--default)'
                              }}
                            >
                              Saving ...
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon
                              style={{
                                color: 'var(--pf-t--global--text--color--subtle)',
                                fontSize: '1rem'
                              }}
                              aria-hidden
                            />
                            <span
                              style={{
                                color: 'var(--pf-t--global--text--color--subtle)',
                                fontSize: 'var(--pf-t--global--font--size--body--default)'
                              }}
                            >
                              Saved
                            </span>
                          </>
                        )}
                      </Flex>
                    </FlexItem>
                  )}
                  <FlexItem>
                    <Switch
                      id={`dashboard-autosave-${dashboard.id}`}
                      label="Autosave"
                      isChecked={autosaveEnabled}
                      isDisabled={isConsoleDefault}
                      onChange={(_event, checked) => setAutosaveEnabled(checked)}
                    />
                  </FlexItem>
                  <FlexItem>
                    <Button
                      variant="plain"
                      className="editable-dashboard-toolbar-plain-icon-action"
                      onClick={() => setIsShareModalOpen(true)}
                    >
                      <span className="editable-dashboard-toolbar-icon-label__inner">
                        <span className="editable-dashboard-toolbar-icon-label__icon" aria-hidden>
                          <ShareAltIcon />
                        </span>
                        <span className="editable-dashboard-toolbar-icon-label__label">Share</span>
                      </span>
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    {isWidgetDrawerOpen ? (
                      <Tabs
                        id={`editable-dashboard-widget-tabs-${dashboard.id}`}
                        aria-label={
                          isConsoleDefault
                            ? 'Widgets unavailable on Console default dashboard'
                            : 'Close widget panel'
                        }
                        isBox
                        variant="secondary"
                        activeKey="widgets-panel"
                        onSelect={() => {
                          if (!isConsoleDefault) {
                            toggleWidgetDrawer();
                          }
                        }}
                        hasNoBorderBottom
                        className="editable-dashboard-widget-panel-tabs"
                      >
                        <Tab
                          eventKey="widgets-panel"
                          isDisabled={isConsoleDefault}
                          title={
                            <TabTitleText>
                              <span className="editable-dashboard-toolbar-icon-label__inner">
                                <span className="editable-dashboard-toolbar-icon-label__icon" aria-hidden>
                                  <TimesCircleIcon />
                                </span>
                                <span className="editable-dashboard-toolbar-icon-label__label">Close</span>
                              </span>
                            </TabTitleText>
                          }
                        />
                      </Tabs>
                    ) : (
                      <Button
                        variant="plain"
                        className="editable-dashboard-toolbar-plain-icon-action"
                        onClick={toggleWidgetDrawer}
                        isDisabled={isConsoleDefault}
                        title={
                          isConsoleDefault
                            ? 'Widgets cannot be added to the built-in Console default dashboard.'
                            : undefined
                        }
                      >
                        <span className="editable-dashboard-toolbar-icon-label__inner">
                          <span className="editable-dashboard-toolbar-icon-label__icon" aria-hidden>
                            <PlusCircleIcon />
                          </span>
                          <span className="editable-dashboard-toolbar-icon-label__label">Add widgets</span>
                        </span>
                      </Button>
                    )}
                  </FlexItem>
                  <FlexItem>
                    <Dropdown
                      isOpen={isKebabOpen}
                      onSelect={() => setIsKebabOpen(false)}
                      onOpenChange={setIsKebabOpen}
                      popperProps={{ position: 'right' }}
                      toggle={(toggleRef) => (
                        <MenuToggle
                          ref={toggleRef}
                          aria-label="Dashboard actions"
                          variant="plain"
                          isExpanded={isKebabOpen}
                          onClick={() => setIsKebabOpen(!isKebabOpen)}
                        >
                          <EllipsisVIcon />
                        </MenuToggle>
                      )}
                      shouldFocusToggleOnSelect
                    >
                      <DropdownList>
                        <DropdownItem
                          isDisabled={Boolean(dashboard.isHomepage)}
                          description={`Current: ${currentHomepageLabel}`}
                          onClick={() => {
                            setDashboardAsHomepage(dashboard.id);
                            setIsKebabOpen(false);
                          }}
                        >
                          <span
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <HomeIcon style={{ color: 'var(--pf-t--global--icon--Color--200)' }} />
                            Set as homepage
                          </span>
                        </DropdownItem>
                        <DropdownItem onClick={handleCopyConfigurationString}>
                          <span
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <CodeIcon style={{ color: 'var(--pf-t--global--icon--Color--200)' }} />
                            Copy configuration string
                          </span>
                        </DropdownItem>
                        <DropdownItem onClick={handleKebabDuplicate}>
                          <span
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <OutlinedCloneIcon style={{ color: 'var(--pf-t--global--icon--Color--200)' }} />
                            Duplicate dashboard
                          </span>
                        </DropdownItem>
                        <Divider component="li" role="separator" />
                        <DropdownItem
                          isDanger={!isConsoleDefault}
                          isDisabled={isConsoleDefault}
                          onClick={handleKebabDelete}
                        >
                          <span
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <OutlinedTrashAltIcon
                              style={{
                                color: isConsoleDefault
                                  ? 'var(--pf-t--global--icon--Color--200)'
                                  : 'var(--pf-t--global--danger-color--200)'
                              }}
                            />
                            Delete dashboard
                          </span>
                        </DropdownItem>
                      </DropdownList>
                    </Dropdown>
                  </FlexItem>
                </Flex>
            </div>
          </div>

          {!isConsoleDefault && (
            <AddWidgetsDrawer
              isOpen={isWidgetDrawerOpen}
              removedWidgets={removedWidgets}
              onAddWidget={handleAddWidgetFromBank}
            />
          )}
          </div>
        </PageSection>

        <PageSection
          className="hcc-editable-dashboard-canvas-section"
          style={
            isAddWidgetsDrawerChromeOpen
              ? { paddingTop: 'var(--pf-t--global--spacer--sm)' }
              : undefined
          }
        >
          <EditableDashboardCanvas
            key={dashboard.id}
            canvasTitle={canvasSectionTitle}
            titleFallback={dashboard.name}
            onCanvasTitleCommit={(title) => updateCanvasTitle(dashboard.id, title)}
            canvasWidgets={canvasWidgets}
            onOpenAddWidgets={() => setIsWidgetDrawerOpen(true)}
            onSizeChange={handleCanvasSizeChange}
            onRemoveWidget={handleRemoveFromCanvas}
            onReorder={handleCanvasReorder}
            readOnly={isConsoleDefault}
          />
        </PageSection>
    </>
  ) : null;

  return (
    <div
      className="editable-dashboard-page"
      data-widget-drawer-open={isAddWidgetsDrawerChromeOpen ? '' : undefined}
    >
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb>
          <BreadcrumbItem to="/">Home</BreadcrumbItem>
          <BreadcrumbItem to="/dashboard-hub">Dashboard Hub</BreadcrumbItem>
          <BreadcrumbItem isActive>{breadcrumbLabel}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      {isConsoleDefault ? (
        <PageSection hasBodyWrapper={false}>
          <Alert
            variant="info"
            isInline
            isPlain
            title="The 'Console-default' dashboard is a system maintained dashboard and you cannot edit it. You may duplicate it, copy its config string, and share it though."
          />
        </PageSection>
      ) : null}

      {dashboardBody}

      {!dashboard && (
        <PageSection>
          <Title headingLevel="h1" size="2xl">
            {breadcrumbLabel}
          </Title>
          <Content style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
            <p style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
              Unknown dashboard id: <strong>{dashboardId}</strong>.{' '}
              <Link to="/dashboard-hub">Back to Dashboard Hub</Link>
            </p>
          </Content>
        </PageSection>
      )}

      {dashboard ? (
        <>
          <DuplicateDashboardModal
            isOpen={isDuplicateModalOpen}
            onClose={() => setIsDuplicateModalOpen(false)}
            rows={rows}
            initialSourceId={dashboard.id}
            initialSetAsHomepage={false}
            onSuccess={handleDuplicateModalSuccess}
          />
          <DeleteDashboardModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            dashboardName={dashboard.name}
            onConfirm={handleDeleteDashboardConfirm}
          />
          <ShareDashboardModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            dashboardId={dashboard.id}
            dashboardName={dashboard.name}
          />
        </>
      ) : null}
    </div>
  );
};

export { EditableDashboard };
