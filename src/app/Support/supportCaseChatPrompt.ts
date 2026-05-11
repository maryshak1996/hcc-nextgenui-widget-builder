/**
 * One-shot guard: `SupportNewCase` effect runs twice in React Strict Mode; after CVE continuation we skip the generic
 * `openHelpPanelWithChatPrompt` pass so the IDE + troubleshoot transcript is not replaced.
 */
export const HCC_SKIP_GENERIC_HELP_CHAT_ONCE = 'hcc-skip-generic-help-chat-once';

/** Persists the IDE → Help chat user prompt so CVE + `/support/cases/new` can restore the thread after navigation or refresh */
export const HCC_SESSION_HELP_CHAT_IDE_PROMPT = 'hcc-help-chat-active-ide-prompt';

/** Route for New support case — keep in sync with `routes` / `OpenSupportCaseButton` */
export const HCC_SUPPORT_CASE_NEW_PATH = '/support/cases/new' as const;

/** Help panel Chat tab when opening **New support case** directly (no CVE troubleshoot thread). */
export const NEW_SUPPORT_CASE_CHAT_PROMPT =
  "I've automatically brought in your data. What other details do you want to include in your support ticket?";

/** Help panel Chat tab after user confirms they want to review the draft — appended to the ongoing CVE / IDE conversation. (Markdown) */
export const SUPPORT_CASE_DRAFT_LOADED_CHAT_PROMPT = [
  'Okay — **I\'ve loaded the draft** of the support case for you.',
  '',
  'You can edit fields directly in the **Open a case** wizard, or tell me what to change here in chat.',
].join('\n');

/** Demo groups suggested after the user asks to notify the app-sre team */
export const SUPPORT_CASE_DEMO_NOTIFY_GROUPS = ['app-sre-all', 'app-sre-on-call', 'sre-admins'] as const;

export const MOCK_SUBMITTED_SUPPORT_CASE_NUMBER = '12345667';

/** Assistant reply listing suggested notification groups (Markdown) */
export const SUPPORT_CASE_ASSISTANT_GROUP_OPTIONS_PROMPT = [
  'Sure — here are **potentially relevant user groups** I found:',
  '',
  '- **`app-sre-all`**',
  '- **`app-sre-on-call`**',
  '- **`sre-admins`**',
  '',
  'Would **one or more** of those be correct, or is there a **different group** you’d like to notify instead?',
].join('\n');

export function buildSupportCaseGroupsAddedAssistantMessage(groups: readonly string[]): string {
  const bullets = groups.map((g) => `- **\`${g}\`** — email notifications enabled`).join('\n');
  return [
    `**${groups.length} user groups** have been added to receive email about this support case:`,
    '',
    bullets,
    '',
    'Is there anything else I can help you with, or are you **ready to submit** the case to Red Hat?',
  ].join('\n');
}

/** Markdown — case number bold; link is demo-only */
export function buildSupportCaseSubmittedAssistantMessage(caseNumber: string): string {
  return [
    `**Support case #${caseNumber}** has been submitted to Red Hat.`,
    '',
    '- **Case ID:** `#${caseNumber}`',
    '- **Next:** [Open Support cases](/support/cases) to view details and track updates *(demo link)*',
  ].join('\n');
}
