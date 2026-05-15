import { COPYFAIL_CVE_DEMO_ID } from '@app/RhelVulnerability/copyFailDemoFleet';
import { CVE_REMEDIATION_FAILED_HOST_TECHNICAL_ISSUE } from '@app/RhelVulnerability/cveTroubleshootDemoCopy';
import { MASTHEAD_USER_EMAIL } from '@app/mastheadUserDisplayName';

/** Linked chat tool for third-party case notifications (Slack webhook wired; others reserved). */
export type TSupportCaseThirdPartyChatTool = 'slack' | 'gchat' | 'teams';

export const SUPPORT_CASE_THIRD_PARTY_TOOL_LABELS: Record<TSupportCaseThirdPartyChatTool, string> = {
  slack: 'Slack',
  gchat: 'GChat',
  teams: 'Microsoft Teams',
};

/** Case type cards — matches portal “Open a case” flow */
export const SUPPORT_CASE_TYPE_OPTIONS: { id: string; title: string; description: string }[] = [
  { id: 'bug', title: 'Bug or Defect', description: 'Report an issue with a product' },
  { id: 'cert', title: 'Certification', description: 'Hardware and software certification support' },
  { id: 'config', title: 'Configuration', description: 'Set-up, configuration & upgrade support' },
  { id: 'customer', title: 'Customer Service', description: 'Account, billing, or subscription support' },
  { id: 'docs', title: 'Usage & Docs help', description: 'Support or request an update to content' },
  { id: 'idea', title: 'Idea', description: 'Request a feature or product enhancement' },
  { id: 'rca', title: 'Root cause analysis', description: 'Only for identifying the source of an issue' },
  { id: 'other', title: 'Other', description: 'General option' },
];

export interface ISupportCaseDraft {
  productId: string;
  version: string;
  title: string;
  problemDescription: string;
  accountId: string;
  ownerId: string;
  caseTypeId: string;
  impact: string;
  frequency: string;
  severityAlertTitle: string;
  phone: string;
  preferredLanguage: string;
  groupId: string;
  notifications: string;
  /** User groups / mailing lists that receive email notifications (demo: dismissable labels) */
  notificationGroups: string[];
  /** Selected third-party chat integration; empty when none. */
  thirdPartyChatTool: '' | TSupportCaseThirdPartyChatTool;
  /** Slack incoming webhook / endpoint URL when `thirdPartyChatTool === 'slack'`. */
  slackNotificationEndpointUrl: string;
  /** Demo: true after mock “connect” (chat or wizard) so UI can show success + test link. */
  slackWebhookDemoVerified: boolean;
  personalReference: string;
}

export const DEFAULT_SUPPORT_CASE_DRAFT: ISupportCaseDraft = {
  productId: 'rhel',
  version: '9.6',
  title: 'CVE-2026-31431 impacting dummy-rhel-system',
  problemDescription: 'ALL THE IMPORTANT STUFF JUST GOES IN HERE',
  accountId: '6082715',
  ownerId: 'rbac',
  caseTypeId: 'bug',
  impact: '',
  frequency: '',
  severityAlertTitle: '4 (Low) — A non-urgent query regarding Red Hat product or service',
  phone: '+1 (978) 602-0969',
  preferredLanguage: '',
  groupId: 'ungrouped',
  notifications: '',
  notificationGroups: [MASTHEAD_USER_EMAIL],
  thirdPartyChatTool: '',
  slackNotificationEndpointUrl: '',
  slackWebhookDemoVerified: false,
  personalReference: '',
};

export function mergeDraft(partial: Partial<ISupportCaseDraft> | null | undefined): ISupportCaseDraft {
  if (!partial) {
    return { ...DEFAULT_SUPPORT_CASE_DRAFT };
  }
  const merged = { ...DEFAULT_SUPPORT_CASE_DRAFT, ...partial };
  if (partial.notificationGroups === undefined) {
    merged.notificationGroups = [...DEFAULT_SUPPORT_CASE_DRAFT.notificationGroups];
  }
  if (!merged.notificationGroups?.length) {
    merged.notificationGroups = [...DEFAULT_SUPPORT_CASE_DRAFT.notificationGroups];
  }
  return merged;
}

/** Prefill after CVE troubleshoot “yes” — remaining host still at risk */
export function buildCvePrefilledSupportDraft(remainingHostName: string, cveId: string = COPYFAIL_CVE_DEMO_ID): ISupportCaseDraft {
  return mergeDraft({
    title: `${cveId} impacting ${remainingHostName}`,
    problemDescription: [
      `Support case draft for ${cveId}.`,
      '',
      'Context from Red Hat: Copy fail–related vulnerability; fleet remediation completed for most systems.',
      `One host remains exposed or not fully validated: ${remainingHostName}.`,
      '',
      CVE_REMEDIATION_FAILED_HOST_TECHNICAL_ISSUE,
      '',
      'Include sosreport from that host, RHSA/advisory linkage, and any errors from remediation playbooks.',
    ].join('\n'),
    impact:
      'Potential compromise or misconfiguration persistence on the remaining host until remediation is verified; production impact depends on workload sensitivity.',
    frequency:
      'Risk persists until patching and validation complete on the affected system; other hosts in scope were remediated successfully.',
    severityAlertTitle: '2 (High) — A high-priority query regarding Red Hat product or service',
  });
}
