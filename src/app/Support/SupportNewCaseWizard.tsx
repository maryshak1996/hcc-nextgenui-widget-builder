import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Content,
  Flex,
  FlexItem,
  Wizard,
  WizardFooter,
  WizardStep,
  type WizardStepType,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import wizardStyles from '@patternfly/react-styles/css/components/Wizard/wizard.mjs';
import { SupportNewCaseReviewStep } from './SupportNewCaseReviewStep';

const REVIEW_STEP_INDEX = 5;

const SupportNewCaseWizard: React.FunctionComponent = () => {
  const navigateToCases = useNavigate();

  const handleFinish = React.useCallback(() => {
    navigateToCases('/support/cases');
  }, [navigateToCases]);

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

  return (
    <div className="support-new-case-wizard">
      <Wizard
        navAriaLabel="Support case wizard steps"
        header={wizardHeader}
        footer={wizardFooter}
        height="min(85vh, 920px)"
        onSave={handleFinish}
        onClose={() => {
          navigateToCases('/support/cases');
        }}
      >
        <WizardStep name="Troubleshoot" id="troubleshoot">
          <Content>
            <p>Troubleshoot your issue before opening a case. This step is a placeholder for guided diagnostics.</p>
          </Content>
        </WizardStep>
        <WizardStep name="Upload Files" id="upload">
          <Content>
            <p>Upload logs, sosreports, or other artifacts. This step is a placeholder for file upload.</p>
          </Content>
        </WizardStep>
        <WizardStep name="Additional Details" id="additional">
          <Content>
            <p>Add any extra context for Support. This step is a placeholder for additional questions.</p>
          </Content>
        </WizardStep>
        <WizardStep name="Configuration" id="configuration">
          <Content>
            <p>Confirm environment and configuration details. This step is a placeholder.</p>
          </Content>
        </WizardStep>
        <WizardStep name="Review" id="review">
          <SupportNewCaseReviewStep />
        </WizardStep>
      </Wizard>
    </div>
  );
};

export { SupportNewCaseWizard };
