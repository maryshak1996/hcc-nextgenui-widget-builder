import * as React from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertActionCloseButton } from '@patternfly/react-core';
import type { PinDashboardServiceTypeId } from '@app/DashboardHub/pinDashboardServiceTypes';
import { getBundleLabel, getPinnedDashboardPath } from '@app/DashboardHub/pinnedDashboardNavigation';
import {
  type PinnedDashboardEntry,
  type PinnedDashboardsByServiceType,
  PINNED_DASHBOARDS_CHANGED_EVENT,
  getPinnedServiceTypesForDashboard,
  readPinnedDashboardsFromStorage,
  removeDashboardPin,
  syncDashboardPins,
  writePinnedDashboardsToStorage
} from '@app/DashboardHub/pinnedDashboardsStorage';

const PIN_TOAST_AUTO_DISMISS_MS = 10_000;

const PIN_TOAST_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 'var(--pf-t--global--spacer--md)',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 10_000,
  width: 'min(42rem, calc(100vw - 2 * var(--pf-t--global--spacer--lg)))',
  boxShadow: 'var(--pf-t--global--box-shadow--md, 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1))',
  borderRadius: 'var(--pf-t--global--border--radius--default)'
};

export type PinDashboardToastDestination = {
  serviceTypeId: PinDashboardServiceTypeId;
  label: string;
  href: string;
};

export type PinDashboardToast = {
  dashboardName: string;
  destinations: PinDashboardToastDestination[];
};

export interface PinnedDashboardsContextValue {
  pinnedByServiceType: PinnedDashboardsByServiceType;
  getPinnedForServiceType: (serviceTypeId: PinDashboardServiceTypeId) => PinnedDashboardEntry[];
  getPinnedServiceTypesForDashboard: (dashboardId: string) => PinDashboardServiceTypeId[];
  pinDashboard: (
    dashboardId: string,
    dashboardName: string,
    serviceTypeIds: PinDashboardServiceTypeId[]
  ) => void;
  unpinDashboardFromService: (
    dashboardId: string,
    serviceTypeId: PinDashboardServiceTypeId
  ) => void;
}

const PinnedDashboardsContext = React.createContext<PinnedDashboardsContextValue | null>(null);

const PinDashboardToastAlert: React.FC<{
  toast: PinDashboardToast | null;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  const dismissRef = React.useRef(onClose);
  dismissRef.current = onClose;

  React.useEffect(() => {
    if (!toast) {
      return;
    }
    const timeoutId = window.setTimeout(() => dismissRef.current(), PIN_TOAST_AUTO_DISMISS_MS);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  if (!toast) {
    return null;
  }

  const count = toast.destinations.length;
  const serviceTypeLabel = count === 1 ? 'service type' : 'service types';

  return (
    <div className="hcc-pin-dashboard-toast" style={PIN_TOAST_STYLE}>
      <Alert
        variant="success"
        isLiveRegion
        title={
          <>
            <strong>{toast.dashboardName}</strong> has been pinned to {count} {serviceTypeLabel}.
          </>
        }
        actionClose={
          <AlertActionCloseButton onClose={onClose} aria-label="Close pin dashboard notification" />
        }
      >
        <ul className="hcc-pin-dashboard-toast__list">
          {toast.destinations.map((destination) => (
            <li key={destination.serviceTypeId}>
              <Link to={destination.href} className="pf-v6-c-button pf-m-link pf-m-inline" onClick={onClose}>
                {destination.label}
              </Link>
            </li>
          ))}
        </ul>
      </Alert>
    </div>
  );
};

export function PinnedDashboardsProvider({ children }: { children: React.ReactNode }) {
  const [pinnedByServiceType, setPinnedByServiceType] = React.useState<PinnedDashboardsByServiceType>(() =>
    readPinnedDashboardsFromStorage()
  );
  const [pinToast, setPinToast] = React.useState<PinDashboardToast | null>(null);

  React.useEffect(() => {
    const syncFromStorage = () => {
      setPinnedByServiceType(readPinnedDashboardsFromStorage());
    };

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(PINNED_DASHBOARDS_CHANGED_EVENT, syncFromStorage);
    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(PINNED_DASHBOARDS_CHANGED_EVENT, syncFromStorage);
    };
  }, []);

  const getPinnedForServiceType = React.useCallback(
    (serviceTypeId: PinDashboardServiceTypeId) => pinnedByServiceType[serviceTypeId] ?? [],
    [pinnedByServiceType]
  );

  const getPinnedServiceTypesForDashboardId = React.useCallback(
    (dashboardId: string) => getPinnedServiceTypesForDashboard(pinnedByServiceType, dashboardId),
    [pinnedByServiceType]
  );

  const pinDashboard = React.useCallback(
    (dashboardId: string, dashboardName: string, serviceTypeIds: PinDashboardServiceTypeId[]) => {
      setPinnedByServiceType((current) => {
        const next = syncDashboardPins(current, dashboardId, dashboardName, serviceTypeIds);
        writePinnedDashboardsToStorage(next);
        return next;
      });

      if (serviceTypeIds.length === 0) {
        return;
      }

      setPinToast({
        dashboardName,
        destinations: serviceTypeIds.map((serviceTypeId) => ({
          serviceTypeId,
          label: getBundleLabel(serviceTypeId),
          href: getPinnedDashboardPath(serviceTypeId, dashboardId)
        }))
      });
    },
    []
  );

  const unpinDashboardFromService = React.useCallback(
    (dashboardId: string, serviceTypeId: PinDashboardServiceTypeId) => {
      setPinnedByServiceType((current) => {
        const next = removeDashboardPin(current, dashboardId, serviceTypeId);
        writePinnedDashboardsToStorage(next);
        return next;
      });
    },
    []
  );

  const dismissPinToast = React.useCallback(() => {
    setPinToast(null);
  }, []);

  const value = React.useMemo(
    () => ({
      pinnedByServiceType,
      getPinnedForServiceType,
      getPinnedServiceTypesForDashboard: getPinnedServiceTypesForDashboardId,
      pinDashboard,
      unpinDashboardFromService
    }),
    [
      getPinnedForServiceType,
      getPinnedServiceTypesForDashboardId,
      pinDashboard,
      pinnedByServiceType,
      unpinDashboardFromService
    ]
  );

  return (
    <PinnedDashboardsContext.Provider value={value}>
      {children}
      <PinDashboardToastAlert toast={pinToast} onClose={dismissPinToast} />
    </PinnedDashboardsContext.Provider>
  );
}

export function usePinnedDashboards(): PinnedDashboardsContextValue {
  const context = React.useContext(PinnedDashboardsContext);
  if (!context) {
    throw new Error('usePinnedDashboards must be used within PinnedDashboardsProvider');
  }
  return context;
}
