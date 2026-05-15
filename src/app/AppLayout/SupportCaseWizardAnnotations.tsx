import * as React from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { DemoAnnotationCallout } from '@app/DemoAnnotations/DemoAnnotationCallout';
import { DemoGoalConnectionAnnotation, DemoGoalConnectionStack } from '@app/DemoAnnotations/DemoGoalConnectionAnnotation';
import { DemoClickIndicator } from '@app/DemoAnnotations/DemoClickIndicator';
import {
  HCC_DEMO_ANNOTATIONS_PREF_CHANGED,
  HCC_SUPPORT_WIZARD_BODY_READY,
  type HccDemoAnnotationsPrefDetail,
} from '@app/DemoAnnotations/demoAnnotationEvents';
import '@app/DemoAnnotations/demoAnnotations.css';
import { readAnnotationsVisiblePreference } from '@app/DemoAnnotations/DemoAnnotationsViewToggle';
import { HCC_SUPPORT_CASE_WIZARD_BOOTSTRAP_STATE_KEY } from '@app/Support/supportCaseWizardBootstrap';
import { HCC_SUPPORT_CASE_NEW_PATH, SUPPORT_CASE_MOCK_USER_SLACK_ENDPOINT, SUPPORT_CASE_SLACK_DM_SYNC_DEMO_MESSAGE } from '@app/Support/supportCaseChatPrompt';
import type { TCveTroubleshootStep } from '@app/RhelVulnerability/CveTroubleshootDemoContext';
import type { TSupportCaseChatContinuationPhase } from '@app/Support/SupportCaseChatContinuationContext';
import { primeHelpChatMessageBarWithText } from '@app/AppLayout/helpChatDemoDom';

const CALLOUT_DELAY_MS = 900;
const SCROLL_DURATION_MS = 5600;
const CUE_AFTER_NOTIFICATIONS_MS = 450;
const CUE_AFTER_GROUP_REPLY_MS = 500;
const CUE_AFTER_SUBMIT_CALLOUT_MS = 550;
const ANCHOR_HELP_MESSAGE_BAR = '[data-demo-anchor="pcm-help-chat-message-bar"]';

/** Demo pasted endpoint — matches `looksLikeSlackWebhookUrl` in `SupportCaseChatContinuationContext` */
const SLACK_WEBHOOK_URL_DEMO_PROMPT = SUPPORT_CASE_MOCK_USER_SLACK_ENDPOINT;
/** Trimmed to `yes, submit` in chat — matches submit intent in `SupportCaseChatContinuationContext`. */
const SUBMIT_CASE_DEMO_PROMPT = ' yes, submit';

const W_PHASE_FLOW = [
  'browse_ticket',
  'scrolling_review',
  'notifications_empty',
  'cue_notify_sre',
  'await_group_options',
  'add_all_teams',
  'cue_all_groups',
  'submit_ball_rolling',
  'cue_yes_submit',
  'done',
] as const;

type TWizardDemoPhase = (typeof W_PHASE_FLOW)[number] | 'idle';

function wPhaseIndex(p: TWizardDemoPhase): number {
  if (p === 'idle') {
    return -1;
  }
  return W_PHASE_FLOW.indexOf(p as (typeof W_PHASE_FLOW)[number]);
}

function wShowSince(current: TWizardDemoPhase, since: (typeof W_PHASE_FLOW)[number]): boolean {
  if (current === 'idle' || current === 'done') {
    return false;
  }
  return wPhaseIndex(current) >= wPhaseIndex(since);
}

function findSupportWizardScroller(): HTMLElement | null {
  const mainBody = document.querySelector<HTMLElement>(
    '.support-new-case-wizard--with-chrome .pf-v6-c-wizard__main-body'
  );
  if (mainBody && mainBody.scrollHeight > mainBody.clientHeight + 24) {
    return mainBody;
  }
  const marked = document.querySelector<HTMLElement>('[data-demo-anchor="support-case-wizard-scroll-root"]');
  if (marked && marked.scrollHeight > marked.clientHeight + 24) {
    return marked;
  }
  const root = document.querySelector<HTMLElement>('.support-new-case-wizard');
  if (!root) {
    return null;
  }
  const walk = (el: HTMLElement): HTMLElement | null => {
    const { overflowY } = window.getComputedStyle(el);
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 24) {
      return el;
    }
    for (let i = 0; i < el.children.length; i += 1) {
      const c = el.children[i];
      if (c instanceof HTMLElement) {
        const inner = walk(c);
        if (inner) {
          return inner;
        }
      }
    }
    return null;
  };
  return walk(root);
}

function animateScrollTopToMax(el: HTMLElement, durationMs: number, onDone: () => void): () => void {
  const startTop = el.scrollTop;
  const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);
  const delta = maxTop - startTop;
  if (delta <= 4) {
    onDone();
    return () => undefined;
  }
  const t0 = performance.now();
  let raf = 0;
  const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
  const tick = (now: number) => {
    const u = Math.min(1, (now - t0) / durationMs);
    el.scrollTop = startTop + delta * easeInOut(u);
    if (u < 1) {
      raf = window.requestAnimationFrame(tick);
    } else {
      onDone();
    }
  };
  raf = window.requestAnimationFrame(tick);
  return () => window.cancelAnimationFrame(raf);
}

export interface ISupportCaseWizardAnnotationsProps {
  ideHandoffUserPrompt: string | null;
  troubleshootStep: TCveTroubleshootStep | undefined;
  supportCaseChatPhase: TSupportCaseChatContinuationPhase;
  supportCaseContinuationMessageCount: number;
  isContinuationThinking: boolean;
  continuationMessageBarEnabled: boolean;
  onSendSupportFollowUp: (text: string) => void;
}

const SupportCaseWizardAnnotations: React.FunctionComponent<ISupportCaseWizardAnnotationsProps> = ({
  ideHandoffUserPrompt,
  troubleshootStep,
  supportCaseChatPhase,
  supportCaseContinuationMessageCount,
  isContinuationThinking,
  continuationMessageBarEnabled,
  onSendSupportFollowUp,
}) => {
  const location = useLocation();
  const [annotationsOn, setAnnotationsOn] = React.useState(readAnnotationsVisiblePreference);
  const [phase, setPhase] = React.useState<TWizardDemoPhase>('idle');
  const [wizardBodyReady, setWizardBodyReady] = React.useState(false);
  const cancelScrollRef = React.useRef<(() => void) | null>(null);
  const cueTimerRef = React.useRef<number | undefined>(undefined);

  const fromCveDemoHandoff = React.useMemo(() => {
    const st = location.state;
    if (!st || typeof st !== 'object') {
      return false;
    }
    const raw = (st as Record<string, unknown>)[HCC_SUPPORT_CASE_WIZARD_BOOTSTRAP_STATE_KEY];
    if (!raw || typeof raw !== 'object') {
      return false;
    }
    return (raw as { fromCveDemoHandoff?: boolean }).fromCveDemoHandoff === true;
  }, [location.state]);

  React.useEffect(() => {
    const onPref = (e: Event) => {
      const d = (e as CustomEvent<HccDemoAnnotationsPrefDetail>).detail;
      setAnnotationsOn(d.visible);
    };
    window.addEventListener(HCC_DEMO_ANNOTATIONS_PREF_CHANGED, onPref);
    return () => window.removeEventListener(HCC_DEMO_ANNOTATIONS_PREF_CHANGED, onPref);
  }, []);

  React.useEffect(() => {
    if (!fromCveDemoHandoff) {
      setWizardBodyReady(true);
      return undefined;
    }
    setWizardBodyReady(false);
    const onReady = () => setWizardBodyReady(true);
    window.addEventListener(HCC_SUPPORT_WIZARD_BODY_READY, onReady);
    return () => window.removeEventListener(HCC_SUPPORT_WIZARD_BODY_READY, onReady);
  }, [fromCveDemoHandoff]);

  const inScope =
    Boolean(ideHandoffUserPrompt) &&
    annotationsOn &&
    location.pathname === HCC_SUPPORT_CASE_NEW_PATH &&
    troubleshootStep === 'support_case_flow' &&
    wizardBodyReady;

  React.useEffect(() => {
    if (!inScope) {
      setPhase('idle');
      if (cancelScrollRef.current) {
        cancelScrollRef.current();
        cancelScrollRef.current = null;
      }
      if (cueTimerRef.current !== undefined) {
        window.clearTimeout(cueTimerRef.current);
        cueTimerRef.current = undefined;
      }
    }
  }, [inScope]);

  React.useEffect(() => {
    if (!inScope || phase !== 'idle') {
      return undefined;
    }
    const t = window.setTimeout(() => {
      setPhase('browse_ticket');
    }, CALLOUT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [inScope, phase]);

  const onBrowseTicketNext = React.useCallback(() => {
    setPhase('scrolling_review');
    window.requestAnimationFrame(() => {
      const scroller = findSupportWizardScroller();
      if (!scroller) {
        setPhase('notifications_empty');
        return;
      }
      cancelScrollRef.current?.();
      cancelScrollRef.current = animateScrollTopToMax(scroller, SCROLL_DURATION_MS, () => {
        cancelScrollRef.current = null;
        setPhase('notifications_empty');
      });
    });
  }, []);

  React.useEffect(() => {
    if (phase !== 'notifications_empty') {
      return undefined;
    }
    if (cueTimerRef.current !== undefined) {
      window.clearTimeout(cueTimerRef.current);
    }
    cueTimerRef.current = window.setTimeout(() => {
      cueTimerRef.current = undefined;
      setPhase('cue_notify_sre');
    }, CUE_AFTER_NOTIFICATIONS_MS);
    return () => {
      if (cueTimerRef.current !== undefined) {
        window.clearTimeout(cueTimerRef.current);
        cueTimerRef.current = undefined;
      }
    };
  }, [phase]);

  React.useEffect(() => {
    if (phase !== 'await_group_options') {
      return undefined;
    }
    if (supportCaseChatPhase !== 'awaiting_slack_webhook' || isContinuationThinking) {
      return undefined;
    }
    if (cueTimerRef.current !== undefined) {
      window.clearTimeout(cueTimerRef.current);
    }
    cueTimerRef.current = window.setTimeout(() => {
      cueTimerRef.current = undefined;
      setPhase('add_all_teams');
    }, CUE_AFTER_GROUP_REPLY_MS);
    return () => {
      if (cueTimerRef.current !== undefined) {
        window.clearTimeout(cueTimerRef.current);
        cueTimerRef.current = undefined;
      }
    };
  }, [phase, supportCaseChatPhase, isContinuationThinking]);

  React.useEffect(() => {
    if (phase !== 'add_all_teams') {
      return undefined;
    }
    if (cueTimerRef.current !== undefined) {
      window.clearTimeout(cueTimerRef.current);
    }
    cueTimerRef.current = window.setTimeout(() => {
      cueTimerRef.current = undefined;
      setPhase('cue_all_groups');
    }, 550);
    return () => {
      if (cueTimerRef.current !== undefined) {
        window.clearTimeout(cueTimerRef.current);
        cueTimerRef.current = undefined;
      }
    };
  }, [phase]);

  React.useEffect(() => {
    if (phase !== 'cue_notify_sre') {
      return;
    }
    if (supportCaseContinuationMessageCount > 0) {
      setPhase('await_group_options');
    }
  }, [phase, supportCaseContinuationMessageCount]);

  React.useEffect(() => {
    if (phase !== 'cue_all_groups') {
      return;
    }
    if (supportCaseChatPhase === 'after_groups_added' && !isContinuationThinking) {
      setPhase('submit_ball_rolling');
    }
  }, [phase, supportCaseChatPhase, isContinuationThinking]);

  React.useEffect(() => {
    if (phase !== 'submit_ball_rolling') {
      return undefined;
    }
    if (cueTimerRef.current !== undefined) {
      window.clearTimeout(cueTimerRef.current);
    }
    cueTimerRef.current = window.setTimeout(() => {
      cueTimerRef.current = undefined;
      setPhase('cue_yes_submit');
    }, CUE_AFTER_SUBMIT_CALLOUT_MS);
    return () => {
      if (cueTimerRef.current !== undefined) {
        window.clearTimeout(cueTimerRef.current);
        cueTimerRef.current = undefined;
      }
    };
  }, [phase]);

  React.useEffect(() => {
    if (phase !== 'cue_yes_submit') {
      return;
    }
    if (supportCaseChatPhase === 'submitted') {
      setPhase('done');
    }
  }, [phase, supportCaseChatPhase]);

  const onClickSlackSync = React.useCallback(() => {
    if (phase !== 'cue_notify_sre') {
      return;
    }
    primeHelpChatMessageBarWithText(SUPPORT_CASE_SLACK_DM_SYNC_DEMO_MESSAGE);
    window.requestAnimationFrame(() => {
      onSendSupportFollowUp(SUPPORT_CASE_SLACK_DM_SYNC_DEMO_MESSAGE);
    });
  }, [phase, onSendSupportFollowUp]);

  const onClickPasteSlackWebhook = React.useCallback(() => {
    if (phase !== 'cue_all_groups') {
      return;
    }
    primeHelpChatMessageBarWithText(SLACK_WEBHOOK_URL_DEMO_PROMPT);
    window.requestAnimationFrame(() => {
      onSendSupportFollowUp(SLACK_WEBHOOK_URL_DEMO_PROMPT);
    });
  }, [phase, onSendSupportFollowUp]);

  const onClickSubmitCase = React.useCallback(() => {
    if (phase !== 'cue_yes_submit') {
      return;
    }
    primeHelpChatMessageBarWithText(SUBMIT_CASE_DEMO_PROMPT);
    window.requestAnimationFrame(() => {
      onSendSupportFollowUp(SUBMIT_CASE_DEMO_PROMPT.trim());
    });
  }, [phase, onSendSupportFollowUp]);

  if (!inScope || phase === 'idle' || typeof document === 'undefined') {
    return null;
  }

  const notifyCue =
    phase === 'cue_notify_sre' && continuationMessageBarEnabled && supportCaseChatPhase === 'awaiting_notify_intent';
  const slackWebhookCue =
    phase === 'cue_all_groups' && continuationMessageBarEnabled && supportCaseChatPhase === 'awaiting_slack_webhook';
  const submitCaseCue =
    phase === 'cue_yes_submit' &&
    continuationMessageBarEnabled &&
    supportCaseChatPhase === 'after_groups_added';

  const showOneRedHatSeamGoal = wShowSince(phase, 'scrolling_review');

  return createPortal(
    <>
      <DemoGoalConnectionStack aria-label="UIE goal connections (support case wizard)">
        <DemoGoalConnectionAnnotation
          visible={showOneRedHatSeamGoal}
          id="hcc-demo-support-goal-one-red-hat-seams"
          inStack
        >
          Customers interact with one Red Hat without hopping from place to place or seeing organizational seams.
        </DemoGoalConnectionAnnotation>
      </DemoGoalConnectionStack>
      <div
        className="hcc-demo-annotations-layer hcc-demo-annotations-layer--help-chat-left"
        aria-label="Support case demo hints"
      >
        <DemoAnnotationCallout
          visible={wShowSince(phase, 'browse_ticket')}
          id="hcc-demo-support-callout-browse-ticket"
          onNext={phase === 'browse_ticket' ? onBrowseTicketNext : undefined}
        >
          Okay, let&apos;s look at the details in this support ticket.
        </DemoAnnotationCallout>
        <DemoAnnotationCallout
          visible={wShowSince(phase, 'notifications_empty')}
          id="hcc-demo-support-callout-notifications"
        >
          I want support-case updates in Slack, and I&apos;ll sync this case to my DMs with an incoming webhook.
        </DemoAnnotationCallout>
        <DemoAnnotationCallout visible={wShowSince(phase, 'add_all_teams')} id="hcc-demo-support-callout-add-all">
          I&apos;ll paste the Slack incoming webhook URL here so the assistant can wire it up.
        </DemoAnnotationCallout>
        <DemoAnnotationCallout
          visible={wShowSince(phase, 'submit_ball_rolling')}
          id="hcc-demo-support-callout-submit-ball"
        >
          Let&apos;s get the ball rolling on this solution. Let&apos;s submit the ticket.
        </DemoAnnotationCallout>
      </div>
      <DemoClickIndicator
        visible={notifyCue}
        anchorSelector={ANCHOR_HELP_MESSAGE_BAR}
        onActivate={onClickSlackSync}
      />
      <DemoClickIndicator
        visible={slackWebhookCue}
        anchorSelector={ANCHOR_HELP_MESSAGE_BAR}
        onActivate={onClickPasteSlackWebhook}
      />
      <DemoClickIndicator
        visible={submitCaseCue}
        anchorSelector={ANCHOR_HELP_MESSAGE_BAR}
        onActivate={onClickSubmitCase}
      />
    </>,
    document.body,
  );
};

export { SupportCaseWizardAnnotations };
