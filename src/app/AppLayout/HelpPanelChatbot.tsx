import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { CveConsoleHandoffAnnotations } from '@app/AppLayout/CveConsoleHandoffAnnotations';
import { SupportCaseWizardAnnotations } from '@app/AppLayout/SupportCaseWizardAnnotations';
/** Granular imports avoid the package barrel pulling CodeModal → Monaco (breaks this webpack setup). */
import Chatbot, { ChatbotDisplayMode } from '@patternfly/chatbot/dist/esm/Chatbot';
import ChatbotContent from '@patternfly/chatbot/dist/esm/ChatbotContent';
import ChatbotFooter from '@patternfly/chatbot/dist/esm/ChatbotFooter';
import MarkdownContent from '@patternfly/chatbot/dist/esm/MarkdownContent';
import Message from '@patternfly/chatbot/dist/esm/Message';
import MessageBox from '@patternfly/chatbot/dist/esm/MessageBox';
import MessageBar from '@patternfly/chatbot/dist/esm/MessageBar';
import MessageDivider from '@patternfly/chatbot/dist/esm/MessageDivider';
import { CopyFailIdeAssistantReplyBody } from '@app/RhelVulnerability/copyFailIdeAssistantReply';
import { HELP_PANEL_CHAT_DEMO_SCRIPT } from '@app/AppLayout/helpPanelChatDemoScript';
import { HCC_DEMO_YAML_DETAILS_CALLOUT_NEXT } from '@app/DemoAnnotations/demoAnnotationEvents';
import { type TCveTroubleshootStep, useCveTroubleshootDemo } from '@app/RhelVulnerability/CveTroubleshootDemoContext';
import {
  CVE_REMEDIATION_SCAFFOLD_AGENT_OFFER,
  buildRemediationAgentStatsMarkdown,
} from '@app/RhelVulnerability/cveTroubleshootDemoCopy';
import { CveRemediationAgentDraftCtaChatBody } from '@app/RhelVulnerability/CveRemediationAgentChatBody';
import { CveRemediationOptionsChatBody } from '@app/RhelVulnerability/CveRemediationOptionsChatBody';
import { CveRemediationPlaybookChatBody } from '@app/RhelVulnerability/CveRemediationPlaybookChatBody';
import { CveRemediationPlaybookOutcomeChatBody } from '@app/RhelVulnerability/CveRemediationPlaybookOutcomeChatBody';
import { CveRemediationRunningPlaybookChatBody } from '@app/RhelVulnerability/CveRemediationRunningPlaybookChatBody';
import {
  REMEDIATION_SIMULATING_THINK_1_MS,
  REMEDIATION_SIMULATING_THINK_2_MS,
} from '@app/RhelVulnerability/cveRemediationDemoTiming';
import {
  HCC_SUPPORT_CASE_NEW_PATH,
  SUPPORT_CASE_DRAFT_LOADED_CHAT_PROMPT,
} from '@app/Support/supportCaseChatPrompt';
import { useSupportCaseChatContinuation } from '@app/Support/SupportCaseChatContinuationContext';

export interface IHelpPanelChatbotProps {
  ideHandoffUserPrompt: string | null;
  assistantBubbleText: string | null;
  /** Appends new-support-case wizard copy after the CVE troubleshoot thread */
  showSupportCaseWizardIntro: boolean;
}

const noopSend = () => undefined;

/** After IDE handoff: two assistant “thinking” beats before the first remediation prompt (ms). */
const REMEDIATION_OFFER_THINK_1_MS = 1300;
const REMEDIATION_OFFER_THINK_2_MS = 1100;

/**
 * After user says yes (remediation options card + playbook artifact): two thinking beats each time (ms).
 * Same duration for both flows so pacing feels consistent.
 */
const REMEDIATION_AFTER_YES_THINK_1_MS = 1800;
const REMEDIATION_AFTER_YES_THINK_2_MS = 1800;

/** After “still at risk” stats: dwell, then two assistant thinking beats before draft + CTA (awaiting_yes meta). */
const REMEDIATION_AGENT_STATS_DWELL_MS = 1050;
const REMEDIATION_AGENT_DRAFT_THINK_1_MS = 820;
const REMEDIATION_AGENT_DRAFT_THINK_2_MS = 880;

/** Chat experience divider before Red Hat remediation thread (demo ID). */
const REMEDIATION_CONVERSATION_DIVIDER = 'Conversation ID #123456';

const REMEDIATION_STEPS_AFTER_FIRST_YES: TCveTroubleshootStep[] = [
  'remediation_playbooks_shown',
  'remediation_playbook_artifact_shown',
  'remediation_simulating',
  'awaiting_yes',
  'support_case_flow',
];

const REMEDIATION_STEPS_AFTER_SECOND_YES: TCveTroubleshootStep[] = [
  'remediation_playbook_artifact_shown',
  'remediation_simulating',
  'awaiting_yes',
  'support_case_flow',
];

const REMEDIATION_STEPS_AFTER_THIRD_YES: TCveTroubleshootStep[] = [
  'remediation_simulating',
  'awaiting_yes',
  'support_case_flow',
];

function isAffirmativeYes(raw: string): boolean {
  const t = raw.trim().toLowerCase();
  return t === 'yes' || t === 'y' || /^yes[.!]?$/.test(t) || t.startsWith('yes ');
}

/**
 * PF Chatbot message stream + footer inside the existing Help panel Chat tab (no duplicate header chrome).
 * Demo transcript — extend via props or `helpPanelChatDemoScript.ts`.
 */
const HelpPanelChatbot: React.FunctionComponent<IHelpPanelChatbotProps> = ({
  ideHandoffUserPrompt,
  assistantBubbleText,
  showSupportCaseWizardIntro,
}) => {
  const location = useLocation();
  const cveDemo = useCveTroubleshootDemo();
  const supportCaseChat = useSupportCaseChatContinuation();

  /**
   * 0 = first thinking bubble, 1 = second thinking, 2 = show remediation offer (only while step is remediation_offer).
   */
  const [remediationOfferPrelude, setRemediationOfferPrelude] = React.useState(0);

  React.useEffect(() => {
    if (!ideHandoffUserPrompt || cveDemo?.step !== 'remediation_offer') {
      setRemediationOfferPrelude(0);
      return undefined;
    }
    setRemediationOfferPrelude(0);
    const t1 = window.setTimeout(() => {
      setRemediationOfferPrelude(1);
    }, REMEDIATION_OFFER_THINK_1_MS);
    const t2 = window.setTimeout(() => {
      setRemediationOfferPrelude(2);
    }, REMEDIATION_OFFER_THINK_1_MS + REMEDIATION_OFFER_THINK_2_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [ideHandoffUserPrompt, cveDemo?.step]);

  /**
   * After first “yes”: 0–1 = assistant thinking, 2 = show remediation options card (only while step is remediation_playbooks_shown).
   */
  const [remediationPlaybooksPrelude, setRemediationPlaybooksPrelude] = React.useState(0);

  React.useEffect(() => {
    if (cveDemo?.step !== 'remediation_playbooks_shown') {
      setRemediationPlaybooksPrelude(0);
      return undefined;
    }
    setRemediationPlaybooksPrelude(0);
    const t1 = window.setTimeout(() => {
      setRemediationPlaybooksPrelude(1);
    }, REMEDIATION_AFTER_YES_THINK_1_MS);
    const t2 = window.setTimeout(() => {
      setRemediationPlaybooksPrelude(2);
    }, REMEDIATION_AFTER_YES_THINK_1_MS + REMEDIATION_AFTER_YES_THINK_2_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [cveDemo?.step]);

  /**
   * After second “yes” (playbook details): 0–1 = thinking, 2 = show playbook card (only while step is remediation_playbook_artifact_shown).
   */
  const [remediationArtifactPrelude, setRemediationArtifactPrelude] = React.useState(0);

  React.useEffect(() => {
    if (cveDemo?.step !== 'remediation_playbook_artifact_shown') {
      setRemediationArtifactPrelude(0);
      return undefined;
    }
    setRemediationArtifactPrelude(0);
    const t1 = window.setTimeout(() => {
      setRemediationArtifactPrelude(1);
    }, REMEDIATION_AFTER_YES_THINK_1_MS);
    const t2 = window.setTimeout(() => {
      setRemediationArtifactPrelude(2);
    }, REMEDIATION_AFTER_YES_THINK_1_MS + REMEDIATION_AFTER_YES_THINK_2_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [cveDemo?.step]);

  /** Console “YAML details” callout Next — allow Help transcript to pin to bottom again. */
  const [yamlArtifactCalloutAcknowledgedForScroll, setYamlArtifactCalloutAcknowledgedForScroll] =
    React.useState(false);
  const playbookYamlIntroScrollDoneRef = React.useRef(false);

  React.useEffect(() => {
    if (cveDemo?.step !== 'remediation_playbook_artifact_shown') {
      playbookYamlIntroScrollDoneRef.current = false;
    }
    if (cveDemo?.step === 'remediation_playbook_artifact_shown') {
      setYamlArtifactCalloutAcknowledgedForScroll(false);
    }
  }, [cveDemo?.step]);

  React.useEffect(() => {
    const onYamlDetailsNext = () => {
      setYamlArtifactCalloutAcknowledgedForScroll(true);
    };
    window.addEventListener(HCC_DEMO_YAML_DETAILS_CALLOUT_NEXT, onYamlDetailsNext);
    return () => window.removeEventListener(HCC_DEMO_YAML_DETAILS_CALLOUT_NEXT, onYamlDetailsNext);
  }, []);

  /**
   * After third “yes”: 0–1 = assistant thinking before the running-playbook card (only while step is remediation_simulating).
   */
  const [remediationSimulatingPrelude, setRemediationSimulatingPrelude] = React.useState(0);

  React.useEffect(() => {
    if (cveDemo?.step !== 'remediation_simulating') {
      setRemediationSimulatingPrelude(0);
      return undefined;
    }
    setRemediationSimulatingPrelude(0);
    const t1 = window.setTimeout(() => {
      setRemediationSimulatingPrelude(1);
    }, REMEDIATION_SIMULATING_THINK_1_MS);
    const t2 = window.setTimeout(() => {
      setRemediationSimulatingPrelude(2);
    }, REMEDIATION_SIMULATING_THINK_1_MS + REMEDIATION_SIMULATING_THINK_2_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [cveDemo?.step]);

  /**
   * 0 = stats only, 1–2 = assistant thinking after stats, 3 = draft + review CTA (while `showRemediationMeta`).
   */
  const [remediationAgentDraftPrelude, setRemediationAgentDraftPrelude] = React.useState(0);

  const troubleshootActive =
    Boolean(ideHandoffUserPrompt) &&
    Boolean(cveDemo) &&
    (cveDemo!.step === 'remediation_offer' ||
      cveDemo!.step === 'remediation_playbooks_shown' ||
      cveDemo!.step === 'remediation_playbook_artifact_shown' ||
      cveDemo!.step === 'remediation_simulating' ||
      cveDemo!.step === 'awaiting_yes' ||
      cveDemo!.step === 'support_case_flow');

  const showRemediationMeta =
    troubleshootActive &&
    cveDemo!.fleetPhase === 'one_remaining' &&
    (cveDemo!.step === 'awaiting_yes' || cveDemo!.step === 'support_case_flow');

  React.useEffect(() => {
    if (!showRemediationMeta) {
      setRemediationAgentDraftPrelude(0);
      return undefined;
    }
    setRemediationAgentDraftPrelude(0);
    const t1 = window.setTimeout(() => {
      setRemediationAgentDraftPrelude(1);
    }, REMEDIATION_AGENT_STATS_DWELL_MS);
    const t2 = window.setTimeout(() => {
      setRemediationAgentDraftPrelude(2);
    }, REMEDIATION_AGENT_STATS_DWELL_MS + REMEDIATION_AGENT_DRAFT_THINK_1_MS);
    const t3 = window.setTimeout(() => {
      setRemediationAgentDraftPrelude(3);
    }, REMEDIATION_AGENT_STATS_DWELL_MS + REMEDIATION_AGENT_DRAFT_THINK_1_MS + REMEDIATION_AGENT_DRAFT_THINK_2_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [showRemediationMeta]);

  const remediationAgentDraftIntroComplete = !showRemediationMeta || remediationAgentDraftPrelude >= 3;

  const showRemediationPlaybookOutcome =
    troubleshootActive &&
    cveDemo!.fleetPhase === 'one_remaining' &&
    (cveDemo!.step === 'awaiting_yes' || cveDemo!.step === 'support_case_flow');

  const remediationOfferIntroComplete =
    cveDemo?.step !== 'remediation_offer' || remediationOfferPrelude >= 2;

  const remediationPlaybooksIntroComplete =
    cveDemo?.step !== 'remediation_playbooks_shown' || remediationPlaybooksPrelude >= 2;

  const remediationArtifactIntroComplete =
    cveDemo?.step !== 'remediation_playbook_artifact_shown' || remediationArtifactPrelude >= 2;

  const remediationMessageBarEnabled =
    troubleshootActive &&
    remediationOfferIntroComplete &&
    remediationPlaybooksIntroComplete &&
    remediationArtifactIntroComplete &&
    (cveDemo?.step === 'remediation_offer' ||
      cveDemo?.step === 'remediation_playbooks_shown' ||
      cveDemo?.step === 'remediation_playbook_artifact_shown');

  const cveMessageBarEnabled =
    troubleshootActive &&
    cveDemo?.step === 'awaiting_yes' &&
    remediationAgentDraftIntroComplete;

  /** Console “9 of 10” callout: fire when stats + outcome are in chat, not after support-case draft thinking (≥2s before draft CTA at current dwell timings). */
  const completionOutcomeReady =
    Boolean(showRemediationMeta) && cveDemo?.step === 'awaiting_yes';

  const awaitingYesReviewBarReady = cveMessageBarEnabled;

  const [supportWizardDraftIntroReady, setSupportWizardDraftIntroReady] = React.useState(false);

  React.useEffect(() => {
    if (!showSupportCaseWizardIntro || location.pathname !== HCC_SUPPORT_CASE_NEW_PATH) {
      setSupportWizardDraftIntroReady(false);
      return undefined;
    }
    setSupportWizardDraftIntroReady(false);
    const t = window.setTimeout(() => setSupportWizardDraftIntroReady(true), 1100);
    return () => window.clearTimeout(t);
  }, [showSupportCaseWizardIntro, location.pathname]);

  const showSupportCaseDraftIntroMessage =
    showSupportCaseWizardIntro &&
    supportWizardDraftIntroReady &&
    location.pathname === HCC_SUPPORT_CASE_NEW_PATH;
  const continuationMessageBarEnabled =
    supportCaseChat.phase !== 'idle' &&
    supportCaseChat.phase !== 'submitted' &&
    !supportCaseChat.isContinuationThinking;
  const messageBarEnabled = remediationMessageBarEnabled || cveMessageBarEnabled || continuationMessageBarEnabled;

  const onSendMessage = React.useCallback(
    (message: string | number) => {
      const raw = String(message).trim();
      if (remediationMessageBarEnabled && isAffirmativeYes(raw)) {
        cveDemo?.advanceRemediationScaffold();
        return;
      }
      if (cveMessageBarEnabled) {
        if (isAffirmativeYes(raw)) {
          cveDemo?.confirmReviewSupportDraft();
        }
        return;
      }
      if (
        supportCaseChat.phase !== 'idle' &&
        supportCaseChat.phase !== 'submitted' &&
        !supportCaseChat.isContinuationThinking
      ) {
        supportCaseChat.sendFollowUpMessage(raw);
      }
    },
    [cveDemo, cveMessageBarEnabled, remediationMessageBarEnabled, supportCaseChat]
  );

  const remediationOfferBarReady =
    Boolean(cveDemo) &&
    remediationMessageBarEnabled &&
    cveDemo!.step === 'remediation_offer';

  const remediationPlaybooksBarReady =
    Boolean(cveDemo) &&
    remediationMessageBarEnabled &&
    cveDemo!.step === 'remediation_playbooks_shown';

  const remediationArtifactBarReady =
    Boolean(cveDemo) &&
    remediationMessageBarEnabled &&
    cveDemo!.step === 'remediation_playbook_artifact_shown';

  const remediationPlaybooksOptionsDisplayed =
    cveDemo?.step !== 'remediation_playbooks_shown' || remediationPlaybooksPrelude >= 2;

  const remediationPlaybookYamlDisplayed =
    cveDemo?.step !== 'remediation_playbook_artifact_shown' || remediationArtifactPrelude >= 2;

  /** Draft support case message + “review” CTA visible in chat (matches `CveRemediationAgentDraftCtaChatBody`). */
  const supportCaseDraftOfferVisible =
    Boolean(showRemediationMeta) && remediationAgentDraftPrelude >= 3;

  const sendRemediationAffirmativeYes = React.useCallback(() => {
    if (remediationMessageBarEnabled || cveMessageBarEnabled) {
      onSendMessage('yes');
    }
  }, [cveMessageBarEnabled, onSendMessage, remediationMessageBarEnabled]);

  const sendSupportFollowUp = React.useCallback(
    (text: string) => {
      supportCaseChat.sendFollowUpMessage(text);
    },
    [supportCaseChat]
  );

  /** PF Chatbot MessageBox attaches scroll helpers via ref (see useImperativeHandle in MessageBox) */
  const messageBoxRef = React.useRef<{ scrollToBottom?: (opts?: { behavior?: ScrollBehavior; resumeSmartScroll?: boolean }) => void } | null>(null);

  /** Scroll transcript to bottom, except while the YAML playbook is shown and the console “YAML details” callout is still pending (then align once to the top of that message). */
  React.useLayoutEffect(() => {
    const playbookYamlHoldScrollToBottom =
      Boolean(ideHandoffUserPrompt) &&
      cveDemo?.step === 'remediation_playbook_artifact_shown' &&
      remediationArtifactPrelude >= 2 &&
      !yamlArtifactCalloutAcknowledgedForScroll;

    if (playbookYamlHoldScrollToBottom) {
      if (!playbookYamlIntroScrollDoneRef.current) {
        const id = window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            const anchor = document.querySelector<HTMLElement>('[data-demo-anchor="pcm-help-chat-playbook-yaml"]');
            if (!anchor) {
              return;
            }
            let el: HTMLElement | null = anchor;
            let scrollParent: HTMLElement | null = null;
            while (el) {
              const { overflowY } = window.getComputedStyle(el);
              if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
                scrollParent = el;
                break;
              }
              el = el.parentElement;
            }
            if (scrollParent) {
              const top =
                anchor.getBoundingClientRect().top -
                scrollParent.getBoundingClientRect().top +
                scrollParent.scrollTop;
              scrollParent.scrollTop = Math.max(0, top - 8);
              playbookYamlIntroScrollDoneRef.current = true;
            }
          });
        });
        return () => window.cancelAnimationFrame(id);
      }
      return undefined;
    }

    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        messageBoxRef.current?.scrollToBottom?.({ behavior: 'smooth', resumeSmartScroll: false });
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [
    ideHandoffUserPrompt,
    assistantBubbleText,
    showSupportCaseDraftIntroMessage,
    showRemediationMeta,
    remediationAgentDraftPrelude,
    cveDemo?.userConfirmedDraft,
    cveDemo?.supportCaseDepartPrelude,
    cveDemo?.step,
    remediationOfferPrelude,
    remediationPlaybooksPrelude,
    remediationArtifactPrelude,
    remediationSimulatingPrelude,
    showRemediationPlaybookOutcome,
    supportCaseChat.continuationMessages,
    supportCaseChat.isContinuationThinking,
    yamlArtifactCalloutAcknowledgedForScroll,
  ]);

  const messageBarPlaceholder = (() => {
    if (troubleshootActive && cveDemo?.step === 'remediation_offer' && !remediationOfferIntroComplete) {
      return 'Assistant is thinking…';
    }
    if (troubleshootActive && cveDemo?.step === 'remediation_playbooks_shown' && !remediationPlaybooksIntroComplete) {
      return 'Assistant is thinking…';
    }
    if (troubleshootActive && cveDemo?.step === 'remediation_playbook_artifact_shown' && !remediationArtifactIntroComplete) {
      return 'Assistant is thinking…';
    }
    if (troubleshootActive && cveDemo?.step === 'remediation_simulating' && remediationSimulatingPrelude < 2) {
      return 'Assistant is thinking…';
    }
    if (troubleshootActive && showRemediationMeta && remediationAgentDraftPrelude > 0 && remediationAgentDraftPrelude < 3) {
      return 'Assistant is thinking…';
    }
    if (remediationMessageBarEnabled) {
      return 'Type yes to continue';
    }
    if (cveMessageBarEnabled) {
      return 'Type yes to review the drafted support case';
    }
    switch (supportCaseChat.phase) {
      case 'awaiting_notify_intent':
        return 'Ask to sync this case with Slack or your Slack DMs…';
      case 'awaiting_slack_webhook':
        return 'Paste your https://hooks.slack.com/… incoming webhook URL…';
      case 'after_groups_added':
        return 'Submit it, send it, done, or go ahead and send it…';
      default:
        return 'Demo — messaging is disabled';
    }
  })();

  const cveStep = cveDemo?.step;
  const showRemediationScaffold = Boolean(ideHandoffUserPrompt && cveDemo && cveStep && cveStep !== 'inactive');
  const showRemediationOfferCopy =
    showRemediationScaffold &&
    (cveStep !== 'remediation_offer' || remediationOfferPrelude >= 2);

  const showRemediationPlaybooksBody =
    cveStep &&
    REMEDIATION_STEPS_AFTER_FIRST_YES.includes(cveStep) &&
    (cveStep !== 'remediation_playbooks_shown' || remediationPlaybooksPrelude >= 2);

  const showRemediationPlaybookArtifactBody =
    cveStep &&
    REMEDIATION_STEPS_AFTER_SECOND_YES.includes(cveStep) &&
    (cveStep !== 'remediation_playbook_artifact_shown' || remediationArtifactPrelude >= 2);

  const transcript = (
    <>
      {ideHandoffUserPrompt ? (
        <>
          <MessageDivider content="Continued from Demo IDE" variant="inset" />
          <Message role="user" name="You" content={ideHandoffUserPrompt} isPrimary />
          <Message role="bot" name="Assistant" isPrimary>
            <CopyFailIdeAssistantReplyBody variant="chatbot" />
          </Message>
        </>
      ) : assistantBubbleText ? (
        <Message role="bot" name="Assistant" content={assistantBubbleText} isPrimary />
      ) : (
        <>
          <Message role="bot" name="Assistant" content={HELP_PANEL_CHAT_DEMO_SCRIPT.assistantGreeting} isPrimary />
          <Message role="user" name="You" content={HELP_PANEL_CHAT_DEMO_SCRIPT.userSamplePrompt} isPrimary />
          <Message role="bot" name="Assistant" content={HELP_PANEL_CHAT_DEMO_SCRIPT.assistantReply} isPrimary />
          <Message role="bot" name="Assistant" isLoading isPrimary />
        </>
      )}

      {showRemediationScaffold ? (
        <MessageDivider content={REMEDIATION_CONVERSATION_DIVIDER} variant="inset" />
      ) : null}

      {cveStep === 'remediation_offer' && remediationOfferPrelude === 0 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}
      {cveStep === 'remediation_offer' && remediationOfferPrelude === 1 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}

      {showRemediationOfferCopy ? (
        <Message role="bot" name="Assistant" content={CVE_REMEDIATION_SCAFFOLD_AGENT_OFFER} isPrimary />
      ) : null}

      {cveStep && REMEDIATION_STEPS_AFTER_FIRST_YES.includes(cveStep) ? (
        <Message role="user" name="You" content="yes" isPrimary />
      ) : null}
      {cveStep === 'remediation_playbooks_shown' && remediationPlaybooksPrelude === 0 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}
      {cveStep === 'remediation_playbooks_shown' && remediationPlaybooksPrelude === 1 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}
      {showRemediationPlaybooksBody ? (
        <Message role="bot" name="Assistant" isPrimary>
          <CveRemediationOptionsChatBody />
        </Message>
      ) : null}

      {cveStep && REMEDIATION_STEPS_AFTER_SECOND_YES.includes(cveStep) ? (
        <Message role="user" name="You" content="yes" isPrimary />
      ) : null}
      {cveStep === 'remediation_playbook_artifact_shown' && remediationArtifactPrelude === 0 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}
      {cveStep === 'remediation_playbook_artifact_shown' && remediationArtifactPrelude === 1 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}
      {showRemediationPlaybookArtifactBody ? (
        <Message role="bot" name="Assistant" isPrimary>
          <CveRemediationPlaybookChatBody />
        </Message>
      ) : null}

      {cveStep && REMEDIATION_STEPS_AFTER_THIRD_YES.includes(cveStep) ? (
        <Message role="user" name="You" content="yes" isPrimary />
      ) : null}
      {cveStep === 'remediation_simulating' && remediationSimulatingPrelude === 0 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}
      {cveStep === 'remediation_simulating' && remediationSimulatingPrelude === 1 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}
      {cveStep === 'remediation_simulating' && remediationSimulatingPrelude >= 2 ? (
        <Message role="bot" name="Assistant" isPrimary>
          <CveRemediationRunningPlaybookChatBody />
        </Message>
      ) : null}

      {showRemediationPlaybookOutcome ? (
        <Message role="bot" name="Assistant" isPrimary>
          <CveRemediationPlaybookOutcomeChatBody failedHostName={cveDemo!.remainingHostName} />
        </Message>
      ) : null}

      {showRemediationMeta ? (
        <>
          <Message role="bot" name="Assistant" isPrimary>
            <MarkdownContent
              content={buildRemediationAgentStatsMarkdown(cveDemo!.remainingHostName)}
              isPrimary
            />
          </Message>
          {remediationAgentDraftPrelude === 1 ? (
            <Message role="bot" name="Assistant" isLoading isPrimary />
          ) : null}
          {remediationAgentDraftPrelude === 2 ? (
            <Message role="bot" name="Assistant" isLoading isPrimary />
          ) : null}
          {remediationAgentDraftPrelude >= 3 ? (
            <Message role="bot" name="Assistant" isPrimary>
              <CveRemediationAgentDraftCtaChatBody />
            </Message>
          ) : null}
        </>
      ) : null}

      {cveDemo?.userConfirmedDraft ? <Message role="user" name="You" content="yes" isPrimary /> : null}

      {cveDemo?.userConfirmedDraft &&
      cveDemo.step === 'awaiting_yes' &&
      cveDemo.supportCaseDepartPrelude === 1 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}
      {cveDemo?.userConfirmedDraft &&
      cveDemo.step === 'awaiting_yes' &&
      cveDemo.supportCaseDepartPrelude === 2 ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}

      {showSupportCaseDraftIntroMessage ? (
        <Message role="bot" name="Assistant" content={SUPPORT_CASE_DRAFT_LOADED_CHAT_PROMPT} isPrimary />
      ) : null}

      {supportCaseChat.continuationMessages.map((line, i) => (
        <Message
          key={`support-case-chat-${i}-${line.role}`}
          role={line.role === 'user' ? 'user' : 'bot'}
          name={line.role === 'user' ? 'You' : 'Assistant'}
          content={line.content}
          isPrimary
        />
      ))}

      {supportCaseChat.isContinuationThinking ? (
        <Message role="bot" name="Assistant" isLoading isPrimary />
      ) : null}
    </>
  );

  return (
    <>
      <CveConsoleHandoffAnnotations
        ideHandoffActive={Boolean(ideHandoffUserPrompt)}
        troubleshootStep={cveDemo?.step}
        remediationOfferIntroComplete={remediationOfferIntroComplete}
        remediationOfferBarReady={remediationOfferBarReady}
        remediationPlaybooksBarReady={remediationPlaybooksBarReady}
        remediationArtifactBarReady={remediationArtifactBarReady}
        remediationPlaybooksOptionsDisplayed={remediationPlaybooksOptionsDisplayed}
        remediationPlaybookYamlDisplayed={remediationPlaybookYamlDisplayed}
        completionOutcomeReady={completionOutcomeReady}
        awaitingYesReviewBarReady={awaitingYesReviewBarReady}
        supportCaseDraftOfferVisible={supportCaseDraftOfferVisible}
        onSendAffirmativeYes={sendRemediationAffirmativeYes}
      />
      <SupportCaseWizardAnnotations
        ideHandoffUserPrompt={ideHandoffUserPrompt}
        troubleshootStep={cveDemo?.step}
        supportCaseChatPhase={supportCaseChat.phase}
        supportCaseContinuationMessageCount={supportCaseChat.continuationMessages.length}
        isContinuationThinking={supportCaseChat.isContinuationThinking}
        continuationMessageBarEnabled={continuationMessageBarEnabled}
        onSendSupportFollowUp={sendSupportFollowUp}
      />
      <div
        data-help-panel="chat"
        className="hcc-help-panel-chatbot-root"
        style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Chatbot
          displayMode={ChatbotDisplayMode.embedded}
          ariaLabel="Ask Red Hat chat"
          className="hcc-help-panel-pf-chatbot"
          isCompact
        >
        <ChatbotContent isPrimary style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <MessageBox
            ref={messageBoxRef as any}
            ariaLabel="Chat messages"
            enableSmartScroll={false}
            style={{ flex: 1, minHeight: 0 }}
          >
            {transcript}
          </MessageBox>
        </ChatbotContent>
        <ChatbotFooter isPrimary isCompact>
          <div data-demo-anchor="pcm-help-chat-message-bar" style={{ width: '100%', minWidth: 0 }}>
            <MessageBar
              key={`pcm-help-msgbar-${cveDemo?.step ?? 'na'}-${supportCaseChat.phase}`}
              onSendMessage={messageBarEnabled ? onSendMessage : noopSend}
              placeholder={messageBarPlaceholder}
              hasAttachButton={false}
              alwayShowSendButton
              isSendButtonDisabled={!messageBarEnabled}
              disabled={!messageBarEnabled}
              isPrimary
              isCompact
              displayMode={ChatbotDisplayMode.embedded}
            />
          </div>
        </ChatbotFooter>
        </Chatbot>
      </div>
    </>
  );
};

export { HelpPanelChatbot };
