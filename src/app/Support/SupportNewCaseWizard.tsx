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
import { SupportNewCaseReviewStep } from './SupportNewCaseReviewStep';
import {
  SupportNewCaseAdditionalDetailsStep,
  SupportNewCaseConfigurationStep,
  SupportNewCaseTroubleshootStep,
  SupportNewCaseUploadStep,
} from './SupportNewCaseWizardSteps';
import { useSupportCaseChatContinuation } from './SupportCaseChatContinuationContext';

const REVIEW_STEP_INDEX = 5;

export interface ISupportNewCaseWizardProps {
  /** CVE continuation opens on Review with prefilled draft (`startIndex` 5). Default 1. */
  startIndex?: number;
}

const SupportNewCaseWizard: React.FunctionComponent<ISupportNewCaseWizardProps> = ({ startIndex = 1 }) => {
  const navigateToCases = useNavigate();
  const { submittedCaseNumber, isContinuationThinking } = useSupportCaseChatContinuation();

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
    <div className="support-new-case-wizard">
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
        height="min(85vh, 920px)"
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
