import * as React from 'react';
import { useLocation } from 'react-router-dom';
import type { ISupportCaseDraft } from '@app/Support/supportCaseDraftConstants';
import {
  buildSupportCaseGroupsAddedAssistantMessage,
  buildSupportCaseSubmittedAssistantMessage,
  HCC_SUPPORT_CASE_NEW_PATH,
  MOCK_SUBMITTED_SUPPORT_CASE_NUMBER,
  SUPPORT_CASE_ASSISTANT_GROUP_OPTIONS_PROMPT,
  SUPPORT_CASE_DEMO_NOTIFY_GROUPS,
} from '@app/Support/supportCaseChatPrompt';

export type TSupportCaseChatContinuationPhase =
  | 'idle'
  | 'awaiting_notify_intent'
  | 'awaiting_group_choice'
  | 'after_groups_added'
  | 'submitted';

export interface ISupportCaseChatLine {
  role: 'user' | 'assistant';
  content: string;
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
}

const SupportCaseChatContinuationContext = React.createContext<ISupportCaseChatContinuationContextValue | undefined>(
  undefined
);

const NOTIFY_INTENT_RE = /app[\s-]?sre|sre-admin|notification|notify|on[\s-]?call|email.*ticket|ticket.*email/i;

function matchesAllSuggestedGroups(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (/^all of them\.?$|^all three\.?$|^every(one|body)\.?$/i.test(t)) {
    return true;
  }
  if (/^all of those\.?$|^alld of those\.?$|^all those\.?$/i.test(t)) {
    return true;
  }
  if (/^all\.?$/.test(t)) {
    return true;
  }
  return SUPPORT_CASE_DEMO_NOTIFY_GROUPS.every((g) => t.includes(g.toLowerCase()));
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
  const location = useLocation();
  const [phase, setPhase] = React.useState<TSupportCaseChatContinuationPhase>('idle');
  const [continuationMessages, setContinuationMessages] = React.useState<ISupportCaseChatLine[]>([]);
  const [submittedCaseNumber, setSubmittedCaseNumber] = React.useState<string | null>(null);
  const [isContinuationThinking, setIsContinuationThinking] = React.useState(false);

  const draftPatchHandlerRef = React.useRef<((patch: Partial<ISupportCaseDraft>) => void) | undefined>(undefined);
  const phaseRef = React.useRef<TSupportCaseChatContinuationPhase>('idle');
  const thinkingTimerRef = React.useRef<number | undefined>(undefined);
  const thinkingGuardRef = React.useRef(false);

  React.useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

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

    const delayMs = 650 + Math.floor(Math.random() * 700);

    thinkingTimerRef.current = window.setTimeout(() => {
      thinkingTimerRef.current = undefined;

      const phaseNow = phaseRef.current;
      let assistantLines: ISupportCaseChatLine[] = [];
      let nextPhase: TSupportCaseChatContinuationPhase = phaseNow;

      if (phaseNow === 'awaiting_notify_intent') {
        if (NOTIFY_INTENT_RE.test(text)) {
          assistantLines = [{ role: 'assistant', content: SUPPORT_CASE_ASSISTANT_GROUP_OPTIONS_PROMPT }];
          nextPhase = 'awaiting_group_choice';
        } else {
          assistantLines = [
            {
              role: 'assistant',
              content: [
                'I can help update **notification recipients** and other draft fields.',
                '',
                'Try asking to route email to a team (for example **app-sre**), or say you want **notifications** on this ticket.',
              ].join('\n'),
            },
          ];
        }
      } else if (phaseNow === 'awaiting_group_choice') {
        if (matchesAllSuggestedGroups(text)) {
          draftPatchHandlerRef.current?.({
            notificationGroups: [...SUPPORT_CASE_DEMO_NOTIFY_GROUPS],
            notifications: '',
          });
          assistantLines = [
            { role: 'assistant', content: buildSupportCaseGroupsAddedAssistantMessage(SUPPORT_CASE_DEMO_NOTIFY_GROUPS) },
          ];
          nextPhase = 'after_groups_added';
        } else {
          assistantLines = [
            {
              role: 'assistant',
              content: [
                'Pick any combination of the suggested groups, or use a shortcut to add **all** of them:',
                '',
                '- **all of them**',
                '- **all of those**',
                '- **all**',
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
      }) satisfies ISupportCaseChatContinuationContextValue,
    [
      phase,
      continuationMessages,
      submittedCaseNumber,
      isContinuationThinking,
      enterFollowUpFlow,
      sendFollowUpMessage,
      registerDraftPatchHandler,
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
