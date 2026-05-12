/** Dispatched when the mock AI IDE opens — clear PCM article demo annotations. */
export const HCC_DEMO_PCM_ANNOTATIONS_CLEAR = 'hcc-demo-pcm-annotations-clear';

export type HccDemoPcmAnnotationsClearDetail = {
  reason: 'ide-opened';
};

/** Dispatched when `persistAnnotationsVisiblePreference` runs (same-tab + other listeners). */
export const HCC_DEMO_ANNOTATIONS_PREF_CHANGED = 'hcc-demo-annotations-pref-changed';

export type HccDemoAnnotationsPrefDetail = {
  visible: boolean;
};

/** User message injected on first focus of the mock IDE composer (demo). */
export const DEMO_IDE_COPY_FAIL_USER_PROMPT =
  'copy fail CVE is in the news. which of my systems are impacted?';

/** Console walkthrough: user advanced past the “YAML details” callout — Help chat may scroll to latest. */
export const HCC_DEMO_YAML_DETAILS_CALLOUT_NEXT = 'hcc-demo-yaml-details-callout-next';

/** Fired when the CVE-handoff support wizard main body is ready for demo annotations (after staged load). */
export const HCC_SUPPORT_WIZARD_BODY_READY = 'hcc-support-wizard-body-ready';
