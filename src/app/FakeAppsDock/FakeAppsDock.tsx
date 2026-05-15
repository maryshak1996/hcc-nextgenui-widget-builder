import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FakeAiIdeFullpage } from '@app/FakeAppsDock/FakeAiIdeFullpage';
import {
  DockIconChrome,
  DockIconDrive,
  DockIconFinder,
  DockIconIde,
  DockIconMail,
  DockIconMessages,
  DockIconNotes,
  DockIconSettings,
  DockIconTerminal,
  DockIconToolkit,
} from '@app/FakeAppsDock/FakeDockMacIcons';
import { FakeSlackDockDemoLayer, FakeSlackGlyph } from '@app/FakeAppsDock/FakeSlackDockDemoLayer';
import { HCC_FAKE_SLACK_DM_DOCK_ACTIVATE } from '@app/FakeAppsDock/fakeSlackDockDemoEvents';
import { HCC_DEMO_PCM_ANNOTATIONS_CLEAR } from '@app/DemoAnnotations/demoAnnotationEvents';

/**
 * Demo-only “desktop” dock and mock AI IDE — Chrome switches back to the fake browser; AI IDE toggles the composer.
 * macOS-inspired glass pill + squircle tiles (not Apple HIG assets).
 */
const FakeAppsDock: React.FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [slackDemo, setSlackDemo] = React.useState({ showDockBadge: false, showDmOpen: false });
  const onSlackDemoState = React.useCallback((s: { showDockBadge: boolean; showDmOpen: boolean }) => {
    setSlackDemo(s);
  }, []);
  const [isIdeOpen, setIsIdeOpen] = React.useState(false);
  const wasIdeOpenRef = React.useRef(false);

  const isFakeBrowserSurface =
    location.pathname.startsWith('/pcm') || location.pathname.startsWith('/red-hat-enterprise-linux');

  const isChromeAppActive = !isIdeOpen && isFakeBrowserSurface;

  const onChromeClick = React.useCallback(() => {
    setIsIdeOpen(false);
    if (!isFakeBrowserSurface) {
      navigate('/pcm/article');
    }
  }, [isFakeBrowserSurface, navigate]);

  React.useEffect(() => {
    document.body.classList.add('hcc-fake-dock--active');
    return () => {
      document.body.classList.remove('hcc-fake-dock--active');
    };
  }, []);

  React.useEffect(() => {
    if (isIdeOpen && !wasIdeOpenRef.current) {
      window.dispatchEvent(
        new CustomEvent(HCC_DEMO_PCM_ANNOTATIONS_CLEAR, { detail: { reason: 'ide-opened' } }),
      );
    }
    wasIdeOpenRef.current = isIdeOpen;
  }, [isIdeOpen]);

  const staticDockItems: Array<{
    id: string;
    label: string;
    Icon: React.FunctionComponent;
  }> = [
    { id: 'files', label: 'Files', Icon: DockIconFinder },
    { id: 'chrome', label: 'Chrome', Icon: DockIconChrome },
    { id: 'messages', label: 'Messages', Icon: DockIconMessages },
    { id: 'mail', label: 'Mail', Icon: DockIconMail },
    { id: 'notes', label: 'Notes', Icon: DockIconNotes },
    { id: 'drive', label: 'Drive', Icon: DockIconDrive },
    { id: 'toolkit', label: 'Toolkit', Icon: DockIconToolkit },
    { id: 'settings', label: 'Settings', Icon: DockIconSettings },
    { id: 'terminal', label: 'Terminal', Icon: DockIconTerminal },
  ];

  return (
    <>
      <nav className="hcc-fake-apps-dock" aria-label="Demo application dock (mock)">
        <div className="hcc-fake-apps-dock__inner">
          <ul className="hcc-fake-apps-dock__list" role="presentation">
            {staticDockItems.map(({ id, label, Icon }) => {
              const isChrome = id === 'chrome';
              const iconActive = isChrome ? isChromeAppActive : false;
              return (
                <li key={id} className="hcc-fake-apps-dock__slot">
                  {isChrome ? (
                    <button
                      type="button"
                      className="hcc-fake-apps-dock__launch"
                      aria-label="Show fake browser"
                      title={label}
                      onClick={onChromeClick}
                    >
                      <span className="hcc-fake-apps-dock__icon-magnify">
                        <span
                          className={[
                            'hcc-fake-apps-dock__icon',
                            'hcc-fake-apps-dock__icon--chrome',
                            iconActive ? 'hcc-fake-apps-dock__icon--active' : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <Icon />
                        </span>
                      </span>
                      <span
                        className={[
                          'hcc-fake-apps-dock__running-dot',
                          iconActive ? 'hcc-fake-apps-dock__running-dot--on' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-hidden
                      />
                      <span className="hcc-fake-apps-dock__label-tooltip">{label}</span>
                    </button>
                  ) : (
                    <div className="hcc-fake-apps-dock__decorative" role="img" aria-label={`${label} (decorative)`}>
                      <span className="hcc-fake-apps-dock__icon-magnify">
                        <span className={['hcc-fake-apps-dock__icon', 'hcc-fake-apps-dock__icon--static']
                          .filter(Boolean)
                          .join(' ')}
                        >
                          <Icon />
                        </span>
                      </span>
                      <span className="hcc-fake-apps-dock__running-dot" aria-hidden />
                      <span className="hcc-fake-apps-dock__label-tooltip">{label}</span>
                    </div>
                  )}
                </li>
              );
            })}
            <li className="hcc-fake-apps-dock__slot hcc-fake-apps-dock__slot--slack">
              <button
                type="button"
                className="hcc-fake-apps-dock__launch"
                aria-label={
                  slackDemo.showDmOpen
                    ? 'Slack demo: message window open'
                    : 'Slack (demo — open direct message when notified)'
                }
                title="Slack"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent(HCC_FAKE_SLACK_DM_DOCK_ACTIVATE));
                }}
              >
                <span className="hcc-fake-apps-dock__icon-magnify">
                  <span
                    className={[
                      'hcc-fake-apps-dock__icon',
                      'hcc-fake-apps-dock__icon--slack',
                      slackDemo.showDmOpen ? 'hcc-fake-apps-dock__icon--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {slackDemo.showDockBadge ? (
                      <span className="hcc-fake-apps-dock__unread" aria-label="Unread Slack messages" />
                    ) : null}
                    <FakeSlackGlyph size={34} />
                  </span>
                </span>
                <span
                  className={[
                    'hcc-fake-apps-dock__running-dot',
                    slackDemo.showDmOpen ? 'hcc-fake-apps-dock__running-dot--on' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden
                />
                <span className="hcc-fake-apps-dock__label-tooltip">Slack</span>
              </button>
            </li>
            <li className="hcc-fake-apps-dock__slot">
              <button
                type="button"
                className="hcc-fake-apps-dock__launch"
                data-demo-anchor="pcm-ai-ide-dock"
                aria-label={isIdeOpen ? 'Close mock AI IDE' : 'Open mock AI IDE'}
                aria-pressed={isIdeOpen}
                title="AI IDE"
                onClick={() => setIsIdeOpen((open) => !open)}
              >
                <span className="hcc-fake-apps-dock__icon-magnify">
                  <span
                    className={[
                      'hcc-fake-apps-dock__icon',
                      'hcc-fake-apps-dock__icon--ide',
                      isIdeOpen ? 'hcc-fake-apps-dock__icon--active' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <DockIconIde />
                  </span>
                </span>
                <span
                  className={[
                    'hcc-fake-apps-dock__running-dot',
                    isIdeOpen ? 'hcc-fake-apps-dock__running-dot--on' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden
                />
                <span className="hcc-fake-apps-dock__label-tooltip">AI IDE</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <FakeSlackDockDemoLayer onDemoState={onSlackDemoState} />

      <FakeAiIdeFullpage isOpen={isIdeOpen} onClose={() => setIsIdeOpen(false)} />
    </>
  );
};

export { FakeAppsDock };
