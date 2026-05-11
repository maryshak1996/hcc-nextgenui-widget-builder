import * as React from 'react';
import { createPortal } from 'react-dom';
import { BrainIcon } from '@patternfly/react-icons';
import { DemoAnnotationCallout } from '@app/DemoAnnotations/DemoAnnotationCallout';
import {
  DEMO_IDE_COPY_FAIL_USER_PROMPT,
  HCC_DEMO_ANNOTATIONS_PREF_CHANGED,
  type HccDemoAnnotationsPrefDetail,
} from '@app/DemoAnnotations/demoAnnotationEvents';
import '@app/DemoAnnotations/demoAnnotations.css';
import { readAnnotationsVisiblePreference } from '@app/DemoAnnotations/DemoAnnotationsViewToggle';
import { DemoClickIndicator } from '@app/DemoAnnotations/DemoClickIndicator';
import { usePcmBrowser } from '@app/PcmDemo/PcmBrowserContext';
import { CopyFailIdeAssistantReplyBody } from '@app/RhelVulnerability/copyFailIdeAssistantReply';

export interface IFakeAiIdeFullpageProps {
  isOpen: boolean;
  onClose: () => void;
}

const THINKING_DELAY_MS = 1100;

const ANCHOR_COMPOSER_INPUT = '[data-demo-anchor="pcm-ide-composer-input"]';
const ANCHOR_IDE_TROUBLESHOOT_HCC = '[data-demo-anchor="pcm-ide-troubleshoot-hcc"]';

const CALLOUT_DELAY_MS = 1000;
const OUTLINE_DELAY_MS = 2200;

type TComposerPhase = 'idle' | 'thinking' | 'answered';

/**
 * Post–assistant-reply demo: monotonic step so prior callouts stay mounted and stack.
 * 0 = not started, 1 = review callout, 2 = + jump callout, 3 = + troubleshoot click outline.
 */
type TIdePostAnswerStep = 0 | 1 | 2 | 3;

/**
 * Non-functional full-screen mock inspired by Cursor-style AI IDEs (not PatternFly).
 */
const FakeAiIdeFullpage: React.FunctionComponent<IFakeAiIdeFullpageProps> = ({ isOpen, onClose }) => {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const composerRef = React.useRef<HTMLTextAreaElement>(null);
  const demoInjectedRef = React.useRef(false);
  const { openTroubleshootInHcc } = usePcmBrowser();

  const [draft, setDraft] = React.useState('');
  const [sentUserPrompt, setSentUserPrompt] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<TComposerPhase>('idle');

  const [ideAnnotationsOn, setIdeAnnotationsOn] = React.useState(readAnnotationsVisiblePreference);
  const [demoCalloutVisible, setDemoCalloutVisible] = React.useState(false);
  const [demoComposerOutline, setDemoComposerOutline] = React.useState(false);
  const [idePostAnswerStep, setIdePostAnswerStep] = React.useState<TIdePostAnswerStep>(0);
  /** Composer demo prompt sent (via Next or focusing the outlined composer). */
  const [ideKickoffDone, setIdeKickoffDone] = React.useState(false);

  React.useEffect(() => {
    const onPref = (e: Event) => {
      const d = (e as CustomEvent<HccDemoAnnotationsPrefDetail>).detail;
      if (typeof d?.visible === 'boolean') {
        setIdeAnnotationsOn(d.visible);
      }
    };
    window.addEventListener(HCC_DEMO_ANNOTATIONS_PREF_CHANGED, onPref);
    return () => window.removeEventListener(HCC_DEMO_ANNOTATIONS_PREF_CHANGED, onPref);
  }, []);

  React.useEffect(() => {
    if (!isOpen) {
      setDraft('');
      setSentUserPrompt(null);
      setPhase('idle');
      demoInjectedRef.current = false;
      setDemoCalloutVisible(false);
      setDemoComposerOutline(false);
      setIdePostAnswerStep(0);
      setIdeKickoffDone(false);
      return;
    }
    setIdeAnnotationsOn(readAnnotationsVisiblePreference());
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || !ideAnnotationsOn) {
      return undefined;
    }
    const tCallout = window.setTimeout(() => setDemoCalloutVisible(true), CALLOUT_DELAY_MS);
    const tOutline = window.setTimeout(() => setDemoComposerOutline(true), OUTLINE_DELAY_MS);
    return () => {
      window.clearTimeout(tCallout);
      window.clearTimeout(tOutline);
    };
  }, [isOpen, ideAnnotationsOn]);

  React.useEffect(() => {
    if (!ideAnnotationsOn) {
      setDemoCalloutVisible(false);
      setDemoComposerOutline(false);
      setIdePostAnswerStep(0);
    }
  }, [ideAnnotationsOn]);

  React.useEffect(() => {
    if (phase === 'idle') {
      setIdePostAnswerStep(0);
    }
  }, [phase]);

  React.useEffect(() => {
    if (phase === 'answered' && ideAnnotationsOn && isOpen) {
      setIdePostAnswerStep((prev) => (prev === 0 ? 1 : prev));
    }
  }, [phase, ideAnnotationsOn, isOpen]);

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
    [submitPrompt],
  );

  const kickOffIdeDemoPrompt = React.useCallback(() => {
    if (demoInjectedRef.current || phase !== 'idle') {
      return;
    }
    demoInjectedRef.current = true;
    setSentUserPrompt(DEMO_IDE_COPY_FAIL_USER_PROMPT);
    setDraft('');
    setPhase('thinking');
    setDemoComposerOutline(false);
    setIdeKickoffDone(true);
  }, [phase]);

  const onIdeAskChatNext = React.useCallback(() => {
    kickOffIdeDemoPrompt();
  }, [kickOffIdeDemoPrompt]);

  const onComposerFocusDemo = React.useCallback(() => {
    if (!demoComposerOutline || demoInjectedRef.current || phase !== 'idle') {
      return;
    }
    kickOffIdeDemoPrompt();
  }, [demoComposerOutline, phase, kickOffIdeDemoPrompt]);

  const onTroubleshootClick = React.useCallback(() => {
    openTroubleshootInHcc({ ideUserPrompt: sentUserPrompt ?? undefined });
    onClose();
  }, [openTroubleshootInHcc, onClose, sentUserPrompt]);

  /** Same pattern as article callouts: `DemoAnnotationCallout` disables Next after one use; keep handlers idempotent. */
  const onIdeReviewResponseNext = React.useCallback(() => {
    setIdePostAnswerStep((s) => {
      if (s >= 2) {
        return s;
      }
      const el = document.querySelector<HTMLElement>(ANCHOR_IDE_TROUBLESHOOT_HCC);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      return 2;
    });
  }, []);

  const onIdeJumpConsoleNext = React.useCallback(() => {
    setIdePostAnswerStep((s) => (s < 3 ? 3 : s));
  }, []);

  if (!isOpen) {
    return null;
  }

  const showConversation = phase !== 'idle';
  const composerDisabled = phase !== 'idle';

  const ideCalloutsPortal =
    ideAnnotationsOn && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="hcc-demo-annotations-layer hcc-demo-ide-annotations-layer--beside-composer"
            aria-label="Demo walkthrough hints"
          >
            <DemoAnnotationCallout
              visible={demoCalloutVisible}
              id="hcc-demo-ide-callout-chat"
              onNext={onIdeAskChatNext}
              nextCompletedExternally={ideKickoffDone}
            >
              {`Let's ask the chat "${DEMO_IDE_COPY_FAIL_USER_PROMPT}"`}
            </DemoAnnotationCallout>
            <DemoAnnotationCallout
              visible={phase === 'answered' && idePostAnswerStep >= 1}
              id="hcc-demo-ide-callout-response-review"
              onNext={onIdeReviewResponseNext}
            >
              {"Okay, let's look through this response"}
            </DemoAnnotationCallout>
            <DemoAnnotationCallout
              visible={phase === 'answered' && idePostAnswerStep >= 2}
              id="hcc-demo-ide-callout-jump-console"
              onNext={onIdeJumpConsoleNext}
            >
              {"Hmmm, okay let's go ahead and jump into the console"}
            </DemoAnnotationCallout>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {ideCalloutsPortal}
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
                        <button
                          type="button"
                          className="hcc-fake-ai-ide-fp__cta-primary"
                          data-demo-anchor="pcm-ide-troubleshoot-hcc"
                          onClick={onTroubleshootClick}
                        >
                          Troubleshoot in the Red Hat console
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
                data-demo-anchor="pcm-ide-composer-input"
                className="hcc-fake-ai-ide-fp__composer-input"
                placeholder="Plan, search, build anything…"
                rows={3}
                value={draft}
                disabled={composerDisabled}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onComposerKeyDown}
                onFocus={onComposerFocusDemo}
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
      <DemoClickIndicator
        visible={ideAnnotationsOn && demoComposerOutline && phase === 'idle'}
        anchorSelector={ANCHOR_COMPOSER_INPUT}
      />
      <DemoClickIndicator
        visible={ideAnnotationsOn && phase === 'answered' && idePostAnswerStep >= 3}
        anchorSelector={ANCHOR_IDE_TROUBLESHOOT_HCC}
      />
    </div>
    </>
  );
};

export { FakeAiIdeFullpage };
