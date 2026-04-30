/**
 * Body-only sample definitions for the widget builder code editor (header title + icon are edited above the editor).
 */
export const WIDGET_BUILDER_SAMPLE_YAML = `layout: centered
blocks:
  - type: text
    text: "Your custom content here like, for example:"
  - type: button
    variant: secondary
    label: A secondary button
  - type: text
    text: "Or maybe a"
  - type: button
    variant: primary
    label: A primary button
  - type: richText
    segments:
      - { type: text, text: "Should work as long as you use " }
      - { type: inlineCode, text: "markdown" }
      - { type: text, text: "." }
`;

export const WIDGET_BUILDER_SAMPLE_JSON = `{
  "layout": "centered",
  "blocks": [
    { "type": "text", "text": "Your custom content here like, for example:" },
    { "type": "button", "variant": "secondary", "label": "A secondary button" },
    { "type": "text", "text": "Or maybe a" },
    { "type": "button", "variant": "primary", "label": "A primary button" },
    {
      "type": "richText",
      "segments": [
        { "type": "text", "text": "Should work as long as you use " },
        { "type": "inlineCode", "text": "markdown" },
        { "type": "text", "text": "." }
      ]
    }
  ]
}
`;

export const WIDGET_BUILDER_SAMPLE_MARKDOWN = `# Widget body

Edit the fenced YAML below (widget header uses **Widget title** and **Header icon** above the editor).

\`\`\`widget-spec
layout: centered
blocks:
  - type: text
    text: "Your custom content here like, for example:"
  - type: button
    variant: secondary
    label: A secondary button
  - type: text
    text: "Or maybe a"
  - type: button
    variant: primary
    label: A primary button
  - type: richText
    segments:
      - { type: text, text: "Should work as long as you use " }
      - { type: inlineCode, text: "markdown" }
      - { type: text, text: "." }
\`\`\`
`;

export type WidgetBuilderFormat = 'yaml' | 'json' | 'markdown';

/** Display names for the widget definition language (toolbar language menu). */
export const WIDGET_BUILDER_FORMAT_LABELS: Record<WidgetBuilderFormat, string> = {
  yaml: 'YAML',
  json: 'JSON',
  markdown: 'Markdown'
};

export const WIDGET_BUILDER_SAMPLES: Record<WidgetBuilderFormat, string> = {
  yaml: WIDGET_BUILDER_SAMPLE_YAML,
  json: WIDGET_BUILDER_SAMPLE_JSON,
  markdown: WIDGET_BUILDER_SAMPLE_MARKDOWN
};

export const WIDGET_BUILDER_DEFAULT_TITLE = 'Widget title here';
