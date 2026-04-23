import * as React from 'react';
import {
  Button,
  Content,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import modalBoxStyles from '@patternfly/react-styles/css/components/ModalBox/modal-box';
import { OutlinedTrashAltIcon } from '@patternfly/react-icons';

const DELETE_DASHBOARD_MODAL_TITLE_ID = 'delete-dashboard-modal-title';

export type DeleteDashboardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Dashboard display name shown in the confirmation copy (quoted in the sentence). */
  dashboardName: string;
  onConfirm: () => void;
};

/**
 * Destructive confirmation dialog. Title row uses ModalBox warning framing (`pf-m-warning` + icon)
 * with the trash glyph tinted danger red to match destructive affordances.
 */
const DeleteDashboardModal: React.FunctionComponent<DeleteDashboardModalProps> = ({
  isOpen,
  onClose,
  dashboardName,
  onConfirm
}) => {
  const handleConfirm = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  return (
    <Modal
      variant={ModalVariant.small}
      isOpen={isOpen}
      onClose={onClose}
      aria-labelledby={DELETE_DASHBOARD_MODAL_TITLE_ID}
    >
      <ModalHeader>
        <h1
          id={DELETE_DASHBOARD_MODAL_TITLE_ID}
          className={css(
            modalBoxStyles.modalBoxTitle,
            modalBoxStyles.modifiers.icon,
            modalBoxStyles.modifiers.warning
          )}
        >
          <span className={css(modalBoxStyles.modalBoxTitleIcon)} aria-hidden>
            <OutlinedTrashAltIcon
              style={{ color: 'var(--pf-t--global--danger-color--200)' }}
            />
          </span>
          <span className={css(modalBoxStyles.modalBoxTitleText)}>Delete dashboard?</span>
        </h1>
      </ModalHeader>
      <ModalBody>
        <Content>
          <p style={{ margin: 0 }}>
            {`Are you sure you want to delete your dashboard, "`}
            <span style={{ fontWeight: 600 }}>{dashboardName}</span>
            {`"? This action cannot be undone.`}
          </p>
        </Content>
      </ModalBody>
      <ModalFooter>
        <Button type="button" variant="danger" onClick={handleConfirm}>
          Delete dashboard
        </Button>
        <Button type="button" variant="link" onClick={onClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { DeleteDashboardModal };
