/**
 * Scoped styles for the Help drawer body and the undocked Help popout window
 * (same rules; popout wraps content in `.pf-v6-c-drawer__panel` so selectors match).
 */
export const HELP_PANEL_DRAWER_SCOPED_CSS = `
          /* Force hidden drawer panels to not take up space */
          .pf-v6-c-drawer__panel[hidden] {
            display: none !important;
          }

          /* Force drawer panel to clip any overflow, except when menu is open */
          .pf-v6-c-drawer__panel {
            overflow: hidden !important;
          }

          /* Allow overflow when tabs overflow menu is open */
          .pf-v6-c-drawer__panel:has(.pf-v6-c-tabs [role="menu"]) {
            overflow: visible !important;
          }

          .pf-v6-c-drawer__panel-content {
            overflow: visible !important; /* Allow menus to escape */
          }

          /* Allow drawer body to overflow when menu is open */
          .pf-v6-c-drawer__body:has(.pf-v6-c-tabs [role="menu"]),
          .pf-v6-c-drawer__body {
            overflow: visible !important;
          }

          /* Override PatternFly's dynamic width variable to constrain tabs */
          .pf-v6-c-drawer__panel .pf-v6-c-tabs {
            --pf-v6-c-tabs--Width: 100% !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important; /* Allow dropdown menu to show */
          }

          /* Constrain the scrollable tab list area */
          .pf-v6-c-drawer__panel .pf-v6-c-tabs__scroll-container {
            max-width: 100%;
            overflow-x: auto;
          }

          .pf-v6-c-drawer__panel .pf-v6-c-tabs__list {
            max-width: 100%;
          }

          /* Constrain tab content areas */
          .pf-v6-c-drawer__panel .pf-v6-c-tabs__panel {
            overflow-x: hidden;
          }

          /* Target all dropdown menus within tabs overflow */
          [data-popper-placement] .pf-v6-c-menu,
          .pf-v6-c-dropdown__menu,
          .pf-v6-c-menu {
            min-width: 300px !important;
            width: 300px !important;
          }

          /* Allow dynamic positioning for tabs overflow menu */
          .pf-v6-c-tabs [role="menu"] {
            /* Positioning will be set dynamically via JavaScript */
            max-width: 300px !important;
          }

          /* Adjust popper positioning for tabs overflow menu */
          .pf-v6-c-tabs [data-popper-placement] {
            /* Positioning will be set dynamically via JavaScript */
            max-width: 300px !important;
          }

          /* Ensure menu stays within drawer panel bounds */
          .pf-v6-c-drawer__panel .pf-v6-c-tabs [role="menu"] {
            position: absolute !important;
          }

          /* Target menu items specifically */
          .pf-v6-c-menu__list-item,
          .pf-v6-c-dropdown__menu-item {
            min-width: 280px !important;
            white-space: nowrap !important;
          }

          /* Ensure tabs overflow menu items show ellipsis when truncated */
          .pf-v6-c-tabs [role="menu"] button[role="menuitem"] {
            display: flex !important;
            align-items: center !important;
            max-width: 300px !important;
            overflow: hidden !important;
          }

          .pf-v6-c-tabs [role="menu"] .menu-item-text-wrapper {
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: block !important;
          }

          /* Truncate visible tab titles */
          .pf-v6-c-tabs__item .pf-v6-c-tabs__item-text {
            max-width: 180px !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            white-space: nowrap !important;
            display: inline-block !important;
          }

          /* Add extra padding for check icons */
          .pf-v6-c-menu__item-text {
            padding-right: 32px !important;
          }

          /* Target the tabs overflow container specifically */
          .pf-v6-c-tabs [role="menu"] {
            min-width: 300px !important;
            width: 300px !important;
          }

          /* Top strip uses its own Tabs row; hide empty tab panels rendered by that duplicate Tabs */
          .help-panel-top-tabs-strip .pf-v6-c-tab-content {
            display: none !important;
          }

          /*
           * Avoid horizontal scroll + PatternFly scroll Buttons (plain Button chevrons) on the top strip.
           * Full-width flex row so margin-inline-start: auto on Chat absorbs remaining space and pins it right.
           */
          .help-panel-top-tabs-strip .pf-v6-c-tabs {
            overflow: visible !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .help-panel-top-tabs-strip .pf-v6-c-tabs__list {
            display: flex !important;
            flex-wrap: wrap !important;
            row-gap: var(--pf-t--global--spacer--xs);
            width: 100% !important;
            max-width: 100% !important;
            min-width: 0 !important;
            justify-content: flex-start !important;
            overflow-x: visible !important;
            overflow-y: visible !important;
          }
          .help-panel-top-tabs-strip .pf-v6-c-tabs__item.help-panel-chat-tab {
            margin-inline-start: auto !important;
            flex-shrink: 0 !important;
          }
          .help-panel-top-tabs-strip .pf-v6-c-tabs__item.help-panel-chat-tab .pf-v6-c-tabs__link {
            min-width: 2.75rem !important;
            justify-content: center !important;
          }
          .help-panel-top-tabs-strip .pf-v6-c-tabs.pf-m-scrollable .pf-v6-c-tabs__scroll-button {
            display: none !important;
          }

          /* Full-bleed grey rule under tab strip (separator from scroll content; insetNone = panel width) */
          .help-panel-header-divider.pf-v6-c-divider {
            width: 100% !important;
            align-self: stretch !important;
            flex-shrink: 0 !important;
          }

          /* Duplicate tab row is rendered above; hide PatternFly's tab buttons inside the scroll region */
          .help-panel-hide-native-tab-list .pf-v6-c-tabs__scroll-buttons,
          .help-panel-hide-native-tab-list .pf-v6-c-tabs__list {
            display: none !important;
          }

          /*
           * PF merges Tabs style prop onto .pf-v6-c-tabs (the nav), not the panels.
           * flex:1 on Tabs stretched the empty nav and caused a large gap above tab body (APIs, Support, etc.).
           * Shell wraps Tabs; collapse the hidden nav and let the active tab panel fill height.
           */
          .help-panel-inner-tabs-shell > .pf-v6-c-tabs {
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            height: 0 !important;
            max-height: 0 !important;
            min-height: 0 !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
          }
          .help-panel-inner-tabs-shell > .pf-v6-c-tab-content:not([hidden]) {
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow: auto !important;
          }

          /* Chat sub-tab content fills available height */
          .pf-v6-c-tabs__panel:has([data-help-panel="chat"]) {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }

          [data-help-panel="chat"] {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }

          /* Style the overflow button to look like a persistent tab */
          .pf-v6-c-tabs__scroll-button[data-overflowing] {
            border: 1px solid var(--pf-v6-global--BorderColor--100) !important;
            border-bottom: none !important;
            background: var(--pf-v6-global--BackgroundColor--100) !important;
            padding: 8px 16px !important;
            min-width: auto !important;
            font-size: var(--pf-v6-global--FontSize--sm) !important;
            font-weight: 500 !important;
            color: var(--pf-v6-global--Color--100) !important;
            border-radius: var(--pf-v6-global--BorderRadius--sm) var(--pf-v6-global--BorderRadius--sm) 0 0 !important;
            margin-left: 4px !important;
            order: 999 !important;
            position: relative !important;
          }

          .pf-v6-c-tabs__scroll-button[data-overflowing]:hover {
            background: var(--pf-v6-global--BackgroundColor--200) !important;
            cursor: pointer !important;
          }

          .pf-v6-c-tabs__scroll-button[data-overflowing] svg {
            display: none !important;
          }

          /* Allow overflow menu to escape tabs boundaries - only apply to tabs, not drawer */
          .pf-v6-c-tabs,
          .pf-v6-c-tabs__list {
            overflow: visible !important;
          }

          /* Make sure tabs container doesn't create scroll region */
          .pf-v6-c-tabs__scroll-button {
            overflow: visible !important;
          }

          /* Ensure overflow menu has high z-index and can overlay content */
          .pf-v6-c-tabs [role="menu"] {
            z-index: 9999 !important;
            position: fixed !important;
            background-color: var(--pf-v6-global--BackgroundColor--100, #ffffff) !important;
            box-shadow: 0 0.25rem 0.5rem 0rem rgba(3, 3, 3, 0.16), 0 0 0.375rem 0 rgba(3, 3, 3, 0.08) !important;
            border-radius: var(--pf-v6-global--BorderRadius--sm, 4px) !important;
          }

          /* Prevent any parent from creating a scroll container for the menu */
          .pf-v6-c-tabs .pf-v6-c-menu {
            overflow: visible !important;
            background-color: var(--pf-v6-global--BackgroundColor--100, #ffffff) !important;
          }

          /* Ensure menu items have proper background */
          .pf-v6-c-tabs [role="menu"] [role="menuitem"] {
            background-color: var(--pf-v6-global--BackgroundColor--100, #ffffff) !important;
          }

          /* Menu item hover state */
          .pf-v6-c-tabs [role="menu"] [role="menuitem"]:hover {
            background-color: var(--pf-v6-global--BackgroundColor--200, #f5f5f5) !important;
          }

          /* Close all button styling */
          .pf-v6-c-tabs [role="menu"] .close-all-tabs-button {
            color: var(--pf-v6-global--danger-color--100, #c9190b) !important;
            font-weight: 500 !important;
          }

          .pf-v6-c-tabs [role="menu"] .close-all-tabs-button:hover {
            color: var(--pf-v6-global--danger-color--200, #a30000) !important;
            background-color: var(--pf-v6-global--BackgroundColor--200, #f5f5f5) !important;
          }
`;
