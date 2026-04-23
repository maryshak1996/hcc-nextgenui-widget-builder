import * as React from 'react';
import {
  Button,
  Content,
  Divider,
  Form,
  FormGroup,
  MenuToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant,
  Select,
  SelectList,
  SelectOption
} from '@patternfly/react-core';
import { ShareAltIcon, UserIcon, UsersIcon } from '@patternfly/react-icons';
import { useDashboardData } from '@app/DashboardHub/DashboardDataContext';
import { ShareRecipientTypeahead } from '@app/DashboardHub/ShareRecipientTypeahead';
import type { ShareDirectoryEntry, ShareDirectoryEntryKind } from '@app/DashboardHub/shareDashboardMockDirectory';
import { SHARE_DIRECTORY, shareDirectoryEntryKey } from '@app/DashboardHub/shareDashboardMockDirectory';
import { MASTHEAD_USER_DISPLAY_NAME } from '@app/mastheadUserDisplayName';

const SHARE_DASHBOARD_FORM_ID = 'share-dashboard-form';

const DASHBOARD_CREATOR_RECIPIENT_KEY = 'user:__dashboard_creator__';

const REMOVE_ACCESS_VALUE = '__remove_access__';

export type SharePermission = 'owner' | 'editor' | 'viewer';

const PERMISSION_LABEL: Record<SharePermission, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer'
};

export interface ShareRecipientRow {
  key: string;
  kind: ShareDirectoryEntryKind;
  displayName: string;
  permission: SharePermission;
  /** The signed-in user who created the dashboard; always owner; cannot be removed. */
  isCreator?: boolean;
}

function buildCreatorRow(): ShareRecipientRow {
  return {
    key: DASHBOARD_CREATOR_RECIPIENT_KEY,
    kind: 'user',
    displayName: MASTHEAD_USER_DISPLAY_NAME,
    permission: 'owner',
    isCreator: true
  };
}

function withCreatorFirst(rows: ShareRecipientRow[]): ShareRecipientRow[] {
  const creator = buildCreatorRow();
  return [creator, ...rows.filter((r) => r.key !== DASHBOARD_CREATOR_RECIPIENT_KEY)];
}

function defaultSeededRecipients(): ShareRecipientRow[] {
  return withCreatorFirst([
    {
      key: shareDirectoryEntryKey({ kind: 'user', id: 'jchen' }),
      kind: 'user',
      displayName: 'jchen',
      permission: 'editor'
    },
    {
      key: shareDirectoryEntryKey({ kind: 'group', id: 'platform-sre' }),
      kind: 'group',
      displayName: 'platform-sre',
      permission: 'viewer'
    }
  ]);
}

export type ShareDashboardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Hub row id for navigation and success toast. */
  dashboardId: string;
  /** Dashboard title shown in the modal header (curly quotes are added around this value). */
  dashboardName: string;
  /** Called after the user saves (stub — wire to API later). */
  onSave?: (recipients: ShareRecipientRow[]) => void;
};

const ShareDashboardModal: React.FunctionComponent<ShareDashboardModalProps> = ({
  isOpen,
  onClose,
  dashboardId,
  dashboardName,
  onSave
}) => {
  const { notifyShareSettingsSaved } = useDashboardData();
  const [recipients, setRecipients] = React.useState<ShareRecipientRow[]>([]);
  const [permissionSelectOpenKey, setPermissionSelectOpenKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setRecipients(defaultSeededRecipients());
    } else {
      setRecipients([]);
      setPermissionSelectOpenKey(null);
    }
  }, [isOpen]);

  const excludedKeys = React.useMemo(() => new Set(recipients.map((r) => r.key)), [recipients]);

  const onAddRecipient = React.useCallback((entry: ShareDirectoryEntry) => {
    const key = shareDirectoryEntryKey(entry);
    setRecipients((prev) => {
      if (prev.some((r) => r.key === key)) {
        return prev;
      }
      return [
        ...prev,
        {
          key,
          kind: entry.kind,
          displayName: entry.displayName,
          permission: 'viewer' as SharePermission
        }
      ];
    });
  }, []);

  const updatePermission = React.useCallback((key: string, permission: SharePermission) => {
    setRecipients((prev) =>
      prev.map((r) => {
        if (r.key !== key) {
          return r;
        }
        if (r.isCreator) {
          return { ...r, permission: 'owner' as SharePermission };
        }
        return { ...r, permission };
      })
    );
  }, []);

  const removeRecipient = React.useCallback((key: string) => {
    if (key === DASHBOARD_CREATOR_RECIPIENT_KEY) {
      return;
    }
    setRecipients((prev) => prev.filter((r) => r.key !== key));
  }, []);

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = React.useCallback(() => {
    notifyShareSettingsSaved(dashboardId, dashboardName);
    onSave?.(recipients);
    onClose();
  }, [dashboardId, dashboardName, notifyShareSettingsSaved, onClose, onSave, recipients]);

  const handleFormSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSave();
    },
    [handleSave]
  );

  const headerTitle = `Share dashboard, ‘${dashboardName}’?`;

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="share-dashboard-modal-title"
    >
      <ModalHeader
        labelId="share-dashboard-modal-title"
        title={headerTitle}
        titleIconVariant={ShareAltIcon}
      />
      <ModalBody>
        <Content className="hcc-share-dashboard-modal-intro">
          <p>
            Dashboards can only be shared with existing users in your organization on the Hybrid Cloud Console. Users
            and groups that you share your dashboard with will receive an email inviting them to view your dashboard.
            Only the dashboard creator can edit the dashboard.
          </p>
        </Content>
        <Form id={SHARE_DASHBOARD_FORM_ID} onSubmit={handleFormSubmit}>
          <FormGroup fieldId="share-recipient-search" label="Add users and groups">
            <ShareRecipientTypeahead
              fieldId="share-recipient-search"
              directory={SHARE_DIRECTORY}
              excludedKeys={excludedKeys}
              onAddRecipient={onAddRecipient}
              aria-label="Search users and groups to share with"
            />
          </FormGroup>
        </Form>
        <Divider className="hcc-share-dashboard-modal-divider" />
        <div className="hcc-share-dashboard-recipient-list" aria-label="People with access">
          {recipients.map((row) => (
            <div className="hcc-share-dashboard-recipient-row" key={row.key}>
              <div className="hcc-share-dashboard-recipient-row__identity">
                <span
                  className="hcc-share-dashboard-recipient-type-icon"
                  title={row.kind === 'user' ? 'User' : 'User group'}
                >
                  {row.kind === 'user' ? (
                    <UserIcon style={{ color: 'var(--pf-t--global--icon--Color--200)' }} aria-hidden />
                  ) : (
                    <UsersIcon style={{ color: 'var(--pf-t--global--icon--Color--200)' }} aria-hidden />
                  )}
                </span>
                <strong>{row.displayName}</strong>
              </div>
              {row.isCreator ? (
                <MenuToggle
                  className="hcc-share-dashboard-creator-permission-toggle"
                  size="sm"
                  isDisabled
                  title="Dashboard creator"
                  aria-label={`Permission for ${row.displayName} (Owner, dashboard creator)`}
                >
                  {PERMISSION_LABEL.owner}
                </MenuToggle>
              ) : (
                <Select
                  className="hcc-share-dashboard-recipient-permission-select"
                  isOpen={permissionSelectOpenKey === row.key}
                  selected={row.permission}
                  onSelect={(_event, value) => {
                    if (value === REMOVE_ACCESS_VALUE) {
                      removeRecipient(row.key);
                    } else if (value === 'owner' || value === 'editor' || value === 'viewer') {
                      updatePermission(row.key, value);
                    }
                    setPermissionSelectOpenKey(null);
                  }}
                  onOpenChange={(open) => {
                    setPermissionSelectOpenKey((prev) => (open ? row.key : prev === row.key ? null : prev));
                  }}
                  toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
                    <MenuToggle
                      ref={toggleRef}
                      size="sm"
                      isExpanded={permissionSelectOpenKey === row.key}
                      onClick={() =>
                        setPermissionSelectOpenKey((prev) => (prev === row.key ? null : row.key))
                      }
                      aria-label={`Permission for ${row.displayName}`}
                    >
                      {PERMISSION_LABEL[row.permission]}
                    </MenuToggle>
                  )}
                  shouldFocusToggleOnSelect
                  popperProps={{ appendTo: () => document.body }}
                >
                  <SelectList>
                    <SelectOption value="owner">Owner</SelectOption>
                    <SelectOption value="editor">Editor</SelectOption>
                    <SelectOption value="viewer">Viewer</SelectOption>
                    <SelectOption
                      className="hcc-share-permission-menu__remove-access"
                      value={REMOVE_ACCESS_VALUE}
                      isDanger
                    >
                      Remove access
                    </SelectOption>
                  </SelectList>
                </Select>
              )}
            </div>
          ))}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button type="submit" variant="primary" form={SHARE_DASHBOARD_FORM_ID}>
          Save settings
        </Button>
        <Button type="button" variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { ShareDashboardModal };
