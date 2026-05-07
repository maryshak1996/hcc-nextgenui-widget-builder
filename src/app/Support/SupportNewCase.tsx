import * as React from 'react';
import { HelpPanelContext } from '@app/AppLayout/AppLayout';
import { SupportBundlePage } from './SupportBundlePage';
import { SupportNewCaseWizard } from './SupportNewCaseWizard';

const NEW_SUPPORT_CASE_CHAT_PROMPT =
  "I've automatically brought in your data. What other details do you want to include in your support ticket?";

/** Create flow drilled under Support cases (`/support/cases/new`). */
const SupportNewCase: React.FunctionComponent = () => {
  const helpPanelContext = React.useContext(HelpPanelContext);
  const helpPanelRef = React.useRef(helpPanelContext);
  helpPanelRef.current = helpPanelContext;

  React.useEffect(() => {
    helpPanelRef.current?.openHelpPanelWithChatPrompt(NEW_SUPPORT_CASE_CHAT_PROMPT);
  }, []);

  return (
    <SupportBundlePage
      pageTitle="New support case"
      breadcrumbParent={{ label: 'Support cases', to: '/support/cases' }}
      breadcrumbCurrent="New case"
      showPageHeading={false}
    >
      <SupportNewCaseWizard />
    </SupportBundlePage>
  );
};

export { SupportNewCase };
