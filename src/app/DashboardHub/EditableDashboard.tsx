import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Content,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  MenuToggle,
  PageSection,
  Spinner,
  Switch,
  TextInput,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem
} from '@patternfly/react-core';
import { CheckCircleIcon, CheckIcon, EllipsisVIcon, TimesIcon } from '@patternfly/react-icons';
import { useDashboardData } from '@app/DashboardHub/DashboardDataContext';

type PersistIndicator = 'saved' | 'saving';

/**
 * Shell for editing a single dashboard. Wire layout, save, widgets, etc. per product spec.
 */
const EditableDashboard: React.FunctionComponent = () => {
  const { dashboardId } = useParams<{ dashboardId: string }>();
  const { rows, updateDashboardName } = useDashboardData();
  const dashboard = dashboardId ? rows.find((r) => r.id === dashboardId) : undefined;
  const breadcrumbLabel = dashboard?.name ?? 'Dashboard';

  const [autosaveEnabled, setAutosaveEnabled] = React.useState(true);
  const [isKebabOpen, setIsKebabOpen] = React.useState(false);

  const [localName, setLocalName] = React.useState('');
  const [isNameFieldFocused, setIsNameFieldFocused] = React.useState(false);
  const [persistIndicator, setPersistIndicator] = React.useState<PersistIndicator>('saved');
  const savingTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const nameEditorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (dashboard) {
      setLocalName(dashboard.name);
    }
  }, [dashboard?.id, dashboard?.name]);

  React.useEffect(
    () => () => {
      if (savingTimerRef.current) {
        clearTimeout(savingTimerRef.current);
      }
    },
    []
  );

  const isDirty = dashboard ? localName !== dashboard.name : false;

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
    updateDashboardName(dashboard.id, next);
    if (autosaveEnabled) {
      runAutosavePersistFlow();
    }
    setIsNameFieldFocused(false);
  }, [dashboard, localName, updateDashboardName, autosaveEnabled, runAutosavePersistFlow]);

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

  return (
    <>
      <PageSection hasBodyWrapper={false}>
        <Breadcrumb>
          <BreadcrumbItem to="/overview">Settings</BreadcrumbItem>
          <BreadcrumbItem to="/dashboard-hub">Dashboard Hub</BreadcrumbItem>
          <BreadcrumbItem isActive>{breadcrumbLabel}</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>

      {dashboard && (
        <PageSection hasBodyWrapper={false} style={{ paddingTop: 0 }}>
          <Toolbar>
            <ToolbarContent>
              <ToolbarItem>
                <div
                  ref={nameEditorRef}
                  onBlur={handleNameEditorBlur}
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--pf-t--global--spacer--xs)' }}
                >
                  <TextInput
                    id="dashboard-name-input"
                    type="text"
                    value={localName}
                    onChange={(_event, value) => setLocalName(value)}
                    onFocus={() => setIsNameFieldFocused(true)}
                    aria-label="Dashboard name"
                    style={{ width: '12rem', maxWidth: '100%' }}
                  />
                  {autosaveEnabled && isNameFieldFocused && (
                    <>
                      <Button
                        variant="plain"
                        type="button"
                        aria-label="Apply dashboard name"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={applyNameChange}
                        isDisabled={!localName.trim() || localName.trim() === dashboard.name}
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
              </ToolbarItem>
              <ToolbarItem align={{ default: 'alignEnd' }} alignItems="center">
                <Flex spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsCenter' }}>
                  {!autosaveEnabled && (
                    <>
                      <Button variant="secondary" onClick={handleSaveManual} isDisabled={!isDirty}>
                        Save
                      </Button>
                      <Button variant="link" onClick={handleCancelManual} isDisabled={!isDirty}>
                        Cancel
                      </Button>
                    </>
                  )}
                  {autosaveEnabled && (
                    <Flex
                      spaceItems={{ default: 'spaceItemsSm' }}
                      alignItems={{ default: 'alignItemsCenter' }}
                      style={{ minHeight: '32px' }}
                    >
                      {persistIndicator === 'saving' ? (
                        <>
                          <Spinner size="sm" aria-label="Saving" />
                          <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: 'var(--pf-t--global--font--size--body--default)' }}>
                            Saving ...
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon style={{ color: 'var(--pf-t--global--color--status--success--default)', fontSize: '1rem' }} aria-hidden />
                          <span style={{ color: 'var(--pf-t--global--text--color--subtle)', fontSize: 'var(--pf-t--global--font--size--body--default)' }}>
                            Saved
                          </span>
                        </>
                      )}
                    </Flex>
                  )}
                  <Switch
                    id={`dashboard-autosave-${dashboard.id}`}
                    label="Autosave"
                    isChecked={autosaveEnabled}
                    onChange={(_event, checked) => setAutosaveEnabled(checked)}
                  />
                  <Button variant="secondary">Share</Button>
                  <Button variant="primary">Add widgets</Button>
                  <Dropdown
                    isOpen={isKebabOpen}
                    onOpenChange={setIsKebabOpen}
                    popperProps={{ position: 'right' }}
                    toggle={(toggleRef) => (
                      <MenuToggle
                        ref={toggleRef}
                        aria-label="Dashboard actions"
                        variant="plain"
                        onClick={() => setIsKebabOpen(!isKebabOpen)}
                      >
                        <EllipsisVIcon />
                      </MenuToggle>
                    )}
                    shouldFocusToggleOnSelect
                  >
                    <DropdownList>
                      <DropdownItem>Placeholder</DropdownItem>
                    </DropdownList>
                  </Dropdown>
                </Flex>
              </ToolbarItem>
            </ToolbarContent>
          </Toolbar>
        </PageSection>
      )}

      <PageSection>
        {dashboard ? (
          <Content style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
            <p style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
              Editable dashboard — layout and behavior will be defined next.
            </p>
          </Content>
        ) : (
          <>
            <Title headingLevel="h1" size="2xl">
              {breadcrumbLabel}
            </Title>
            <Content style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
              <p style={{ margin: 0, color: 'var(--pf-t--global--text--color--subtle)' }}>
                Unknown dashboard id: <strong>{dashboardId}</strong>.{' '}
                <Link to="/dashboard-hub">Back to Dashboard Hub</Link>
              </p>
            </Content>
          </>
        )}
      </PageSection>
    </>
  );
};

export { EditableDashboard };
