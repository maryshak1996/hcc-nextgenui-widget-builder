import * as React from 'react';
import {
  Button,
  Checkbox,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  TextInput
} from '@patternfly/react-core';
import { OutlinedCloneIcon } from '@patternfly/react-icons';
import type { HubRow } from '@app/DashboardHub/dashboardHubMockData';
import { DASHBOARD_DUPLICATE_NAME_ERROR } from '@app/DashboardHub/dashboardHubMockData';
import { useDashboardData } from '@app/DashboardHub/DashboardDataContext';
import { DuplicateDashboardSourceTypeahead } from '@app/DashboardHub/DuplicateDashboardSourceTypeahead';

const DUPLICATE_DASHBOARD_FORM_ID = 'duplicate-dashboard-form';
const DUPLICATE_NAME_DUPLICATE_ID = 'duplicate-name-duplicate-error';

export type DuplicateDashboardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** All dashboards shown in the typeahead (typically every hub row). */
  rows: HubRow[];
  /** When the modal opens, this dashboard id is pre-selected in the typeahead. */
  initialSourceId?: string;
  /** Initial state of “Set as homepage” when the modal opens. */
  initialSetAsHomepage?: boolean;
  onSuccess: (newDashboardId: string) => void;
};

const DuplicateDashboardModal: React.FunctionComponent<DuplicateDashboardModalProps> = ({
  isOpen,
  onClose,
  rows,
  initialSourceId = '',
  initialSetAsHomepage = false,
  onSuccess
}) => {
  const { duplicateDashboard, isDashboardNameTaken } = useDashboardData();

  const sortedRows = React.useMemo(
    () => [...rows].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
    [rows]
  );

  const [duplicateSourceId, setDuplicateSourceId] = React.useState('');
  const [duplicateNewName, setDuplicateNewName] = React.useState('');
  const [duplicateSetAsHomepage, setDuplicateSetAsHomepage] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setDuplicateSourceId(initialSourceId ?? '');
      setDuplicateNewName('');
      setDuplicateSetAsHomepage(Boolean(initialSetAsHomepage));
    } else {
      setDuplicateSourceId('');
      setDuplicateNewName('');
      setDuplicateSetAsHomepage(false);
    }
  }, [isOpen, initialSourceId, initialSetAsHomepage]);

  const duplicateNameTrimmed = duplicateNewName.trim();
  const duplicateNameIsDuplicate =
    duplicateNameTrimmed.length > 0 && isDashboardNameTaken(duplicateNameTrimmed);
  const isDuplicateFormValid =
    duplicateSourceId.length > 0 && duplicateNameTrimmed.length > 0 && !duplicateNameIsDuplicate;

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDuplicateDashboard = React.useCallback(() => {
    if (!isDuplicateFormValid) {
      return;
    }
    const newId = duplicateDashboard(duplicateSourceId, {
      name: duplicateNameTrimmed,
      setAsHomepage: duplicateSetAsHomepage
    });
    if (!newId) {
      return;
    }
    onSuccess(newId);
  }, [
    duplicateDashboard,
    duplicateNameTrimmed,
    duplicateSetAsHomepage,
    duplicateSourceId,
    isDuplicateFormValid,
    onSuccess
  ]);

  const handleDuplicateFormSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleDuplicateDashboard();
    },
    [handleDuplicateDashboard]
  );

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="duplicate-dashboard-modal-title"
    >
      <ModalHeader
        labelId="duplicate-dashboard-modal-title"
        title="Duplicate existing dashboard"
        titleIconVariant={OutlinedCloneIcon}
      />
      <ModalBody>
        <Form id={DUPLICATE_DASHBOARD_FORM_ID} onSubmit={handleDuplicateFormSubmit}>
          <FormGroup
            isRequired
            fieldId="duplicate-source-dashboard"
            label="Select existing dashboard for duplication"
          >
            <DuplicateDashboardSourceTypeahead
              fieldId="duplicate-source-dashboard"
              rows={sortedRows}
              selectedId={duplicateSourceId}
              onSelectedIdChange={setDuplicateSourceId}
              aria-label="Select existing dashboard for duplication"
            />
          </FormGroup>
          <FormGroup isRequired fieldId="duplicate-new-dashboard-name" label="New dashboard name">
            <TextInput
              isRequired
              type="text"
              id="duplicate-new-dashboard-name"
              name="duplicate-new-dashboard-name"
              value={duplicateNewName}
              onChange={(_event, value) => setDuplicateNewName(value)}
              placeholder="Ie. prod-release monitoring"
              validated={duplicateNameIsDuplicate ? 'error' : 'default'}
              aria-describedby={duplicateNameIsDuplicate ? DUPLICATE_NAME_DUPLICATE_ID : undefined}
            />
            {duplicateNameIsDuplicate && (
              <HelperText isLiveRegion>
                <HelperTextItem id={DUPLICATE_NAME_DUPLICATE_ID} variant="error" component="div">
                  {DASHBOARD_DUPLICATE_NAME_ERROR}
                </HelperTextItem>
              </HelperText>
            )}
          </FormGroup>
          <FormGroup fieldId="duplicate-set-homepage" hasNoPaddingTop>
            <Checkbox
              id="duplicate-set-homepage"
              isChecked={duplicateSetAsHomepage}
              onChange={(_event, checked) => setDuplicateSetAsHomepage(checked)}
              label="Set as homepage"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          type="submit"
          variant="primary"
          form={DUPLICATE_DASHBOARD_FORM_ID}
          isDisabled={!isDuplicateFormValid}
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

export { DuplicateDashboardModal };
