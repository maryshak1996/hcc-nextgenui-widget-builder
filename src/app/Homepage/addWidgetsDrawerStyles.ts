/** Styles for the Homepage / dashboard “Add widgets” drawer and bank (shared). */
export const ADD_WIDGETS_DRAWER_STYLES = `
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
      margin-bottom: 0;
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
      background-color: var(--pf-t--global--background--color--secondary--default);
      border: none;
      border-radius: var(--pf-v6-c-card--BorderRadius, var(--pf-t--global--border--radius--medium, 8px));
      overflow: hidden;
      position: relative;
      z-index: 100;
      min-height: 0;
    }
    
    .widget-drawer-panel .pf-v6-c-panel__main-body {
      padding: 24px;
      min-height: 0;
    }
    
    .widget-drawer-panel .pf-v6-c-panel__main {
      min-height: 0;
    }

    .widget-drawer-section-card {
      --pf-v6-c-card--BorderColor: transparent !important;
      --pf-v6-c-card--BorderWidth: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }
    
    /* White subsection panels: flat fill, no outer card border */
    .widget-drawer .widget-drawer-subsection-card {
      --pf-v6-c-card--BackgroundColor: var(--pf-t--global--background--color--100);
      border: none !important;
      --pf-v6-c-card--BorderColor: transparent !important;
      --pf-v6-c-card--BorderWidth: 0 !important;
      box-shadow: none !important;
    }

    /* Plain strip (not CardHeader) so PF card-title rules do not flatten Title typography */
    .widget-drawer .widget-drawer-subsection-heading {
      padding-block: var(--pf-t--global--spacer--md);
      padding-inline: var(--pf-t--global--spacer--lg);
      box-sizing: border-box;
      background: var(--pf-t--global--background--color--100);
    }

    .widget-drawer .widget-drawer-subsection-heading__icon {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 0;
      color: var(--pf-t--global--icon--color--default);
    }

    .widget-drawer .widget-drawer-subsection-heading__icon svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    .add-widgets-example-prompts {
      --pf-v6-c-expandable-section--BackgroundColor: transparent;
    }

    .widget-drawer .add-widgets-example-prompts-list {
      --pf-v6-c-list--item--RowGap: var(--pf-t--global--spacer--sm);
    }

    .widget-drawer .add-widgets-example-prompt-link {
      --pf-v6-c-button--FontSize: var(--pf-t--global--font--size--body--default);
      text-align: left;
      height: auto;
      white-space: normal;
      padding-block: 2px;
    }
    
    .removed-widgets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .add-widgets-bank-grid {
      margin-top: 0;
      gap: 8px;
    }

    .add-widgets-bank-add {
      flex-shrink: 0;
    }

    .widget-drawer .add-widgets-bank-search-ai-icon {
      display: inline-flex;
      line-height: 0;
      color: var(--pf-t--global--icon--color--default);
    }

    .widget-drawer .add-widgets-bank-search-ai-icon svg {
      display: block;
    }

    /* Find widgets column: never narrower than 360px when the drawer has room */
    .widget-drawer .add-widgets-find-column {
      flex: 0 1 25%;
      min-width: 360px;
      max-width: 100%;
      min-height: 0;
    }

    /* Widget builder card: fill column height so the editor can stretch */
    .widget-drawer .add-widgets-builder-card.pf-v6-c-card {
      min-height: 0;
    }

    /* Expanded builder body: flex column so the editor row can grow */
    .widget-drawer .add-widgets-builder-section-body.pf-v6-c-card__body {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }

    .widget-drawer .add-widgets-builder-intro {
      flex-shrink: 0;
      margin: 0 0 var(--pf-t--global--spacer--md) 0;
      color: var(--pf-t--global--text--color--subtle, var(--pf-v6-global--Color--200));
      font-size: var(--pf-t--global--font--size--body--default);
    }

    /* Widget builder: code editor + preview in a row; preview wraps below when width is tight */
    .widget-drawer .add-widgets-builder-row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: stretch;
      gap: var(--pf-t--global--spacer--md);
      width: 100%;
      flex: 1 1 auto;
      min-height: 0;
    }

    .widget-drawer .add-widgets-builder-row__editor {
      display: flex;
      flex-direction: column;
      flex: 1 1 280px;
      min-width: 0;
      min-height: 0;
      max-width: 100%;
    }

    .widget-drawer .add-widgets-builder-editor-stack {
      display: flex;
      flex-direction: column;
      row-gap: var(--pf-t--global--spacer--md);
      flex: 1 1 auto;
      min-height: 0;
      min-width: 0;
      width: 100%;
    }

    /* Title + Icon: one row; labels use PF form label classes; gap between label and control via __field. */
    .widget-drawer .add-widgets-builder-title-icon-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      column-gap: var(--pf-t--global--spacer--lg);
      row-gap: var(--pf-t--global--spacer--md);
      width: 100%;
      flex-shrink: 0;
    }

    .widget-drawer .add-widgets-builder-title-icon-row__field {
      display: flex;
      align-items: center;
      gap: var(--pf-t--global--spacer--sm);
      min-width: 0;
    }

    .widget-drawer .add-widgets-builder-title-icon-row__field--title {
      flex: 1 1 auto;
      min-width: min(100%, 12rem);
    }

    .widget-drawer .add-widgets-builder-title-icon-row__field--icon {
      flex: 0 0 auto;
    }

    .widget-drawer .add-widgets-builder-title-icon-row .pf-v6-c-form__label {
      margin: 0;
      flex-shrink: 0;
    }

    .widget-drawer .add-widgets-builder-title-icon-row .pf-v6-c-form__label-text {
      font-weight: var(--pf-t--global--font--weight--body--bold);
    }

    .widget-drawer .add-widgets-builder-title-icon-row__control {
      flex: 1 1 auto;
      min-width: 0;
    }

    .widget-drawer .add-widgets-builder-title-icon-row__field--title .add-widgets-builder-title-icon-row__control .pf-v6-c-form-control {
      width: 100%;
    }

    .widget-drawer .add-widgets-builder-title-icon-row__control--icon {
      flex: 0 0 auto;
    }

    /*
     * Icon field: TextInputGroup border wraps the icon with even padding (icon is in-flow; dummy
     * input is an invisible overlay for PatternFly markup).
     */
    .widget-drawer .add-widgets-builder-header-icon-trigger {
      cursor: pointer;
      max-width: 100%;
      width: fit-content;
    }

    .widget-drawer .add-widgets-builder-header-icon-trigger .pf-v6-c-text-input-group {
      width: fit-content;
      min-width: 0;
      /* Match default TextInput / .pf-v6-c-form-control single-line height */
      min-height: calc(
        (var(--pf-t--global--font--size--body--default) * var(--pf-t--global--font--line-height--body))
          + (2 * var(--pf-t--global--spacer--control--vertical--default))
          + (2 * var(--pf-t--global--border--width--control--default))
      );
      display: flex;
      align-items: center;
      box-sizing: border-box;
    }

    .widget-drawer .add-widgets-builder-header-icon-trigger .pf-v6-c-text-input-group__main.pf-m-icon {
      flex: 1 1 auto;
      align-self: stretch;
      min-width: 0 !important;
      min-height: 100%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding-block: 0;
      padding-inline: var(--pf-t--global--spacer--control--horizontal--default);
    }

    .widget-drawer .add-widgets-builder-header-icon-trigger .pf-v6-c-text-input-group__text {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: 1.125rem;
      height: 1.125rem;
      min-width: 1.125rem;
      min-height: 1.125rem;
    }

    .widget-drawer .add-widgets-builder-header-icon-trigger .pf-v6-c-text-input-group__icon:not(.pf-m-status) {
      position: static !important;
      transform: none !important;
    }

    .widget-drawer .add-widgets-builder-header-icon-trigger .pf-v6-c-text-input-group__text-input {
      position: absolute !important;
      inset: 0 !important;
      box-sizing: border-box !important;
      width: 100% !important;
      height: 100% !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }

    .widget-drawer .add-widgets-builder-header-icon-trigger--locked {
      pointer-events: none;
      cursor: not-allowed;
      opacity: var(--pf-t--global--opacity--disabled, 0.6);
    }

    .widget-drawer .add-widgets-builder-header-icon-trigger--locked .pf-v6-c-text-input-group {
      --pf-v6-c-text-input-group--BorderColor: var(--pf-t--global--border--color--disabled);
      --pf-v6-c-text-input-group--BackgroundColor: var(--pf-t--global--background--color--disabled--default);
    }

    /*
     * Icon picker: 4×4 grid (icon-only). Selectors must not be scoped to the drawer wrapper — the Dropdown
     * menu is portaled to document.body, outside the drawer subtree.
     */
    .add-widgets-builder-icon-menu-grid.pf-v6-c-menu__list {
      display: grid !important;
      grid-template-columns: repeat(4, 2.75rem);
      grid-auto-rows: auto;
      gap: var(--pf-t--global--spacer--xs);
      min-width: auto;
      width: max-content;
      max-width: none;
      padding: var(--pf-t--global--spacer--sm);
    }

    .add-widgets-builder-icon-menu-grid.pf-v6-c-menu__list > .pf-v6-c-menu__list-item {
      margin: 0;
      align-items: stretch;
      border-radius: var(--pf-t--global--border--radius--small);
      overflow: hidden;
    }

    .add-widgets-builder-icon-menu-item.pf-v6-c-menu__item {
      align-items: center;
      justify-content: center;
      min-width: 2.75rem;
      min-height: 2.75rem;
      padding: var(--pf-t--global--spacer--xs);
      border-radius: var(--pf-t--global--border--radius--small);
      /* PF defaults menu rows to text-start + growing label — collapse label so the icon centers */
      --pf-v6-c-menu__item--PaddingInlineStart: var(--pf-t--global--spacer--xs);
      --pf-v6-c-menu__item--PaddingInlineEnd: var(--pf-t--global--spacer--xs);
      --pf-v6-c-menu__item--PaddingBlockStart: var(--pf-t--global--spacer--xs);
      --pf-v6-c-menu__item--PaddingBlockEnd: var(--pf-t--global--spacer--xs);
    }

    .add-widgets-builder-icon-menu-item .pf-v6-c-menu__item-main {
      position: relative;
      justify-content: center;
      align-items: center;
      column-gap: 0;
      flex: 1 1 auto;
      min-height: 0;
    }

    .add-widgets-builder-icon-menu-grid .pf-v6-c-menu__item-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin: 0;
    }

    .add-widgets-builder-icon-menu-grid .pf-v6-c-menu__item-text {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
      flex-grow: 0 !important;
    }

    /* Default menu icon color; brand when selected */
    .add-widgets-builder-icon-menu-grid .add-widgets-builder-icon-menu-item svg {
      width: 1.25rem;
      height: 1.25rem;
      color: var(--pf-t--global--icon--color--default);
    }

    .add-widgets-builder-icon-menu-grid .pf-v6-c-menu__list-item.pf-m-selected .add-widgets-builder-icon-menu-item svg,
    .add-widgets-builder-icon-menu-grid .add-widgets-builder-icon-menu-item.pf-m-selected svg,
    .add-widgets-builder-icon-menu-grid .add-widgets-builder-icon-menu-item[aria-selected='true'] svg {
      color: var(--pf-t--global--icon--color--brand--default);
    }

    /* Selected icon: brand ring like a focused icon control */
    .add-widgets-builder-icon-menu-grid .add-widgets-builder-icon-menu-item.pf-v6-c-menu__item.pf-m-selected,
    .add-widgets-builder-icon-menu-grid .pf-v6-c-menu__list-item.pf-m-selected .add-widgets-builder-icon-menu-item.pf-v6-c-menu__item,
    .add-widgets-builder-icon-menu-grid .add-widgets-builder-icon-menu-item.pf-v6-c-menu__item[aria-selected='true'] {
      box-shadow: inset 0 0 0 var(--pf-t--global--border--width--control--focused, 2px)
        var(--pf-t--global--border--color--brand--default);
    }

    /* Selection state uses menu background; hide separate checkmark so the grid stays icon-only. */
    .add-widgets-builder-icon-menu-grid .pf-v6-c-menu__item-select-icon {
      display: none;
    }

    .widget-drawer .add-widgets-builder-form-group.pf-v6-c-form__group {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      align-items: stretch;
    }

    .widget-drawer .add-widgets-builder-form-group.pf-v6-c-form__group .pf-v6-c-form__group-control {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      align-self: stretch;
    }

    .widget-drawer #widget-builder-code-editor {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
    }

    .widget-drawer .add-widgets-builder-row__editor .add-widgets-builder-code-editor.pf-v6-c-code-editor {
      width: 100%;
      flex: 1 1 auto;
      /* Floor height when the flex chain has no definite block size; grows when the builder card stretches */
      min-height: min(14rem, 40vh);
      height: 100%;
    }

    .widget-drawer .add-widgets-builder-row__editor .add-widgets-builder-code-editor .pf-v6-c-code-editor__main {
      min-height: 0;
    }

    /* Widget builder code editor: gray toolbar (grows) + white strip (fit-content, language only). */
    .widget-drawer .add-widgets-builder-row__editor .add-widgets-builder-code-editor.pf-v6-c-code-editor .pf-v6-c-code-editor__controls {
      flex: 1 1 auto;
      min-width: 0;
      align-items: stretch;
      flex-wrap: nowrap;
    }

    .widget-drawer .add-widgets-builder-code-editor .pf-v6-c-code-editor__header-content {
      align-items: stretch;
      background-color: var(--pf-t--global--background--color--primary--default);
      padding-block: 0;
      padding-inline: 0;
    }

    .widget-drawer .add-widgets-builder-code-editor-header-toolbar {
      display: flex;
      flex: 1 1 auto;
      min-width: 0;
      align-items: stretch;
    }

    .widget-drawer .add-widgets-builder-code-editor-toolbar-gray {
      display: flex;
      flex: 1 1 auto;
      min-width: 0;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--pf-v6-c-code-editor__controls--Gap, var(--pf-t--global--spacer--sm));
      padding-inline: var(--pf-t--global--spacer--sm);
      padding-block: var(--pf-t--global--spacer--xs);
      background-color: var(--pf-t--global--background--color--secondary--default);
      border-inline-end: var(--pf-t--global--border--width--box--default) solid var(--pf-t--global--border--color--default);
    }

    .widget-drawer .add-widgets-builder-code-editor-toolbar-gray-spacer {
      flex: 1 1 auto;
      min-width: var(--pf-t--global--spacer--sm);
    }

    .widget-drawer .add-widgets-builder-code-editor-toolbar-white {
      display: flex;
      flex: 0 0 auto;
      align-items: center;
      align-self: stretch;
      width: fit-content;
      max-width: 100%;
      padding-inline: var(--pf-t--global--spacer--sm);
      padding-block: var(--pf-t--global--spacer--xs);
      background-color: var(--pf-t--global--background--color--primary--default);
    }

    .widget-drawer .add-widgets-builder-language-toggle-content {
      display: inline-flex;
      align-items: center;
      gap: var(--pf-t--global--spacer--xs);
    }

    .widget-drawer .add-widgets-builder-language-toggle-icon {
      flex-shrink: 0;
      width: 1rem;
      height: 1rem;
      color: var(--pf-t--global--icon--color--default);
    }

    .widget-drawer .add-widgets-builder-row__preview {
      display: flex;
      flex-direction: column;
      flex: 1 1 300px;
      min-width: 0;
      min-height: 0;
      width: 100%;
      box-sizing: border-box;
      align-self: stretch;
    }

    /* Grey preview shell: no outer card border — inner sample widget is the only bordered card (matches dashboard). */
    .widget-drawer .add-widgets-builder-preview-panel.pf-v6-c-card {
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      max-width: 100%;
      overflow: visible;
      border: none;
      box-shadow: none;
      --pf-v6-c-card--first-child--PaddingBlockStart: var(--pf-t--global--spacer--sm);
      --pf-v6-c-card--child--PaddingInlineEnd: var(--pf-t--global--spacer--md);
      --pf-v6-c-card--child--PaddingBlockEnd: var(--pf-t--global--spacer--md);
      --pf-v6-c-card--child--PaddingInlineStart: var(--pf-t--global--spacer--md);
      --pf-v6-c-card--c-divider--child--PaddingBlockStart: var(--pf-t--global--spacer--sm);
    }

    .widget-drawer .add-widgets-builder-preview-panel-header.pf-v6-c-card__header {
      padding-block: var(--pf-t--global--spacer--sm);
    }

    .widget-drawer .add-widgets-builder-preview-panel-body.pf-v6-c-card__body {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 0;
      gap: var(--pf-t--global--spacer--md);
    }

    .widget-drawer .add-widgets-builder-preview-panel-actions.pf-v6-l-flex {
      margin-top: auto;
      flex-shrink: 0;
      width: 100%;
    }

    /* Inner “dashboard widget” sample card: single PF card chrome like grid widgets; height from content only */
    .widget-drawer .widget-builder-sample-preview-card.pf-v6-c-card {
      height: fit-content;
      overflow: visible;
      width: 100%;
      max-width: 100%;
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
    
    .bank-widget-wrapper {
      cursor: default;
    }

    .bank-widget-wrapper--celebrate-exit {
      pointer-events: none;
      opacity: 0;
      transform: scale(0.97);
      transition: opacity 300ms ease, transform 300ms ease;
    }

    @media (prefers-reduced-motion: reduce) {
      .bank-widget-wrapper--celebrate-exit {
        transform: none;
        transition: opacity 200ms ease;
      }
    }
    
    .bank-widget-card {
      transition: all 0.2s ease-in-out;
      border: 2px dashed var(--pf-v6-global--BorderColor--100);
      background-color: var(--pf-v6-global--BackgroundColor--100);
    }
    
    .bank-widget-wrapper:hover .bank-widget-card {
      border-color: var(--pf-v6-global--primary-color--100);
      box-shadow: var(--pf-v6-global--BoxShadow--sm);
    }

    .bank-widget-card__action-slot.pf-v6-l-flex__item,
    .bank-widget-card__action-slot {
      flex-shrink: 0;
      width: 2.25rem;
      min-height: 2.25rem;
      display: inline-flex !important;
      align-items: center;
      justify-content: center;
    }

    .bank-widget-card__action-slot svg {
      width: 1.125rem;
      height: 1.125rem;
    }

    .bank-widget-card__action-slot .pf-v6-c-button.pf-m-plain {
      --pf-v6-c-button--PaddingInlineStart: var(--pf-t--global--spacer--xs);
      --pf-v6-c-button--PaddingInlineEnd: var(--pf-t--global--spacer--xs);
    }

    .drag-overlay {
      opacity: 0.9;
      box-shadow: var(--pf-v6-global--BoxShadow--xl) !important;
      cursor: grabbing !important;
    }
`;
