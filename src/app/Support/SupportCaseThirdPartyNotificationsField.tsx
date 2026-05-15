import * as React from 'react';
import {
  Alert,
  Button,
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FormGroup,
  HelperText,
  HelperTextItem,
  MenuToggle,
  TextInput,
} from '@patternfly/react-core';
import { useSupportCaseDraft } from '@app/Support/SupportCaseDraftContext';
import {
  SUPPORT_CASE_THIRD_PARTY_TOOL_LABELS,
  type TSupportCaseThirdPartyChatTool,
} from '@app/Support/supportCaseDraftConstants';
import {
  SUPPORT_CASE_SLACK_DM_SYNC_DEMO_MESSAGE,
  SUPPORT_CASE_SLACK_ENDPOINT_EXAMPLE,
  SUPPORT_CASE_SLACK_TEST_NOTIFICATION_HREF,
} from '@app/Support/supportCaseChatPrompt';
import { useSupportCaseChatContinuation } from '@app/Support/SupportCaseChatContinuationContext';
import { THIRD_PARTY_TOOL_MENU_ICONS } from '@app/Support/SupportCaseThirdPartyToolIcons';

export interface ISupportCaseThirdPartyNotificationsFieldProps {
  fieldIdBase: string;
}

const TOOL_ORDER: readonly TSupportCaseThirdPartyChatTool[] = ['slack', 'gchat', 'teams'] as const;

const SLACK_DM_SYNC_DEMO_MESSAGE_NORM = SUPPORT_CASE_SLACK_DM_SYNC_DEMO_MESSAGE.trim().toLowerCase();

const SupportCaseThirdPartyNotificationsField: React.FunctionComponent<
  ISupportCaseThirdPartyNotificationsFieldProps
> = ({ fieldIdBase }) => {
  const { draft, updateDraft } = useSupportCaseDraft();
  const { notifySlackLinkedFromWizard, phase, isContinuationThinking, continuationMessages } =
    useSupportCaseChatContinuation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isConnectLoading, setIsConnectLoading] = React.useState(false);
  const slackDmDemoSyncScheduledRef = React.useRef<string | null>(null);

  const selectTool = React.useCallback(
    (tool: TSupportCaseThirdPartyChatTool) => {
      setIsMenuOpen(false);
      if (tool === 'slack') {
        updateDraft({ thirdPartyChatTool: 'slack' });
      } else {
        updateDraft({ thirdPartyChatTool: tool, slackNotificationEndpointUrl: '', slackWebhookDemoVerified: false });
      }
    },
    [updateDraft]
  );

  React.useEffect(() => {
    if (!fieldIdBase.endsWith('-third-party')) {
      return undefined;
    }
    if (!isContinuationThinking || phase !== 'awaiting_notify_intent') {
      return undefined;
    }
    if (draft.thirdPartyChatTool === 'slack') {
      return undefined;
    }
    const last = continuationMessages[continuationMessages.length - 1];
    if (!last || last.role !== 'user') {
      return undefined;
    }
    if (last.content.trim().toLowerCase() !== SLACK_DM_SYNC_DEMO_MESSAGE_NORM) {
      return undefined;
    }
    const syncKey = `${continuationMessages.length}:${last.content}`;
    if (slackDmDemoSyncScheduledRef.current === syncKey) {
      return undefined;
    }
    slackDmDemoSyncScheduledRef.current = syncKey;

    setIsMenuOpen(true);
    const clickTid = window.setTimeout(() => {
      selectTool('slack');
    }, 480);

    return () => {
      window.clearTimeout(clickTid);
      slackDmDemoSyncScheduledRef.current = null;
    };
  }, [continuationMessages, draft.thirdPartyChatTool, fieldIdBase, isContinuationThinking, phase, selectTool]);

  const onSlackUrlChange = React.useCallback(
    (_e: React.FormEvent<HTMLInputElement>, v: string) => {
      updateDraft({ slackNotificationEndpointUrl: v, slackWebhookDemoVerified: false });
    },
    [updateDraft]
  );

  const onConnectSlack = React.useCallback(() => {
    const url = draft.slackNotificationEndpointUrl.trim();
    if (!url) {
      return;
    }
    setIsConnectLoading(true);
    window.setTimeout(() => {
      updateDraft({
        thirdPartyChatTool: 'slack',
        slackNotificationEndpointUrl: url,
        slackWebhookDemoVerified: true,
      });
      setIsConnectLoading(false);
      notifySlackLinkedFromWizard();
    }, 1850 + Math.floor(Math.random() * 400));
  }, [draft.slackNotificationEndpointUrl, updateDraft, notifySlackLinkedFromWizard]);

  const toggleLabel =
    draft.thirdPartyChatTool === ''
      ? 'Add third-party tool'
      : SUPPORT_CASE_THIRD_PARTY_TOOL_LABELS[draft.thirdPartyChatTool];

  const toggleIcon =
    draft.thirdPartyChatTool === '' ? undefined : THIRD_PARTY_TOOL_MENU_ICONS[draft.thirdPartyChatTool];

  const showSlackConnect =
    draft.thirdPartyChatTool === 'slack' && draft.slackNotificationEndpointUrl.trim().length > 0;

  return (
    <FormGroup label="Third-party notifications" fieldId={`${fieldIdBase}-tool-menu`}>
      <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsMd' }}>
        <HelperText component="div">
          <HelperTextItem>
            Sync case activity and interact with the assigned support engineer from your own chat tools — Slack, GChat,
            and Microsoft Teams.
          </HelperTextItem>
        </HelperText>

        <Dropdown
          isOpen={isMenuOpen}
          onOpenChange={setIsMenuOpen}
          toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
            <MenuToggle
              ref={toggleRef}
              id={`${fieldIdBase}-tool-menu`}
              icon={toggleIcon}
              onClick={() => setIsMenuOpen((o) => !o)}
              isExpanded={isMenuOpen}
              aria-label="Choose a third-party chat tool for notifications"
            >
              {toggleLabel}
            </MenuToggle>
          )}
          shouldFocusToggleOnSelect
        >
          <DropdownList>
            {TOOL_ORDER.map((tool) => (
              <DropdownItem
                key={tool}
                id={`${fieldIdBase}-tool-${tool}`}
                icon={THIRD_PARTY_TOOL_MENU_ICONS[tool]}
                onClick={() => selectTool(tool)}
              >
                {SUPPORT_CASE_THIRD_PARTY_TOOL_LABELS[tool]}
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>

        {draft.thirdPartyChatTool === 'slack' ? (
          <>
            <FormGroup label="Slack endpoint URL" fieldId={`${fieldIdBase}-slack-url`}>
              <Flex
                direction={{ default: 'column', sm: 'row' }}
                spaceItems={{ default: 'spaceItemsMd' }}
                alignItems={{ default: 'alignItemsFlexStart' }}
              >
                <Flex flex={{ default: 'flex_1' }} grow={{ default: 'grow' }} style={{ minWidth: 0, width: '100%' }}>
                  <TextInput
                    id={`${fieldIdBase}-slack-url`}
                    type="url"
                    value={draft.slackNotificationEndpointUrl}
                    onChange={onSlackUrlChange}
                    placeholder={SUPPORT_CASE_SLACK_ENDPOINT_EXAMPLE}
                    aria-label="Slack incoming webhook endpoint URL"
                    isDisabled={isConnectLoading}
                  />
                </Flex>
                {showSlackConnect && !draft.slackWebhookDemoVerified ? (
                  <Button
                    id={`${fieldIdBase}-slack-connect`}
                    variant="secondary"
                    isDisabled={isConnectLoading}
                    isLoading={isConnectLoading}
                    onClick={onConnectSlack}
                  >
                    Connect Slack
                  </Button>
                ) : null}
              </Flex>
            </FormGroup>

            {draft.slackWebhookDemoVerified ? (
              <Alert variant="success" title="Slack endpoint connected" isInline>
                <p style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
                  Your webhook is stored on this draft for demo purposes only. No message is sent until you use a
                  production integration.
                </p>
                <Button
                  component="a"
                  variant="link"
                  isInline
                  href={SUPPORT_CASE_SLACK_TEST_NOTIFICATION_HREF}
                  onClick={(e) => e.preventDefault()}
                >
                  Send test notification to Slack
                </Button>
              </Alert>
            ) : null}
          </>
        ) : null}
      </Flex>
    </FormGroup>
  );
};

export { SupportCaseThirdPartyNotificationsField };
