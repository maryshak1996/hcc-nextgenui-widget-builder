import * as React from 'react';
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Content,
  Divider,
  Flex,
  FlexItem,
  Form,
  FormGroup,
  FormSection,
  FormSelect,
  FormSelectOption,
  HelperText,
  HelperTextItem,
  InputGroup,
  InputGroupItem,
  InputGroupText,
  TextArea,
  TextInput,
  Title,
} from '@patternfly/react-core';
import { CloudUploadAltIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { SUPPORT_CASE_TYPE_OPTIONS } from '@app/Support/supportCaseDraftConstants';
import { SupportCaseNotificationLabelsField } from '@app/Support/SupportCaseNotificationLabelsField';
import { useSupportCaseDraft } from '@app/Support/SupportCaseDraftContext';

/** Step 1 — Troubleshoot (portal aligns core fields here first) */
const SupportNewCaseTroubleshootStep: React.FunctionComponent = () => {
  const { draft, updateDraft } = useSupportCaseDraft();

  return (
    <Form>
      <FormSection>
        <Title headingLevel="h2" size="xl">
          Product &amp; version
        </Title>
        <FormGroup label="Product" isRequired fieldId="ts-product">
          <FormSelect
            id="ts-product"
            value={draft.productId}
            onChange={(_e, v) => updateDraft({ productId: String(v) })}
            aria-label="Product"
          >
            <FormSelectOption value="rhel" label="Red Hat Enterprise Linux" />
            <FormSelectOption value="ocp" label="OpenShift" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Version" isRequired fieldId="ts-version">
          <FormSelect
            id="ts-version"
            value={draft.version}
            onChange={(_e, v) => updateDraft({ version: String(v) })}
            aria-label="Version"
          >
            <FormSelectOption value="9.6" label="9.6" />
            <FormSelectOption value="9.5" label="9.5" />
            <FormSelectOption value="9.4" label="9.4" />
          </FormSelect>
        </FormGroup>
      </FormSection>

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Title headingLevel="h2" size="xl">
          Case summary
        </Title>
        <FormGroup label="Title" isRequired fieldId="ts-case-title">
          <TextInput
            id="ts-case-title"
            value={draft.title}
            onChange={(_e, v) => updateDraft({ title: v })}
            maxLength={255}
            aria-describedby="ts-case-title-count"
          />
          <HelperText component="div" id="ts-case-title-count">
            <HelperTextItem>{draft.title.length}/255</HelperTextItem>
          </HelperText>
        </FormGroup>
        <FormGroup label="Describe your problem" isRequired fieldId="ts-problem">
          <TextArea
            id="ts-problem"
            value={draft.problemDescription}
            onChange={(_e, v) => updateDraft({ problemDescription: v })}
            rows={8}
            maxLength={30000}
            aria-describedby="ts-problem-helper ts-problem-count"
          />
          <HelperText component="div" id="ts-problem-helper">
            <HelperTextItem>Describe your problem. Include specific actions and error messages.</HelperTextItem>
          </HelperText>
          <HelperText component="div" id="ts-problem-count">
            <HelperTextItem>{draft.problemDescription.length}/30000</HelperTextItem>
          </HelperText>
        </FormGroup>
      </FormSection>

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Title headingLevel="h2" size="xl">
          Account &amp; owner
        </Title>
        <FormGroup label="Account" isRequired fieldId="ts-account">
          <FormSelect
            id="ts-account"
            value={draft.accountId}
            onChange={(_e, v) => updateDraft({ accountId: String(v) })}
            aria-label="Account"
          >
            <FormSelectOption value="6082715" label="Insights QA (6082715)" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Owner" isRequired fieldId="ts-owner">
          <FormSelect
            id="ts-owner"
            value={draft.ownerId}
            onChange={(_e, v) => updateDraft({ ownerId: String(v) })}
            aria-label="Owner"
          >
            <FormSelectOption value="rbac" label="rbac-frontend rbac-frontend (rbacfrontend)" />
          </FormSelect>
        </FormGroup>
      </FormSection>

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <FormGroup isRequired fieldId="ts-case-type-grid" label="Select case type">
          <div
            role="group"
            aria-label="Case type"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 'var(--pf-t--global--spacer--md)',
            }}
          >
            {SUPPORT_CASE_TYPE_OPTIONS.map((opt) => (
              <Card
                key={opt.id}
                id={`ts-case-type-${opt.id}`}
                isCompact
                isSelectable
                isSelected={draft.caseTypeId === opt.id}
                onClick={() => updateDraft({ caseTypeId: opt.id })}
              >
                <CardHeader>
                  <CardTitle>{opt.title}</CardTitle>
                </CardHeader>
                <CardBody>
                  <Content component="p" style={{ fontSize: 'var(--pf-t--global--font--size--body--sm)' }}>
                    {opt.description}
                  </Content>
                </CardBody>
              </Card>
            ))}
          </div>
        </FormGroup>
      </FormSection>
    </Form>
  );
};

/** Step 2 — Upload files */
const SupportNewCaseUploadStep: React.FunctionComponent = () => (
  <Form>
    <FormSection>
      <Title headingLevel="h2" size="xl">
        Upload files
      </Title>
      <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
        Attach diagnostics Support may need. Accepted types mirror the customer portal experience (demo).
      </Content>
      <div
        style={{
          border: '2px dashed var(--pf-t--global--border--color--brand--default)',
          borderRadius: 'var(--pf-t--global--border--radius--medium)',
          padding: 'var(--pf-t--global--spacer--2xl)',
          textAlign: 'center',
          background: 'var(--pf-t--global--background--color--primary--default)',
        }}
      >
        <Flex
          justifyContent={{ default: 'justifyContentCenter' }}
          alignItems={{ default: 'alignItemsCenter' }}
          gap={{ default: 'gapMd' }}
          flexWrap={{ default: 'wrap' }}
        >
          <FlexItem>
            <CloudUploadAltIcon style={{ fontSize: '2.5rem', color: 'var(--pf-t--global--icon--color--brand--default)' }} aria-hidden />
          </FlexItem>
          <FlexItem>
            <Content component="p" style={{ margin: 0, textAlign: 'left' }}>
              Drag and drop files here or upload
            </Content>
          </FlexItem>
          <FlexItem>
            <Button variant="secondary">Upload</Button>
          </FlexItem>
        </Flex>
      </div>
      <HelperText component="div" style={{ marginTop: 'var(--pf-t--global--spacer--md)' }}>
        <HelperTextItem>Accepted file types: .tar.xz, .gz, .zip, .log</HelperTextItem>
      </HelperText>
      <Button variant="link" isInline icon={<ExternalLinkAltIcon />} iconPosition="right" component="a" href="#" onClick={(e) => e.preventDefault()}>
        How to generate a sosreport file
      </Button>
    </FormSection>
  </Form>
);

/** Step 3 — Additional details (impact & frequency only — portal step 3) */
const SupportNewCaseAdditionalDetailsStep: React.FunctionComponent = () => {
  const { draft, updateDraft } = useSupportCaseDraft();

  return (
    <Form>
      <FormSection>
        <Title headingLevel="h2" size="xl">
          Additional details
        </Title>
        <FormGroup
          label="Describe the impact to you or the business"
          isRequired
          fieldId="add-impact"
        >
          <TextArea
            id="add-impact"
            value={draft.impact}
            onChange={(_e, v) => updateDraft({ impact: v })}
            rows={5}
            maxLength={4000}
            aria-describedby="add-impact-count"
          />
          <HelperText component="div" id="add-impact-count">
            <HelperTextItem>
              {draft.impact.length} / 4000
            </HelperTextItem>
          </HelperText>
        </FormGroup>
        <FormGroup
          label="How frequently does this behavior occur? Does it occur repeatedly or at certain times?"
          isRequired
          fieldId="add-frequency"
        >
          <TextArea
            id="add-frequency"
            value={draft.frequency}
            onChange={(_e, v) => updateDraft({ frequency: v })}
            rows={5}
            maxLength={4000}
            aria-describedby="add-frequency-count"
          />
          <HelperText component="div" id="add-frequency-count">
            <HelperTextItem>
              {draft.frequency.length} / 4000
            </HelperTextItem>
          </HelperText>
        </FormGroup>
      </FormSection>
    </Form>
  );
};

/** Step 4 — Configuration (severity, contact — portal step 4) */
const SupportNewCaseConfigurationStep: React.FunctionComponent = () => {
  const { draft, updateDraft } = useSupportCaseDraft();

  return (
    <Form>
      <FormSection>
        <Title headingLevel="h2" size="xl">
          Configuration
        </Title>
        <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--sm)' }}>
          Based upon the conversation, I have selected the severity for you. Make changes, if required: *
        </Content>
        <Alert
          variant="info"
          isInline
          title={draft.severityAlertTitle}
          style={{ marginBottom: 'var(--pf-t--global--spacer--lg)' }}
          actionLinks={
            <Button variant="link" isInline>
              Change severity
            </Button>
          }
        />

        <FormGroup label="Case owner phone number" isRequired fieldId="cfg-phone">
          <InputGroup>
            <InputGroupItem>
              <InputGroupText>US</InputGroupText>
            </InputGroupItem>
            <InputGroupItem isFill>
              <TextInput
                type="tel"
                id="cfg-phone"
                value={draft.phone}
                onChange={(_e, v) => updateDraft({ phone: v })}
                aria-label="Case owner phone number"
              />
            </InputGroupItem>
          </InputGroup>
          <HelperText component="div">
            <HelperTextItem>A current phone number helps Support reach you during the case.</HelperTextItem>
          </HelperText>
        </FormGroup>

        <FormGroup label="Preferred language" isRequired fieldId="cfg-lang">
          <FormSelect
            id="cfg-lang"
            value={draft.preferredLanguage}
            onChange={(_e, v) => updateDraft({ preferredLanguage: String(v) })}
            aria-label="Preferred language"
          >
            <FormSelectOption value="" label="Select language" />
            <FormSelectOption value="en" label="English" />
          </FormSelect>
        </FormGroup>

        <FormGroup label="Group" fieldId="cfg-group">
          <FormSelect
            id="cfg-group"
            value={draft.groupId}
            onChange={(_e, v) => updateDraft({ groupId: String(v) })}
            aria-label="Group"
          >
            <FormSelectOption value="" label="Search or select a group" />
            <FormSelectOption value="ungrouped" label="Ungrouped Case" />
          </FormSelect>
          <HelperText component="div">
            <HelperTextItem>Organization administrators manage these groups.</HelperTextItem>
          </HelperText>
        </FormGroup>

        <SupportCaseNotificationLabelsField
          fieldId="cfg-notify"
          emptyPlaceholder="Enter an email address or username for the person you want to notify"
        />

        <FormGroup label="Personal reference number" fieldId="cfg-ref">
          <TextInput
            type="text"
            id="cfg-ref"
            value={draft.personalReference}
            onChange={(_e, v) => updateDraft({ personalReference: v })}
            placeholder="Enter the reference number used personally or within your company"
          />
        </FormGroup>
      </FormSection>
    </Form>
  );
};

export {
  SupportNewCaseAdditionalDetailsStep,
  SupportNewCaseConfigurationStep,
  SupportNewCaseTroubleshootStep,
  SupportNewCaseUploadStep,
};
