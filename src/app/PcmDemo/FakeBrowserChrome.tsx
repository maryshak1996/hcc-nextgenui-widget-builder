import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { AngleLeftIcon, AngleRightIcon, GlobeIcon, SyncAltIcon } from '@patternfly/react-icons';
import { PCM_ARTICLE_TAB, usePcmBrowser } from '@app/PcmDemo/PcmBrowserContext';

export interface IFakeBrowserChromeProps {
  children: React.ReactNode;
}

/**
 * Decorative browser frame (tabs + toolbar) around PCM demo content — not a real browser.
 */
const FakeBrowserChrome: React.FunctionComponent<IFakeBrowserChromeProps> = ({ children }) => {
  const location = useLocation();
  const { tabs, activeOmniboxUrl, selectTab, closeTab } = usePcmBrowser();

  return (
    <div className="hcc-fake-browser">
      <div className="hcc-fake-browser__chrome">
        <div className="hcc-fake-browser__titlebar" aria-hidden="true">
          <span className="hcc-fake-browser__traffic hcc-fake-browser__traffic--close" />
          <span className="hcc-fake-browser__traffic hcc-fake-browser__traffic--min" />
          <span className="hcc-fake-browser__traffic hcc-fake-browser__traffic--max" />
        </div>
        <div className="hcc-fake-browser__tabs" role="tablist" aria-label="Demo browser tabs">
          {tabs.map((tab) => {
            const isArticleTab = tab.id === PCM_ARTICLE_TAB.id;
            const isActive = isArticleTab
              ? location.pathname.startsWith('/pcm')
              : tab.path === location.pathname;
            const canClose = tab.id !== PCM_ARTICLE_TAB.id;
            return (
              <div
                key={tab.id}
                className={[
                  'hcc-fake-browser__tab-slot',
                  isActive ? 'hcc-fake-browser__tab-slot--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className="hcc-fake-browser__tab-btn"
                  title={tab.title}
                  onClick={() => selectTab(tab.path)}
                >
                  <span className="hcc-fake-browser__tab-favicon" aria-hidden="true">
                    <GlobeIcon />
                  </span>
                  <span className="hcc-fake-browser__tab-title">{tab.title}</span>
                </button>
                {canClose ? (
                  <button
                    type="button"
                    className="hcc-fake-browser__tab-close-btn"
                    aria-label={`Close ${tab.title}`}
                    onClick={() => closeTab(tab.id)}
                  >
                    ×
                  </button>
                ) : (
                  <span className="hcc-fake-browser__tab-close-spacer" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>
        <div className="hcc-fake-browser__toolbar">
          <div className="hcc-fake-browser__nav-cluster">
            <button type="button" className="hcc-fake-browser__tool-btn" disabled aria-hidden="true" tabIndex={-1}>
              <AngleLeftIcon />
            </button>
            <button type="button" className="hcc-fake-browser__tool-btn" disabled aria-hidden="true" tabIndex={-1}>
              <AngleRightIcon />
            </button>
            <button type="button" className="hcc-fake-browser__tool-btn" disabled aria-hidden="true" tabIndex={-1}>
              <SyncAltIcon />
            </button>
          </div>
          <div className="hcc-fake-browser__omnibox" role="presentation">
            <span className="hcc-fake-browser__lock" aria-hidden="true">
              🔒
            </span>
            <span className="hcc-fake-browser__url">{activeOmniboxUrl}</span>
          </div>
        </div>
      </div>
      <div className="hcc-fake-browser__page">{children}</div>
    </div>
  );
};

export { FakeBrowserChrome };
