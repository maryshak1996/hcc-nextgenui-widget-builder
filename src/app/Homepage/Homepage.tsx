import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Button,
  Content,
  Divider,
  DrilldownMenu,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  MenuGroup,
  FlexItem,
  MenuItem,
  MenuItemAction,
  MenuToggle,
  PageSection,
  Title
} from '@patternfly/react-core';
import {
  CodeIcon,
  EllipsisVIcon,
  HomeIcon,
  OutlinedCloneIcon,
  OutlinedHandPaperIcon,
  PencilAltIcon,
  PlusCircleIcon,
  ShareAltIcon
} from '@patternfly/react-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useDashboardData } from '@app/DashboardHub/DashboardDataContext';
import {
  mergeCanvasWidgetsWithCatalog,
  onDashboardCanvasUpdated,
  readDashboardCanvasWidgets
} from '@app/DashboardHub/dashboardCanvasStorage';
import type { Widget } from '@app/Homepage/widgetTypes';
import {
  ReadOnlyHomepageWidgetFrame,
  renderHomepageWidgetContent,
  WIDGET_GRID_STYLES
} from '@app/Homepage/homepageWidgetGrid';
import { MASTHEAD_USER_DISPLAY_NAME } from '@app/mastheadUserDisplayName';

type GreetingSegment = 'morning' | 'afternoon' | 'evening' | 'night';

function getGreetingSegmentForLocalTime(date: Date): GreetingSegment {
  const h = date.getHours();
  if (h >= 5 && h < 12) {
    return 'morning';
  }
  if (h >= 12 && h < 17) {
    return 'afternoon';
  }
  if (h >= 17 && h < 22) {
    return 'evening';
  }
  return 'night';
}

const Homepage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { rows, setDashboardAsHomepage } = useDashboardData();
  const [displayWidgets, setDisplayWidgets] = useState<Widget[]>([]);
  const [isHomepageKebabOpen, setIsHomepageKebabOpen] = useState(false);
  const [isHomepageHeroMenuOpen, setIsHomepageHeroMenuOpen] = useState(false);
  const [homeHeroMenuDrilledIn, setHomeHeroMenuDrilledIn] = useState<string[]>([]);
  const [homeHeroDrillPath, setHomeHeroDrillPath] = useState<string[]>([]);
  const [homeHeroActiveMenu, setHomeHeroActiveMenu] = useState('homepage-hero-drilldown-root');
  const [homeHeroMenuHeights, setHomeHeroMenuHeights] = useState<Record<string, number>>({});

  const greetingSegment = useMemo(() => getGreetingSegmentForLocalTime(new Date()), []);

  const homepageDashboard = useMemo(
    () => rows.find((r) => r.isHomepage),
    [rows]
  );

  const canvasTitle = homepageDashboard
    ? (homepageDashboard.canvasTitle ?? homepageDashboard.name)
    : '';

  const sortedHubRows = useMemo(
    () => [...rows].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [rows]
  );

  const refreshFromStorage = useCallback(() => {
    if (!homepageDashboard) {
      setDisplayWidgets([]);
      return;
    }
    const raw = readDashboardCanvasWidgets(homepageDashboard.id);
    if (raw && raw.length > 0) {
      setDisplayWidgets(mergeCanvasWidgetsWithCatalog(raw));
    } else {
      setDisplayWidgets([]);
    }
  }, [homepageDashboard]);

  useEffect(() => {
    refreshFromStorage();
  }, [refreshFromStorage]);

  useEffect(() => {
    return onDashboardCanvasUpdated((detail) => {
      if (detail?.dashboardId && detail.dashboardId === homepageDashboard?.id) {
        refreshFromStorage();
      }
    });
  }, [homepageDashboard?.id, refreshFromStorage]);

  const closeHomepageKebab = useCallback(() => {
    setIsHomepageKebabOpen(false);
  }, []);

  const onHomepageHeroGetMenuHeight = useCallback((menuId: string, height: number) => {
    setHomeHeroMenuHeights((prev) => {
      if (prev[menuId] === height) {
        return prev;
      }
      if (menuId === 'homepage-hero-drilldown-root' || (menuId !== 'homepage-hero-drilldown-root' && prev[menuId] !== height)) {
        return { ...prev, [menuId]: height };
      }
      return prev;
    });
  }, []);

  const onHomepageHeroDrillIn = useCallback(
    (
      _event: React.KeyboardEvent | React.MouseEvent,
      fromMenuId: string,
      toMenuId: string,
      pathId: string
    ) => {
      setHomeHeroMenuDrilledIn((d) => [...d, fromMenuId]);
      setHomeHeroDrillPath((p) => [...p, pathId]);
      setHomeHeroActiveMenu(toMenuId);
    },
    []
  );

  const onHomepageHeroDrillOut = useCallback(
    (_event: React.KeyboardEvent | React.MouseEvent, toMenuId: string, _itemId?: string) => {
      setHomeHeroMenuDrilledIn((d) => d.slice(0, -1));
      setHomeHeroDrillPath((p) => p.slice(0, -1));
      setHomeHeroActiveMenu(toMenuId);
    },
    []
  );

  const handleCopyConfigurationString = useCallback(() => {
    if (!homepageDashboard) {
      return;
    }
    const raw = readDashboardCanvasWidgets(homepageDashboard.id);
    const payload = {
      dashboardId: homepageDashboard.id,
      name: homepageDashboard.name,
      widgets: raw ?? []
    };
    void navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    closeHomepageKebab();
  }, [closeHomepageKebab, homepageDashboard]);

  return (
    <>
      <style>{WIDGET_GRID_STYLES}</style>
      <PageSection isWidthLimited={false} className="homepage-hero-header">
        <div className="homepage-hero-header__inner">
          <Flex
            alignItems={{ default: 'alignItemsCenter' }}
            justifyContent={{ default: 'justifyContentSpaceBetween' }}
            flexWrap={{ default: 'wrap' }}
            rowGap={{ default: 'rowGapMd' }}
            style={{ width: '100%' }}
          >
            <FlexItem>
              <Flex
                spaceItems={{ default: 'spaceItemsMd' }}
                alignItems={{ default: 'alignItemsCenter' }}
                style={{ minWidth: 0 }}
              >
                <span className="homepage-hero-greeting__icon" aria-hidden>
                  <OutlinedHandPaperIcon />
                </span>
                <Title
                  headingLevel="h1"
                  size="4xl"
                  className="homepage-hero-greeting__title"
                >
                  Good {greetingSegment}, {MASTHEAD_USER_DISPLAY_NAME}
                </Title>
              </Flex>
            </FlexItem>
            <FlexItem>
              <Dropdown
                id="homepage-hero-drilldown-root"
                isOpen={isHomepageHeroMenuOpen}
                containsDrilldown
                drilldownItemPath={homeHeroDrillPath}
                drilledInMenus={homeHeroMenuDrilledIn}
                activeMenu={homeHeroActiveMenu}
                onDrillIn={onHomepageHeroDrillIn}
                onDrillOut={onHomepageHeroDrillOut}
                onGetMenuHeight={onHomepageHeroGetMenuHeight}
                shouldFocusToggleOnSelect
                menuHeight={
                  homeHeroMenuHeights[homeHeroActiveMenu] != null
                    ? `${homeHeroMenuHeights[homeHeroActiveMenu]}px`
                    : undefined
                }
                onOpenChange={(isOpen) => {
                  setIsHomepageHeroMenuOpen(isOpen);
                  if (!isOpen) {
                    setHomeHeroMenuDrilledIn([]);
                    setHomeHeroDrillPath([]);
                    setHomeHeroActiveMenu('homepage-hero-drilldown-root');
                  }
                }}
                popperProps={{ position: 'end' }}
                toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="default"
                    isExpanded={isHomepageHeroMenuOpen}
                    aria-label={
                      homepageDashboard
                        ? `Homepage: ${canvasTitle}. Open menu.`
                        : 'No homepage assigned. Open menu to set a dashboard as your homepage.'
                    }
                    onClick={() => setIsHomepageHeroMenuOpen((o) => !o)}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        minWidth: 0,
                        maxWidth: 'min(32rem, 70vw)',
                        color: homepageDashboard
                          ? undefined
                          : 'var(--pf-t--global--text--color--subtle)'
                      }}
                    >
                      <HomeIcon
                        style={{ color: 'var(--pf-t--global--icon--Color--200)', flexShrink: 0 }}
                        aria-hidden
                      />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0
                        }}
                      >
                        {homepageDashboard ? canvasTitle : 'No homepage assigned'}
                      </span>
                    </span>
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <MenuGroup label="Set as homepage ..." labelHeadingLevel="h2">
                    {sortedHubRows.length > 0 ? (
                      sortedHubRows.map((row) => (
                        <DropdownItem
                          key={row.id}
                          value={row.id}
                          isSelected={row.isHomepage === true}
                          onClick={() => {
                            setDashboardAsHomepage(row.id);
                            setIsHomepageHeroMenuOpen(false);
                            setHomeHeroMenuDrilledIn([]);
                            setHomeHeroDrillPath([]);
                            setHomeHeroActiveMenu('homepage-hero-drilldown-root');
                          }}
                          actions={
                            <MenuItemAction
                              icon={<PencilAltIcon />}
                              aria-label={`Edit ${row.name}`}
                              onClick={(e) => {
                                e?.stopPropagation?.();
                                setIsHomepageHeroMenuOpen(false);
                                setHomeHeroMenuDrilledIn([]);
                                setHomeHeroDrillPath([]);
                                setHomeHeroActiveMenu('homepage-hero-drilldown-root');
                                navigate(`/dashboard-hub/${row.id}`);
                              }}
                            />
                          }
                        >
                          {row.name}
                        </DropdownItem>
                      ))
                    ) : (
                      <DropdownItem value="no-dashboards" isDisabled>
                        No dashboards in hub yet
                      </DropdownItem>
                    )}
                  </MenuGroup>
                  <Divider component="li" role="separator" />
                  <DropdownItem
                    value="hp-menu-create"
                    direction="down"
                    icon={
                      <PlusCircleIcon
                        style={{ color: 'var(--pf-t--global--icon--Color--200)' }}
                        aria-hidden
                      />
                    }
                    drilldownMenu={
                      <DrilldownMenu id="homepage-hero-drilldown-create">
                        <MenuItem itemId="hp-menu-create-up" direction="up">
                          Create new dashboard
                        </MenuItem>
                        <Divider component="li" role="separator" />
                        <MenuItem
                          itemId="hp-menu-blank"
                          onClick={() => {
                            setIsHomepageHeroMenuOpen(false);
                            setHomeHeroMenuDrilledIn([]);
                            setHomeHeroDrillPath([]);
                            setHomeHeroActiveMenu('homepage-hero-drilldown-root');
                            navigate('/dashboard-hub', {
                              state: { fromHome: { openCreate: 'blank' } }
                            });
                          }}
                        >
                          Create from blank
                        </MenuItem>
                        <MenuItem
                          itemId="hp-menu-import"
                          onClick={() => {
                            setIsHomepageHeroMenuOpen(false);
                            setHomeHeroMenuDrilledIn([]);
                            setHomeHeroDrillPath([]);
                            setHomeHeroActiveMenu('homepage-hero-drilldown-root');
                            navigate('/dashboard-hub', {
                              state: { fromHome: { openCreate: 'import' } }
                            });
                          }}
                        >
                          Import from config string
                        </MenuItem>
                        <MenuItem
                          itemId="hp-menu-dup"
                          onClick={() => {
                            setIsHomepageHeroMenuOpen(false);
                            setHomeHeroMenuDrilledIn([]);
                            setHomeHeroDrillPath([]);
                            setHomeHeroActiveMenu('homepage-hero-drilldown-root');
                            navigate('/dashboard-hub', {
                              state: { fromHome: { openCreate: 'duplicate' } }
                            });
                          }}
                        >
                          Duplicate existing
                        </MenuItem>
                      </DrilldownMenu>
                    }
                  >
                    Create new dashboard
                  </DropdownItem>
                  <Divider component="li" role="separator" />
                  <DropdownItem
                    value="dashboard-hub"
                    description="Create, manage, and share dashboards"
                    onClick={() => {
                      setIsHomepageHeroMenuOpen(false);
                      setHomeHeroMenuDrilledIn([]);
                      setHomeHeroDrillPath([]);
                      setHomeHeroActiveMenu('homepage-hero-drilldown-root');
                      navigate('/dashboard-hub');
                    }}
                  >
                    Dashboard hub
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
          </Flex>
        </div>
        <div className="homepage-hero-separator" role="separator" aria-orientation="horizontal" />
      </PageSection>
      <PageSection>
        {homepageDashboard ? (
          <>
            <div style={{ maxWidth: '1566px', margin: '0 auto', width: '100%' }}>
              <Flex
                alignItems={{ default: 'alignItemsFlexStart' }}
                justifyContent={{ default: 'justifyContentSpaceBetween' }}
                spaceItems={{ default: 'spaceItemsMd' }}
                style={{
                  width: '100%',
                  minWidth: 0,
                  marginBottom: 'var(--pf-t--global--spacer--lg)',
                }}
                className="homepage-dashboard-title-bar"
              >
                <FlexItem className="homepage-dashboard-title" style={{ minWidth: 0, flex: '1 1 auto' }}>
                  <Title headingLevel="h2" size="2xl" className="homepage-dashboard-title__text">
                    {canvasTitle}
                  </Title>
                </FlexItem>
                <FlexItem
                  className="homepage-dashboard-actions"
                  style={{ flex: '0 0 auto' }}
                >
                  <Flex
                    alignItems={{ default: 'alignItemsCenter' }}
                    spaceItems={{ default: 'spaceItemsSm' }}
                    style={{ flexWrap: 'nowrap' }}
                  >
                    <FlexItem>
                      <Dropdown
                        isOpen={isHomepageKebabOpen}
                        onSelect={() => setIsHomepageKebabOpen(false)}
                        onOpenChange={setIsHomepageKebabOpen}
                        popperProps={{ position: 'end' }}
                        toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                          <MenuToggle
                            ref={toggleRef}
                            variant="plain"
                            isExpanded={isHomepageKebabOpen}
                            aria-label="Homepage dashboard actions"
                            onClick={() => {
                              setIsHomepageKebabOpen((o) => !o);
                            }}
                          >
                            <EllipsisVIcon />
                          </MenuToggle>
                        )}
                        shouldFocusToggleOnSelect
                      >
                        <DropdownList>
                          <DropdownItem key="copy-config" onClick={handleCopyConfigurationString}>
                            <span
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <CodeIcon style={{ color: 'var(--pf-t--global--icon--Color--200)' }} />
                              Copy configuration string
                            </span>
                          </DropdownItem>
                          <DropdownItem key="duplicate" onClick={closeHomepageKebab}>
                            <span
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <OutlinedCloneIcon style={{ color: 'var(--pf-t--global--icon--Color--200)' }} />
                              Duplicate dashboard
                            </span>
                          </DropdownItem>
                          <DropdownItem key="share" onClick={closeHomepageKebab}>
                            <span
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <ShareAltIcon style={{ color: 'var(--pf-t--global--icon--Color--200)' }} />
                              Share dashboard
                            </span>
                          </DropdownItem>
                          <Divider component="li" role="separator" />
                          <DropdownItem
                            key="dashboard-hub"
                            description="Create, manage, share dashboards"
                            onClick={() => {
                              closeHomepageKebab();
                              navigate('/dashboard-hub');
                            }}
                          >
                            Dashboard Hub
                          </DropdownItem>
                        </DropdownList>
                      </Dropdown>
                    </FlexItem>
                    <FlexItem>
                      <Button
                        variant="secondary"
                        icon={<PencilAltIcon />}
                        iconPosition="start"
                        onClick={() => navigate(`/dashboard-hub/${homepageDashboard.id}`)}
                      >
                        Edit dashboard
                      </Button>
                    </FlexItem>
                  </Flex>
                </FlexItem>
              </Flex>
              {displayWidgets.length > 0 ? (
                <div
                  className="widgets-grid homepage-readonly-grid"
                  style={{ minWidth: 0, width: '100%' }}
                  aria-label="Read-only preview of your homepage dashboard"
                >
                  {displayWidgets.map((widget) => (
                    <ReadOnlyHomepageWidgetFrame key={widget.id} widget={widget}>
                      {renderHomepageWidgetContent(widget, {
                        navigate,
                        readOnly: true
                      })}
                    </ReadOnlyHomepageWidgetFrame>
                  ))}
                </div>
              ) : (
                <Content style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>
                  No widgets on this dashboard yet. Open{' '}
                  <Link to={`/dashboard-hub/${homepageDashboard.id}`}>this dashboard in the hub</Link> to add widgets. You
                  are viewing a read-only preview; editing happens only in Dashboard Hub.
                </Content>
              )}
            </div>
          </>
        ) : (
          <Content>
            <p>
              Set a <strong>homepage dashboard</strong> in <Link to="/dashboard-hub">Dashboard Hub</Link> (kebab menu →
              Set as homepage) to show it here. Until then, the widget area is empty.
            </p>
          </Content>
        )}
      </PageSection>
    </>
  );
};

export { Homepage };
