import * as React from 'react';
import type { Widget } from '@app/Homepage/widgetTypes';

export type DashboardBankBridgeState = {
  /** Widget IDs currently on the edited dashboard canvas */
  canvasWidgetIds: ReadonlySet<string>;
  addWidgetToDashboard: (widget: Widget) => void;
  /** False when viewing the built-in Console default dashboard (widgets aren’t editable the same way) */
  canAddWidgets: boolean;
};

let current: DashboardBankBridgeState | null = null;
const listeners = new Set<(state: DashboardBankBridgeState | null) => void>();

export function getDashboardBankBridgeState(): DashboardBankBridgeState | null {
  return current;
}

export function setDashboardBankBridgeState(next: DashboardBankBridgeState | null) {
  current = next;
  listeners.forEach((l) => l(next));
}

export function subscribeDashboardBankBridge(listener: (state: DashboardBankBridgeState | null) => void) {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}

export function useDashboardBankBridge(): DashboardBankBridgeState | null {
  const [state, setState] = React.useState<DashboardBankBridgeState | null>(() => getDashboardBankBridgeState());
  React.useEffect(() => subscribeDashboardBankBridge(setState), []);
  return state;
}
