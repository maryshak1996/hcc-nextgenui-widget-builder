import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { HelpPanelContext } from '@app/AppLayout/AppLayout';
import { HCC_SESSION_CVE_DEMO_ON_SUPPORT_CASE_PAGE, HCC_SESSION_SUPPORT_CASE_FROM_CVE } from '@app/RhelVulnerability/cveTroubleshootDemoCopy';
import {
  HCC_SUPPORT_CASE_NEW_PATH,
  NEW_SUPPORT_CASE_CHAT_PROMPT,
} from '@app/Support/supportCaseChatPrompt';
import { hasPersistedSupportCaseContinuationThread } from '@app/Support/supportCaseDraftSession';
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

  const prevPathRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const prev = prevPathRef.current;
    const cur = location.pathname;
    prevPathRef.current = cur;
    if (prev === HCC_SUPPORT_CASE_NEW_PATH && cur !== HCC_SUPPORT_CASE_NEW_PATH) {
      try {
        sessionStorage.removeItem(HCC_SESSION_SUPPORT_CASE_FROM_CVE);
        sessionStorage.removeItem(HCC_SESSION_CVE_DEMO_ON_SUPPORT_CASE_PAGE);
      } catch {
        /* ignore */
      }
      clearSupportCaseWizardSessionBootstrapCache();
    }
  }, [location.pathname]);

  const helpPanelContext = React.useContext(HelpPanelContext);
  const helpPanelRef = React.useRef(helpPanelContext);
  helpPanelRef.current = helpPanelContext;

  const { enterFollowUpFlow } = useSupportCaseChatContinuation();

  React.useEffect(() => {
    let fromCve = false;
    try {
      fromCve = sessionStorage.getItem(HCC_SESSION_SUPPORT_CASE_FROM_CVE) === '1';
    } catch {
      /* ignore */
    }
    const resumedThread = hasPersistedSupportCaseContinuationThread();
    if (fromCve) {
      if (!resumedThread) {
        enterFollowUpFlow();
      }
      helpPanelRef.current?.openHelpPanelForSupportCaseContinuation();
    } else if (resumedThread) {
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
      layoutVariant="wizard-fill"
    >
      <SupportCaseDraftProvider initialDraft={wizardBootstrap.initialDraft}>
        <SupportCaseDraftPatchBridge />
        <SupportNewCaseWizard
          startIndex={wizardBootstrap.wizardStartIndex}
          fromCveDemoHandoff={wizardBootstrap.fromCveDemoHandoff === true}
        />
      </SupportCaseDraftProvider>
    </SupportBundlePage>
  );
};

export { SupportNewCase };
