import type { ISupportCaseDraft } from '@app/Support/supportCaseDraftConstants';
import {
  HCC_SUPPORT_CASE_DRAFT_PAYLOAD,
  HCC_WIZARD_START_AT_REVIEW_STEP,
} from '@app/Support/supportCaseDraftSession';

/** Passed via `navigate(..., { state })` from CVE → new case so Review step survives Strict Mode double-mount */
export const HCC_SUPPORT_CASE_WIZARD_BOOTSTRAP_STATE_KEY = 'hccSupportCaseWizardBootstrap';

export interface ISupportCaseWizardBootstrap {
  initialDraft: ISupportCaseDraft | null;
  wizardStartIndex: number;
  /** CVE handoff demo: staged wizard body + help-chat intro timing */
  fromCveDemoHandoff?: boolean;
}

/** Survives Strict Mode: first paint reads session and clears keys; second mount returns cached result */
let sessionBootstrapCache: ISupportCaseWizardBootstrap | undefined;

export function clearSupportCaseWizardSessionBootstrapCache(): void {
  sessionBootstrapCache = undefined;
}

function tryParseRouterBootstrap(locationState: unknown): ISupportCaseWizardBootstrap | null {
  if (!locationState || typeof locationState !== 'object') {
    return null;
  }
  const raw = (locationState as Record<string, unknown>)[HCC_SUPPORT_CASE_WIZARD_BOOTSTRAP_STATE_KEY];
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const rec = raw as Record<string, unknown>;
  const wizardStartIndex = rec.wizardStartIndex;
  if (typeof wizardStartIndex !== 'number' || wizardStartIndex < 1) {
    return null;
  }
  const initialDraft = rec.initialDraft;
  if (initialDraft !== null && (typeof initialDraft !== 'object' || Array.isArray(initialDraft))) {
    return null;
  }
  const fromCveDemoHandoff = rec.fromCveDemoHandoff === true;
  return {
    wizardStartIndex,
    initialDraft: initialDraft as ISupportCaseDraft | null,
    fromCveDemoHandoff,
  };
}

function readSupportCaseWizardBootstrapFromSessionOnce(): ISupportCaseWizardBootstrap {
  if (typeof window === 'undefined') {
    return { initialDraft: null, wizardStartIndex: 1 };
  }
  try {
    const raw = sessionStorage.getItem(HCC_SUPPORT_CASE_DRAFT_PAYLOAD);
    const openReview = sessionStorage.getItem(HCC_WIZARD_START_AT_REVIEW_STEP) === '1';
    if (raw) {
      sessionStorage.removeItem(HCC_SUPPORT_CASE_DRAFT_PAYLOAD);
      sessionStorage.removeItem(HCC_WIZARD_START_AT_REVIEW_STEP);
      const parsed = JSON.parse(raw) as ISupportCaseDraft;
      return { initialDraft: parsed, wizardStartIndex: openReview ? 5 : 1 };
    }
    if (openReview) {
      sessionStorage.removeItem(HCC_WIZARD_START_AT_REVIEW_STEP);
    }
  } catch {
    /* ignore */
  }
  return { initialDraft: null, wizardStartIndex: 1 };
}

function readSupportCaseWizardBootstrapFromSessionCached(): ISupportCaseWizardBootstrap {
  if (sessionBootstrapCache !== undefined) {
    return sessionBootstrapCache;
  }
  sessionBootstrapCache = readSupportCaseWizardBootstrapFromSessionOnce();
  return sessionBootstrapCache;
}

/** Prefer React Router location state (CVE handoff), then sessionStorage (refresh / deep link). */
export function resolveSupportCaseWizardBootstrap(locationState: unknown): ISupportCaseWizardBootstrap {
  const fromRouter = tryParseRouterBootstrap(locationState);
  if (fromRouter) {
    return fromRouter;
  }
  return readSupportCaseWizardBootstrapFromSessionCached();
}
