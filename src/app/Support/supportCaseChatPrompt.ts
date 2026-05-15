/**
 * Help chat session keys and copy for New support case / CVE handoff.
 */

/** Persists the IDE → Help chat user prompt so CVE + `/support/cases/new` can restore the thread after navigation or refresh */
export const HCC_SESSION_HELP_CHAT_IDE_PROMPT = 'hcc-help-chat-active-ide-prompt';

/** Route for New support case — keep in sync with `routes` / `OpenSupportCaseButton` */
export const HCC_SUPPORT_CASE_NEW_PATH = '/support/cases/new' as const;

/** Generic example in assistant copy and Slack URL field placeholder (not the scripted demo paste). */
export const SUPPORT_CASE_SLACK_ENDPOINT_EXAMPLE = 'https://company.enterprise.slack.com/team/000000000';

/** Demo / annotations: URL the mocked user sends in chat after the assistant asks for an endpoint. */
export const SUPPORT_CASE_MOCK_USER_SLACK_ENDPOINT = 'https://redhat.enterprise.slack.com/team/UB71VEV0V';

/** Help panel Chat tab when opening **New support case** directly (no CVE troubleshoot thread). */
export const NEW_SUPPORT_CASE_CHAT_PROMPT =
  "I've automatically brought in your data. What other details do you want to include in your support ticket?";

/** Help panel Chat tab after user confirms they want to review the draft — appended to the ongoing CVE / IDE conversation. (Markdown) */
export const SUPPORT_CASE_DRAFT_LOADED_CHAT_PROMPT = [
  'Okay — **I\'ve loaded the draft** of the support case for you.',
  '',
  'You can edit fields directly in the **Open a case** wizard, or tell me what to change here in chat.',
].join('\n');

/** Exact demo phrase: help-chat annotations, dropdown sync, and `looksLikeSlackWebhookUrl` flow. */
export const SUPPORT_CASE_SLACK_DM_SYNC_DEMO_MESSAGE = 'sync this support case with my Slack DMs';

export const MOCK_SUBMITTED_SUPPORT_CASE_NUMBER = '12345667';

/** Placeholder destination for the demo “send test” action (no real integration). */
export const SUPPORT_CASE_SLACK_TEST_NOTIFICATION_HREF = '#demo-slack-test-notification';

/** After the user asks to sync the case to Slack — ask for incoming webhook URL (Markdown). */
export const SUPPORT_CASE_SLACK_WEBHOOK_INSTRUCTION_PROMPT = [
  'I can **sync case activity to your Slack** so updates land in direct messages or a channel you control.',
  '',
  `Please **paste your Slack endpoint URL** here in chat — for example a link like **\`${SUPPORT_CASE_SLACK_ENDPOINT_EXAMPLE}\`**, or a classic incoming webhook \`https://hooks.slack.com/services/…\`. You can also add it under **Third-party notifications** in the wizard and choose **Connect Slack**.`,
].join('\n');

/** Markdown — success + demo test link; then resume submit flow */
export function buildSupportCaseSlackLinkedAssistantMessage(): string {
  return [
    '**Slack endpoint saved.** This support case draft will sync updates to Slack using that webhook.',
    '',
    `When you’re ready, you can **[Send test notification to Slack](${SUPPORT_CASE_SLACK_TEST_NOTIFICATION_HREF})** *(demo — link only)*.`,
    '',
    'Anything else to adjust, or are you **ready to submit** the case to Red Hat?',
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
