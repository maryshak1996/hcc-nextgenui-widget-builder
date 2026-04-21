import * as React from 'react';
import type { HubRow } from '@app/DashboardHub/dashboardHubMockData';
import { DASHBOARD_HUB_ROWS } from '@app/DashboardHub/dashboardHubMockData';

const SESSION_ROWS_KEY = 'hcc-dashboard-hub-rows';

function isHubRow(value: unknown): value is HubRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.description === 'string' &&
    typeof row.lastModified === 'string'
  );
}

function readRowsFromSessionStorage(): HubRow[] | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_ROWS_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return null;
    }
    const rows = parsed.filter(isHubRow);
    return rows.length === parsed.length ? rows : null;
  } catch {
    return null;
  }
}

function initialRows(): HubRow[] {
  const stored = readRowsFromSessionStorage();
  if (stored) {
    return stored;
  }
  return DASHBOARD_HUB_ROWS.map((r) => ({ ...r }));
}

export interface DashboardDataContextValue {
  rows: HubRow[];
  updateDashboardName: (id: string, name: string) => void;
}

const DashboardDataContext = React.createContext<DashboardDataContextValue | null>(null);

const DashboardDataProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const [rows, setRows] = React.useState<HubRow[]>(initialRows);

  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_ROWS_KEY, JSON.stringify(rows));
    } catch {
      // ignore quota / private mode
    }
  }, [rows]);

  const updateDashboardName = React.useCallback((id: string, name: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, name } : row)));
  }, []);

  const value = React.useMemo(
    () => ({
      rows,
      updateDashboardName
    }),
    [rows, updateDashboardName]
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
};

function useDashboardData(): DashboardDataContextValue {
  const ctx = React.useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error('useDashboardData must be used within DashboardDataProvider');
  }
  return ctx;
}

export { DashboardDataProvider, useDashboardData };
