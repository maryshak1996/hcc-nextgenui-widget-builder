import * as React from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { DemoAnnotationCallout } from '@app/DemoAnnotations/DemoAnnotationCallout';
import { DemoClickIndicator } from '@app/DemoAnnotations/DemoClickIndicator';
import { DemoGoalConnectionAnnotation, DemoGoalConnectionStack } from '@app/DemoAnnotations/DemoGoalConnectionAnnotation';
import {
  HCC_DEMO_ANNOTATIONS_PREF_CHANGED,
  type HccDemoAnnotationsPrefDetail,
} from '@app/DemoAnnotations/demoAnnotationEvents';
import '@app/DemoAnnotations/demoAnnotations.css';
import { readAnnotationsVisiblePreference } from '@app/DemoAnnotations/DemoAnnotationsViewToggle';
import { HCC_SUPPORT_CASE_NEW_PATH } from '@app/Support/supportCaseChatPrompt';
import {
  HCC_FAKE_SLACK_DM_DEMO_ARM,
  HCC_FAKE_SLACK_DM_DOCK_ACTIVATE,
  type HccFakeSlackDmDemoArmDetail,
} from '@app/FakeAppsDock/fakeSlackDockDemoEvents';

const SLACK_DM_DEMO_DELAY_MS = 2000;

const DECORATIVE_CHANNELS: ReadonlyArray<{ name: string; isPrivate?: boolean }> = [
  { name: 'lounge-homelab' },
  { name: 'team-ask-red-hat-ext' },
  { name: 'uxd-ai-experiments' },
  { name: 'ux-tooling-private', isPrivate: true },
  { name: 'wg-ocm-insights-notifications' },
  { name: 'announcements' },
  { name: 'lounge-broadhat' },
  { name: 'team-hcc-console' },
];

export interface IFakeSlackDockDemoLayerProps {
  /** When true, the Slack dock icon shows an unread badge (and can mirror “active” if desired). */
  onDemoState: (state: { showDockBadge: boolean; showDmOpen: boolean }) => void;
}

const ANCHOR_SLACK_MAC_NOTIFICATION = '[data-demo-anchor="hcc-fake-slack-macos-notification"]';

/**
 * macOS-style system notification + mock Slack DM (not PatternFly). Wired from support case “submitted” success.
 */
const FakeSlackDockDemoLayer: React.FunctionComponent<IFakeSlackDockDemoLayerProps> = ({ onDemoState }) => {
  const location = useLocation();
  const [demoAnnotationsOn, setDemoAnnotationsOn] = React.useState(readAnnotationsVisiblePreference);
  const [caseNumber, setCaseNumber] = React.useState<string | null>(null);
  const [showMacNotification, setShowMacNotification] = React.useState(false);
  const [showDmPanel, setShowDmPanel] = React.useState(false);
  const notifyTimerRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    const onPref = (e: Event) => {
      const d = (e as CustomEvent<HccDemoAnnotationsPrefDetail>).detail;
      if (typeof d?.visible === 'boolean') {
        setDemoAnnotationsOn(d.visible);
      }
    };
    window.addEventListener(HCC_DEMO_ANNOTATIONS_PREF_CHANGED, onPref);
    return () => window.removeEventListener(HCC_DEMO_ANNOTATIONS_PREF_CHANGED, onPref);
  }, []);

  const clearNotifyTimer = React.useCallback(() => {
    if (notifyTimerRef.current !== undefined) {
      window.clearTimeout(notifyTimerRef.current);
      notifyTimerRef.current = undefined;
    }
  }, []);

  const resetDemo = React.useCallback(() => {
    clearNotifyTimer();
    setCaseNumber(null);
    setShowMacNotification(false);
    setShowDmPanel(false);
    onDemoState({ showDockBadge: false, showDmOpen: false });
  }, [clearNotifyTimer, onDemoState]);

  React.useEffect(() => {
    const onArm = (ev: Event) => {
      const ce = ev as CustomEvent<HccFakeSlackDmDemoArmDetail>;
      const num = ce.detail?.caseNumber?.trim();
      if (!num) {
        return;
      }
      clearNotifyTimer();
      setShowMacNotification(false);
      setShowDmPanel(false);
      setCaseNumber(num);
      onDemoState({ showDockBadge: false, showDmOpen: false });
      notifyTimerRef.current = window.setTimeout(() => {
        notifyTimerRef.current = undefined;
        setShowMacNotification(true);
        onDemoState({ showDockBadge: true, showDmOpen: false });
      }, SLACK_DM_DEMO_DELAY_MS);
    };
    window.addEventListener(HCC_FAKE_SLACK_DM_DEMO_ARM, onArm as EventListener);
    return () => {
      window.removeEventListener(HCC_FAKE_SLACK_DM_DEMO_ARM, onArm as EventListener);
    };
  }, [clearNotifyTimer, onDemoState]);

  React.useEffect(() => {
    if (!location.pathname.endsWith(HCC_SUPPORT_CASE_NEW_PATH)) {
      resetDemo();
    }
  }, [location.pathname, resetDemo]);

  React.useEffect(() => () => clearNotifyTimer(), [clearNotifyTimer]);

  React.useEffect(() => {
    const onDock = () => {
      if (!caseNumber || showDmPanel) {
        return;
      }
      clearNotifyTimer();
      setShowMacNotification(false);
      setShowDmPanel(true);
      onDemoState({ showDockBadge: false, showDmOpen: true });
    };
    window.addEventListener(HCC_FAKE_SLACK_DM_DOCK_ACTIVATE, onDock);
    return () => {
      window.removeEventListener(HCC_FAKE_SLACK_DM_DOCK_ACTIVATE, onDock);
    };
  }, [caseNumber, showDmPanel, clearNotifyTimer, onDemoState]);

  const onNotificationClick = React.useCallback(() => {
    clearNotifyTimer();
    setShowMacNotification(false);
    setShowDmPanel(true);
    onDemoState({ showDockBadge: false, showDmOpen: true });
  }, [clearNotifyTimer, onDemoState]);

  const onCloseDm = React.useCallback(() => {
    setShowDmPanel(false);
    onDemoState({ showDockBadge: false, showDmOpen: false });
  }, [onDemoState]);

  if (!caseNumber) {
    return null;
  }

  const slackDemoAnnotationsPortal =
    typeof document !== 'undefined'
      ? createPortal(
          <>
            {demoAnnotationsOn && showMacNotification ? (
              <div
                className="hcc-demo-annotations-layer hcc-demo-annotations-layer--slack-mac-callout"
                aria-label="Slack integration demo hint"
              >
                <DemoAnnotationCallout visible id="hcc-demo-slack-callout-integration-works">
                  Looks like the Slack integration works.
                </DemoAnnotationCallout>
              </div>
            ) : null}
            {demoAnnotationsOn && showMacNotification ? (
              <DemoClickIndicator
                visible
                anchorSelector={ANCHOR_SLACK_MAC_NOTIFICATION}
                onActivate={onNotificationClick}
                outlinePaddingPx={8}
                elevated
                activateAriaLabel="Demo: open Slack notification"
              />
            ) : null}
            {demoAnnotationsOn && showDmPanel ? (
              <DemoGoalConnectionStack
                aria-label="UIE goal connections (Slack DM)"
                className="hcc-demo-goal-connection-stack--above-fake-slack"
              >
                <DemoGoalConnectionAnnotation
                  visible
                  id="hcc-demo-slack-goal-intelligence-in-workflow"
                  inStack
                >
                  Again, we have intelligence where the customer is. In this case, they are interacting with Red Hat
                  through a tool that is already part of their workflow.
                </DemoGoalConnectionAnnotation>
              </DemoGoalConnectionStack>
            ) : null}
          </>,
          document.body,
        )
      : null;

  return (
    <>
      {slackDemoAnnotationsPortal}
      {showMacNotification ? (
        <div className="hcc-macos-slack-notification-host" aria-live="polite">
          <button
            type="button"
            className="hcc-macos-slack-notification"
            data-demo-anchor="hcc-fake-slack-macos-notification"
            onClick={onNotificationClick}
            aria-label="New Slack message from Red Hat Support. Open message."
          >
            <div className="hcc-macos-slack-notification__icon" aria-hidden>
              <FakeSlackGlyph size={44} />
            </div>
            <div className="hcc-macos-slack-notification__text">
              <div className="hcc-macos-slack-notification__app">Slack</div>
              <div className="hcc-macos-slack-notification__title">New Slack message from Red Hat Support</div>
              <div className="hcc-macos-slack-notification__subtitle">
                Open to read your support case confirmation in DMs.
              </div>
            </div>
          </button>
        </div>
      ) : null}

      {showDmPanel ? (
        <FakeSlackDesktopWindow caseNumber={caseNumber} onClose={onCloseDm} />
      ) : null}
    </>
  );
};

interface IFakeSlackDesktopWindowProps {
  caseNumber: string;
  onClose: () => void;
}

/** Full Slack desktop–style frame (demo only): rail, workspace list, conversation + composer. */
function FakeSlackDesktopWindow({ caseNumber, onClose }: IFakeSlackDesktopWindowProps): React.ReactElement {
  return (
    <div className="hcc-fake-slack-dm-root" role="dialog" aria-modal="true" aria-label="Slack">
      <button type="button" className="hcc-fake-slack-dm-backdrop" onClick={onClose} aria-label="Close Slack demo" />
      <div className="hcc-fake-slack-window-shell">
        <div className="hcc-fake-slack-window">
          <header className="hcc-fake-slack-win__titlebar">
            <div className="hcc-fake-slack-win__traffic">
              <button type="button" className="hcc-fake-slack-win__dot hcc-fake-slack-win__dot--close" onClick={onClose} title="Close" aria-label="Close" />
              <span className="hcc-fake-slack-win__dot hcc-fake-slack-win__dot--min" aria-hidden />
              <span className="hcc-fake-slack-win__dot hcc-fake-slack-win__dot--zoom" aria-hidden />
            </div>
            <div className="hcc-fake-slack-win__titlebar-actions">
              <span className="hcc-fake-slack-win__nav-icon" aria-hidden>
                <SlackWinIconChevronLeft />
              </span>
              <span className="hcc-fake-slack-win__nav-icon" aria-hidden>
                <SlackWinIconChevronRight />
              </span>
              <span className="hcc-fake-slack-win__nav-icon" aria-hidden>
                <SlackWinIconHistory />
              </span>
            </div>
            <div className="hcc-fake-slack-win__search-wrap">
              <input
                className="hcc-fake-slack-win__search"
                type="search"
                readOnly
                tabIndex={-1}
                placeholder="Search Red Hat"
                aria-label="Search Red Hat (demo)"
              />
            </div>
            <button type="button" className="hcc-fake-slack-win__help" aria-label="Help (demo)">
              <SlackWinIconHelp />
            </button>
          </header>

          <div className="hcc-fake-slack-win__body">
            <nav className="hcc-fake-slack-rail" aria-label="Slack workspace apps (demo)">
              <div className="hcc-fake-slack-rail__brand" aria-hidden>
                <span className="hcc-fake-slack-rail__brand-inner">RH</span>
              </div>
              <ul className="hcc-fake-slack-rail__list">
                <li>
                  <span className="hcc-fake-slack-rail__btn hcc-fake-slack-rail__btn--active" title="Home">
                    <SlackWinIconHome />
                  </span>
                </li>
                <li>
                  <span className="hcc-fake-slack-rail__btn" title="DMs">
                    <SlackWinIconDm />
                  </span>
                </li>
                <li>
                  <span className="hcc-fake-slack-rail__btn" title="Activity">
                    <SlackWinIconActivity />
                  </span>
                </li>
                <li>
                  <span className="hcc-fake-slack-rail__btn" title="Files">
                    <SlackWinIconFiles />
                  </span>
                </li>
                <li>
                  <span className="hcc-fake-slack-rail__btn" title="Later">
                    <SlackWinIconLater />
                  </span>
                </li>
                <li>
                  <span className="hcc-fake-slack-rail__btn" title="More">
                    <SlackWinIconMore />
                  </span>
                </li>
              </ul>
              <div className="hcc-fake-slack-rail__foot">
                <span className="hcc-fake-slack-rail__add" aria-hidden>
                  +
                </span>
                <span className="hcc-fake-slack-rail__me" aria-hidden>
                  <span className="hcc-fake-slack-rail__me-dot" />
                  You
                </span>
              </div>
            </nav>

            <div className="hcc-fake-slack-sidebar">
              <div className="hcc-fake-slack-sidebar__head">
                <button type="button" className="hcc-fake-slack-sidebar__workspace">
                  Red Hat
                  <SlackWinIconChevronDownTiny />
                </button>
                <span className="hcc-fake-slack-sidebar__head-icons" aria-hidden>
                  <span className="hcc-fake-slack-sidebar__ic">▦</span>
                  <span className="hcc-fake-slack-sidebar__ic">✎</span>
                </span>
              </div>
              <div className="hcc-fake-slack-sidebar__unreads" role="note">
                <span className="hcc-fake-slack-sidebar__unreads-pill">↑ More unreads</span>
              </div>
              <div className="hcc-fake-slack-sidebar__channels" role="list">
                {DECORATIVE_CHANNELS.map(({ name, isPrivate }) => (
                  <div key={name} className="hcc-fake-slack-sidebar__channel" role="listitem">
                    {isPrivate ? (
                      <span className="hcc-fake-slack-sidebar__lock" aria-hidden>
                        🔒
                      </span>
                    ) : (
                      <span className="hcc-fake-slack-sidebar__hash" aria-hidden>
                        #
                      </span>
                    )}
                    <span className="hcc-fake-slack-sidebar__ch-name">{name}</span>
                  </div>
                ))}
              </div>
              <div className="hcc-fake-slack-sidebar__dm-head">Direct messages</div>
              <div className="hcc-fake-slack-sidebar__dm-list">
                <div className="hcc-fake-slack-sidebar__dm hcc-fake-slack-sidebar__dm--active">
                  <span className="hcc-fake-slack-sidebar__dm-avatar hcc-fake-slack-sidebar__dm-avatar--rhs">
                    RHS
                  </span>
                  <span className="hcc-fake-slack-sidebar__dm-name">Red Hat Support</span>
                </div>
                <div className="hcc-fake-slack-sidebar__dm">
                  <span className="hcc-fake-slack-sidebar__dm-avatar hcc-fake-slack-sidebar__dm-avatar--you">
                    You
                  </span>
                  <span className="hcc-fake-slack-sidebar__dm-name">You (demo)</span>
                </div>
              </div>
            </div>

            <main className="hcc-fake-slack-main">
              <header className="hcc-fake-slack-main__top">
                <div className="hcc-fake-slack-main__top-row">
                  <div className="hcc-fake-slack-main__peer">
                    <span className="hcc-fake-slack-main__peer-avatar">RHS</span>
                    <div>
                      <div className="hcc-fake-slack-main__peer-name">Red Hat Support</div>
                    </div>
                  </div>
                  <div className="hcc-fake-slack-main__top-actions">
                    <button type="button" className="hcc-fake-slack-main__icon-btn" aria-label="Star (demo)">
                      ★
                    </button>
                    <button type="button" className="hcc-fake-slack-main__icon-btn" aria-label="More (demo)">
                      ⋮
                    </button>
                  </div>
                </div>
                <div className="hcc-fake-slack-main__tabs">
                  <span className="hcc-fake-slack-main__tab hcc-fake-slack-main__tab--on">Messages</span>
                  <span className="hcc-fake-slack-main__tab">Add canvas</span>
                  <button type="button" className="hcc-fake-slack-main__tab-plus" aria-hidden>
                    +
                  </button>
                </div>
              </header>

              <div className="hcc-fake-slack-main__scroll">
                <div className="hcc-fake-slack-main__date">Today</div>

                <article className="hcc-fake-slack-feed-msg">
                  <div className="hcc-fake-slack-feed-msg__avatar" aria-hidden>
                    RHS
                  </div>
                  <div className="hcc-fake-slack-feed-msg__content">
                    <header className="hcc-fake-slack-feed-msg__head">
                      <span className="hcc-fake-slack-feed-msg__who">Red Hat Support</span>
                      <span className="hcc-fake-slack-feed-msg__when">just now</span>
                    </header>
                    <div className="hcc-fake-slack-feed-msg__text">
                      <p>
                        Support case <strong>#{caseNumber}</strong> has been opened.
                      </p>
                      <p>You can check the status and add comments to the case from this Slack thread.</p>
                    </div>
                  </div>
                </article>
              </div>

              <footer className="hcc-fake-slack-composer">
                <div className="hcc-fake-slack-composer__fmt">
                  <span className="hcc-fake-slack-composer__fmt-i" title="Bold (demo)">
                    <strong>B</strong>
                  </span>
                  <span className="hcc-fake-slack-composer__fmt-i">
                    <em>I</em>
                  </span>
                  <span className="hcc-fake-slack-composer__fmt-i">S̶</span>
                  <span className="hcc-fake-slack-composer__fmt-i">🔗</span>
                  <span className="hcc-fake-slack-composer__fmt-i">1.</span>
                  <span className="hcc-fake-slack-composer__fmt-i">•</span>
                  <span className="hcc-fake-slack-composer__fmt-i">&gt;</span>
                  <span className="hcc-fake-slack-composer__fmt-i">&lt;/&gt;</span>
                </div>
                <div className="hcc-fake-slack-composer__field-wrap">
                  <div className="hcc-fake-slack-composer__field" contentEditable={false} suppressContentEditableWarning>
                    Jot something down
                  </div>
                </div>
                <div className="hcc-fake-slack-composer__foot">
                  <span className="hcc-fake-slack-composer__foot-i">＋</span>
                  <span className="hcc-fake-slack-composer__foot-i">Aa</span>
                  <span className="hcc-fake-slack-composer__foot-i">😊</span>
                  <span className="hcc-fake-slack-composer__foot-i">@</span>
                  <button type="button" className="hcc-fake-slack-composer__send" aria-label="Send (demo)">
                    ➤
                  </button>
                </div>
              </footer>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlackWinIconHome(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" strokeLinejoin="round" />
    </svg>
  );
}

function SlackWinIconDm(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
    </svg>
  );
}

function SlackWinIconActivity(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M10 3a7 7 0 1 0 3.36 13.11l.47 2a1 1 0 0 0 1.22.72l2.07-.52a1 1 0 0 0 .73-1.21l-.47-1.89A7 7 0 0 0 10 3Z" strokeLinejoin="round" />
      <path d="M7.5 10h5M10 7.5v5" strokeLinecap="round" />
    </svg>
  );
}

function SlackWinIconFiles(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M13 3H6a2 2 0 0 0-2 2v14h14V9l-5-6Z" strokeLinejoin="round" />
      <path d="M13 3v6h6" strokeLinejoin="round" />
    </svg>
  );
}

function SlackWinIconLater(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M6 4h12a2 2 0 0 1 2 2v15l-8-4-8 4V6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
    </svg>
  );
}

function SlackWinIconMore(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="5" cy="12" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

function SlackWinIconChevronLeft(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m14 6-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SlackWinIconChevronRight(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m10 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SlackWinIconHistory(): React.ReactElement {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SlackWinIconHelp(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.27 2.37c-.67.34-1.27 1.13-1.27 1.83V14" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SlackWinIconChevronDownTiny(): React.ReactElement {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Compact Slack logo mark (demo only). */
function FakeSlackGlyph({ size }: { size: number }): React.ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 54 54"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="hcc-fake-slack-glyph"
    >
      <path
        d="M11.8 22.5a3.4 3.4 0 013.4-3.4h6.8a3.4 3.4 0 013.4 3.4v6.8a3.4 3.4 0 01-3.4 3.4h-6.8a3.4 3.4 0 01-3.4-3.4v-6.8z"
        fill="#E01E5A"
      />
      <path
        d="M22.5 11.8a3.4 3.4 0 013.4-3.4h6.8a3.4 3.4 0 013.4 3.4v6.8a3.4 3.4 0 01-3.4 3.4h-6.8a3.4 3.4 0 01-3.4-3.4v-6.8z"
        fill="#36C5F0"
      />
      <path
        d="M33.2 22.5a3.4 3.4 0 013.4-3.4H43a3.4 3.4 0 013.4 3.4v6.8a3.4 3.4 0 01-3.4 3.4h-6.8a3.4 3.4 0 01-3.4-3.4v-6.8z"
        fill="#2EB67D"
      />
      <path
        d="M22.5 33.2a3.4 3.4 0 013.4-3.4h6.8a3.4 3.4 0 013.4 3.4V43a3.4 3.4 0 01-3.4 3.4h-6.8a3.4 3.4 0 01-3.4-3.4v-6.8z"
        fill="#ECB22E"
      />
    </svg>
  );
}

export { FakeSlackDockDemoLayer, FakeSlackGlyph };
