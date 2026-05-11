import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Flex,
  FlexItem,
  Spinner,
  Wizard,
  WizardFooter,
  WizardStep,
  type WizardStepType,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import wizardStyles from '@patternfly/react-styles/css/components/Wizard/wizard.mjs';
import { HCC_SUPPORT_WIZARD_BODY_READY } from '@app/DemoAnnotations/demoAnnotationEvents';
import { SupportNewCaseReviewStep } from './SupportNewCaseReviewStep';
import {
  SupportNewCaseAdditionalDetailsStep,
  SupportNewCaseConfigurationStep,
  SupportNewCaseTroubleshootStep,
  SupportNewCaseUploadStep,
} from './SupportNewCaseWizardSteps';
import { useSupportCaseChatContinuation } from './SupportCaseChatContinuationContext';

const REVIEW_STEP_INDEX = 5;

/** Staged “page load” before the Open a case body appears (CVE handoff demo only). */
const CVE_WIZARD_BODY_STAGED_MS = 1550;

export interface ISupportNewCaseWizardProps {
  /** CVE continuation opens on Review with prefilled draft (`startIndex` 5). Default 1. */
  startIndex?: number;
  /** When true, briefly show a loading state so the main wizard can “arrive” after navigation. */
  fromCveDemoHandoff?: boolean;
}

const SupportNewCaseWizard: React.FunctionComponent<ISupportNewCaseWizardProps> = ({
  startIndex = 1,
  fromCveDemoHandoff = false,
}) => {
  const navigateToCases = useNavigate();
  const { submittedCaseNumber, isContinuationThinking } = useSupportCaseChatContinuation();
  const [wizardBodyVisible, setWizardBodyVisible] = React.useState(() => !fromCveDemoHandoff);

  React.useEffect(() => {
    if (!fromCveDemoHandoff) {
      setWizardBodyVisible(true);
      return undefined;
    }
    setWizardBodyVisible(false);
    const t = window.setTimeout(() => {
      setWizardBodyVisible(true);
      window.dispatchEvent(new Event(HCC_SUPPORT_WIZARD_BODY_READY));
    }, CVE_WIZARD_BODY_STAGED_MS);
    return () => window.clearTimeout(t);
  }, [fromCveDemoHandoff]);

  const handleFinish = React.useCallback(() => {
    navigateToCases('/support/cases');
  }, [navigateToCases]);

  const wizardFooter = React.useCallback(
    (
      activeStep: WizardStepType,
      onNext: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>,
      onBack: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>,
      onClose: (event: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>
    ) => (
      <WizardFooter
        activeStep={activeStep}
        onNext={onNext}
        onBack={onBack}
        onClose={onClose}
        isCancelHidden
        nextButtonText={activeStep?.index === REVIEW_STEP_INDEX ? 'Submit' : 'Next'}
      />
    ),
    []
  );

  if (submittedCaseNumber) {
    return (
      <div className="support-new-case-wizard support-new-case-wizard--completion">
        <Alert
          variant="success"
          title={`Support case #${submittedCaseNumber} submitted successfully`}
          style={{ maxWidth: '100%' }}
        >
          <p style={{ marginTop: 'var(--pf-t--global--spacer--sm)' }}>
            Red Hat Support has received your case. You can review updates, attachments, and notifications from the case
            detail view.
          </p>
          <Link to="/support/cases">View support case details</Link>
        </Alert>
      </div>
    );
  }

  if (fromCveDemoHandoff && !wizardBodyVisible) {
    return (
      <div
        className="support-new-case-wizard support-new-case-wizard--bootstrapping"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--pf-t--global--spacer--md)',
          minHeight: 'min(60vh, 560px)',
          padding: 'var(--pf-t--global--spacer--2xl)',
        }}
      >
        <Spinner size="lg" />
        <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>Loading support case draft…</span>
      </div>
    );
  }

  const wizardHeader = (
    <div className={css(wizardStyles.wizardHeader)}>
      <Flex
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
        alignItems={{ default: 'alignItemsFlexStart' }}
        flexWrap={{ default: 'wrap' }}
        spaceItems={{ default: 'spaceItemsMd' }}
        style={{ width: '100%' }}
      >
        <FlexItem flex={{ default: 'flex_1' }}>
          <div className={css(wizardStyles.wizardTitle)}>
            <h2 className={css(wizardStyles.wizardTitleText)} id="support-case-wizard-title">
              Open a case
            </h2>
          </div>
        </FlexItem>
        <FlexItem>
          <Button variant="link" onClick={() => undefined}>
            Switch to AI
          </Button>
        </FlexItem>
      </Flex>
    </div>
  );

  return (
    <div className="support-new-case-wizard support-new-case-wizard--with-chrome">
      {isContinuationThinking ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--pf-t--global--spacer--sm)',
            marginBottom: 'var(--pf-t--global--spacer--md)',
          }}
        >
          <Spinner size="sm" />
          <span
            style={{
              fontSize: 'var(--pf-t--global--font--size--body--sm)',
              color: 'var(--pf-t--global--text--color--subtle)',
            }}
          >
            Assistant is updating your support case draft…
          </span>
        </div>
      ) : null}
      <Wizard
        key={startIndex}
        navAriaLabel="Support case wizard steps"
        header={wizardHeader}
        footer={wizardFooter}
        height="100%"
        startIndex={startIndex}
        onSave={handleFinish}
        onClose={() => {
          navigateToCases('/support/cases');
        }}
      >
        <WizardStep name="Troubleshoot" id="troubleshoot">
          <SupportNewCaseTroubleshootStep />
        </WizardStep>
        <WizardStep name="Upload Files" id="upload">
          <SupportNewCaseUploadStep />
        </WizardStep>
        <WizardStep name="Additional Details" id="additional">
          <SupportNewCaseAdditionalDetailsStep />
        </WizardStep>
        <WizardStep name="Configuration" id="configuration">
          <SupportNewCaseConfigurationStep />
        </WizardStep>
        <WizardStep name="Review" id="review">
          <SupportNewCaseReviewStep />
        </WizardStep>
      </Wizard>
    </div>
  );
};

export { SupportNewCaseWizard };
