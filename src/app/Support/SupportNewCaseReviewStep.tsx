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
import { SUPPORT_CASE_TYPE_OPTIONS } from '@app/Support/supportCaseDraftConstants';
import { SupportCaseNotificationLabelsField } from '@app/Support/SupportCaseNotificationLabelsField';
import { SupportCaseThirdPartyNotificationsField } from '@app/Support/SupportCaseThirdPartyNotificationsField';
import { useSupportCaseDraft } from '@app/Support/SupportCaseDraftContext';

/** Final Review step — same fields as earlier steps, bound to shared draft */
const SupportNewCaseReviewStep: React.FunctionComponent = () => {
  const { draft, updateDraft } = useSupportCaseDraft();

  return (
    <Form>
      <FormSection>
        <Title headingLevel="h2" size="xl">
          Product &amp; version
        </Title>
        <FormGroup label="Product" isRequired fieldId="review-product">
          <FormSelect
            id="review-product"
            value={draft.productId}
            onChange={(_e, v) => updateDraft({ productId: String(v) })}
            aria-label="Product"
          >
            <FormSelectOption value="rhel" label="Red Hat Enterprise Linux" />
            <FormSelectOption value="ocp" label="OpenShift" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Version" isRequired fieldId="review-version">
          <FormSelect
            id="review-version"
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
        <FormGroup label="Title" isRequired fieldId="review-case-title">
          <TextInput
            type="text"
            id="review-case-title"
            name="review-case-title"
            value={draft.title}
            onChange={(_e, v) => updateDraft({ title: v })}
            maxLength={255}
            aria-describedby="review-case-title-helper"
          />
          <HelperText component="div" id="review-case-title-helper">
            <HelperTextItem>{draft.title.length}/255</HelperTextItem>
          </HelperText>
        </FormGroup>
        <FormGroup label="Problem description" isRequired fieldId="review-problem">
          <TextArea
            id="review-problem"
            name="review-problem"
            value={draft.problemDescription}
            onChange={(_e, v) => updateDraft({ problemDescription: v })}
            rows={6}
            maxLength={30000}
            aria-describedby="review-problem-helper review-problem-count"
          />
          <HelperText component="div" id="review-problem-helper">
            <HelperTextItem>Describe your problem. Include specific actions and error messages.</HelperTextItem>
          </HelperText>
          <HelperText component="div" id="review-problem-count">
            <HelperTextItem>{draft.problemDescription.length}/30000</HelperTextItem>
          </HelperText>
        </FormGroup>
      </FormSection>

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Title headingLevel="h2" size="xl">
          Account &amp; owner
        </Title>
        <FormGroup label="Account" isRequired fieldId="review-account">
          <FormSelect
            id="review-account"
            value={draft.accountId}
            onChange={(_e, v) => updateDraft({ accountId: String(v) })}
            aria-label="Account"
          >
            <FormSelectOption value="6082715" label="Insights QA (6082715)" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Owner" isRequired fieldId="review-owner">
          <FormSelect
            id="review-owner"
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
        <FormGroup isRequired fieldId="review-case-type-grid" label="Select case type">
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
                id={`case-type-${opt.id}`}
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

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Title headingLevel="h2" size="xl">
          Impact &amp; frequency
        </Title>
        <FormGroup label="Impact" isRequired fieldId="review-impact">
          <TextArea
            id="review-impact"
            name="review-impact"
            value={draft.impact}
            onChange={(_e, v) => updateDraft({ impact: v })}
            placeholder="Describe the impact to you or the business"
            rows={3}
          />
        </FormGroup>
        <FormGroup label="Frequency" isRequired fieldId="review-frequency">
          <TextArea
            id="review-frequency"
            name="review-frequency"
            value={draft.frequency}
            onChange={(_e, v) => updateDraft({ frequency: v })}
            placeholder="How frequently does this behavior occur? Does it occur repeatedly or at certain times?"
            rows={3}
          />
        </FormGroup>
      </FormSection>

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Title headingLevel="h2" size="xl">
          Severity
        </Title>
        <Content component="p" style={{ marginBottom: 'var(--pf-t--global--spacer--md)' }}>
          Based upon the conversation, I have selected the severity for you. Make changes, if required.
        </Content>
        <Alert
          variant="info"
          isInline
          title={draft.severityAlertTitle}
          actionLinks={
            <Button variant="link" isInline>
              Change severity
            </Button>
          }
        />
      </FormSection>

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Title headingLevel="h2" size="xl">
          Contact &amp; preferences
        </Title>
        <FormGroup label="Case owner phone number" isRequired fieldId="review-phone">
          <InputGroup>
            <InputGroupItem>
              <InputGroupText>US</InputGroupText>
            </InputGroupItem>
            <InputGroupItem isFill>
              <TextInput
                type="tel"
                id="review-phone"
                name="review-phone"
                value={draft.phone}
                onChange={(_e, v) => updateDraft({ phone: v })}
                aria-label="Case owner phone number"
              />
            </InputGroupItem>
          </InputGroup>
        </FormGroup>
        <FormGroup label="Preferred language" isRequired fieldId="review-lang">
          <FormSelect
            id="review-lang"
            value={draft.preferredLanguage}
            onChange={(_e, v) => updateDraft({ preferredLanguage: String(v) })}
            aria-label="Preferred language"
          >
            <FormSelectOption value="" label="Select language" />
            <FormSelectOption value="en" label="English" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Group" fieldId="review-group">
          <FormSelect
            id="review-group"
            value={draft.groupId}
            onChange={(_e, v) => updateDraft({ groupId: String(v) })}
            aria-label="Group"
          >
            <FormSelectOption value="ungrouped" label="Ungrouped Case" />
          </FormSelect>
        </FormGroup>
      </FormSection>

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Title headingLevel="h2" size="xl">
          Notifications &amp; references
        </Title>
        <SupportCaseNotificationLabelsField
          fieldId="review-notify"
          emptyPlaceholder="Add email addresses, usernames, or notification groups"
        />
        <SupportCaseThirdPartyNotificationsField fieldIdBase="review-third-party" />
        <FormGroup label="Personal reference number" fieldId="review-ref">
          <TextInput
            type="text"
            id="review-ref"
            name="review-ref"
            value={draft.personalReference}
            onChange={(_e, v) => updateDraft({ personalReference: v })}
            placeholder="Internal tracking reference"
          />
        </FormGroup>
      </FormSection>
    </Form>
  );
};

export { SupportNewCaseReviewStep };
