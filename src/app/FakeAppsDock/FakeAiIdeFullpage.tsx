import * as React from 'react';
import { BrainIcon } from '@patternfly/react-icons';
import { usePcmBrowser } from '@app/PcmDemo/PcmBrowserContext';
import { CopyFailIdeAssistantReplyBody } from '@app/RhelVulnerability/copyFailIdeAssistantReply';

export interface IFakeAiIdeFullpageProps {
  isOpen: boolean;
  onClose: () => void;
}

const THINKING_DELAY_MS = 1100;

type TComposerPhase = 'idle' | 'thinking' | 'answered';

/**
 * Non-functional full-screen mock inspired by Cursor-style AI IDEs (not PatternFly).
 */
const FakeAiIdeFullpage: React.FunctionComponent<IFakeAiIdeFullpageProps> = ({ isOpen, onClose }) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const composerRef = React.useRef<HTMLTextAreaElement>(null);
  const { openTroubleshootInHcc } = usePcmBrowser();

  const [draft, setDraft] = React.useState('');
  const [sentUserPrompt, setSentUserPrompt] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<TComposerPhase>('idle');

  React.useEffect(() => {
    if (!isOpen) {
      setDraft('');
      setSentUserPrompt(null);
      setPhase('idle');
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (phase !== 'thinking') {
      return;
    }
    const id = window.setTimeout(() => setPhase('answered'), THINKING_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('hcc-pcm-ai-ide-open');
      window.setTimeout(() => composerRef.current?.focus(), 0);
    } else {
      document.body.classList.remove('hcc-pcm-ai-ide-open');
    }
    return () => document.body.classList.remove('hcc-pcm-ai-ide-open');
  }, [isOpen]);

  const submitPrompt = React.useCallback(() => {
    const trimmed = draft.trim();
    if (!trimmed || phase !== 'idle') {
      return;
    }
    setSentUserPrompt(trimmed);
    setDraft('');
    setPhase('thinking');
  }, [draft, phase]);

  const onComposerKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key !== 'Enter' || e.shiftKey) {
        return;
      }
      e.preventDefault();
      submitPrompt();
    },
    [submitPrompt]
  );

  const onTroubleshootClick = React.useCallback(() => {
    openTroubleshootInHcc({ ideUserPrompt: sentUserPrompt ?? undefined });
    onClose();
  }, [openTroubleshootInHcc, onClose, sentUserPrompt]);

  if (!isOpen) {
    return null;
  }

  const showConversation = phase !== 'idle';
  const composerDisabled = phase !== 'idle';

  return (
    <div
      ref={panelRef}
      className="hcc-fake-ai-ide-fp"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hcc-fake-ai-ide-fp-title"
      tabIndex={-1}
    >
      <header className="hcc-fake-ai-ide-fp__menubar">
        <span className="hcc-fake-ai-ide-fp__brand" id="hcc-fake-ai-ide-fp-title">
          Demo IDE
        </span>
        <nav className="hcc-fake-ai-ide-fp__menus" aria-label="Mock menu bar">
          <span>File</span>
          <span>Edit</span>
          <span>Selection</span>
          <span>View</span>
          <span>Go</span>
          <span>Terminal</span>
          <span>Help</span>
        </nav>
        <button type="button" className="hcc-fake-ai-ide-fp__close" onClick={onClose} aria-label="Close IDE">
          ×
        </button>
      </header>

      <div className="hcc-fake-ai-ide-fp__workspace">
        <aside className="hcc-fake-ai-ide-fp__activity" aria-hidden="true">
          <span className="hcc-fake-ai-ide-fp__activity-item hcc-fake-ai-ide-fp__activity-item--on">
            <BrainIcon />
          </span>
          <span className="hcc-fake-ai-ide-fp__activity-item">
            <span className="hcc-fake-ai-ide-fp__activity-glyph">{'{}'}</span>
          </span>
          <span className="hcc-fake-ai-ide-fp__activity-item">◇</span>
        </aside>

        <aside className="hcc-fake-ai-ide-fp__sidebar" aria-label="Explorer">
          <div className="hcc-fake-ai-ide-fp__sidebar-head">EXPLORER</div>
          <div className="hcc-fake-ai-ide-fp__tree">
            <div className="hcc-fake-ai-ide-fp__tree-row">📁 workspace</div>
            <div className="hcc-fake-ai-ide-fp__tree-row hcc-fake-ai-ide-fp__tree-row--nested">📁 src</div>
            <div className="hcc-fake-ai-ide-fp__tree-row hcc-fake-ai-ide-fp__tree-row--nested2">utils.ts</div>
            <div className="hcc-fake-ai-ide-fp__tree-row hcc-fake-ai-ide-fp__tree-row--nested2 hcc-fake-ai-ide-fp__tree-row--active">
              pcm-flow.tsx
            </div>
            <div className="hcc-fake-ai-ide-fp__tree-row hcc-fake-ai-ide-fp__tree-row--nested2">types.d.ts</div>
          </div>
        </aside>

        <div className="hcc-fake-ai-ide-fp__editor-col">
          <div className="hcc-fake-ai-ide-fp__tabs">
            <div className="hcc-fake-ai-ide-fp__tab hcc-fake-ai-ide-fp__tab--active">
              pcm-flow.tsx
              <span className="hcc-fake-ai-ide-fp__tab-x" aria-hidden="true">
                ×
              </span>
            </div>
          </div>
          <div className="hcc-fake-ai-ide-fp__editor">
            <pre className="hcc-fake-ai-ide-fp__pre">
              <code>{`// pcm-flow.tsx — mock buffer
import { analyze } from './utils';

export async function runVisionFlow() {
  const risk = await analyze('CVE-COPYFAIL');
  console.log(\`report: \${risk}\`);
  return { ok: true };
}
`}</code>
            </pre>
          </div>
        </div>

        <aside className="hcc-fake-ai-ide-fp__composer" aria-label="AI Composer">
          <div className="hcc-fake-ai-ide-fp__composer-head">
            <span className="hcc-fake-ai-ide-fp__composer-title">Composer</span>
            <span className="hcc-fake-ai-ide-fp__composer-badge">⌘K</span>
          </div>
          <div className="hcc-fake-ai-ide-fp__composer-body">
            <div className="hcc-fake-ai-ide-fp__chat" aria-live={showConversation ? 'polite' : undefined}>
              {showConversation && sentUserPrompt ? (
                <>
                  <div className="hcc-fake-ai-ide-fp__msg hcc-fake-ai-ide-fp__msg--user">{sentUserPrompt}</div>
                  {phase === 'thinking' ? (
                    <div
                      className="hcc-fake-ai-ide-fp__thinking"
                      role="status"
                      aria-busy="true"
                      aria-label="Assistant is thinking"
                    >
                      <span className="hcc-fake-ai-ide-fp__thinking-label">Thinking</span>
                      <span className="hcc-fake-ai-ide-fp__thinking-dots" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                      </span>
                    </div>
                  ) : null}
                  {phase === 'answered' ? (
                    <div className="hcc-fake-ai-ide-fp__msg hcc-fake-ai-ide-fp__msg--ai">
                      <CopyFailIdeAssistantReplyBody variant="ide" />
                      <div className="hcc-fake-ai-ide-fp__cta-row">
                        <button type="button" className="hcc-fake-ai-ide-fp__cta-primary" onClick={onTroubleshootClick}>
                          Troubleshoot in Hybrid Cloud Console
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
            <div className="hcc-fake-ai-ide-fp__composer-input-wrap">
              <label className="hcc-fake-ai-ide-fp__composer-label" htmlFor="hcc-fake-ai-ide-composer-input">
                Message
              </label>
              <textarea
                id="hcc-fake-ai-ide-composer-input"
                ref={composerRef}
                className="hcc-fake-ai-ide-fp__composer-input"
                placeholder="Plan, search, build anything…"
                rows={3}
                value={draft}
                disabled={composerDisabled}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onComposerKeyDown}
                aria-describedby="hcc-fake-ai-ide-composer-hint"
              />
              <p id="hcc-fake-ai-ide-composer-hint" className="hcc-fake-ai-ide-fp__composer-hint">
                {composerDisabled
                  ? 'Demo response shown above.'
                  : 'Press Enter to send · Shift+Enter for a new line'}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export { FakeAiIdeFullpage };
