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
import { CodeIcon } from '@app/icons/rhUiIcons';
import { DASHBOARD_DUPLICATE_NAME_ERROR } from '@app/DashboardHub/dashboardHubMockData';
import { useDashboardData } from '@app/DashboardHub/DashboardDataContext';
import {
  mergeCanvasWidgetsWithCatalog,
  parseDashboardConfigClipboardText,
  writeDashboardCanvasWidgets
} from '@app/DashboardHub/dashboardCanvasStorage';
import {
  IMPORT_JSON_CONFIG_MENU_LABEL,
  IMPORT_JSON_CONFIG_PASTE_LABEL
} from '@app/useCopyConfigFeedback';

const IMPORT_CONFIG_FORM_ID = 'import-config-string-form';
const IMPORT_NAME_DUPLICATE_ID = 'import-config-name-duplicate-error';
const IMPORT_CONFIG_PARSE_ERROR_ID = 'import-config-parse-error';

/** Replace when the product documentation URL for JSON config import is finalized. */
const CONFIG_STRING_HELP_PLACEHOLDER_URL = 'https://www.redhat.com/';

const IMPORT_CONFIG_EDITOR_PLACEHOLDER =
  '{\n  "dashboardId": "…",\n  "name": "…",\n  "widgets": [ … ]\n}';

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
  const [isConfigEditorFocused, setIsConfigEditorFocused] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setConfigString('');
      setNewDashboardName('');
      setSetAsHomepage(Boolean(initialSetAsHomepage));
      setIsConfigEditorFocused(false);
    } else {
      setConfigString('');
      setNewDashboardName('');
      setSetAsHomepage(false);
      setIsConfigEditorFocused(false);
    }
  }, [isOpen, initialSetAsHomepage]);

  const nameTrimmed = newDashboardName.trim();
  const configTrimmed = configString.trim();

  const parsedConfig = React.useMemo(() => {
    if (!configTrimmed) {
      return { status: 'empty' as const };
    }
    const result = parseDashboardConfigClipboardText(configTrimmed);
    if (!result.ok) {
      return { status: 'error' as const, message: result.message };
    }
    return { status: 'ok' as const, widgets: result.widgets };
  }, [configTrimmed]);

  const nameIsDuplicate = nameTrimmed.length > 0 && isDashboardNameTaken(nameTrimmed);
  const configParseOk = parsedConfig.status === 'ok';
  const isImportFormValid =
    configParseOk && configTrimmed.length > 0 && nameTrimmed.length > 0 && !nameIsDuplicate;

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleCreateImportedDashboard = React.useCallback(() => {
    if (!isImportFormValid || parsedConfig.status !== 'ok') {
      return;
    }
    const newId = addDashboard({ name: nameTrimmed, setAsHomepage });
    if (!newId) {
      return;
    }
    const merged = mergeCanvasWidgetsWithCatalog(parsedConfig.widgets);
    writeDashboardCanvasWidgets(newId, merged);
    onSuccess(newId);
  }, [addDashboard, isImportFormValid, nameTrimmed, onSuccess, parsedConfig, setAsHomepage]);

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
        title={IMPORT_JSON_CONFIG_MENU_LABEL}
        titleIconVariant={CodeIcon}
      />
      <ModalBody>
        <Content className="hcc-import-config-modal-intro">
          <p>
            Copy/paste JSON config from any other Hybrid Cloud Console dashboard (i.e. JSON shared with you
            from another person in your organization) to have that dashboard recreated in your account.{' '}
            <Button
              variant="link"
              isInline
              component="a"
              href={CONFIG_STRING_HELP_PLACEHOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn about using JSON config.
            </Button>
          </p>
        </Content>
        <Form id={IMPORT_CONFIG_FORM_ID} onSubmit={handleFormSubmit}>
          <FormGroup isRequired fieldId="import-config-string" label={IMPORT_JSON_CONFIG_PASTE_LABEL}>
            <TextArea
              isRequired
              id="import-config-string"
              name="import-config-string"
              value={configString}
              onChange={(_event, value) => setConfigString(value)}
              onFocus={() => setIsConfigEditorFocused(true)}
              onBlur={() => setIsConfigEditorFocused(false)}
              rows={10}
              resizeOrientation="vertical"
              aria-label={IMPORT_JSON_CONFIG_PASTE_LABEL}
              className="hcc-import-config-code-editor"
              placeholder={
                isConfigEditorFocused || configString.length > 0
                  ? undefined
                  : IMPORT_CONFIG_EDITOR_PLACEHOLDER
              }
              validated={parsedConfig.status === 'error' ? 'error' : 'default'}
              aria-invalid={parsedConfig.status === 'error'}
              aria-describedby={
                parsedConfig.status === 'error' ? IMPORT_CONFIG_PARSE_ERROR_ID : undefined
              }
            />
            {parsedConfig.status === 'error' && (
              <HelperText isLiveRegion>
                <HelperTextItem id={IMPORT_CONFIG_PARSE_ERROR_ID} variant="error" component="div">
                  {parsedConfig.message}
                </HelperTextItem>
              </HelperText>
            )}
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
