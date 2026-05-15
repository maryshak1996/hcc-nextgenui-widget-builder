import * as React from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { DemoAnnotationCallout } from '@app/DemoAnnotations/DemoAnnotationCallout';
import { DemoGoalConnectionAnnotation, DemoGoalConnectionStack } from '@app/DemoAnnotations/DemoGoalConnectionAnnotation';
import { DemoClickIndicator } from '@app/DemoAnnotations/DemoClickIndicator';
import {
  HCC_DEMO_ANNOTATIONS_PREF_CHANGED,
  HCC_DEMO_YAML_DETAILS_CALLOUT_NEXT,
  type HccDemoAnnotationsPrefDetail,
} from '@app/DemoAnnotations/demoAnnotationEvents';
import '@app/DemoAnnotations/demoAnnotations.css';
import { readAnnotationsVisiblePreference } from '@app/DemoAnnotations/DemoAnnotationsViewToggle';
import { HCC_COPYFAIL_CVE_PATH } from '@app/RhelVulnerability/copyFailDemoFleet';
import type { TCveTroubleshootStep } from '@app/RhelVulnerability/CveTroubleshootDemoContext';
import { primeHelpChatMessageBarWithYes } from '@app/AppLayout/helpChatDemoDom';

const CALLOUT_DELAY_MS = 900;
const ANCHOR_HELP_MESSAGE_BAR = '[data-demo-anchor="pcm-help-chat-message-bar"]';

const PHASE_FLOW = [
  'follow',
  'remediate',
  'cue_yes_offer',
  'playbook_sure',
  'cue_yes_playbook',
  'yml_details',
  'safe_run_all',
  'cue_yes_run_all',
  'await_remediation_completion',
  'completion_nine_ten',
  'completion_ticket_awesome',
  'cue_yes_open_support',
] as const;

type TConsoleHandoffPhase = (typeof PHASE_FLOW)[number] | 'idle';

function phaseIndex(p: TConsoleHandoffPhase): number {
  if (p === 'idle') {
    return -1;
  }
  return PHASE_FLOW.indexOf(p as (typeof PHASE_FLOW)[number]);
}

function showSince(current: TConsoleHandoffPhase, since: (typeof PHASE_FLOW)[number]): boolean {
  if (current === 'idle') {
    return false;
  }
  return phaseIndex(current) >= phaseIndex(since);
}

type TPendingCue = null | 'offer' | 'playbook' | 'artifact' | 'open_support';

export interface ICveConsoleHandoffAnnotationsProps {
  ideHandoffActive: boolean;
  troubleshootStep: TCveTroubleshootStep | undefined;
  /** First remediation prompt fully visible (thinking beats finished on `remediation_offer`). */
  remediationOfferIntroComplete: boolean;
  remediationOfferBarReady: boolean;
  remediationPlaybooksBarReady: boolean;
  remediationArtifactBarReady: boolean;
  /** After first “yes”: remediation options card is on-screen (thinking beats finished). */
  remediationPlaybooksOptionsDisplayed: boolean;
  /** After second “yes”: YAML playbook artifact is on-screen (thinking beats finished). */
  remediationPlaybookYamlDisplayed: boolean;
  /** Remediation stats / outcome block is in chat (`awaiting_yes`, one host left); not delayed until support-case draft thinking finishes. */
  completionOutcomeReady: boolean;
  /** Message bar enabled for “yes” to open the support case wizard. */
  awaitingYesReviewBarReady: boolean;
  /** Agent has shown drafted support case + review CTA (after stats thinking beats). */
  supportCaseDraftOfferVisible: boolean;
  onSendAffirmativeYes: () => void;
}

/**
 * Post–IDE handoff walkthrough in the Help panel Chat tab (copy-fail CVE demo only).
 */
const CveConsoleHandoffAnnotations: React.FunctionComponent<ICveConsoleHandoffAnnotationsProps> = ({
  ideHandoffActive,
  troubleshootStep,
  remediationOfferIntroComplete,
  remediationOfferBarReady,
  remediationPlaybooksBarReady,
  remediationArtifactBarReady,
  remediationPlaybooksOptionsDisplayed,
  remediationPlaybookYamlDisplayed,
  completionOutcomeReady,
  awaitingYesReviewBarReady,
  supportCaseDraftOfferVisible,
  onSendAffirmativeYes,
}) => {
  const location = useLocation();
  const [annotationsOn, setAnnotationsOn] = React.useState(readAnnotationsVisiblePreference);
  const [phase, setPhase] = React.useState<TConsoleHandoffPhase>('idle');
  const [pendingCue, setPendingCue] = React.useState<TPendingCue>(null);

  React.useEffect(() => {
    const onPref = (e: Event) => {
      const d = (e as CustomEvent<HccDemoAnnotationsPrefDetail>).detail;
      setAnnotationsOn(d.visible);
    };
    window.addEventListener(HCC_DEMO_ANNOTATIONS_PREF_CHANGED, onPref);
    return () => window.removeEventListener(HCC_DEMO_ANNOTATIONS_PREF_CHANGED, onPref);
  }, []);

  const inScope =
    ideHandoffActive &&
    annotationsOn &&
    location.pathname === HCC_COPYFAIL_CVE_PATH &&
    troubleshootStep != null &&
    troubleshootStep !== 'inactive';

  React.useEffect(() => {
    if (!inScope) {
      setPhase('idle');
      setPendingCue(null);
    }
  }, [inScope]);

  /** User advanced the scripted CVE flow without the walkthrough — catch the transcript up. */
  React.useEffect(() => {
    if (!inScope || !troubleshootStep) {
      return;
    }
    if (troubleshootStep === 'remediation_playbooks_shown' && phaseIndex(phase) < phaseIndex('playbook_sure')) {
      setPhase('playbook_sure');
      setPendingCue(null);
    }
    if (troubleshootStep === 'remediation_playbook_artifact_shown' && phaseIndex(phase) < phaseIndex('yml_details')) {
      setPhase('yml_details');
      setPendingCue(null);
    }
    if (
      troubleshootStep === 'awaiting_yes' &&
      completionOutcomeReady &&
      phaseIndex(phase) < phaseIndex('completion_nine_ten')
    ) {
      setPhase('completion_nine_ten');
      setPendingCue(null);
    }
  }, [inScope, troubleshootStep, phase, completionOutcomeReady]);

  /** After third “yes”, move off the message cue while remediation finishes. */
  React.useEffect(() => {
    if (!inScope) {
      return;
    }
    if (phase === 'cue_yes_run_all') {
      if (troubleshootStep === 'remediation_simulating' || troubleshootStep === 'awaiting_yes') {
        setPhase('await_remediation_completion');
        setPendingCue(null);
      }
    }
  }, [inScope, phase, troubleshootStep]);

  React.useEffect(() => {
    if (!inScope || phase !== 'await_remediation_completion') {
      return;
    }
    if (troubleshootStep === 'awaiting_yes' && completionOutcomeReady) {
      setPhase('completion_nine_ten');
    }
  }, [inScope, phase, troubleshootStep, completionOutcomeReady]);

  React.useEffect(() => {
    if (!inScope || phase !== 'idle') {
      return undefined;
    }
    const t = window.setTimeout(() => {
      setPhase('follow');
    }, CALLOUT_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [inScope, phase]);

  React.useEffect(() => {
    if (phase !== 'remediate' || pendingCue !== 'offer') {
      return undefined;
    }
    if (!remediationOfferBarReady) {
      return undefined;
    }
    setPhase('cue_yes_offer');
    setPendingCue(null);
    return undefined;
  }, [phase, pendingCue, remediationOfferBarReady]);

  React.useEffect(() => {
    if (phase !== 'playbook_sure' || pendingCue !== 'playbook') {
      return undefined;
    }
    if (!remediationPlaybooksBarReady) {
      return undefined;
    }
    setPhase('cue_yes_playbook');
    setPendingCue(null);
    return undefined;
  }, [phase, pendingCue, remediationPlaybooksBarReady]);

  React.useEffect(() => {
    if (phase !== 'safe_run_all' || pendingCue !== 'artifact') {
      return undefined;
    }
    if (!remediationArtifactBarReady) {
      return undefined;
    }
    setPhase('cue_yes_run_all');
    setPendingCue(null);
    return undefined;
  }, [phase, pendingCue, remediationArtifactBarReady]);

  React.useEffect(() => {
    if (phase !== 'completion_ticket_awesome' || pendingCue !== 'open_support') {
      return undefined;
    }
    if (!awaitingYesReviewBarReady) {
      return undefined;
    }
    setPhase('cue_yes_open_support');
    setPendingCue(null);
    return undefined;
  }, [phase, pendingCue, awaitingYesReviewBarReady]);

  const onFollowNext = React.useCallback(() => {
    setPhase('remediate');
  }, []);

  const onRemediateNext = React.useCallback(() => {
    if (remediationOfferBarReady) {
      setPhase('cue_yes_offer');
    } else {
      setPendingCue('offer');
    }
  }, [remediationOfferBarReady]);

  const onPlaybookSureNext = React.useCallback(() => {
    if (remediationPlaybooksBarReady) {
      setPhase('cue_yes_playbook');
    } else {
      setPendingCue('playbook');
    }
  }, [remediationPlaybooksBarReady]);

  const onYmlDetailsNext = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent(HCC_DEMO_YAML_DETAILS_CALLOUT_NEXT));
    setPhase('safe_run_all');
  }, []);

  const onSafeRunAllNext = React.useCallback(() => {
    if (remediationArtifactBarReady) {
      setPhase('cue_yes_run_all');
    } else {
      setPendingCue('artifact');
    }
  }, [remediationArtifactBarReady]);

  const onCompletionNineTenNext = React.useCallback(() => {
    setPhase('completion_ticket_awesome');
  }, []);

  const onCompletionTicketAwesomeNext = React.useCallback(() => {
    if (awaitingYesReviewBarReady) {
      setPhase('cue_yes_open_support');
    } else {
      setPendingCue('open_support');
    }
  }, [awaitingYesReviewBarReady]);

  const onClickAffirmativeBar = React.useCallback(() => {
    if (
      phase !== 'cue_yes_offer' &&
      phase !== 'cue_yes_playbook' &&
      phase !== 'cue_yes_run_all' &&
      phase !== 'cue_yes_open_support'
    ) {
      return;
    }
    primeHelpChatMessageBarWithYes();
    window.requestAnimationFrame(() => {
      onSendAffirmativeYes();
    });
  }, [phase, onSendAffirmativeYes]);

  const showGoalZeroContextLoss = inScope;

  const showGoalProactiveTroubleshoot =
    inScope &&
    ((troubleshootStep === 'remediation_offer' && remediationOfferIntroComplete) ||
      troubleshootStep === 'remediation_playbooks_shown' ||
      troubleshootStep === 'remediation_playbook_artifact_shown' ||
      troubleshootStep === 'remediation_simulating' ||
      troubleshootStep === 'awaiting_yes' ||
      troubleshootStep === 'support_case_flow');

  const showGoalFindItFixIt =
    inScope &&
    ((troubleshootStep === 'remediation_playbooks_shown' && remediationPlaybooksOptionsDisplayed) ||
      troubleshootStep === 'remediation_playbook_artifact_shown' ||
      troubleshootStep === 'remediation_simulating' ||
      troubleshootStep === 'awaiting_yes' ||
      troubleshootStep === 'support_case_flow');

  const showGoalWorldClassSupport =
    inScope &&
    (supportCaseDraftOfferVisible || troubleshootStep === 'support_case_flow');

  const goalsPortal =
    inScope && typeof document !== 'undefined'
      ? createPortal(
          <DemoGoalConnectionStack aria-label="UIE goal connections (CVE console)">
            <DemoGoalConnectionAnnotation
              visible={showGoalZeroContextLoss}
              id="hcc-demo-cve-goal-zero-context-loss"
              inStack
            >
              Zero context loss: The conversation follows the user across their workflow.
            </DemoGoalConnectionAnnotation>
            <DemoGoalConnectionAnnotation
              visible={showGoalProactiveTroubleshoot}
              id="hcc-demo-cve-goal-proactive-troubleshoot"
              inStack
            >
              <>
                <p className="hcc-demo-goal-connection__p">
                  Proactive troubleshooting defers support case creation by immediately mitigating the common support
                  case ask, &ldquo;Am I impacted by this?&rdquo;.
                </p>
                <p className="hcc-demo-goal-connection__p">
                  Red Hat gives the customer confidence in a fearful situation.
                </p>
              </>
            </DemoGoalConnectionAnnotation>
            <DemoGoalConnectionAnnotation
              visible={showGoalFindItFixIt}
              id="hcc-demo-cve-goal-find-it-fix-it"
              inStack
            >
              Find it, fix it. Red Hat&apos;s agents can identify the problem and fix it with less friction and context
              switching. Customers have one place to learn about a problem and solve it.
            </DemoGoalConnectionAnnotation>
            <DemoGoalConnectionAnnotation
              visible={showGoalWorldClassSupport}
              id="hcc-demo-cve-goal-world-class-support"
              inStack
            >
              When there&apos;s a problem that the AI can&apos;t solve, we provide world-class support with all the
              context included.
            </DemoGoalConnectionAnnotation>
          </DemoGoalConnectionStack>,
          document.body,
        )
      : null;

  if ((!inScope || phase === 'idle') && !goalsPortal) {
    return null;
  }

  const clickCueVisible =
    phase === 'cue_yes_offer' ||
    phase === 'cue_yes_playbook' ||
    phase === 'cue_yes_run_all' ||
    phase === 'cue_yes_open_support';

  const playbookSureCalloutVisible =
    showSince(phase, 'playbook_sure') && remediationPlaybooksOptionsDisplayed;
  const ymlDetailsCalloutVisible = showSince(phase, 'yml_details') && remediationPlaybookYamlDisplayed;

  const calloutsPortal =
    inScope && phase !== 'idle' && typeof document !== 'undefined'
      ? createPortal(
          <>
            <div
              className="hcc-demo-annotations-layer hcc-demo-annotations-layer--help-chat-left"
              aria-label="Red Hat console demo hints"
            >
              <DemoAnnotationCallout
                visible={showSince(phase, 'follow')}
                id="hcc-demo-console-callout-follow"
                onNext={phase === 'follow' ? onFollowNext : undefined}
              >
                Great. It looks like my conversation is following me here.
              </DemoAnnotationCallout>
              <DemoAnnotationCallout
                visible={showSince(phase, 'remediate')}
                id="hcc-demo-console-callout-remediate"
                onNext={phase === 'remediate' ? onRemediateNext : undefined}
              >
                It says it can help me remediate the systems. Let&apos;s give it a shot.
              </DemoAnnotationCallout>
              <DemoAnnotationCallout
                visible={playbookSureCalloutVisible}
                id="hcc-demo-console-callout-playbook-sure"
                onNext={phase === 'playbook_sure' ? onPlaybookSureNext : undefined}
              >
                Sure. Let&apos;s take a look at the playbook.
              </DemoAnnotationCallout>
              <DemoAnnotationCallout
                visible={ymlDetailsCalloutVisible}
                id="hcc-demo-console-callout-yml-details"
                onNext={phase === 'yml_details' ? onYmlDetailsNext : undefined}
              >
                Let&apos;s look at the details in this YAML file.
              </DemoAnnotationCallout>
              <DemoAnnotationCallout
                visible={showSince(phase, 'safe_run_all')}
                id="hcc-demo-console-callout-safe-run"
                onNext={phase === 'safe_run_all' ? onSafeRunAllNext : undefined}
              >
                This seems safe to run on all my systems.
              </DemoAnnotationCallout>
              <DemoAnnotationCallout
                visible={showSince(phase, 'completion_nine_ten')}
                id="hcc-demo-console-callout-completion-stats"
                onNext={phase === 'completion_nine_ten' ? onCompletionNineTenNext : undefined}
              >
                Alright. It looks like nine out of ten systems were remediated, and the other one had a Pod
                CrashLoopBackOff situation.
              </DemoAnnotationCallout>
              <DemoAnnotationCallout
                visible={showSince(phase, 'completion_ticket_awesome')}
                id="hcc-demo-console-callout-completion-ticket"
                onNext={phase === 'completion_ticket_awesome' ? onCompletionTicketAwesomeNext : undefined}
              >
                It looks like all these details have already been put in a support ticket for me. Awesome. Let&apos;s
                see it.
              </DemoAnnotationCallout>
            </div>
            <DemoClickIndicator
              visible={clickCueVisible}
              anchorSelector={ANCHOR_HELP_MESSAGE_BAR}
              onActivate={onClickAffirmativeBar}
            />
          </>,
          document.body,
        )
      : null;

  if (!goalsPortal && !calloutsPortal) {
    return null;
  }

  return (
    <>
      {goalsPortal}
      {calloutsPortal}
    </>
  );
};

export { CveConsoleHandoffAnnotations };
