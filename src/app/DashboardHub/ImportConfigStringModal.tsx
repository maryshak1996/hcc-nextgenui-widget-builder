import * as React from 'react';
import {
  Button,
  Checkbox,
  Content,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextArea,
  TextInput
} from '@patternfly/react-core';
import { CodeIcon } from '@patternfly/react-icons';
import { DASHBOARD_DUPLICATE_NAME_ERROR } from '@app/DashboardHub/dashboardHubMockData';
import { useDashboardData } from '@app/DashboardHub/DashboardDataContext';
import { mergeCanvasWidgetsWithCatalog, writeDashboardCanvasWidgets } from '@app/DashboardHub/dashboardCanvasStorage';
import { createHomepageWidgetClones } from '@app/Homepage/homepageWidgetCatalog';
import type { Widget } from '@app/Homepage/widgetTypes';

const IMPORT_CONFIG_FORM_ID = 'import-config-string-form';
const IMPORT_NAME_DUPLICATE_ID = 'import-config-name-duplicate-error';

/** Replace when the product documentation URL for config strings is finalized. */
const CONFIG_STRING_HELP_PLACEHOLDER_URL = 'https://www.redhat.com/';

function buildImportStarterCanvasWidgets(): Widget[] {
  const all = createHomepageWidgetClones();
  const ids = ['recently-visited', 'events', 'openshift', 'rhel'];
  return ids.map((id) => all.find((w) => w.id === id)).filter((w): w is Widget => w !== undefined);
}

export type ImportConfigStringModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Initial state of “Set as homepage” when the modal opens (e.g. from homepage hero). */
  initialSetAsHomepage?: boolean;
  onSuccess: (newDashboardId: string) => void;
};

const ImportConfigStringModal: React.FunctionComponent<ImportConfigStringModalProps> = ({
  isOpen,
  onClose,
  initialSetAsHomepage = false,
  onSuccess
}) => {
  const { addDashboard, isDashboardNameTaken } = useDashboardData();

  const [configString, setConfigString] = React.useState('');
  const [newDashboardName, setNewDashboardName] = React.useState('');
  const [setAsHomepage, setSetAsHomepage] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setConfigString('');
      setNewDashboardName('');
      setSetAsHomepage(Boolean(initialSetAsHomepage));
    } else {
      setConfigString('');
      setNewDashboardName('');
      setSetAsHomepage(false);
    }
  }, [isOpen, initialSetAsHomepage]);

  const nameTrimmed = newDashboardName.trim();
  const configTrimmed = configString.trim();
  const nameIsDuplicate = nameTrimmed.length > 0 && isDashboardNameTaken(nameTrimmed);
  const isImportFormValid =
    configTrimmed.length > 0 && nameTrimmed.length > 0 && !nameIsDuplicate;

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCreateImportedDashboard = React.useCallback(() => {
    if (!isImportFormValid) {
      return;
    }
    const newId = addDashboard({ name: nameTrimmed, setAsHomepage });
    if (!newId) {
      return;
    }
    const starter = buildImportStarterCanvasWidgets();
    writeDashboardCanvasWidgets(newId, mergeCanvasWidgetsWithCatalog(starter));
    onSuccess(newId);
  }, [addDashboard, isImportFormValid, nameTrimmed, onSuccess, setAsHomepage]);

  const handleFormSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleCreateImportedDashboard();
    },
    [handleCreateImportedDashboard]
  );

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="import-config-string-modal-title"
    >
      <ModalHeader
        labelId="import-config-string-modal-title"
        title="Import configuration string"
        titleIconVariant={CodeIcon}
      />
      <ModalBody>
        <Content className="hcc-import-config-modal-intro">
          <p>
            Copy/paste a config string from any other Hybrid Cloud Console dashboard (i.e. a string shared with you
            from another person in your organization) to have that dashboard recreated in your account.{' '}
            <Button
              variant="link"
              isInline
              component="a"
              href={CONFIG_STRING_HELP_PLACEHOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn about using config strings.
            </Button>
          </p>
        </Content>
        <Form id={IMPORT_CONFIG_FORM_ID} onSubmit={handleFormSubmit}>
          <FormGroup isRequired fieldId="import-config-string" label="Paste configuration string">
            <TextArea
              isRequired
              id="import-config-string"
              name="import-config-string"
              value={configString}
              onChange={(_event, value) => setConfigString(value)}
              rows={10}
              resizeOrientation="vertical"
              aria-label="Paste configuration string"
              className="hcc-import-config-code-editor"
              placeholder="{ … }"
            />
          </FormGroup>
          <FormGroup isRequired fieldId="import-new-dashboard-name" label="New dashboard name">
            <TextInput
              isRequired
              type="text"
              id="import-new-dashboard-name"
              name="import-new-dashboard-name"
              value={newDashboardName}
              onChange={(_event, value) => setNewDashboardName(value)}
              placeholder="e.g. imported monitoring layout"
              validated={nameIsDuplicate ? 'error' : 'default'}
              aria-describedby={nameIsDuplicate ? IMPORT_NAME_DUPLICATE_ID : undefined}
            />
            {nameIsDuplicate && (
              <HelperText isLiveRegion>
                <HelperTextItem id={IMPORT_NAME_DUPLICATE_ID} variant="error" component="div">
                  {DASHBOARD_DUPLICATE_NAME_ERROR}
                </HelperTextItem>
              </HelperText>
            )}
          </FormGroup>
          <FormGroup fieldId="import-set-homepage" hasNoPaddingTop>
            <Checkbox
              id="import-set-homepage"
              isChecked={setAsHomepage}
              onChange={(_event, checked) => setSetAsHomepage(checked)}
              label="Set as homepage"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          type="submit"
          variant="primary"
          form={IMPORT_CONFIG_FORM_ID}
          isDisabled={!isImportFormValid}
        >
          Create dashboard
        </Button>
        <Button type="button" variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { ImportConfigStringModal };
