import yaml from 'js-yaml';
import type { WidgetBuilderFormat } from '@app/Homepage/widgetBuilderSamples';

export type PreviewSegment = { type: 'text' | 'inlineCode'; text: string };

export type PreviewBlock =
  | { type: 'text'; text: string }
  | { type: 'button'; variant: 'primary' | 'secondary'; label: string }
  | { type: 'richText'; segments: PreviewSegment[] };

/** Parsed from the code editor only (widget body). Title and header icon come from the form. */
export interface WidgetBuilderPreviewModel {
  blocks: PreviewBlock[];
}

/** Default body blocks (matches shipped body samples). */
export const DEFAULT_WIDGET_BUILDER_PREVIEW_MODEL: WidgetBuilderPreviewModel = {
  blocks: [
    { type: 'text', text: 'Your custom content here like, for example:' },
    { type: 'button', variant: 'secondary', label: 'A secondary button' },
    { type: 'text', text: 'Or maybe a' },
    { type: 'button', variant: 'primary', label: 'A primary button' },
    {
      type: 'richText',
      segments: [
        { type: 'text', text: 'Should work as long as you use ' },
        { type: 'inlineCode', text: 'markdown' },
        { type: 'text', text: '.' }
      ]
    }
  ]
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function normalizeBlocks(raw: unknown): PreviewBlock[] | null {
  if (!Array.isArray(raw)) {
    return null;
  }
  const out: PreviewBlock[] = [];
  for (const item of raw) {
    if (!isRecord(item)) {
      return null;
    }
    const t = item.type;
    if (t === 'text' && typeof item.text === 'string') {
      out.push({ type: 'text', text: item.text });
      continue;
    }
    if (
      t === 'button' &&
      (item.variant === 'primary' || item.variant === 'secondary') &&
      typeof item.label === 'string'
    ) {
      out.push({ type: 'button', variant: item.variant, label: item.label });
      continue;
    }
    if (t === 'richText' && Array.isArray(item.segments)) {
      const segs: PreviewSegment[] = [];
      for (const s of item.segments) {
        if (!isRecord(s)) {
          return null;
        }
        if (s.type === 'text' && typeof s.text === 'string') {
          segs.push({ type: 'text', text: s.text });
        } else if (s.type === 'inlineCode' && typeof s.text === 'string') {
          segs.push({ type: 'inlineCode', text: s.text });
        } else {
          return null;
        }
      }
      out.push({ type: 'richText', segments: segs });
      continue;
    }
    return null;
  }
  return out;
}

/** Accept `{ blocks }`, `{ layout, blocks }`, legacy `{ body: { blocks } }`, or a root-level blocks array. */
function normalizeBodyDocument(obj: unknown): PreviewBlock[] | null {
  if (Array.isArray(obj)) {
    return normalizeBlocks(obj);
  }
  if (!isRecord(obj)) {
    return null;
  }
  if (Array.isArray(obj.blocks)) {
    return normalizeBlocks(obj.blocks);
  }
  if (isRecord(obj.body) && Array.isArray(obj.body.blocks)) {
    return normalizeBlocks(obj.body.blocks);
  }
  return null;
}

function bodyFromParsedObject(obj: unknown): WidgetBuilderPreviewModel | null {
  const blocks = normalizeBodyDocument(obj);
  if (!blocks) {
    return null;
  }
  return { blocks };
}

/** Returns null if the editor contents are not a valid widget body for the selected format. */
export function parseWidgetBuilderCode(code: string, format: WidgetBuilderFormat): WidgetBuilderPreviewModel | null {
  const trimmed = code.trim();
  if (!trimmed) {
    return null;
  }
  try {
    if (format === 'json') {
      const obj = JSON.parse(trimmed) as unknown;
      return bodyFromParsedObject(obj);
    }
    if (format === 'yaml') {
      const obj = yaml.load(trimmed) as unknown;
      return bodyFromParsedObject(obj);
    }
    const fence = trimmed.match(/```(?:widget-spec|yaml)\s*([\s\S]*?)```/i);
    if (fence?.[1]) {
      const obj = yaml.load(fence[1].trim()) as unknown;
      return bodyFromParsedObject(obj);
    }
    return null;
  } catch {
    return null;
  }
}
