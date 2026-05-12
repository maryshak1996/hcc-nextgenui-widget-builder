import * as React from 'react';
import { createPortal } from 'react-dom';
import { BrainIcon, CubesIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
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
import { REDHAT_ACCESS_COPYFAIL_CVE_URL } from '@app/RhelVulnerability/copyFailDemoFleet';
import { CopyFailIdeAssistantReplyBody } from '@app/RhelVulnerability/copyFailIdeAssistantReply';

export interface IFakeAiIdeFullpageProps {
  isOpen: boolean;
  onClose: () => void;
}

const THINKING_DELAY_MS = 1100;

const ANCHOR_COMPOSER_INPUT = '[data-demo-anchor="pcm-ide-composer-input"]';
const ANCHOR_IDE_TROUBLESHOOT_HCC = '[data-demo-anchor="pcm-ide-troubleshoot-hcc"]';

const CALLOUT_DELAY_MS = 1000;
/** Delay after the “ask the chat” callout appears before highlighting the composer (was ~1200ms after first callout in single-step flow). */
const COMPOSER_OUTLINE_AFTER_CHAT_CALLOUT_MS = 1200;

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
  const ideComposerChatRef = React.useRef<HTMLDivElement>(null);
  const composerRef = React.useRef<HTMLTextAreaElement>(null);
  const demoInjectedRef = React.useRef(false);
  const { openTroubleshootInHcc } = usePcmBrowser();

  const [draft, setDraft] = React.useState('');
  const [sentUserPrompt, setSentUserPrompt] = React.useState<string | null>(null);
  const [phase, setPhase] = React.useState<TComposerPhase>('idle');

  const [ideAnnotationsOn, setIdeAnnotationsOn] = React.useState(readAnnotationsVisiblePreference);
  /** MCP / skill preamble callout: once revealed, stays mounted so it stacks with later hints. */
  const [ideMcpSkillCalloutShown, setIdeMcpSkillCalloutShown] = React.useState(false);
  /** User dismissed the MCP preamble; enables “Let’s ask the chat…” + composer outline timer. */
  const [ideSetupCalloutDone, setIdeSetupCalloutDone] = React.useState(false);
  const [demoComposerOutline, setDemoComposerOutline] = React.useState(false);
  const [idePostAnswerStep, setIdePostAnswerStep] = React.useState<TIdePostAnswerStep>(0);
  /** Composer demo prompt sent (via Next or focusing the outlined composer). */
  const [ideKickoffDone, setIdeKickoffDone] = React.useState(false);
  /** After assistant reply mounts, scroll once so the top of the answer is visible (not the CTAs). */
  const ideAssistantIntroScrollDoneRef = React.useRef(false);

  React.useEffect(() => {
    if (phase !== 'answered') {
      ideAssistantIntroScrollDoneRef.current = false;
    }
  }, [phase]);

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
      setIdeMcpSkillCalloutShown(false);
      setIdeSetupCalloutDone(false);
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
    setIdeMcpSkillCalloutShown(false);
    setIdeSetupCalloutDone(false);
    const tSetup = window.setTimeout(() => setIdeMcpSkillCalloutShown(true), CALLOUT_DELAY_MS);
    return () => {
      window.clearTimeout(tSetup);
    };
  }, [isOpen, ideAnnotationsOn]);

  React.useEffect(() => {
    if (!isOpen || !ideAnnotationsOn || !ideSetupCalloutDone) {
      return undefined;
    }
    const tOutline = window.setTimeout(() => setDemoComposerOutline(true), COMPOSER_OUTLINE_AFTER_CHAT_CALLOUT_MS);
    return () => {
      window.clearTimeout(tOutline);
    };
  }, [isOpen, ideAnnotationsOn, ideSetupCalloutDone]);

  React.useEffect(() => {
    if (!ideAnnotationsOn) {
      setIdeMcpSkillCalloutShown(false);
      setIdeSetupCalloutDone(false);
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

  const onIdeSetupPreambleNext = React.useCallback(() => {
    setIdeSetupCalloutDone(true);
  }, []);

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
    setIdePostAnswerStep((s) => (s >= 2 ? s : 2));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const chat = ideComposerChatRef.current;
        if (chat) {
          chat.scrollTop = chat.scrollHeight;
        }
      });
    });
  }, []);

  const onIdeJumpConsoleNext = React.useCallback(() => {
    setIdePostAnswerStep((s) => (s < 3 ? 3 : s));
  }, []);

  /** First layout after assistant message mounts: keep the start of the reply in view (do not jump to CTAs yet). */
  React.useLayoutEffect(() => {
    if (!isOpen || phase !== 'answered' || ideAssistantIntroScrollDoneRef.current) {
      return;
    }
    const chat = ideComposerChatRef.current;
    const aiMsg = chat?.querySelector<HTMLElement>('.hcc-fake-ai-ide-fp__msg--ai');
    if (!chat || !aiMsg) {
      return;
    }
    ideAssistantIntroScrollDoneRef.current = true;
    const chatRect = chat.getBoundingClientRect();
    const msgRect = aiMsg.getBoundingClientRect();
    const nextTop = msgRect.top - chatRect.top + chat.scrollTop;
    chat.scrollTop = Math.max(0, nextTop - 4);
  }, [isOpen, phase]);

  if (!isOpen) {
    return null;
  }

  const showConversation = phase !== 'idle';
  const composerDisabled = phase !== 'idle';

  const ideAskChatCalloutVisible = ideSetupCalloutDone;

  const ideCalloutsPortal =
    ideAnnotationsOn && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="hcc-demo-annotations-layer hcc-demo-ide-annotations-layer--beside-composer"
            aria-label="Demo walkthrough hints"
          >
            <DemoAnnotationCallout
              visible={ideMcpSkillCalloutShown}
              id="hcc-demo-ide-callout-mcp-skill-setup"
              onNext={onIdeSetupPreambleNext}
              nextCompletedExternally={ideSetupCalloutDone}
            >
              {
                "I added the Red Hat MCP servers and I've built a skill telling the IDE to treat the Red Hat security data base as the source of truth"
              }
            </DemoAnnotationCallout>
            <DemoAnnotationCallout
              visible={ideAskChatCalloutVisible}
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
              nextCompletedExternally={idePostAnswerStep >= 2}
            >
              {"Okay, let's look through this response"}
            </DemoAnnotationCallout>
            <DemoAnnotationCallout
              visible={phase === 'answered' && idePostAnswerStep >= 2}
              id="hcc-demo-ide-callout-jump-console"
              onNext={onIdeJumpConsoleNext}
              nextCompletedExternally={idePostAnswerStep >= 3}
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
          AI IDE — Workspace
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

        <aside className="hcc-fake-ai-ide-fp__sidebar" aria-label="Explorer, skills, and MCP servers">
          <div className="hcc-fake-ai-ide-fp__sidebar-block">
            <div className="hcc-fake-ai-ide-fp__sidebar-head">EXPLORER</div>
            <div className="hcc-fake-ai-ide-fp__tree">
              <div className="hcc-fake-ai-ide-fp__tree-row">📁 src</div>
              <div className="hcc-fake-ai-ide-fp__tree-row hcc-fake-ai-ide-fp__tree-row--nested hcc-fake-ai-ide-fp__tree-row--active">
                main.py
              </div>
              <div className="hcc-fake-ai-ide-fp__tree-row hcc-fake-ai-ide-fp__tree-row--nested">config.yaml</div>
              <div className="hcc-fake-ai-ide-fp__tree-row">📁 deploy</div>
              <div className="hcc-fake-ai-ide-fp__tree-row hcc-fake-ai-ide-fp__tree-row--nested">Containerfile</div>
            </div>
          </div>
          <div className="hcc-fake-ai-ide-fp__sidebar-block hcc-fake-ai-ide-fp__sidebar-block--stacked">
            <div className="hcc-fake-ai-ide-fp__sidebar-head">SKILLS</div>
            <ul className="hcc-fake-ai-ide-fp__skills-list">
              <li className="hcc-fake-ai-ide-fp__skills-item">Errata as truth</li>
            </ul>
          </div>
          <div className="hcc-fake-ai-ide-fp__sidebar-block hcc-fake-ai-ide-fp__sidebar-block--stacked">
            <div className="hcc-fake-ai-ide-fp__sidebar-head">MCP SERVERS</div>
            <ul className="hcc-fake-ai-ide-fp__mcp-list">
              <li className="hcc-fake-ai-ide-fp__mcp-item">
                <span className="hcc-fake-ai-ide-fp__mcp-status" aria-label="Connected" title="Connected" />
                <span>Red Hat CVE</span>
              </li>
              <li className="hcc-fake-ai-ide-fp__mcp-item">
                <span className="hcc-fake-ai-ide-fp__mcp-status" aria-label="Connected" title="Connected" />
                <span>Red Hat Lightspeed</span>
              </li>
            </ul>
          </div>
        </aside>

        <div className="hcc-fake-ai-ide-fp__editor-col">
          <div className="hcc-fake-ai-ide-fp__tabs">
            <div className="hcc-fake-ai-ide-fp__tab hcc-fake-ai-ide-fp__tab--active">
              main.py
              <span className="hcc-fake-ai-ide-fp__tab-x" aria-hidden="true">
                ×
              </span>
            </div>
          </div>
          <div className="hcc-fake-ai-ide-fp__editor">
            <pre className="hcc-fake-ai-ide-fp__pre">
              <code>{`from rhel_config import deploy

def build_container():
    # Build and push to registry
    deploy.build("Containerfile")
`}</code>
            </pre>
          </div>
        </div>

        <aside className="hcc-fake-ai-ide-fp__composer" aria-label="AI Composer">
          <div className="hcc-fake-ai-ide-fp__composer-head">
            <span className="hcc-fake-ai-ide-fp__composer-title-row">
              <CubesIcon className="hcc-fake-ai-ide-fp__composer-title-icon" aria-hidden />
              <span className="hcc-fake-ai-ide-fp__composer-title">AI Assistant</span>
            </span>
          </div>
          <div className="hcc-fake-ai-ide-fp__composer-body">
            <div
              ref={ideComposerChatRef}
              className="hcc-fake-ai-ide-fp__chat"
              aria-live={showConversation ? 'polite' : undefined}
            >
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
                        <div className="hcc-fake-ai-ide-fp__cta-actions">
                          <button
                            type="button"
                            className="hcc-fake-ai-ide-fp__cta-primary"
                            data-demo-anchor="pcm-ide-troubleshoot-hcc"
                            onClick={onTroubleshootClick}
                          >
                            Troubleshoot in the Red Hat console
                          </button>
                          <a
                            className="hcc-fake-ai-ide-fp__cta-secondary"
                            href={REDHAT_ACCESS_COPYFAIL_CVE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span className="hcc-fake-ai-ide-fp__cta-secondary-inner">
                              View security details
                              <ExternalLinkAltIcon
                                className="hcc-fake-ai-ide-fp__cta-secondary-icon"
                                aria-hidden
                              />
                            </span>
                          </a>
                        </div>
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
