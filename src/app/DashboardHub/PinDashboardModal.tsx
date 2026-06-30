import * as React from 'react';
import {
  Button,
  Checkbox,
  Content,
  Form,
  FormGroup,
  Grid,
  GridItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalVariant
} from '@patternfly/react-core';
import { ThumbtackIcon } from '@app/icons/rhUiIcons';
import { usePinnedDashboards } from '@app/DashboardHub/PinnedDashboardsContext';
import {
  PIN_DASHBOARD_SERVICE_TYPES,
  type PinDashboardServiceTypeId
} from '@app/DashboardHub/pinDashboardServiceTypes';

const PIN_DASHBOARD_FORM_ID = 'pin-dashboard-form';

export const PIN_DASHBOARD_TO_SERVICES_MODAL_TITLE = 'Pin dashboard to services';

export const PIN_DASHBOARD_SERVICE_TYPES_FORM_LABEL =
  'Select which service types you want to pin this dashboard to.';

export const PIN_DASHBOARD_SUBMIT_LABEL = 'Save pins';

function areServiceTypeSelectionsEqual(
  a: Set<PinDashboardServiceTypeId>,
  b: Set<PinDashboardServiceTypeId>
): boolean {
  if (a.size !== b.size) {
    return false;
  }
  return Array.from(a).every((id) => b.has(id));
}

export type PinDashboardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: string;
  dashboardName: string;
};

const PinDashboardModal: React.FunctionComponent<PinDashboardModalProps> = ({
  isOpen,
  onClose,
  dashboardId,
  dashboardName
}) => {
  const { pinDashboard, getPinnedServiceTypesForDashboard } = usePinnedDashboards();
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<Set<PinDashboardServiceTypeId>>(
    () => new Set()
  );
  const [initialServiceIds, setInitialServiceIds] = React.useState<Set<PinDashboardServiceTypeId>>(
    () => new Set()
  );

  React.useEffect(() => {
    if (isOpen && dashboardId) {
      const initial = new Set(getPinnedServiceTypesForDashboard(dashboardId));
      setInitialServiceIds(initial);
      setSelectedServiceIds(new Set(initial));
    } else if (!isOpen) {
      setInitialServiceIds(new Set());
      setSelectedServiceIds(new Set());
    }
  }, [dashboardId, getPinnedServiceTypesForDashboard, isOpen]);

  const hasChanges = !areServiceTypeSelectionsEqual(initialServiceIds, selectedServiceIds);

  const handleClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const handleServiceTypeChange = React.useCallback(
    (serviceId: PinDashboardServiceTypeId, checked: boolean) => {
      setSelectedServiceIds((current) => {
        const next = new Set(current);
        if (checked) {
          next.add(serviceId);
        } else {
          next.delete(serviceId);
        }
        return next;
      });
    },
    []
  );

  const handleSavePins = React.useCallback(() => {
    if (!hasChanges || !dashboardId.trim()) {
      return;
    }
    pinDashboard(dashboardId, dashboardName, Array.from(selectedServiceIds));
    onClose();
  }, [dashboardId, dashboardName, hasChanges, onClose, pinDashboard, selectedServiceIds]);

  const handleFormSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSavePins();
    },
    [handleSavePins]
  );

  return (
    <Modal
      variant={ModalVariant.medium}
      isOpen={isOpen}
      onClose={handleClose}
      aria-labelledby="pin-dashboard-modal-title"
    >
      <ModalHeader
        labelId="pin-dashboard-modal-title"
        title={PIN_DASHBOARD_TO_SERVICES_MODAL_TITLE}
        titleIconVariant={ThumbtackIcon}
      />
      <ModalBody>
        <Content className="hcc-pin-dashboard-modal-intro">
          <p>
            Pin <strong>{dashboardName}</strong> to the left navigation panel of services on the console to
            get access to information when and where you need it.
          </p>
        </Content>
        <Form id={PIN_DASHBOARD_FORM_ID} onSubmit={handleFormSubmit}>
          <FormGroup fieldId="pin-dashboard-service-types" label={PIN_DASHBOARD_SERVICE_TYPES_FORM_LABEL}>
            <Grid hasGutter className="hcc-pin-dashboard-service-types">
              {PIN_DASHBOARD_SERVICE_TYPES.map((service) => (
                <GridItem key={service.id} span={6}>
                  <Checkbox
                    id={`pin-dashboard-service-${service.id}`}
                    label={service.label}
                    isChecked={selectedServiceIds.has(service.id)}
                    onChange={(_event, checked) => handleServiceTypeChange(service.id, checked)}
                  />
                </GridItem>
              ))}
            </Grid>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          type="submit"
          variant="primary"
          form={PIN_DASHBOARD_FORM_ID}
          isDisabled={!hasChanges}
        >
          {PIN_DASHBOARD_SUBMIT_LABEL}
        </Button>
        <Button type="button" variant="link" onClick={handleClose}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export { PinDashboardModal };
