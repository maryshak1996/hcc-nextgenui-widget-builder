import * as React from 'react';
import {
  DEFAULT_SUPPORT_CASE_DRAFT,
  type ISupportCaseDraft,
  mergeDraft,
} from '@app/Support/supportCaseDraftConstants';

interface ISupportCaseDraftContextValue {
  draft: ISupportCaseDraft;
  setDraft: React.Dispatch<React.SetStateAction<ISupportCaseDraft>>;
  updateDraft: (patch: Partial<ISupportCaseDraft>) => void;
}

const SupportCaseDraftContext = React.createContext<ISupportCaseDraftContextValue | undefined>(undefined);

interface ISupportCaseDraftProviderProps {
  children: React.ReactNode;
  /** Merged on mount — typically from CVE session payload parsed in SupportNewCase */
  initialDraft?: ISupportCaseDraft | null;
}

const SupportCaseDraftProvider: React.FunctionComponent<ISupportCaseDraftProviderProps> = ({
  children,
  initialDraft,
}) => {
  const [draft, setDraft] = React.useState<ISupportCaseDraft>(() => mergeDraft(initialDraft ?? undefined));

  const updateDraft = React.useCallback((patch: Partial<ISupportCaseDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = React.useMemo(
    () => ({ draft, setDraft, updateDraft }),
    [draft, updateDraft]
  );

  return <SupportCaseDraftContext.Provider value={value}>{children}</SupportCaseDraftContext.Provider>;
};

function useSupportCaseDraft(): ISupportCaseDraftContextValue {
  const ctx = React.useContext(SupportCaseDraftContext);
  if (!ctx) {
    throw new Error('useSupportCaseDraft must be used within SupportCaseDraftProvider');
  }
  return ctx;
}

export { SupportCaseDraftProvider, useSupportCaseDraft };
