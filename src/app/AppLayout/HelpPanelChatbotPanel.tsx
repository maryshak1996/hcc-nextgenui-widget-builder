import * as React from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle
} from '@patternfly/react-core';
import Chatbot, { ChatbotDisplayMode } from '@patternfly/chatbot/dist/esm/Chatbot';
import ChatbotContent from '@patternfly/chatbot/dist/esm/ChatbotContent';
import ChatbotFooter from '@patternfly/chatbot/dist/esm/ChatbotFooter';
import ChatbotHeader from '@patternfly/chatbot/dist/esm/ChatbotHeader';
import ChatbotWelcomePrompt from '@patternfly/chatbot/dist/esm/ChatbotWelcomePrompt';
import MessageBar from '@patternfly/chatbot/dist/esm/MessageBar';
import '@patternfly/chatbot/dist/css/main.css';
import { BarsIcon } from '@patternfly/react-icons';
import HappyRobotIcon from '@app/bgimages/happy-robot-icon.svg';
import { MASTHEAD_USER_DISPLAY_NAME } from '@app/mastheadUserDisplayName';

const HELP_PANEL_WELCOME_PROMPTS = [
  { title: 'Get recommendations from Advisor', onClick: () => undefined },
  { title: 'Show my critical vulnerabilities', onClick: () => undefined },
  { title: 'Create new integrations', onClick: () => undefined }
] as const;

function HelpPanelRobotIcon({ className = '' }: { className?: string }) {
  return (
    <img
      src={HappyRobotIcon}
      alt=""
      aria-hidden
      className={['help-panel-chatbot__robot-icon', className].filter(Boolean).join(' ')}
    />
  );
}

/** Static help-panel chat mock — visual only, not wired to a backend. */
export function HelpPanelChatbotPanel() {
  return (
    <div data-help-panel="chat" className="help-panel-chatbot">
      <Chatbot
        displayMode={ChatbotDisplayMode.embedded}
        ariaLabel="Ask Red Hat"
        isCompact
        className="help-panel-chatbot__surface"
      >
        <ChatbotHeader className="help-panel-chatbot__header">
          <Flex
            direction={{ default: 'column' }}
            spaceItems={{ default: 'spaceItemsSm' }}
            className="help-panel-chatbot__header-inner"
          >
            <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
              <FlexItem>
                <BarsIcon aria-hidden style={{ width: '1rem', height: '1rem' }} />
              </FlexItem>
              <FlexItem>
                <HelpPanelRobotIcon className="help-panel-chatbot__robot-icon--header" />
              </FlexItem>
              <FlexItem>Ask Red Hat</FlexItem>
            </Flex>
            <FlexItem>
              <Dropdown
                isOpen={false}
                onSelect={() => undefined}
                toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                  <MenuToggle
                    ref={toggleRef}
                    isExpanded={false}
                    isFullWidth
                    size="sm"
                    className="help-panel-chatbot__agent-toggle"
                  >
                    Agent: General Red Hat
                  </MenuToggle>
                )}
                shouldFocusToggleOnSelect
              >
                <DropdownList>
                  <DropdownItem>Agent: General Red Hat</DropdownItem>
                  <DropdownItem>Support Agent</DropdownItem>
                  <DropdownItem>Feedback Bot</DropdownItem>
                </DropdownList>
              </Dropdown>
            </FlexItem>
          </Flex>
        </ChatbotHeader>

        <ChatbotContent className="help-panel-chatbot__content">
          <ChatbotWelcomePrompt
            className="help-panel-chatbot__welcome"
            isCompact
            title={`Hello, ${MASTHEAD_USER_DISPLAY_NAME}`}
            description="How may I help you today?"
            prompts={[...HELP_PANEL_WELCOME_PROMPTS]}
          />
        </ChatbotContent>

        <ChatbotFooter isCompact className="help-panel-chatbot__footer">
          <MessageBar
            isCompact
            placeholder="Type your message..."
            onSendMessage={() => undefined}
            readOnly
            isSendButtonDisabled
            aria-label="Message input (preview only)"
          />
        </ChatbotFooter>
      </Chatbot>
    </div>
  );
}

export const HELP_PANEL_CHATBOT_STYLES = `
  .help-panel-chatbot {
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
    max-width: 100%;
    overflow-x: hidden;
  }

  .help-panel-chatbot__surface.pf-chatbot {
    height: 100%;
    min-height: 0;
    min-width: 0;
    max-width: 100%;
    border: none;
    border-radius: 0;
    overflow-x: hidden;
  }

  .help-panel-chatbot__header.pf-chatbot__header {
    flex-shrink: 0;
    min-width: 0;
    max-width: 100%;
    padding: var(--pf-t--global--spacer--md);
    border-block-end: var(--pf-t--global--border--width--box--default) solid
      var(--pf-t--global--border--color--default);
    background: var(--pf-t--global--background--color--primary--default);
  }

  .help-panel-chatbot__header-inner {
    width: 100%;
    min-width: 0;
  }

  .help-panel-chatbot__agent-toggle.pf-v6-c-menu-toggle {
    width: 100%;
    max-width: 100%;
    justify-content: flex-start;
  }

  .help-panel-chatbot__content.pf-chatbot__content {
    flex: 1 1 auto;
    min-height: 0;
    min-width: 0;
    max-width: 100%;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    box-sizing: border-box;
  }

  .help-panel-chatbot__welcome.pf-chatbot--layout--welcome {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: var(--pf-t--global--spacer--md);
  }

  /* Drawer is narrow — keep prompts stacked; PF embedded mode switches to row at 64rem viewport. */
  .help-panel-chatbot__welcome.pf-chatbot--layout--welcome .pf-chatbot__prompt-suggestions {
    flex-direction: column;
    align-items: stretch;
  }

  .help-panel-chatbot__welcome.pf-chatbot--layout--welcome .pf-chatbot__prompt-suggestions > * {
    flex: 0 0 auto;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    height: auto;
    overflow: visible;
  }

  .help-panel-chatbot__welcome .pf-v6-c-content--h1,
  .help-panel-chatbot__welcome .pf-v6-c-card__title {
    overflow-wrap: anywhere;
  }

  .help-panel-chatbot__welcome .pf-chatbot__prompt-suggestion.pf-v6-c-card {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .help-panel-chatbot__footer.pf-chatbot__footer {
    flex-shrink: 0;
    min-width: 0;
    max-width: 100%;
    align-items: stretch;
  }

  .help-panel-chatbot__footer .pf-chatbot__footer-container {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding-inline: var(--pf-t--global--spacer--md);
  }

  .help-panel-chatbot__footer .pf-chatbot__message-bar {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .help-panel-chatbot__robot-icon {
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    object-fit: contain;
  }

  .help-panel-chatbot__robot-icon--header {
    width: 2rem;
    height: 2rem;
  }

  .help-panel-chatbot__surface.pf-m-compact .help-panel-chatbot__robot-icon--header {
    width: 1.5rem;
    height: 1.5rem;
  }
`;
