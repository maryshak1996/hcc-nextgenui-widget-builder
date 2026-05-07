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

const CASE_TYPE_OPTIONS: { id: string; title: string; description: string }[] = [
  { id: 'bug', title: 'Bug or Defect', description: 'Report an issue with a product' },
  { id: 'cert', title: 'Certification', description: 'Hardware and software certification support' },
  { id: 'config', title: 'Configuration', description: 'Set-up, configuration & upgrade support' },
  { id: 'customer', title: 'Customer Service', description: 'Account, billing, or subscription support' },
  { id: 'docs', title: 'Usage & Docs help', description: 'Support or request an update to content' },
  { id: 'idea', title: 'Idea', description: 'Request a feature or product enhancement' },
  { id: 'rca', title: 'Root cause analysis', description: 'Only for identifying the source of an issue' },
  { id: 'other', title: 'Other', description: 'General option' },
];

const SupportNewCaseReviewStep: React.FunctionComponent = () => {
  const [caseType, setCaseType] = React.useState('bug');
  const [title, setTitle] = React.useState('CVE-2023-45678910 impacting dummy-rhel-system');
  const [description, setDescription] = React.useState('ALL THE IMPORTANT STUFF JUST GOES IN HERE');
  const [impact, setImpact] = React.useState('');
  const [frequency, setFrequency] = React.useState('');

  return (
    <Form>
      <FormSection>
        <Title headingLevel="h2" size="xl">
          Product &amp; version
        </Title>
        <FormGroup label="Product" isRequired fieldId="review-product">
          <FormSelect id="review-product" value="rhel" aria-label="Product">
            <FormSelectOption value="rhel" label="Red Hat Enterprise Linux" />
            <FormSelectOption value="ocp" label="OpenShift" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Version" isRequired fieldId="review-version">
          <FormSelect id="review-version" value="9.5" aria-label="Version">
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
            value={title}
            onChange={(_e, v) => setTitle(v)}
            maxLength={255}
            aria-describedby="review-case-title-helper"
          />
          <HelperText component="div" id="review-case-title-helper">
            <HelperTextItem>{title.length}/255</HelperTextItem>
          </HelperText>
        </FormGroup>
        <FormGroup label="Problem description" isRequired fieldId="review-problem">
          <TextArea
            id="review-problem"
            name="review-problem"
            value={description}
            onChange={(_e, v) => setDescription(v)}
            rows={6}
            maxLength={30000}
            aria-describedby="review-problem-helper review-problem-count"
          />
          <HelperText component="div" id="review-problem-helper">
            <HelperTextItem>Describe your problem. Include specific actions and error messages.</HelperTextItem>
          </HelperText>
          <HelperText component="div" id="review-problem-count">
            <HelperTextItem>{description.length}/30000</HelperTextItem>
          </HelperText>
        </FormGroup>
      </FormSection>

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Title headingLevel="h2" size="xl">
          Account &amp; owner
        </Title>
        <FormGroup label="Account" isRequired fieldId="review-account">
          <FormSelect id="review-account" value="6082715" aria-label="Account">
            <FormSelectOption value="6082715" label="Insights QA (6082715)" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Owner" isRequired fieldId="review-owner">
          <FormSelect id="review-owner" value="rbac" aria-label="Owner">
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
            {CASE_TYPE_OPTIONS.map((opt) => (
              <Card
                key={opt.id}
                id={`case-type-${opt.id}`}
                isCompact
                isSelectable
                isSelected={caseType === opt.id}
                onClick={() => setCaseType(opt.id)}
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
            value={impact}
            onChange={(_e, v) => setImpact(v)}
            placeholder="Describe the impact to you or the business"
            rows={3}
          />
        </FormGroup>
        <FormGroup label="Frequency" isRequired fieldId="review-frequency">
          <TextArea
            id="review-frequency"
            name="review-frequency"
            value={frequency}
            onChange={(_e, v) => setFrequency(v)}
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
          title="4 (Low) — A non-urgent query…"
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
                aria-label="Case owner phone number"
                placeholder="+1"
              />
            </InputGroupItem>
          </InputGroup>
        </FormGroup>
        <FormGroup label="Preferred language" isRequired fieldId="review-lang">
          <FormSelect id="review-lang" value="en" aria-label="Preferred language">
            <FormSelectOption value="en" label="English" />
          </FormSelect>
        </FormGroup>
        <FormGroup label="Group" fieldId="review-group">
          <FormSelect id="review-group" value="ungrouped" aria-label="Group">
            <FormSelectOption value="ungrouped" label="Ungrouped Case" />
          </FormSelect>
        </FormGroup>
      </FormSection>

      <Divider />

      <FormSection style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <Title headingLevel="h2" size="xl">
          Notifications &amp; references
        </Title>
        <FormGroup label="Send notifications" fieldId="review-notify">
          <TextInput
            type="text"
            id="review-notify"
            name="review-notify"
            placeholder="Add email addresses or usernames"
          />
        </FormGroup>
        <FormGroup label="Personal reference number" fieldId="review-ref">
          <TextInput type="text" id="review-ref" name="review-ref" placeholder="Internal tracking reference" />
        </FormGroup>
      </FormSection>
    </Form>
  );
};

export { SupportNewCaseReviewStep };
