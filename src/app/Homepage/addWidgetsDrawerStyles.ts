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
    
    /* White “subsection” card: entire card expands/collapses; no inner grey expandables */
    .widget-drawer .widget-drawer-subsection-card {
      --pf-v6-c-card--BackgroundColor: var(--pf-t--global--background--color--100);
      border: 1px solid var(--pf-t--global--border--color--default) !important;
      --pf-v6-c-card--BorderColor: var(--pf-t--global--border--color--default) !important;
      --pf-v6-c-card--BorderWidth: 1px;
      box-shadow: var(--pf-t--global--box-shadow--sm) !important;
    }
    
    .widget-drawer .widget-drawer-subsection-toggle {
      width: 100%;
      text-align: left;
      padding: var(--pf-t--global--spacer--md) var(--pf-t--global--spacer--lg);
      cursor: pointer;
      background: var(--pf-t--global--background--color--100);
      border: none;
      box-sizing: border-box;
    }
    
    .widget-drawer .widget-drawer-subsection-toggle:hover {
      background: var(--pf-t--global--background--color--200);
    }
    
    .widget-drawer .widget-drawer-subsection-toggle:focus {
      outline: 2px solid var(--pf-t--global--primary--default);
      outline-offset: 2px;
    }
    
    .widget-drawer .widget-drawer-caret {
      display: inline-flex;
      flex-shrink: 0;
      line-height: 1;
      transition: transform 0.15s ease;
      color: var(--pf-t--global--text--color--default);
    }
    
    .widget-drawer .widget-drawer-caret svg {
      width: 0.9em;
      height: 0.9em;
    }
    
    .widget-drawer .widget-drawer-subsection-toggle[aria-expanded="true"] .widget-drawer-caret {
      transform: rotate(90deg);
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
    
    .widget-drawer-section-card .pf-v6-c-card.pf-m-selectable {
      --pf-v6-c-card--BorderColor: var(--pf-t--global--border--color--default, #c7c7c7);
      --pf-v6-c-card--BorderWidth: 1px;
      cursor: pointer;
    }
    
    .widget-drawer-section-card .pf-v6-c-card.pf-m-selectable:hover {
      --pf-v6-c-card--BorderColor: var(--pf-t--global--border--color--hover, #4394e5);
    }
    
    .widget-drawer-section-card .pf-v6-c-card.pf-m-selectable.pf-m-selected {
      --pf-v6-c-card--BorderColor: var(--pf-t--global--border--color--clicked, #0066cc);
      --pf-v6-c-card--BorderWidth: 2px;
    }
    
    .widget-drawer-section-card .pf-v6-c-card.pf-m-selectable .pf-v6-c-radio__input {
      appearance: auto;
      -webkit-appearance: radio;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
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

    /* Find widgets column: never narrower than 360px when the drawer has room */
    .widget-drawer .add-widgets-find-column {
      flex: 0 1 25%;
      min-width: 360px;
      max-width: 100%;
      min-height: 0;
    }

    /* Widget builder: options + preview in a row; preview wraps below when width is tight */
    .widget-drawer .add-widgets-builder-row {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: stretch;
      gap: var(--pf-t--global--spacer--md);
      width: 100%;
    }

    .widget-drawer .add-widgets-builder-row__options {
      flex: 0 1 auto;
      min-width: min(100%, 220px);
      max-width: 100%;
    }

    .widget-drawer .add-widgets-builder-row__preview {
      flex: 1 1 300px;
      min-width: 0;
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
