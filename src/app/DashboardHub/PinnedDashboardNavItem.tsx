import * as React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button, NavItem, Tooltip } from '@patternfly/react-core';
import { ThumbtackIcon } from '@app/icons/rhUiIcons';
import { usePinnedDashboards } from '@app/DashboardHub/PinnedDashboardsContext';
import type { PinDashboardServiceTypeId } from '@app/DashboardHub/pinDashboardServiceTypes';
import {
  getPinnedDashboardLandingPath,
  getPinnedDashboardPath,
  isPinnedDashboardNavActive
} from '@app/DashboardHub/pinnedDashboardNavigation';
import type { PinnedDashboardEntry } from '@app/DashboardHub/pinnedDashboardsStorage';

const PENDING_UNPIN_MS = 4000;

export type PinnedDashboardNavItemProps = {
  entry: PinnedDashboardEntry;
  serviceTypeId: PinDashboardServiceTypeId;
};

export const PinnedDashboardNavItem: React.FunctionComponent<PinnedDashboardNavItemProps> = ({
  entry,
  serviceTypeId
}) => {
  const { unpinDashboardFromService } = usePinnedDashboards();
  const navigate = useNavigate();
  const location = useLocation();
  const [isPendingUnpin, setIsPendingUnpin] = React.useState(false);
  const unpinTimerRef = React.useRef<number | null>(null);

  const clearUnpinTimer = React.useCallback(() => {
    if (unpinTimerRef.current != null) {
      window.clearTimeout(unpinTimerRef.current);
      unpinTimerRef.current = null;
    }
  }, []);

  React.useEffect(() => () => clearUnpinTimer(), [clearUnpinTimer]);

  const path = getPinnedDashboardPath(serviceTypeId, entry.dashboardId);
  const isActive = isPinnedDashboardNavActive(
    location.pathname,
    location.search,
    serviceTypeId,
    entry.dashboardId
  );

  const handlePinClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (isPendingUnpin) {
      clearUnpinTimer();
      setIsPendingUnpin(false);
      return;
    }

    setIsPendingUnpin(true);
    unpinTimerRef.current = window.setTimeout(() => {
      unpinDashboardFromService(entry.dashboardId, serviceTypeId);
      setIsPendingUnpin(false);

      if (
        isPinnedDashboardNavActive(
          location.pathname,
          location.search,
          serviceTypeId,
          entry.dashboardId
        )
      ) {
        navigate(getPinnedDashboardLandingPath(serviceTypeId));
      }
    }, PENDING_UNPIN_MS);
  };

  const pinTooltip = isPendingUnpin ? 'Pin dashboard' : 'Unpin dashboard';
  const pinAriaLabel = isPendingUnpin ? 'Pin dashboard' : 'Unpin dashboard';

  return (
    <NavItem
      key={`${serviceTypeId}-${entry.dashboardId}`}
      id={`pinned-${serviceTypeId}-${entry.dashboardId}`}
      isActive={isActive}
    >
      <NavLink to={path} className="hcc-pinned-dashboard-nav-link">
        <span className="hcc-pinned-dashboard-nav-link__label">{entry.dashboardName}</span>
        <Tooltip content={pinTooltip}>
          <span
            className="hcc-pinned-dashboard-nav-pin-wrap"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
          >
            <Button
              variant="plain"
              className={`hcc-pinned-dashboard-nav-pin${
                isPendingUnpin ? ' hcc-pinned-dashboard-nav-pin--unpinned' : ''
              }`}
              aria-label={pinAriaLabel}
              onClick={handlePinClick}
              icon={<ThumbtackIcon aria-hidden />}
            />
          </span>
        </Tooltip>
      </NavLink>
    </NavItem>
  );
};
