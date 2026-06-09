import * as React from 'react';
import {
  CheckCircleIcon,
  ConnectedIcon,
  DisconnectedIcon,
  HistoryIcon,
  MinusCircleIcon
} from '@app/icons/rhUiIcons';

export type ClusterStatus = 'Connected' | 'Disconnected' | 'Ready' | 'Stale' | 'Expired';

type ClusterStatusTone = 'success' | 'grey' | 'danger';

export const CLUSTER_STATUS_CONFIG: Record<
  ClusterStatus,
  {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    tone: ClusterStatusTone;
  }
> = {
  Connected: {
    icon: ConnectedIcon,
    tone: 'success'
  },
  Disconnected: {
    icon: DisconnectedIcon,
    tone: 'grey'
  },
  Ready: {
    icon: CheckCircleIcon,
    tone: 'success'
  },
  Stale: {
    icon: MinusCircleIcon,
    tone: 'grey'
  },
  Expired: {
    icon: HistoryIcon,
    tone: 'danger'
  }
};

/** Styles injected with dashboard widget grid styles. */
export const CLUSTER_STATUS_DISPLAY_STYLES = `
  .cluster-status-display__icon {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }

  .cluster-status-display__icon svg {
    width: 1rem;
    height: 1rem;
  }

  .cluster-status-display__icon--success,
  .cluster-status-display__icon--success svg {
    color: var(--pf-t--global--icon--color--status--success--default);
    fill: currentColor;
  }

  .cluster-status-display__icon--grey,
  .cluster-status-display__icon--grey svg {
    color: var(--pf-t--global--icon--color--subtle);
    fill: currentColor;
  }

  .cluster-status-display__icon--danger,
  .cluster-status-display__icon--danger svg {
    color: var(--pf-t--global--icon--color--status--danger--default);
    fill: currentColor;
  }
`;
