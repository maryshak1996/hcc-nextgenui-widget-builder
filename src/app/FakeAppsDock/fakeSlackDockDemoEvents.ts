/** When support case chat reaches the submitted success screen, dock demo arms a delayed Slack notification. */
export const HCC_FAKE_SLACK_DM_DEMO_ARM = 'hcc-fake-slack-dm-demo-arm';

export type HccFakeSlackDmDemoArmDetail = {
  caseNumber: string;
};

/** Dock Slack icon clicked — open DM when a support-case demo notification is available. */
export const HCC_FAKE_SLACK_DM_DOCK_ACTIVATE = 'hcc-fake-slack-dm-dock-activate';
