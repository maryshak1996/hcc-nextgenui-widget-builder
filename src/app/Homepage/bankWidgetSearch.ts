import type { Widget } from '@app/Homepage/widgetTypes';

/** Example prompts: click fills the search field and runs the same keyword search as Enter. */
export const EXAMPLE_BANK_SEARCH_PROMPTS: readonly string[] = [
  'Show me my critical vulnerabilities',
  'Visualize my RHEL subscription usage',
  'Show me my account details',
  'Summarize my cluster health'
];

/** Filler words stripped so natural-language queries still match on meaningful tokens. */
const BANK_SEARCH_STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'any',
  'are',
  'as',
  'at',
  'be',
  'been',
  'being',
  'both',
  'but',
  'by',
  'can',
  'could',
  'did',
  'do',
  'does',
  'each',
  'few',
  'find',
  'for',
  'from',
  'get',
  'had',
  'has',
  'have',
  'having',
  'he',
  'help',
  'her',
  'here',
  'him',
  'his',
  'how',
  'i',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'just',
  'like',
  'many',
  'may',
  'me',
  'might',
  'more',
  'most',
  'much',
  'must',
  'my',
  'need',
  'needs',
  'no',
  'not',
  'of',
  'on',
  'only',
  'or',
  'other',
  'our',
  'own',
  'same',
  'see',
  'shall',
  'she',
  'should',
  'show',
  'so',
  'some',
  'such',
  'than',
  'that',
  'the',
  'their',
  'them',
  'then',
  'there',
  'these',
  'they',
  'this',
  'those',
  'to',
  'too',
  'very',
  'want',
  'was',
  'we',
  'were',
  'what',
  'when',
  'where',
  'which',
  'who',
  'why',
  'will',
  'with',
  'would',
  'you',
  'your'
]);

export function tokenizeBankSearchQuery(raw: string): string[] {
  const q = raw.trim().toLowerCase();
  if (!q) {
    return [];
  }
  return q
    .split(/[^a-z0-9]+/i)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !BANK_SEARCH_STOP_WORDS.has(t));
}

/** e.g. "clusters" also tries "cluster" against titles. */
function bankSearchKeywordVariants(token: string): readonly string[] {
  const out = new Set<string>([token]);
  if (token.length > 3 && token.endsWith('s') && !token.endsWith('ss')) {
    out.add(token.slice(0, -1));
  }
  return Array.from(out);
}

export function widgetMatchesBankSearchKeywords(widget: Widget, keywords: readonly string[]): boolean {
  if (keywords.length === 0) {
    return false;
  }
  const hay = `${widget.title} ${widget.id}`.toLowerCase();
  return keywords.some((kw) => bankSearchKeywordVariants(kw).some((variant) => hay.includes(variant)));
}

/**
 * Same keyword matching as Find widgets in the add-widgets bank.
 * Empty query returns the full catalog (copy).
 */
export function filterCatalogWidgetsBySearch(catalog: readonly Widget[], searchQuery: string): Widget[] {
  const q = searchQuery.trim();
  if (!q) {
    return [...catalog];
  }
  const keywords = tokenizeBankSearchQuery(q);
  return catalog.filter((w) => widgetMatchesBankSearchKeywords(w, keywords));
}
