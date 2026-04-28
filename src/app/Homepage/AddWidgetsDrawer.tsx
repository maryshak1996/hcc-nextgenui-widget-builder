import * as React from 'react';
import { useCallback, useContext, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Content,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  ExpandableSection,
  Flex,
  FlexItem,
  List,
  ListItem,
  Panel,
  PanelMain,
  PanelMainBody,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Title
} from '@patternfly/react-core';
import { AngleRightIcon, CubesIcon, PanelOpenIcon, TimesIcon } from '@patternfly/react-icons';
import SparkleIcon from '@app/bgimages/sparkle-icon.svg';
import { HelpPanelContext } from '@app/AppLayout/AppLayout';
import { EXAMPLE_BANK_SEARCH_PROMPTS, filterCatalogWidgetsBySearch } from '@app/Homepage/bankWidgetSearch';
import { BankWidgetCard } from '@app/Homepage/BankWidgetCard';
import { ADD_WIDGETS_DRAWER_STYLES } from '@app/Homepage/addWidgetsDrawerStyles';
import { HOMEPAGE_WIDGET_CATALOG } from '@app/Homepage/homepageWidgetCatalog';
import type { Widget } from '@app/Homepage/widgetTypes';

/** Shown at the bottom when search is empty; order matches product ask. */
const FEATURED_BANK_WIDGET_IDS: readonly string[] = [
  'recently-visited',
  'explore-capabilities',
  'openshift',
  'rhel',
  'ansible'
];

/** How many tiles to show in “Recommended for you” — matches featured ID count; backfills from catalog when some are already on the dashboard */
const RECOMMENDED_VISIBLE_TARGET = FEATURED_BANK_WIDGET_IDS.length;

/**
 * Prioritize featured IDs still in the bank; then backfill with other widgets the user hasn’t added yet
 * (catalog order) until the slot count is filled.
 */
function getRecommendedBankWidgets(removedWidgets: Widget[]): Widget[] {
  const availableById = new Map(removedWidgets.map((w) => [w.id, w]));
  const result: Widget[] = [];
  const seen = new Set<string>();

  for (const id of FEATURED_BANK_WIDGET_IDS) {
    if (result.length >= RECOMMENDED_VISIBLE_TARGET) {
      break;
    }
    const w = availableById.get(id);
    if (w) {
      result.push(w);
      seen.add(id);
    }
  }

  for (const catalogWidget of HOMEPAGE_WIDGET_CATALOG) {
    if (result.length >= RECOMMENDED_VISIBLE_TARGET) {
      break;
    }
    if (seen.has(catalogWidget.id)) {
      continue;
    }
    const w = availableById.get(catalogWidget.id);
    if (w) {
      result.push(w);
      seen.add(catalogWidget.id);
    }
  }

  return result;
}

function getVisiblePreconfiguredBankWidgets(removedWidgets: Widget[], searchQuery: string): Widget[] {
  const q = searchQuery.trim();
  if (q) {
    return filterCatalogWidgetsBySearch(removedWidgets, searchQuery);
  }
  return getRecommendedBankWidgets(removedWidgets);
}

export interface AddWidgetsDrawerProps {
  isOpen: boolean;
  removedWidgets: Widget[];
  /** Add a pre-configured widget to the page/canvas (no bank drag). */
  onAddWidget: (widget: Widget) => void;
  /** Max width wrapper (matches Homepage layout) */
  maxWidth?: string;
}

/**
 * “Add widgets” bank + widget builder panel from the Homepage, reusable on other surfaces
 * (e.g. editable dashboard). Widgets are added with the + control (not drag).
 */
const AddWidgetsDrawer: React.FC<AddWidgetsDrawerProps> = ({
  isOpen,
  removedWidgets,
  onAddWidget,
  maxWidth = '1566px'
}) => {
  const [selectedBuilderOption, setSelectedBuilderOption] = useState<string>('ai-generate');
  const [bankSearchInput, setBankSearchInput] = useState('');
  const [bankSearchQuery, setBankSearchQuery] = useState('');
  const [isPreConfiguredExpanded, setIsPreConfiguredExpanded] = useState(true);
  const [isBuilderExpanded, setIsBuilderExpanded] = useState(true);
  const [isExamplePromptsExpanded, setIsExamplePromptsExpanded] = useState(false);
  const helpPanelContext = useContext(HelpPanelContext);

  const visiblePreconfigured = useMemo(
    () => getVisiblePreconfiguredBankWidgets(removedWidgets, bankSearchQuery),
    [removedWidgets, bankSearchQuery]
  );

  /** When the field is empty (cleared, deleted, or only spaces), show featured + example prompts again. */
  const resetFindWidgetsSearchToDefault = useCallback(() => {
    setBankSearchInput('');
    setBankSearchQuery('');
    setIsExamplePromptsExpanded(false);
  }, []);

  const submitBankSearch = useCallback(() => {
    const trimmed = bankSearchInput.trim();
    setBankSearchQuery(trimmed);
    if (trimmed === '') {
      setIsExamplePromptsExpanded(false);
    }
  }, [bankSearchInput]);

  const applyExamplePromptSearch = useCallback((prompt: string) => {
    const trimmed = prompt.trim();
    setBankSearchInput(trimmed);
    setBankSearchQuery(trimmed);
    setIsExamplePromptsExpanded(false);
  }, []);

  const openDashboardWidgetsHelpTab = useCallback(() => {
    helpPanelContext?.openHelpPanelWithTab('Dashboard widgets');
  }, [helpPanelContext]);

  const openRequestNewWidgetTab = useCallback(() => {
    helpPanelContext?.openHelpPanelToShareGeneralFeedback();
  }, [helpPanelContext]);

  const widgetBankEmptyActions = (
    <EmptyStateFooter>
      <Flex spaceItems={{ default: 'spaceItemsSm' }} flexWrap={{ default: 'wrap' }}>
        <Button
          variant="primary"
          size="sm"
          type="button"
          icon={<PanelOpenIcon aria-hidden />}
          iconPosition="end"
          onClick={openDashboardWidgetsHelpTab}
        >
          View all widgets
        </Button>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          icon={<PanelOpenIcon aria-hidden />}
          iconPosition="end"
          onClick={openRequestNewWidgetTab}
        >
          Request a new widget
        </Button>
      </Flex>
    </EmptyStateFooter>
  );

  const widgetBankEmptyActionsCentered = (
    <EmptyStateFooter>
      <Flex
        justifyContent={{ default: 'justifyContentCenter' }}
        alignItems={{ default: 'alignItemsCenter' }}
        spaceItems={{ default: 'spaceItemsSm' }}
        flexWrap={{ default: 'wrap' }}
        style={{ width: '100%' }}
      >
        <Button
          variant="primary"
          size="sm"
          type="button"
          icon={<PanelOpenIcon aria-hidden />}
          iconPosition="end"
          onClick={openDashboardWidgetsHelpTab}
        >
          View all widgets
        </Button>
        <Button
          variant="secondary"
          size="sm"
          type="button"
          icon={<PanelOpenIcon aria-hidden />}
          iconPosition="end"
          onClick={openRequestNewWidgetTab}
        >
          Request a new widget
        </Button>
      </Flex>
    </EmptyStateFooter>
  );

  return (
    <div style={{ width: '100%', minWidth: 0 }}>
      <style>{ADD_WIDGETS_DRAWER_STYLES}</style>
      <div className={`widget-drawer ${isOpen ? 'open' : ''}`} style={{ maxWidth, margin: '0 auto', width: '100%' }}>
        <Panel className="widget-drawer-panel">
          <PanelMain>
            <PanelMainBody>
              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }} alignItems={{ default: 'alignItemsFlexStart' }}>
                <Flex
                  direction={{ default: 'row' }}
                  spaceItems={{ default: 'spaceItemsMd' }}
                  alignItems={{ default: 'alignItemsStretch' }}
                  style={{ width: '100%' }}
                >
                  <FlexItem className="add-widgets-find-column">
                    <Card isFullHeight className="widget-drawer-section-card widget-drawer-subsection-card">
                      <div
                        className="widget-drawer-subsection-toggle"
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsPreConfiguredExpanded((e) => !e)}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' || ev.key === ' ') {
                            ev.preventDefault();
                            setIsPreConfiguredExpanded((e) => !e);
                          }
                        }}
                        aria-expanded={isPreConfiguredExpanded}
                        aria-controls="add-widgets-preco-section"
                      >
                        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                          <span className="widget-drawer-caret" aria-hidden>
                            <AngleRightIcon />
                          </span>
                          <Title headingLevel="h4" size="md" style={{ margin: 0 }}>
                            Find widgets
                          </Title>
                        </Flex>
                      </div>
                      {isPreConfiguredExpanded && (
                        <CardBody id="add-widgets-preco-section">
                          <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }} style={{ width: '100%' }}>
                            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsSm' }} style={{ width: '100%' }}>
                              <form
                                onSubmit={(e) => e.preventDefault()}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    submitBankSearch();
                                  }
                                }}
                                style={{ width: '100%' }}
                              >
                                <TextInputGroup style={{ width: '100%' }}>
                                  <TextInputGroupMain
                                    inputId="add-widgets-bank-search"
                                    icon={
                                      <img
                                        src={SparkleIcon}
                                        alt=""
                                        aria-hidden
                                        width={16}
                                        height={16}
                                        style={{ display: 'block' }}
                                      />
                                    }
                                    placeholder="What do you need your widget to do?"
                                    value={bankSearchInput}
                                    onChange={(_e, v) => {
                                      if (v.trim() === '') {
                                        resetFindWidgetsSearchToDefault();
                                      } else {
                                        setBankSearchInput(v);
                                      }
                                    }}
                                    name="add-widgets-bank-search"
                                    type="text"
                                    aria-label="What you need your widget to do; press Enter to search"
                                  />
                                  {!!bankSearchInput && (
                                    <TextInputGroupUtilities>
                                      <Button
                                        variant="plain"
                                        type="button"
                                        aria-label="Clear search"
                                        icon={<TimesIcon />}
                                        onClick={resetFindWidgetsSearchToDefault}
                                      />
                                    </TextInputGroupUtilities>
                                  )}
                                </TextInputGroup>
                              </form>
                              <Content
                                component="p"
                                style={{
                                  color: 'var(--pf-t--global--text--color--subtle, var(--pf-v6-global--Color--200))',
                                  fontSize: 'var(--pf-t--global--font--size--body--default)',
                                  margin: 0
                                }}
                              >
                                Hit &lsquo;Enter&rsquo; to send search query
                              </Content>
                            </Flex>
                            {!bankSearchQuery.trim() && (
                              <ExpandableSection
                                className="add-widgets-example-prompts"
                                isExpanded={isExamplePromptsExpanded}
                                onToggle={(_e, isExpanded) => setIsExamplePromptsExpanded(isExpanded)}
                                toggleText="Show example prompts"
                              >
                                <List isPlain className="add-widgets-example-prompts-list">
                                  {EXAMPLE_BANK_SEARCH_PROMPTS.map((prompt) => (
                                    <ListItem key={prompt}>
                                      <Button
                                        variant="link"
                                        isInline
                                        type="button"
                                        className="add-widgets-example-prompt-link"
                                        onClick={() => applyExamplePromptSearch(prompt)}
                                        aria-label={`Search widgets: ${prompt}`}
                                      >
                                        {prompt}
                                      </Button>
                                    </ListItem>
                                  ))}
                                </List>
                              </ExpandableSection>
                            )}
                            {removedWidgets.length === 0 ? (
                              <EmptyState variant="xs" headingLevel="h4" titleText="No widgets available" className="add-widgets-empty-no-widgets-available">
                                <EmptyStateBody>
                                  All available pre-configured widgets are already displayed in your dashboard.
                                </EmptyStateBody>
                                {widgetBankEmptyActionsCentered}
                              </EmptyState>
                            ) : visiblePreconfigured.length === 0 ? (
                              <EmptyState variant="xs" headingLevel="h4" titleText="No matching widgets" icon={CubesIcon}>
                                <EmptyStateBody>
                                  Try a different search, or check that the widget is still in the add list.
                                </EmptyStateBody>
                                {widgetBankEmptyActions}
                              </EmptyState>
                            ) : !bankSearchQuery.trim() ? (
                              <section aria-labelledby="add-widgets-recommended-label">
                                <Flex
                                  justifyContent={{ default: 'justifyContentSpaceBetween' }}
                                  alignItems={{ default: 'alignItemsCenter' }}
                                  flexWrap={{ default: 'nowrap' }}
                                  style={{ width: '100%', gap: 'var(--pf-t--global--spacer--sm)' }}
                                >
                                  <FlexItem>
                                    <Title
                                      headingLevel="h5"
                                      size="md"
                                      id="add-widgets-recommended-label"
                                      style={{
                                        fontSize: 'var(--pf-v6-global--FontSize--sm)',
                                        lineHeight: 'var(--pf-v6-global--LineHeight--sm)'
                                      }}
                                    >
                                      Recommended for you
                                    </Title>
                                  </FlexItem>
                                  <FlexItem>
                                    <Button
                                      variant="tertiary"
                                      size="sm"
                                      type="button"
                                      onClick={() => helpPanelContext?.openHelpPanelWithTab('Dashboard widgets')}
                                      icon={<PanelOpenIcon aria-hidden />}
                                      iconPosition="end"
                                    >
                                      All widgets
                                    </Button>
                                  </FlexItem>
                                </Flex>
                                <div
                                  className="removed-widgets-grid add-widgets-bank-grid"
                                  style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}
                                >
                                  {visiblePreconfigured.map((widget) => (
                                    <BankWidgetCard key={widget.id} widget={widget} onAdd={onAddWidget} />
                                  ))}
                                </div>
                              </section>
                            ) : (
                              <div className="removed-widgets-grid add-widgets-bank-grid">
                                {visiblePreconfigured.map((widget) => (
                                  <BankWidgetCard key={widget.id} widget={widget} onAdd={onAddWidget} />
                                ))}
                              </div>
                            )}
                          </Flex>
                        </CardBody>
                      )}
                    </Card>
                  </FlexItem>
                  <FlexItem flex={{ default: 'flex_1' }} style={{ minWidth: 0, flex: '1 1 0%' }}>
                    <Card isFullHeight className="widget-drawer-section-card widget-drawer-subsection-card">
                      <div
                        className="widget-drawer-subsection-toggle"
                        role="button"
                        tabIndex={0}
                        onClick={() => setIsBuilderExpanded((e) => !e)}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter' || ev.key === ' ') {
                            ev.preventDefault();
                            setIsBuilderExpanded((e) => !e);
                          }
                        }}
                        aria-expanded={isBuilderExpanded}
                        aria-controls="add-widgets-builder-section"
                      >
                        <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                          <span className="widget-drawer-caret" aria-hidden>
                            <AngleRightIcon />
                          </span>
                          <Title headingLevel="h4" size="md" style={{ margin: 0 }}>
                            Widget builder
                          </Title>
                        </Flex>
                      </div>
                      {isBuilderExpanded && (
                        <CardBody id="add-widgets-builder-section">
                          <div className="add-widgets-builder-row">
                            <div className="add-widgets-builder-row__options">
                              <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
                                <FlexItem>
                                  <Card isSelectable isCompact isSelected={selectedBuilderOption === 'ai-generate'}>
                                    <CardHeader
                                      selectableActions={{
                                        selectableActionId: 'ai-generate-option',
                                        selectableActionAriaLabelledby: 'ai-generate-title',
                                        name: 'widget-builder-option',
                                        variant: 'single',
                                        onChange: (_event, checked) => {
                                          if (checked) {
                                            setSelectedBuilderOption('ai-generate');
                                          }
                                        }
                                      }}
                                    >
                                      <Title headingLevel="h5" size="md" id="ai-generate-title">
                                        Use generative AI to create one for you
                                      </Title>
                                    </CardHeader>
                                    <CardBody>
                                      <Content component="small" style={{ color: 'var(--pf-v6-global--Color--200)' }}>
                                        Describe the widget you want and AI will generate it for you.
                                      </Content>
                                    </CardBody>
                                  </Card>
                                </FlexItem>
                                <FlexItem>
                                  <Card isSelectable isCompact isSelected={selectedBuilderOption === 'static-markdown'}>
                                    <CardHeader
                                      selectableActions={{
                                        selectableActionId: 'static-markdown-option',
                                        selectableActionAriaLabelledby: 'static-markdown-title',
                                        name: 'widget-builder-option',
                                        variant: 'single',
                                        onChange: (_event, checked) => {
                                          if (checked) {
                                            setSelectedBuilderOption('static-markdown');
                                          }
                                        }
                                      }}
                                    >
                                      <Title headingLevel="h5" size="md" id="static-markdown-title">
                                        Create a static widget with markdown
                                      </Title>
                                    </CardHeader>
                                    <CardBody>
                                      <Content component="small" style={{ color: 'var(--pf-v6-global--Color--200)' }}>
                                        Write your own content using markdown formatting.
                                      </Content>
                                    </CardBody>
                                  </Card>
                                </FlexItem>
                              </Flex>
                            </div>
                            <div className="add-widgets-builder-row__preview">
                              <Card isFullHeight variant="secondary">
                                <CardHeader>
                                  <Title headingLevel="h5" size="md">
                                    Widget preview
                                  </Title>
                                </CardHeader>
                                <CardBody>
                                  <Content component="small" style={{ color: 'var(--pf-v6-global--Color--200)', textAlign: 'center' }}>
                                    Your widget preview will appear here.
                                  </Content>
                                </CardBody>
                              </Card>
                            </div>
                          </div>
                        </CardBody>
                      )}
                    </Card>
                  </FlexItem>
                </Flex>
              </Flex>
            </PanelMainBody>
          </PanelMain>
        </Panel>
      </div>
    </div>
  );
};

export { AddWidgetsDrawer };
