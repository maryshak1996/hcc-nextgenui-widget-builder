/** Written before `navigate('/support/cases/new')` from CVE flow; read synchronously on that route mount */
export const HCC_SUPPORT_CASE_DRAFT_PAYLOAD = 'hcc-support-case-draft-payload';

/** When `'1'`, wizard opens on step 5 (Review) */
export const HCC_WIZARD_START_AT_REVIEW_STEP = 'hcc-wizard-open-review-step';

/** JSON snapshot of follow-up chat on New support case (`phase`, `continuationMessages`, …) — survives refresh. */
export const HCC_SUPPORT_CASE_CHAT_CONTINUATION_KEY = 'hcc-support-case-chat-continuation';

/** True when session has non-trivial follow-up chat (avoid resetting thread after refresh). */
export function hasPersistedSupportCaseContinuationThread(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const raw = window.sessionStorage.getItem(HCC_SUPPORT_CASE_CHAT_CONTINUATION_KEY);
    if (!raw) {
      return false;
    }
    const p = JSON.parse(raw) as {
      phase?: string;
      continuationMessages?: unknown[];
      submittedCaseNumber?: string | null;
    };
    if (p.submittedCaseNumber) {
      return true;
    }
    if (p.phase && p.phase !== 'idle') {
      return true;
    }
    return Array.isArray(p.continuationMessages) && p.continuationMessages.length > 0;
  } catch {
    return false;
  }
}
