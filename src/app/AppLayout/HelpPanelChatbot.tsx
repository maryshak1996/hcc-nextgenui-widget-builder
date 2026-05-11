import * as React from 'react';
import { Button } from '@patternfly/react-core';
/** Granular imports avoid the package barrel pulling CodeModal → Monaco (breaks this webpack setup). */
import Chatbot, { ChatbotDisplayMode } from '@patternfly/chatbot/dist/esm/Chatbot';
import ChatbotContent from '@patternfly/chatbot/dist/esm/ChatbotContent';
import ChatbotFooter from '@patternfly/chatbot/dist/esm/ChatbotFooter';
import Message from '@patternfly/chatbot/dist/esm/Message';
import MessageBox from '@patternfly/chatbot/dist/esm/MessageBox';
import MessageBar from '@patternfly/chatbot/dist/esm/MessageBar';
import MessageDivider from '@patternfly/chatbot/dist/esm/MessageDivider';
import { CopyFailIdeAssistantReplyBody } from '@app/RhelVulnerability/copyFailIdeAssistantReply';
import { HELP_PANEL_CHAT_DEMO_SCRIPT } from '@app/AppLayout/helpPanelChatDemoScript';
import { useCveTroubleshootDemo } from '@app/RhelVulnerability/CveTroubleshootDemoContext';
import { buildRemediationAgentMessage } from '@app/RhelVulnerability/cveTroubleshootDemoCopy';
import { SUPPORT_CASE_DRAFT_LOADED_CHAT_PROMPT } from '@app/Support/supportCaseChatPrompt';
import { useSupportCaseChatContinuation } from '@app/Support/SupportCaseChatContinuationContext';

export interface IHelpPanelChatbotProps {
  ideHandoffUserPrompt: string | null;
  assistantBubbleText: string | null;
  /** Appends new-support-case wizard copy after the CVE troubleshoot thread */
  showSupportCaseWizardIntro: boolean;
}

const noopSend = () => undefined;

/**
 * PF Chatbot message stream + footer inside the existing Help panel Chat tab (no duplicate header chrome).
 * Demo transcript — extend via props or `helpPanelChatDemoScript.ts`.
 */
const HelpPanelChatbot: React.FunctionComponent<IHelpPanelChatbotProps> = ({
  ideHandoffUserPrompt,
  assistantBubbleText,
  showSupportCaseWizardIntro,
}) => {
  const cveDemo = useCveTroubleshootDemo();
  const supportCaseChat = useSupportCaseChatContinuation();

  const troubleshootActive =
    Boolean(ideHandoffUserPrompt) &&
    Boolean(cveDemo) &&
    (cveDemo!.step === 'awaiting_fast_forward' ||
      cveDemo!.step === 'awaiting_yes' ||
      cveDemo!.step === 'support_case_flow');

  const showFastForward =
    Boolean(ideHandoffUserPrompt) &&
    cveDemo?.step === 'awaiting_fast_forward';

  const showRemediationMeta =
    troubleshootActive &&
    cveDemo!.fleetPhase === 'one_remaining' &&
    (cveDemo!.step === 'awaiting_yes' || cveDemo!.step === 'support_case_flow');

  const cveMessageBarEnabled = troubleshootActive && cveDemo?.step === 'awaiting_yes';
  const continuationMessageBarEnabled =
    supportCaseChat.phase !== 'idle' &&
    supportCaseChat.phase !== 'submitted' &&
    !supportCaseChat.isContinuationThinking;
  const messageBarEnabled = cveMessageBarEnabled || continuationMessageBarEnabled;

  const onSendMessage = React.useCallback(
    (message: string | number) => {
      const raw = String(message).trim();
      const t = raw.toLowerCase();
      if (cveMessageBarEnabled) {
        if (t === 'yes' || t === 'y' || /^yes[.!]?$/.test(t) || t.startsWith('yes ')) {
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
    [cveDemo, cveMessageBarEnabled, supportCaseChat]
  );

  /** PF Chatbot MessageBox attaches scroll helpers via ref (see useImperativeHandle in MessageBox) */
  const messageBoxRef = React.useRef<{ scrollToBottom?: (opts?: { behavior?: ScrollBehavior; resumeSmartScroll?: boolean }) => void } | null>(null);

  /** Keep the transcript pinned to the latest user/assistant content */
  React.useLayoutEffect(() => {
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        messageBoxRef.current?.scrollToBottom?.({ behavior: 'smooth', resumeSmartScroll: false });
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [
    ideHandoffUserPrompt,
    assistantBubbleText,
    showSupportCaseWizardIntro,
    showFastForward,
    showRemediationMeta,
    cveDemo?.userConfirmedDraft,
    supportCaseChat.continuationMessages,
    supportCaseChat.isContinuationThinking,
  ]);

  const messageBarPlaceholder = (() => {
    if (cveMessageBarEnabled) {
      return 'Type yes to review the drafted support case';
    }
    switch (supportCaseChat.phase) {
      case 'awaiting_notify_intent':
        return 'Ask to notify the app-sre team or add ticket notifications…';
      case 'awaiting_group_choice':
        return 'Say all of them, all of those, or all…';
      case 'after_groups_added':
        return 'Submit it, send it, done, or go ahead and send it…';
      default:
        return 'Demo — messaging is disabled';
    }
  })();

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

      {showFastForward ? (
        <div style={{ padding: 'var(--pf-t--global--spacer--sm) 0' }}>
          <Button
            type="button"
            onClick={() => cveDemo?.fastForwardToEndOfTroubleshooting()}
            style={{
              backgroundColor: '#fbcfe8',
              borderColor: '#f472b6',
              color: '#9d174d',
              borderWidth: 1,
              borderStyle: 'solid',
            }}
          >
            Fast forward to end of troubleshooting
          </Button>
        </div>
      ) : null}

      {showRemediationMeta ? (
        <Message
          role="bot"
          name="Assistant"
          content={buildRemediationAgentMessage(cveDemo!.remainingHostName)}
          isPrimary
        />
      ) : null}

      {cveDemo?.userConfirmedDraft ? <Message role="user" name="You" content="yes" isPrimary /> : null}

      {showSupportCaseWizardIntro ? (
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
          <MessageBar
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
        </ChatbotFooter>
      </Chatbot>
    </div>
  );
};

export { HelpPanelChatbot };
