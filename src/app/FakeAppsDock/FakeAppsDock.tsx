import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FakeAiIdeFullpage } from '@app/FakeAppsDock/FakeAiIdeFullpage';
import {
  ApplicationsIcon,
  BellIcon,
  BookOpenIcon,
  BrainIcon,
  CloudIcon,
  CodeIcon,
  CogIcon,
  CommentsIcon,
  CubeIcon,
  GlobeIcon,
} from '@patternfly/react-icons';

/**
 * Demo-only “desktop” dock and mock AI IDE — Chrome switches back to the fake browser; AI IDE toggles the composer.
 */
const FakeAppsDock: React.FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isIdeOpen, setIsIdeOpen] = React.useState(false);

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

  const staticDockItems: Array<{
    id: string;
    label: string;
    Icon: typeof ApplicationsIcon;
  }> = [
    { id: 'files', label: 'Files', Icon: ApplicationsIcon },
    { id: 'chrome', label: 'Chrome', Icon: GlobeIcon },
    { id: 'messages', label: 'Messages', Icon: CommentsIcon },
    { id: 'mail', label: 'Mail', Icon: BellIcon },
    { id: 'notes', label: 'Notes', Icon: BookOpenIcon },
    { id: 'drive', label: 'Drive', Icon: CloudIcon },
    { id: 'toolkit', label: 'Toolkit', Icon: CubeIcon },
    { id: 'settings', label: 'Settings', Icon: CogIcon },
    { id: 'terminal', label: 'Terminal', Icon: CodeIcon },
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
                      title="Switch to fake browser (closes AI IDE)"
                      onClick={onChromeClick}
                    >
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
                      <span className="hcc-fake-apps-dock__label">{label}</span>
                    </button>
                  ) : (
                    <>
                      <span
                        className={['hcc-fake-apps-dock__icon', 'hcc-fake-apps-dock__icon--static']
                          .join(' ')}
                        title={`${label} (decorative)`}
                      >
                        <Icon />
                      </span>
                      <span className="hcc-fake-apps-dock__label">{label}</span>
                    </>
                  )}
                </li>
              );
            })}
            <li className="hcc-fake-apps-dock__slot">
              <button
                type="button"
                className="hcc-fake-apps-dock__launch"
                aria-label={isIdeOpen ? 'Close mock AI IDE' : 'Open mock AI IDE'}
                aria-pressed={isIdeOpen}
                onClick={() => setIsIdeOpen((open) => !open)}
              >
                <span
                  className={[
                    'hcc-fake-apps-dock__icon',
                    'hcc-fake-apps-dock__icon--ide',
                    isIdeOpen ? 'hcc-fake-apps-dock__icon--active' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <BrainIcon />
                </span>
                <span className="hcc-fake-apps-dock__label">AI IDE</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <FakeAiIdeFullpage isOpen={isIdeOpen} onClose={() => setIsIdeOpen(false)} />
    </>
  );
};

export { FakeAppsDock };
