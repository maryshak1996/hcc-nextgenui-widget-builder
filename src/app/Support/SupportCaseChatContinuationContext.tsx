import * as React from 'react';
import { useLocation } from 'react-router-dom';
import type { ISupportCaseDraft } from '@app/Support/supportCaseDraftConstants';
import { HCC_SUPPORT_CASE_CHAT_CONTINUATION_KEY } from '@app/Support/supportCaseDraftSession';
import {
  HCC_SUPPORT_CASE_NEW_PATH,
  MOCK_SUBMITTED_SUPPORT_CASE_NUMBER,
  SUPPORT_CASE_SLACK_WEBHOOK_INSTRUCTION_PROMPT,
  buildSupportCaseSlackLinkedAssistantMessage,
  buildSupportCaseSubmittedAssistantMessage,
} from '@app/Support/supportCaseChatPrompt';

export type TSupportCaseChatContinuationPhase =
  | 'idle'
  | 'awaiting_notify_intent'
  | 'awaiting_slack_webhook'
  | 'after_groups_added'
  | 'submitted';

export interface ISupportCaseChatLine {
  role: 'user' | 'assistant';
  content: string;
}

const PHASE_SET = new Set<TSupportCaseChatContinuationPhase>([
  'idle',
  'awaiting_notify_intent',
  'awaiting_slack_webhook',
  'after_groups_added',
  'submitted',
]);

interface IPersistedContinuationV1 {
  v: 1;
  phase: TSupportCaseChatContinuationPhase;
  continuationMessages: ISupportCaseChatLine[];
  submittedCaseNumber: string | null;
}

function clearContinuationSnapshot(): void {
  try {
    sessionStorage.removeItem(HCC_SUPPORT_CASE_CHAT_CONTINUATION_KEY);
  } catch {
    /* ignore */
  }
}

function readContinuationSnapshotForPath(): IPersistedContinuationV1 | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!window.location.pathname.endsWith(HCC_SUPPORT_CASE_NEW_PATH)) {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(HCC_SUPPORT_CASE_CHAT_CONTINUATION_KEY);
    if (!raw) {
      return null;
    }
    const p = JSON.parse(raw) as Partial<IPersistedContinuationV1>;
    if (p.v !== 1 || !Array.isArray(p.continuationMessages)) {
      return null;
    }
    const phaseRaw = p.phase;
    const phase =
      typeof phaseRaw === 'string' && PHASE_SET.has(phaseRaw as TSupportCaseChatContinuationPhase)
        ? (phaseRaw as TSupportCaseChatContinuationPhase)
        : 'idle';
    const lines: ISupportCaseChatLine[] = p.continuationMessages.filter(
      (row): row is ISupportCaseChatLine =>
        row != null &&
        typeof row === 'object' &&
        (row.role === 'user' || row.role === 'assistant') &&
        typeof (row as ISupportCaseChatLine).content === 'string'
    );
    const submitted =
      typeof p.submittedCaseNumber === 'string' || p.submittedCaseNumber === null
        ? p.submittedCaseNumber
        : null;
    return { v: 1, phase, continuationMessages: lines, submittedCaseNumber: submitted };
  } catch {
    return null;
  }
}

function writeContinuationSnapshot(payload: IPersistedContinuationV1): void {
  try {
    sessionStorage.setItem(HCC_SUPPORT_CASE_CHAT_CONTINUATION_KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

interface ISupportCaseChatContinuationContextValue {
  phase: TSupportCaseChatContinuationPhase;
  continuationMessages: ISupportCaseChatLine[];
  submittedCaseNumber: string | null;
  /** Brief assistant “thinking” delay after user sends (demo realism) */
  isContinuationThinking: boolean;
  /** CVE → new case follow-up: enables scripted notify / submit chat */
  enterFollowUpFlow: () => void;
  sendFollowUpMessage: (text: string) => void;
  registerDraftPatchHandler: (handler: ((patch: Partial<ISupportCaseDraft>) => void) | undefined) => void;
  /** When the user connects Slack from the wizard while chat is awaiting the webhook URL, mirror the assistant success step. */
  notifySlackLinkedFromWizard: () => void;
}

const SupportCaseChatContinuationContext = React.createContext<ISupportCaseChatContinuationContextValue | undefined>(
  undefined
);

/** User says they want case updates in Slack / DMs / webhook */
const SLACK_SYNC_INTENT_RE =
  /slack|incoming\s*webhook|webhook|sync.*\bcase\b.*slack|slack.*\bsync\b|\bdms?\b|direct\s*messages?/i;

function looksLikeSlackWebhookUrl(text: string): boolean {
  const t = text.trim();
  if (/^https:\/\/hooks\.slack\.com\/\S+/i.test(t)) {
    return true;
  }
  if (/^https:\/\/[a-z0-9-]+\.enterprise\.slack\.com\/\S+/i.test(t)) {
    return true;
  }
  return /^https:\/\/\S{12,}/i.test(t);
}

function matchesSubmitIntent(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (/\bgo ahead\b/.test(t) && /\bsend\b/.test(t)) {
    return true;
  }
  if (/\bsubmit\s+it\b/.test(t)) {
    return true;
  }
  if (/^\s*done\s*[!.]?\s*$/i.test(text.trim())) {
    return true;
  }
  if (/^\s*send\s+it\s*[!.]?\s*$/i.test(text.trim())) {
    return true;
  }
  if (/\bsubmit(\s+the)?(\s+case)?\b/.test(t)) {
    return true;
  }
  if (/\bfile\s+the\s+case\b/.test(t)) {
    return true;
  }
  return false;
}

const SupportCaseChatContinuationProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const initial = readContinuationSnapshotForPath();
  const location = useLocation();

  const [phase, setPhase] = React.useState<TSupportCaseChatContinuationPhase>(() => initial?.phase ?? 'idle');
  const [continuationMessages, setContinuationMessages] = React.useState<ISupportCaseChatLine[]>(
    () => initial?.continuationMessages ?? []
  );
  const [submittedCaseNumber, setSubmittedCaseNumber] = React.useState<string | null>(
    () => initial?.submittedCaseNumber ?? null
  );
  const [isContinuationThinking, setIsContinuationThinking] = React.useState(false);

  const draftPatchHandlerRef = React.useRef<((patch: Partial<ISupportCaseDraft>) => void) | undefined>(undefined);
  const phaseRef = React.useRef<TSupportCaseChatContinuationPhase>(phase);
  const thinkingTimerRef = React.useRef<number | undefined>(undefined);
  const thinkingGuardRef = React.useRef(false);

  React.useLayoutEffect(() => {
    if (location.pathname !== HCC_SUPPORT_CASE_NEW_PATH) {
      return;
    }
    const snap = readContinuationSnapshotForPath();
    if (!snap) {
      return;
    }
    setPhase(snap.phase);
    setContinuationMessages(snap.continuationMessages);
    setSubmittedCaseNumber(snap.submittedCaseNumber);
    phaseRef.current = snap.phase;
  }, [location.pathname]);

  React.useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  React.useEffect(() => {
    if (location.pathname !== HCC_SUPPORT_CASE_NEW_PATH) {
      return;
    }
    if (
      phase === 'idle' &&
      continuationMessages.length === 0 &&
      submittedCaseNumber === null
    ) {
      return;
    }
    writeContinuationSnapshot({
      v: 1,
      phase,
      continuationMessages,
      submittedCaseNumber,
    });
  }, [location.pathname, phase, continuationMessages, submittedCaseNumber]);

  const reset = React.useCallback(() => {
    if (thinkingTimerRef.current !== undefined) {
      window.clearTimeout(thinkingTimerRef.current);
      thinkingTimerRef.current = undefined;
    }
    thinkingGuardRef.current = false;
    setIsContinuationThinking(false);
    setPhase('idle');
    setContinuationMessages([]);
    setSubmittedCaseNumber(null);
    clearContinuationSnapshot();
  }, []);

  React.useEffect(() => {
    if (location.pathname !== HCC_SUPPORT_CASE_NEW_PATH) {
      reset();
    }
  }, [location.pathname, reset]);

  const registerDraftPatchHandler = React.useCallback(
    (handler: ((patch: Partial<ISupportCaseDraft>) => void) | undefined) => {
      draftPatchHandlerRef.current = handler;
    },
    []
  );

  const enterFollowUpFlow = React.useCallback(() => {
    setContinuationMessages([]);
    setSubmittedCaseNumber(null);
    setPhase('awaiting_notify_intent');
  }, []);

  const notifySlackLinkedFromWizard = React.useCallback(() => {
    if (phaseRef.current !== 'awaiting_slack_webhook') {
      return;
    }
    setContinuationMessages((prev) => [
      ...prev,
      { role: 'assistant', content: buildSupportCaseSlackLinkedAssistantMessage() },
    ]);
    setPhase('after_groups_added');
  }, []);

  const sendFollowUpMessage = React.useCallback((raw: string) => {
    const text = raw.trim();
    if (!text || thinkingGuardRef.current) {
      return;
    }

    const p = phaseRef.current;
    if (p === 'idle' || p === 'submitted') {
      return;
    }

    const userLine: ISupportCaseChatLine = { role: 'user', content: text };
    setContinuationMessages((prev) => [...prev, userLine]);

    thinkingGuardRef.current = true;
    setIsContinuationThinking(true);

    const phaseForDelay = phaseRef.current;
    let delayMs = 650 + Math.floor(Math.random() * 700);
    if (phaseForDelay === 'awaiting_notify_intent') {
      delayMs = 1050 + Math.floor(Math.random() * 700);
    } else if (phaseForDelay === 'awaiting_slack_webhook') {
      delayMs = 2100 + Math.floor(Math.random() * 900);
    }

    thinkingTimerRef.current = window.setTimeout(() => {
      thinkingTimerRef.current = undefined;

      const phaseNow = phaseRef.current;
      let assistantLines: ISupportCaseChatLine[] = [];
      let nextPhase: TSupportCaseChatContinuationPhase = phaseNow;

      if (phaseNow === 'awaiting_notify_intent') {
        if (SLACK_SYNC_INTENT_RE.test(text)) {
          assistantLines = [{ role: 'assistant', content: SUPPORT_CASE_SLACK_WEBHOOK_INSTRUCTION_PROMPT }];
          nextPhase = 'awaiting_slack_webhook';
        } else {
          assistantLines = [
            {
              role: 'assistant',
              content: [
                'I can connect this case to **Slack** so updates follow you in **direct messages** (via an incoming webhook).',
                '',
                'Ask to **sync this case with Slack** or say you want **Slack** notifications.',
              ].join('\n'),
            },
          ];
        }
      } else if (phaseNow === 'awaiting_slack_webhook') {
        if (looksLikeSlackWebhookUrl(text)) {
          const url = text.trim();
          draftPatchHandlerRef.current?.({
            thirdPartyChatTool: 'slack',
            slackNotificationEndpointUrl: url,
            slackWebhookDemoVerified: true,
          });
          assistantLines = [{ role: 'assistant', content: buildSupportCaseSlackLinkedAssistantMessage() }];
          nextPhase = 'after_groups_added';
        } else {
          assistantLines = [
            {
              role: 'assistant',
              content: [
                'I need a valid **https** Slack URL — for example your **incoming webhook** (`https://hooks.slack.com/services/…`) or an **enterprise Slack team link** like `company.enterprise.slack.com/team/…`.',
                '',
                'Paste the URL here, or enter it in the wizard under **Third-party notifications** → **Slack**, then choose **Connect Slack**.',
              ].join('\n'),
            },
          ];
        }
      } else if (phaseNow === 'after_groups_added') {
        if (matchesSubmitIntent(text)) {
          assistantLines = [
            { role: 'assistant', content: buildSupportCaseSubmittedAssistantMessage(MOCK_SUBMITTED_SUPPORT_CASE_NUMBER) },
          ];
          nextPhase = 'submitted';
          setSubmittedCaseNumber(MOCK_SUBMITTED_SUPPORT_CASE_NUMBER);
        } else {
          assistantLines = [
            {
              role: 'assistant',
              content: [
                'When you’re ready, use any of these to **submit** to Red Hat Support:',
                '',
                '- **Go ahead and send it**',
                '- **submit it**',
                '- **done**',
                '- **send it**',
              ].join('\n'),
            },
          ];
        }
      }

      setContinuationMessages((prev) => [...prev, ...assistantLines]);
      setPhase(nextPhase);
      setIsContinuationThinking(false);
      thinkingGuardRef.current = false;
    }, delayMs);
  }, []);

  React.useEffect(
    () => () => {
      if (thinkingTimerRef.current !== undefined) {
        window.clearTimeout(thinkingTimerRef.current);
      }
    },
    []
  );

  const value = React.useMemo(
    () =>
      ({
        phase,
        continuationMessages,
        submittedCaseNumber,
        isContinuationThinking,
        enterFollowUpFlow,
        sendFollowUpMessage,
        registerDraftPatchHandler,
        notifySlackLinkedFromWizard,
      }) satisfies ISupportCaseChatContinuationContextValue,
    [
      phase,
      continuationMessages,
      submittedCaseNumber,
      isContinuationThinking,
      enterFollowUpFlow,
      sendFollowUpMessage,
      registerDraftPatchHandler,
      notifySlackLinkedFromWizard,
    ]
  );

  return (
    <SupportCaseChatContinuationContext.Provider value={value}>{children}</SupportCaseChatContinuationContext.Provider>
  );
};

function useSupportCaseChatContinuation(): ISupportCaseChatContinuationContextValue {
  const ctx = React.useContext(SupportCaseChatContinuationContext);
  if (!ctx) {
    throw new Error('useSupportCaseChatContinuation must be used within SupportCaseChatContinuationProvider');
  }
  return ctx;
}

export { SupportCaseChatContinuationProvider, useSupportCaseChatContinuation };
