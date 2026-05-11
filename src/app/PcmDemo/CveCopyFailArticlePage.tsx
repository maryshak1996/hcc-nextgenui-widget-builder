import * as React from 'react';
import { createPortal } from 'react-dom';
import { DemoAnnotationCallout } from '@app/DemoAnnotations/DemoAnnotationCallout';
import {
  HCC_DEMO_PCM_ANNOTATIONS_CLEAR,
  type HccDemoPcmAnnotationsClearDetail,
} from '@app/DemoAnnotations/demoAnnotationEvents';
import {
  DemoAnnotationsViewToggle,
  persistAnnotationsVisiblePreference,
  readAnnotationsVisiblePreference,
} from '@app/DemoAnnotations/DemoAnnotationsViewToggle';
import { DemoClickIndicator } from '@app/DemoAnnotations/DemoClickIndicator';
import '@app/DemoAnnotations/demoAnnotations.css';

const DOC_TITLE =
  'Emergency: “Copy fail” CVE shakes Linux ecosystem — TechPulse Daily';

const ANCHOR_AI_IDE_DOCK = '[data-demo-anchor="pcm-ai-ide-dock"]';

/** PCM vision demo: TechPulse article body only — fake browser chrome comes from `PcmDemoDesktopShell`. */
const CveCopyFailArticlePage: React.FunctionComponent = () => {
  const [showCalloutImpacted, setShowCalloutImpacted] = React.useState(false);
  const [showCalloutAgent, setShowCalloutAgent] = React.useState(false);
  const [showClickOutline, setShowClickOutline] = React.useState(false);
  const [annotationsOn, setAnnotationsOn] = React.useState(readAnnotationsVisiblePreference);

  const clearAllAnnotations = React.useCallback(() => {
    setShowCalloutImpacted(false);
    setShowCalloutAgent(false);
    setShowClickOutline(false);
  }, []);

  const activateIdeDock = React.useCallback(() => {
    document.querySelector<HTMLButtonElement>(ANCHOR_AI_IDE_DOCK)?.click();
  }, []);

  const handleToggleAnnotations = React.useCallback(() => {
    setAnnotationsOn((prev) => {
      const next = !prev;
      persistAnnotationsVisiblePreference(next);
      return next;
    });
  }, []);

  React.useEffect(() => {
    const previous = document.title;
    document.title = DOC_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  React.useEffect(() => {
    const t = window.setTimeout(() => setShowCalloutImpacted(true), 1000);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    const onClear = (e: Event) => {
      const ce = e as CustomEvent<HccDemoPcmAnnotationsClearDetail>;
      if (ce.detail?.reason === 'ide-opened') {
        clearAllAnnotations();
      }
    };
    window.addEventListener(HCC_DEMO_PCM_ANNOTATIONS_CLEAR, onClear);
    return () => window.removeEventListener(HCC_DEMO_PCM_ANNOTATIONS_CLEAR, onClear);
  }, [clearAllAnnotations]);

  const articleAnnotationsPortal =
    annotationsOn && typeof document !== 'undefined'
      ? createPortal(
          <div
            className="hcc-demo-annotations-layer hcc-demo-annotations-layer--article-viewport"
            aria-label="Demo walkthrough hints"
          >
            <DemoAnnotationCallout
              visible={showCalloutImpacted}
              id="hcc-demo-callout-impacted"
              onNext={() => setShowCalloutAgent(true)}
            >
              Oh no, the copy fail CVE AGAIN? I better go check which of my RHEL systems are impacted.
            </DemoAnnotationCallout>
            <DemoAnnotationCallout
              visible={showCalloutAgent}
              id="hcc-demo-callout-agent"
              onNext={() => setShowClickOutline(true)}
            >
              {"Let's ask my Red Hat agent what's going on"}
            </DemoAnnotationCallout>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="hcc-cve-copy-fail-root" role="main" aria-label="TechPulse Daily article (demo)">
      {articleAnnotationsPortal}
      <DemoClickIndicator
        visible={annotationsOn && showClickOutline}
        anchorSelector={ANCHOR_AI_IDE_DOCK}
        outlinePaddingPx={22}
        onActivate={activateIdeDock}
        activateAriaLabel="Open the mock AI IDE (demo)"
      />
      <DemoAnnotationsViewToggle
        annotationsOn={annotationsOn}
        onToggle={handleToggleAnnotations}
      />
      <div className="hcc-cve-copy-fail-article">
        <header className="masthead">
          <div className="masthead-inner">
            <div className="masthead-tag">Technology · Security</div>
            <p className="masthead-title">TechPulse Daily</p>
          </div>
        </header>
        <article>
          <p className="kicker">Breaking</p>
          <h1>
            Researchers warn of dangerous “Copy fail” vulnerability with mass impact across Linux systems
          </h1>
          <p className="byline">
            By Jordan Ellis · <time dateTime="2026-05-08">May 8, 2026</time> · 6 min read
          </p>
          <p className="lead">
            A newly disclosed flaw—internally nicknamed <strong>“Copy fail”</strong>—has security teams racing to
            patch fleets before widespread exploitation, according to early coordination bulletins shared with
            TechPulse Daily.
          </p>
          <div className="alert-box">
            <strong>⚠ Advisory</strong>
            Industry analysts describe “Copy fail” as a high-risk defect affecting core copy paths on numerous Linux
            distributions. Administrators are urged to treat this as a priority patch cycle and to validate backups
            before applying emergency fixes.
          </div>
          <p>
            The issue is understood to arise when trusted utilities mishandle buffer boundaries during routine file
            and pipeline copies under specific race conditions. What begins as a silent truncation or duplication error
            can, in the worst cases, yield privilege escalation or unsafe overwrite of critical configuration—making
            the bug unusually damaging at scale on servers, containers, and embedded Linux appliances.
          </p>
          <p>
            “This isn’t a niche corner case,” said Dr. Amara Okonkwo, a principal researcher cited in the draft
            advisory. “The same code paths are exercised constantly—CI runners, package mirrors, orchestration nodes.
            That’s why we’re talking about <em>mass impact</em> on Linux, not a single vendor bug.”
          </p>
          <p>
            Major distributions have acknowledged receipt of embargoed details; emergency updates are expected to roll
            out in overlapping waves. Until patches land, experts recommend minimizing privileged copy operations,
            enforcing strict integrity monitoring on critical paths, and assuming lateral movement risk on shared
            infrastructure.
          </p>
          <p>
            TechPulse will continue to track vendor bulletins and upstream coordination under the tracking label{' '}
            <span className="cve-id">CVE-PENDING-COPYFAIL</span>. Readers should verify guidance from their OS vendor
            and security teams rather than relying on third‑party summaries alone.
          </p>
          <footer>
            <p>
              <em>TechPulse Daily</em> is a fictional publication for demonstration purposes. “Copy fail” and this
              article are not affiliated with any real CVE or vendor advisory.
            </p>
          </footer>
        </article>
      </div>
    </div>
  );
};

export { CveCopyFailArticlePage };
