import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { HelpPanelContext } from '@app/AppLayout/AppLayout';
import { HCC_SESSION_SUPPORT_CASE_FROM_CVE } from '@app/RhelVulnerability/cveTroubleshootDemoCopy';
import {
  HCC_SKIP_GENERIC_HELP_CHAT_ONCE,
  NEW_SUPPORT_CASE_CHAT_PROMPT,
} from '@app/Support/supportCaseChatPrompt';
import {
  clearSupportCaseWizardSessionBootstrapCache,
  resolveSupportCaseWizardBootstrap,
} from '@app/Support/supportCaseWizardBootstrap';
import { SupportCaseDraftProvider, useSupportCaseDraft } from '@app/Support/SupportCaseDraftContext';
import { useSupportCaseChatContinuation } from '@app/Support/SupportCaseChatContinuationContext';
import { SupportBundlePage } from './SupportBundlePage';
import { SupportNewCaseWizard } from './SupportNewCaseWizard';

/** Bridges CVE follow-up chat commands into `SupportCaseDraftProvider` */
const SupportCaseDraftPatchBridge: React.FunctionComponent = () => {
  const { updateDraft } = useSupportCaseDraft();
  const { registerDraftPatchHandler } = useSupportCaseChatContinuation();
  React.useEffect(() => {
    registerDraftPatchHandler((patch) => updateDraft(patch));
    return () => registerDraftPatchHandler(undefined);
  }, [registerDraftPatchHandler, updateDraft]);
  return null;
};

/** Create flow drilled under Support cases (`/support/cases/new`). */
const SupportNewCase: React.FunctionComponent = () => {
  const location = useLocation();
  const wizardBootstrap = React.useMemo(
    () => resolveSupportCaseWizardBootstrap(location.state),
    [location.state]
  );

  React.useEffect(() => {
    return () => {
      clearSupportCaseWizardSessionBootstrapCache();
    };
  }, []);

  const helpPanelContext = React.useContext(HelpPanelContext);
  const helpPanelRef = React.useRef(helpPanelContext);
  helpPanelRef.current = helpPanelContext;

  const { enterFollowUpFlow } = useSupportCaseChatContinuation();

  React.useEffect(() => {
    try {
      if (sessionStorage.getItem(HCC_SKIP_GENERIC_HELP_CHAT_ONCE) === '1') {
        sessionStorage.removeItem(HCC_SKIP_GENERIC_HELP_CHAT_ONCE);
        return;
      }
    } catch {
      /* ignore */
    }
    let fromCve = false;
    try {
      fromCve = sessionStorage.getItem(HCC_SESSION_SUPPORT_CASE_FROM_CVE) === '1';
      if (fromCve) {
        sessionStorage.removeItem(HCC_SESSION_SUPPORT_CASE_FROM_CVE);
      }
    } catch {
      /* ignore */
    }
    if (fromCve) {
      enterFollowUpFlow();
      helpPanelRef.current?.openHelpPanelForSupportCaseContinuation();
    } else {
      helpPanelRef.current?.openHelpPanelWithChatPrompt(NEW_SUPPORT_CASE_CHAT_PROMPT);
    }
  }, [enterFollowUpFlow]);

  return (
    <SupportBundlePage
      pageTitle="New support case"
      breadcrumbParent={{ label: 'Support cases', to: '/support/cases' }}
      breadcrumbCurrent="New case"
      showPageHeading={false}
    >
      <SupportCaseDraftProvider initialDraft={wizardBootstrap.initialDraft}>
        <SupportCaseDraftPatchBridge />
        <SupportNewCaseWizard startIndex={wizardBootstrap.wizardStartIndex} />
      </SupportCaseDraftProvider>
    </SupportBundlePage>
  );
};

export { SupportNewCase };
