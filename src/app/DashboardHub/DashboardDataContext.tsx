import * as React from 'react';
import {
  Alert,
  AlertActionCloseButton,
  Button
} from '@patternfly/react-core';
import { useNavigate } from 'react-router-dom';
import type { HubRow } from '@app/DashboardHub/dashboardHubMockData';
import { DASHBOARD_HUB_ROWS } from '@app/DashboardHub/dashboardHubMockData';
import {
  CONSOLE_DEFAULT_DASHBOARD_ID,
  getConsoleDefaultWidgets,
  mergeConsoleDefaultIntoRows
} from '@app/DashboardHub/consoleDefaultDashboard';
import {
  clearDashboardCanvasWidgets,
  mergeCanvasWidgetsWithCatalog,
  readDashboardCanvasWidgets,
  writeDashboardCanvasWidgets
} from '@app/DashboardHub/dashboardCanvasStorage';

const SESSION_ROWS_KEY = 'hcc-dashboard-hub-rows';

function normalizeDashboardNameKey(name: string): string {
  return name.trim().toLowerCase();
}

/** True if another row (or any row when exclude is omitted) already uses this name (compared case-insensitively, trimmed). */
function isDashboardNameInUse(
  allRows: HubRow[],
  candidate: string,
  excludeDashboardId?: string
): boolean {
  const key = normalizeDashboardNameKey(candidate);
  if (!key) {
    return false;
  }
  if (
    key === normalizeDashboardNameKey('Console default') &&
    excludeDashboardId !== CONSOLE_DEFAULT_DASHBOARD_ID
  ) {
    return true;
  }
  return allRows.some(
    (r) => r.id !== excludeDashboardId && normalizeDashboardNameKey(r.name) === key
  );
}

function isHubRow(value: unknown): value is HubRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const row = value as Record<string, unknown>;
  const canvasOk = row.canvasTitle === undefined || typeof row.canvasTitle === 'string';
  const homeOk = row.isHomepage === undefined || typeof row.isHomepage === 'boolean';
  const consoleOk = row.isConsoleDefault === undefined || typeof row.isConsoleDefault === 'boolean';
  return (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.description === 'string' &&
    typeof row.lastModified === 'string' &&
    canvasOk &&
    homeOk &&
    consoleOk
  );
}

/** Legacy rows without `canvasTitle` snapshot to `name` so the in-canvas title starts in sync, then can diverge. */
function withCanvasTitle(row: HubRow): HubRow {
  return { ...row, canvasTitle: row.canvasTitle ?? row.name };
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
    return mergeConsoleDefaultIntoRows(stored.map(withCanvasTitle));
  }
  return mergeConsoleDefaultIntoRows(DASHBOARD_HUB_ROWS.map((r) => withCanvasTitle({ ...r })));
}

function formatLastModifiedDate(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface DashboardDataContextValue {
  rows: HubRow[];
  updateDashboardName: (id: string, name: string) => void;
  /** Hub “Description” column; trimmed text, empty allowed. No-op for the built-in Console default row. */
  updateDashboardDescription: (id: string, description: string) => void;
  updateCanvasTitle: (id: string, canvasTitle: string) => void;
  /** Creates a new blank dashboard row. Returns the new id. */
  addDashboard: (input: { name: string; setAsHomepage: boolean }) => string;
  /** Whether `name` is already used by a dashboard, optionally ignoring one id (e.g. the row being edited). */
  isDashboardNameTaken: (name: string, excludeDashboardId?: string) => boolean;
  /** At most one dashboard is homepage; clears the flag on other rows, then sets it on this id. */
  setDashboardAsHomepage: (id: string) => void;
  /**
   * Removes a dashboard row and stored canvas data.
   * If the removed row was the console homepage, homepage falls back to the built-in Console default dashboard.
   */
  removeDashboard: (id: string) => void;
  /**
   * Clones a row and copies widget layout into session storage.
   * With `options.name`, uses that name (must be unique); otherwise picks a unique `Copy of …` name.
   * With `options.setAsHomepage`, clears homepage on other rows and sets it on the clone (only when a new row is created).
   * Returns the new id, or an empty string if the source is missing or the chosen name is taken.
   */
  duplicateDashboard: (
    id: string,
    options?: { name?: string; setAsHomepage?: boolean }
  ) => string;
  /** Show the “sharing settings updated” success toast (after Save settings in the share modal). */
  notifyShareSettingsSaved: (dashboardId: string, dashboardName: string) => void;
}

const DashboardDataContext = React.createContext<DashboardDataContextValue | null>(null);

const TOAST_FIXED_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 'var(--pf-t--global--spacer--md)',
  right: 'var(--pf-t--global--spacer--md)',
  zIndex: 10_000,
  maxWidth: 'min(32rem, calc(100% - 2 * var(--pf-t--global--spacer--md)))',
  boxShadow: 'var(--pf-t--global--box-shadow--md, 0 0.5rem 1.5rem rgba(0, 0, 0, 0.1))',
  borderRadius: 'var(--pf-t--global--border--radius--default)'
};

const HomepageSetToast: React.FC<{
  toast: { name: string } | null;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  const navigate = useNavigate();
  const dismissRef = React.useRef(onClose);
  dismissRef.current = onClose;

  React.useEffect(() => {
    if (!toast) {
      return;
    }
    const t = window.setTimeout(() => dismissRef.current(), 8_000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) {
    return null;
  }

  return (
    <div className="hcc-homepage-set-toast" style={TOAST_FIXED_STYLE}>
      <Alert
        variant="success"
        isLiveRegion
        isInline
        actionClose={
          <AlertActionCloseButton
            onClick={onClose}
            aria-label="Close homepage set notification"
          />
        }
        title={
          <span>
            <strong>{`'${toast.name}'`}</strong> set as homepage.{' '}
            <Button
              variant="link"
              isInline
              onClick={() => {
                onClose();
                navigate('/');
              }}
            >
              View homepage
            </Button>
          </span>
        }
      />
    </div>
  );
};

const ShareSettingsToast: React.FC<{
  toast: { dashboardId: string; name: string } | null;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  const navigate = useNavigate();
  const dismissRef = React.useRef(onClose);
  dismissRef.current = onClose;

  React.useEffect(() => {
    if (!toast) {
      return;
    }
    const t = window.setTimeout(() => dismissRef.current(), 8_000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) {
    return null;
  }

  const dashboardPath = `/dashboard-hub/${toast.dashboardId}`;

  return (
    <div className="hcc-share-settings-toast" style={{ ...TOAST_FIXED_STYLE, zIndex: 10_001 }}>
      <Alert
        variant="success"
        isLiveRegion
        isInline
        actionClose={
          <AlertActionCloseButton
            onClick={onClose}
            aria-label="Close sharing settings notification"
          />
        }
        title={
          <span>
            <strong>&#x2018;{toast.name}&#x2019;</strong> sharing settings have been updated.
          </span>
        }
      >
        <p style={{ margin: 'var(--pf-t--global--spacer--xs) 0 var(--pf-t--global--spacer--sm)' }}>
          Users and groups who have gained additional access have been alerted.
        </p>
        <div>
          <Button
            variant="link"
            isInline
            onClick={() => {
              onClose();
              navigate(dashboardPath);
            }}
          >
            View dashboard
          </Button>
          <span aria-hidden style={{ marginInline: 'var(--pf-t--global--spacer--sm)' }}>
            ·
          </span>
          <Button
            variant="link"
            isInline
            onClick={() => {
              onClose();
              navigate(dashboardPath, { state: { openShare: true } });
            }}
          >
            Modify permissions
          </Button>
        </div>
      </Alert>
    </div>
  );
};

const DashboardDataProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const [rows, setRows] = React.useState<HubRow[]>(initialRows);
  const [homepageSetToast, setHomepageSetToast] = React.useState<{ name: string } | null>(null);
  const [shareSettingsToast, setShareSettingsToast] = React.useState<{
    dashboardId: string;
    name: string;
  } | null>(null);

  const dismissHomepageSetToast = React.useCallback(() => {
    setHomepageSetToast(null);
  }, []);

  const dismissShareSettingsToast = React.useCallback(() => {
    setShareSettingsToast(null);
  }, []);

  const notifyShareSettingsSaved = React.useCallback((dashboardId: string, dashboardName: string) => {
    setShareSettingsToast({ dashboardId, name: dashboardName });
  }, []);

  React.useEffect(() => {
    try {
      window.sessionStorage.setItem(SESSION_ROWS_KEY, JSON.stringify(rows));
    } catch {
      // ignore quota / private mode
    }
  }, [rows]);

  const updateDashboardName = React.useCallback((id: string, name: string) => {
    if (id === CONSOLE_DEFAULT_DASHBOARD_ID) {
      return;
    }
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    setRows((prev) => {
      if (isDashboardNameInUse(prev, trimmed, id)) {
        return prev;
      }
      return prev.map((row) => (row.id === id ? { ...row, name: trimmed } : row));
    });
  }, []);

  const updateDashboardDescription = React.useCallback((id: string, description: string) => {
    if (id === CONSOLE_DEFAULT_DASHBOARD_ID) {
      return;
    }
    const trimmed = description.trim();
    const lastModified = formatLastModifiedDate();
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, description: trimmed, lastModified } : row))
    );
  }, []);

  const updateCanvasTitle = React.useCallback((id: string, canvasTitle: string) => {
    if (id === CONSOLE_DEFAULT_DASHBOARD_ID) {
      return;
    }
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, canvasTitle } : row)));
  }, []);

  const addDashboard = React.useCallback((input: { name: string; setAsHomepage: boolean }) => {
    const name = input.name.trim();
    if (!name) {
      return '';
    }
    let newId = '';
    const lastModified = formatLastModifiedDate();
    setRows((prev) => {
      if (isDashboardNameInUse(prev, name)) {
        return prev;
      }
      newId = `d-${Date.now()}`;
      const cleared =
        input.setAsHomepage === true
          ? prev.map((r) => {
              const { isHomepage: _omit, ...rest } = r;
              return rest;
            })
          : prev;
      const newRow: HubRow = {
        id: newId,
        name,
        canvasTitle: name,
        description: '',
        lastModified,
        isHomepage: input.setAsHomepage ? true : undefined
      };
      return [...cleared, newRow];
    });
    if (newId && input.setAsHomepage) {
      window.queueMicrotask(() => {
        setHomepageSetToast({ name });
      });
    }
    return newId;
  }, []);

  const isDashboardNameTaken = React.useCallback(
    (name: string, excludeDashboardId?: string) => isDashboardNameInUse(rows, name, excludeDashboardId),
    [rows]
  );

  const setDashboardAsHomepage = React.useCallback((id: string) => {
    setRows((prev) => {
      const target = prev.find((r) => r.id === id);
      if (!target) {
        return prev;
      }
      const displayName = target.canvasTitle ?? target.name;
      window.queueMicrotask(() => {
        setHomepageSetToast({ name: displayName });
      });
      return prev.map((r) => {
        if (r.id === id) {
          return { ...r, isHomepage: true };
        }
        if (r.isHomepage) {
          const { isHomepage: _omit, ...rest } = r;
          return rest as HubRow;
        }
        return r;
      });
    });
  }, []);

  const removeDashboard = React.useCallback((id: string) => {
    if (id === CONSOLE_DEFAULT_DASHBOARD_ID) {
      return;
    }
    let showHomepageFallbackToast = false;
    let fallbackHomepageDisplayName = 'Console default';
    setRows((prev) => {
      const target = prev.find((r) => r.id === id);
      if (!target) {
        return prev;
      }
      const wasHomepage = target.isHomepage === true;
      const filtered = prev.filter((r) => r.id !== id);
      if (!wasHomepage) {
        return filtered;
      }
      const consoleRow = prev.find((r) => r.id === CONSOLE_DEFAULT_DASHBOARD_ID);
      if (consoleRow) {
        fallbackHomepageDisplayName = consoleRow.canvasTitle ?? consoleRow.name;
      }
      showHomepageFallbackToast = true;
      return filtered.map((r) => {
        if (r.id === CONSOLE_DEFAULT_DASHBOARD_ID) {
          return { ...r, isHomepage: true };
        }
        if (r.isHomepage) {
          const { isHomepage: _omit, ...rest } = r;
          return rest as HubRow;
        }
        return r;
      });
    });
    if (showHomepageFallbackToast) {
      window.queueMicrotask(() => {
        setHomepageSetToast({ name: fallbackHomepageDisplayName });
      });
    }
    clearDashboardCanvasWidgets(id);
  }, []);

  const duplicateDashboard = React.useCallback(
    (id: string, options?: { name?: string; setAsHomepage?: boolean }) => {
      let createdId = '';
      const trimmedCustomName = options?.name?.trim() ?? '';
      const useCustomName = trimmedCustomName.length > 0;

      setRows((prev) => {
        const source = prev.find((r) => r.id === id);
        if (!source) {
          return prev;
        }
        if (useCustomName) {
          if (isDashboardNameInUse(prev, trimmedCustomName)) {
            return prev;
          }
          createdId = `d-${Date.now()}`;
          const cleared =
            options?.setAsHomepage === true
              ? prev.map((r) => {
                  const { isHomepage: _omit, ...rest } = r;
                  return rest;
                })
              : prev;
          const newRow: HubRow = {
            id: createdId,
            name: trimmedCustomName,
            canvasTitle: trimmedCustomName,
            description: source.description,
            lastModified: formatLastModifiedDate(),
            isHomepage: options?.setAsHomepage ? true : undefined
          };
          return [...cleared, newRow];
        }

        let candidate = `Copy of ${source.name}`;
        let suffix = 2;
        while (isDashboardNameInUse(prev, candidate)) {
          candidate = `Copy of ${source.name} (${suffix})`;
          suffix += 1;
        }
        createdId = `d-${Date.now()}`;
        const newRow: HubRow = {
          id: createdId,
          name: candidate,
          canvasTitle: source.canvasTitle ?? source.name,
          description: source.description,
          lastModified: formatLastModifiedDate()
        };
        return [...prev, newRow];
      });

      if (!createdId) {
        return '';
      }
      if (useCustomName && options?.setAsHomepage) {
        window.queueMicrotask(() => {
          setHomepageSetToast({ name: trimmedCustomName });
        });
      }
      const raw =
        id === CONSOLE_DEFAULT_DASHBOARD_ID
          ? getConsoleDefaultWidgets()
          : readDashboardCanvasWidgets(id);
      if (raw && raw.length) {
        writeDashboardCanvasWidgets(createdId, mergeCanvasWidgetsWithCatalog(raw));
      }
      return createdId;
    },
    []
  );

  const value = React.useMemo(
    () => ({
      rows,
      updateDashboardName,
      updateDashboardDescription,
      updateCanvasTitle,
      addDashboard,
      isDashboardNameTaken,
      setDashboardAsHomepage,
      removeDashboard,
      duplicateDashboard,
      notifyShareSettingsSaved
    }),
    [
      rows,
      updateDashboardName,
      updateDashboardDescription,
      updateCanvasTitle,
      addDashboard,
      isDashboardNameTaken,
      setDashboardAsHomepage,
      removeDashboard,
      duplicateDashboard,
      notifyShareSettingsSaved
    ]
  );

  return (
    <DashboardDataContext.Provider value={value}>
      {children}
      <HomepageSetToast toast={homepageSetToast} onClose={dismissHomepageSetToast} />
      <ShareSettingsToast toast={shareSettingsToast} onClose={dismissShareSettingsToast} />
    </DashboardDataContext.Provider>
  );
};

function useDashboardData(): DashboardDataContextValue {
  const ctx = React.useContext(DashboardDataContext);
  if (!ctx) {
    throw new Error('useDashboardData must be used within DashboardDataProvider');
  }
  return ctx;
}

export { DashboardDataProvider, useDashboardData };
