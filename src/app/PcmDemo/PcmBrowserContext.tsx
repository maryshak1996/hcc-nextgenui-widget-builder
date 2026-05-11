import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHccFakeBrowserTabTitle } from '@app/routes';
import {
  HCC_COPYFAIL_CVE_PATH,
  PCM_SESSION_IDE_CHAT_HANDOFF,
  PCM_SESSION_OPEN_HELP_CHAT,
} from '@app/RhelVulnerability/copyFailDemoFleet';

export interface IPcmBrowserTab {
  id: string;
  title: string;
  path: string;
  omniboxUrl: string;
}

export const PCM_ARTICLE_TAB: IPcmBrowserTab = {
  id: 'techpulse-copyfail',
  title: 'TechPulse — “Copy fail” advisory',
  path: '/pcm/article',
  omniboxUrl: 'https://news.techpulse.demo/security/copy-fail-linux',
};

const HCC_CONSOLE_TAB_ID = 'hcc-console';

function buildFakeBrowserTabs(pathname: string, search: string): IPcmBrowserTab[] {
  if (pathname.startsWith('/pcm')) {
    return [PCM_ARTICLE_TAB];
  }
  return [
    PCM_ARTICLE_TAB,
    {
      id: HCC_CONSOLE_TAB_ID,
      title: getHccFakeBrowserTabTitle(pathname),
      path: pathname,
      omniboxUrl: `https://console.redhat.com${pathname}${search}`,
    },
  ];
}

interface IPcmBrowserContextValue {
  tabs: IPcmBrowserTab[];
  activeOmniboxUrl: string;
  /** Adds the HCC CVE tab (if needed) and navigates in-app so it sits beside the TechPulse tab in the fake browser. */
  openTroubleshootInHcc: (options?: { ideUserPrompt?: string }) => void;
  selectTab: (path: string) => void;
  closeTab: (tabId: string) => void;
}

const PcmBrowserContext = React.createContext<IPcmBrowserContextValue | null>(null);

const PcmBrowserProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = React.useMemo(
    () => buildFakeBrowserTabs(location.pathname, location.search),
    [location.pathname, location.search]
  );

  const activeOmniboxUrl = React.useMemo(() => {
    if (location.pathname.startsWith('/pcm')) {
      return PCM_ARTICLE_TAB.omniboxUrl;
    }
    return `https://console.redhat.com${location.pathname}${location.search}`;
  }, [location.pathname, location.search]);

  const openTroubleshootInHcc = React.useCallback((options?: { ideUserPrompt?: string }) => {
    try {
      sessionStorage.setItem(PCM_SESSION_OPEN_HELP_CHAT, '1');
      const trimmed = options?.ideUserPrompt?.trim();
      if (trimmed) {
        sessionStorage.setItem(PCM_SESSION_IDE_CHAT_HANDOFF, JSON.stringify({ userPrompt: trimmed }));
      } else {
        sessionStorage.removeItem(PCM_SESSION_IDE_CHAT_HANDOFF);
      }
    } catch {
      /* ignore quota / private mode */
    }
    navigate(HCC_COPYFAIL_CVE_PATH);
  }, [navigate]);

  const selectTab = React.useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate]
  );

  const closeTab = React.useCallback(
    (tabId: string) => {
      if (tabId === PCM_ARTICLE_TAB.id) {
        return;
      }
      if (tabId === HCC_CONSOLE_TAB_ID) {
        navigate(PCM_ARTICLE_TAB.path);
      }
    },
    [navigate]
  );

  const value = React.useMemo(
    () => ({
      tabs,
      activeOmniboxUrl,
      openTroubleshootInHcc,
      selectTab,
      closeTab,
    }),
    [tabs, activeOmniboxUrl, openTroubleshootInHcc, selectTab, closeTab]
  );

  return <PcmBrowserContext.Provider value={value}>{children}</PcmBrowserContext.Provider>;
};

function usePcmBrowser(): IPcmBrowserContextValue {
  const ctx = React.useContext(PcmBrowserContext);
  if (!ctx) {
    throw new Error('usePcmBrowser must be used within PcmBrowserProvider');
  }
  return ctx;
}

export { PcmBrowserProvider, usePcmBrowser };
