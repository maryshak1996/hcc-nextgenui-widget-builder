import * as React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
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
  MenuToggle,
  PageSection,
  Spinner,
  Switch,
  HelperText,
  HelperTextItem,
  TextInput,
  Title
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
  TimesIcon
} from '@patternfly/react-icons';
import { AddWidgetsDrawer } from '@app/Homepage/AddWidgetsDrawer';
import { createHomepageWidgetClones } from '@app/Homepage/homepageWidgetCatalog';
import {
  GAP,
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
import { DASHBOARD_DUPLICATE_NAME_ERROR } from '@app/DashboardHub/dashboardHubMockData';
import {
  mergeCanvasWidgetsWithCatalog,
  readDashboardCanvasWidgets,
  writeDashboardCanvasWidgets
} from '@app/DashboardHub/dashboardCanvasStorage';

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
}

const EditableDashboardCanvas: React.FC<EditableDashboardCanvasProps> = ({
  canvasTitle,
  titleFallback,
  onCanvasTitleCommit,
  canvasWidgets,
  onOpenAddWidgets,
  onSizeChange,
  onRemoveWidget,
  onReorder
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
        {!isEditingSectionTitle ? (
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
          {canvasWidgets.length === 0 ? (
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
const EditableDashboard: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const {
    rows,
    updateDashboardName,
    updateCanvasTitle,
    isDashboardNameTaken,
    setDashboardAsHomepage,
    removeDashboard,
    duplicateDashboard
  } = useDashboardData();
  const dashboard = dashboardId ? rows.find((r) => r.id === dashboardId) : undefined;
  const homepageRow = React.useMemo(() => rows.find((r) => r.isHomepage), [rows]);
  const currentHomepageLabel = homepageRow
    ? (homepageRow.canvasTitle ?? homepageRow.name)
    : 'None';
  const breadcrumbLabel = dashboard?.name ?? 'Dashboard';
  const resolvedCanvasTitle = dashboard ? dashboard.canvasTitle ?? dashboard.name : '';

  const [autosaveEnabled, setAutosaveEnabled] = React.useState(true);
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);

  const [localName, setLocalName] = React.useState('');
  const [isNameFieldFocused, setIsNameFieldFocused] = React.useState(false);
  const [persistIndicator, setPersistIndicator] = React.useState<PersistIndicator>('saved');
  const savingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const nameEditorRef = React.useRef<HTMLDivElement>(null);

  const [isWidgetDrawerOpen, setIsWidgetDrawerOpen] = React.useState(false);
  const [removedWidgets, setRemovedWidgets] = React.useState<Widget[]>(() => createHomepageWidgetClones());
  const [canvasWidgets, setCanvasWidgets] = React.useState<Widget[]>([]);

  React.useEffect(() => {
    if (dashboard) {
      setLocalName(dashboard.name);
    }
  }, [dashboard?.id, dashboard?.name]);

  /** Load per-dashboard widget layout (session storage) before paint; keeps hub ↔ homepage in sync. */
  React.useLayoutEffect(() => {
    if (!dashboardId) {
      return;
    }
    const all = createHomepageWidgetClones();
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
  }, [dashboardId]);

  const skipNextCanvasPersist = React.useRef(false);

  /** Persist layout so the console home can show a read-only replica. */
  React.useEffect(() => {
    if (!dashboardId) {
      return;
    }
    if (skipNextCanvasPersist.current) {
      skipNextCanvasPersist.current = false;
      return;
    }
    writeDashboardCanvasWidgets(dashboardId, canvasWidgets);
  }, [dashboardId, canvasWidgets]);

  React.useEffect(
    () => () => {
      if (savingTimerRef.current) {
        clearTimeout(savingTimerRef.current);
      }
    },
    []
  );

  const isDirty = dashboard ? localName !== dashboard.name : false;

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

  const cancelNameChange = React.useCallback(() => {
    if (!dashboard) {
      return;
    }
    setLocalName(dashboard.name);
    setIsNameFieldFocused(false);
  }, [dashboard]);

  const handleNameEditorBlur = React.useCallback(() => {
    window.setTimeout(() => {
      if (!nameEditorRef.current?.contains(document.activeElement)) {
        setIsNameFieldFocused(false);
        if (autosaveEnabled) {
          if (dashboard) {
            setLocalName(dashboard.name);
          }
        }
      }
    }, 0);
  }, [autosaveEnabled, dashboard]);

  const handleSaveManual = React.useCallback(() => {
    applyNameChange();
  }, [applyNameChange]);

  const handleCancelManual = React.useCallback(() => {
    cancelNameChange();
  }, [cancelNameChange]);

  const handleAddWidgetFromBank = React.useCallback((widget: Widget) => {
    setRemovedWidgets((prev) => prev.filter((w) => w.id !== widget.id));
    setCanvasWidgets((prev) => (prev.some((w) => w.id === widget.id) ? prev : [...prev, widget]));
  }, []);

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
    setIsWidgetDrawerOpen((open) => !open);
  }, []);

  const handleCopyConfigurationString = React.useCallback(() => {
    if (!dashboard) {
      return;
    }
    const raw = readDashboardCanvasWidgets(dashboard.id);
    const payload = { dashboardId: dashboard.id, name: dashboard.name, widgets: raw ?? [] };
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setIsKebabOpen(false);
  }, [dashboard]);

  const handleKebabDuplicate = React.useCallback(() => {
    if (!dashboard) {
      return;
    }
    const newId = duplicateDashboard(dashboard.id);
    if (newId) {
      setIsKebabOpen(false);
      navigate(`/dashboard-hub/${newId}`);
    }
  }, [dashboard, duplicateDashboard, navigate]);

  const handleKebabDelete = React.useCallback(() => {
    if (!dashboard) {
      return;
    }
    removeDashboard(dashboard.id);
    setIsKebabOpen(false);
    navigate('/dashboard-hub');
  }, [dashboard, removeDashboard, navigate]);

  const dashboardBody =
    dashboard ? (
      <>
        <PageSection
          hasBodyWrapper={false}
          style={{ paddingTop: 0, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
        >
          <div role="toolbar" aria-label="Dashboard editor" className="editable-dashboard-toolbar">
            <div style={{ minWidth: 0, maxWidth: '100%' }}>
              <div
                ref={nameEditorRef}
                className="editable-dashboard-name-editor"
                onBlur={handleNameEditorBlur}
              >
                <div className="editable-dashboard-name-group">
                  <div
                    className={
                      dashboard.isHomepage
                        ? 'editable-dashboard-name-input-wrap editable-dashboard-name-input-wrap--home'
                        : 'editable-dashboard-name-input-wrap'
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
                      className="editable-dashboard-name-input"
                      id="dashboard-name-input"
                      type="text"
                      value={localName}
                      onChange={(_event, value) => setLocalName(value)}
                      onFocus={() => setIsNameFieldFocused(true)}
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
                      aria-label={
                        dashboard.isHomepage
                          ? 'Dashboard name (set as your console homepage)'
                          : 'Dashboard name'
                      }
                      validated={toolbarNameIsDuplicate ? 'error' : 'default'}
                      aria-describedby={toolbarNameIsDuplicate ? 'dashboard-name-duplicate-error' : undefined}
                    />
                  </div>
                  {isNameFieldFocused && (
                    <>
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
                    </>
                  )}
                </div>
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
            <div className="editable-dashboard-toolbar__actions">
              <Flex
                flexWrap={{ default: 'wrap' }}
                justifyContent={{ default: 'justifyContentFlexEnd' }}
                alignItems={{ default: 'alignItemsCenter' }}
                spaceItems={{ default: 'spaceItemsMd' }}
                style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
              >
                  {!autosaveEnabled && (
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
                              style={{ color: 'var(--pf-t--global--color--status--success--default)', fontSize: '1rem' }}
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
                      onChange={(_event, checked) => setAutosaveEnabled(checked)}
                    />
                  </FlexItem>
                  <FlexItem>
                    <Button variant="secondary">Share</Button>
                  </FlexItem>
                  <FlexItem>
                    <Button variant={isWidgetDrawerOpen ? 'secondary' : 'primary'} onClick={toggleWidgetDrawer}>
                      {isWidgetDrawerOpen ? 'Close drawer' : 'Add widgets'}
                    </Button>
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
                          isDanger
                          onClick={handleKebabDelete}
                        >
                          <span
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <OutlinedTrashAltIcon
                              style={{ color: 'var(--pf-t--global--danger-color--200)' }}
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
        </PageSection>

        <AddWidgetsDrawer
          isOpen={isWidgetDrawerOpen}
          onClose={() => setIsWidgetDrawerOpen(false)}
          removedWidgets={removedWidgets}
          onAddWidget={handleAddWidgetFromBank}
        />

        <PageSection>
          <EditableDashboardCanvas
            key={dashboard.id}
            canvasTitle={resolvedCanvasTitle}
            titleFallback={dashboard.name}
            onCanvasTitleCommit={(title) => updateCanvasTitle(dashboard.id, title)}
            canvasWidgets={canvasWidgets}
            onOpenAddWidgets={() => setIsWidgetDrawerOpen(true)}
            onSizeChange={handleCanvasSizeChange}
            onRemoveWidget={handleRemoveFromCanvas}
            onReorder={handleCanvasReorder}
          />
        </PageSection>
      </>
    ) : null;

  return (
    <div className="editable-dashboard-page">
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb>
          <BreadcrumbItem to="/">Home</BreadcrumbItem>
          <BreadcrumbItem to="/dashboard-hub">Dashboard Hub</BreadcrumbItem>
          <BreadcrumbItem isActive>{breadcrumbLabel}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

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
    </div>
  );
};

export { EditableDashboard };
