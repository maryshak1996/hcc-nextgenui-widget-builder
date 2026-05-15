import * as React from 'react';
import type { TSupportCaseThirdPartyChatTool } from '@app/Support/supportCaseDraftConstants';

const iconBoxStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

/** Compact Slack mark (brand colors — demo UI only). */
export const SlackMenuIcon: React.FunctionComponent<{ size?: number }> = ({ size = 18 }) => (
  <span style={iconBoxStyle} aria-hidden>
    <svg width={size} height={size} viewBox="0 0 122.8 122.8" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#E01E5A"
        d="M25.8 77.6c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2z"
      />
      <path
        fill="#36C5F0"
        d="M48.2 77.6c7.3 0 13.2-5.9 13.2-13.2s-5.9-13.2-13.2-13.2H32.4v13.2c0 7.3 5.9 13.2 13.2 13.2z"
      />
      <path
        fill="#2EB67D"
        d="M48.2 32.4c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v13.2H48.2c-7.3 0-13.2-5.9-13.2-13.2z"
      />
      <path
        fill="#ECB22E"
        d="M93.4 45.6c7.3 0 13.2-5.9 13.2-13.2s-5.9-13.2-13.2-13.2-13.2 5.9-13.2 13.2v13.2h13.2z"
      />
      <path
        fill="#E01E5A"
        d="M93.4 77.6c0-7.3 5.9-13.2 13.2-13.2h13.2c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H93.4V77.6z"
      />
      <path
        fill="#36C5F0"
        d="M77.6 93.4c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V93.4h13.2z"
      />
      <path
        fill="#2EB67D"
        d="M45.6 93.4c-7.3 0-13.2 5.9-13.2 13.2s5.9 13.2 13.2 13.2 13.2-5.9 13.2-13.2V93.4H45.6z"
      />
      <path
        fill="#ECB22E"
        d="M32.4 77.6c0-7.3-5.9-13.2-13.2-13.2s-13.2 5.9-13.2 13.2 5.9 13.2 13.2 13.2h13.2V77.6H32.4z"
      />
    </svg>
  </span>
);

/** Google Chat–style mark (multi-color bubble — demo UI only). */
export const GoogleChatMenuIcon: React.FunctionComponent<{ size?: number }> = ({ size = 18 }) => (
  <span style={iconBoxStyle} aria-hidden>
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#00AC47"
        d="M12 2C6.5 2 2 5.8 2 10.5c0 2.1.9 4 2.4 5.5L2 22l6.4-1.7c1.3.7 2.8 1.1 4.3 1.2h.3c5.5 0 10-3.8 10-8.5S17.5 2 12 2z"
      />
      <path fill="#5BB974" d="M12 5.75c3.45 0 6.25 2.24 6.25 5s-2.8 5-6.25 5c-.58 0-1.14-.07-1.68-.2L7 17l.85-3.05A5.05 5.05 0 015.75 10.75c0-2.76 2.8-5 6.25-5z" />
      <circle cx="9" cy="10.75" r="1.15" fill="#fff" />
      <circle cx="12" cy="10.75" r="1.15" fill="#fff" />
      <circle cx="15" cy="10.75" r="1.15" fill="#fff" />
    </svg>
  </span>
);

/** Microsoft Teams mark (demo UI only). */
export const MicrosoftTeamsMenuIcon: React.FunctionComponent<{ size?: number }> = ({ size = 18 }) => (
  <span style={iconBoxStyle} aria-hidden>
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#5059C9" d="M17.2 8.5c1.7 0 3.1 1.3 3.2 3v5.4c0 1.7-1.4 3.1-3.1 3.1h-5.3c-1.7 0-3.1-1.4-3.1-3.1V11.5l.1-.4c.4-1.4 1.6-2.5 3.1-2.6h2.1z" />
      <path fill="#7B83EB" d="M11.9 3.3c1.3 0 2.4 1 2.5 2.3v.2c0 1.4-1.1 2.5-2.5 2.5H8.3V5.8c0-1.4 1.1-2.5 2.5-2.5h1.1z" />
      <path
        fill="#fff"
        d="M6.4 11.2h5.6v7.2H5.2c-.7 0-1.2-.5-1.2-1.2v-4.6c0-1 1-1.4 2.4-1.4z"
      />
      <path fill="#4B53BC" d="M8.7 12.8h2.5v4.5H7.8v-3.3c0-.7.4-1.2 1-1.2z" />
    </svg>
  </span>
);

export const THIRD_PARTY_TOOL_MENU_ICONS: Record<TSupportCaseThirdPartyChatTool, React.ReactNode> = {
  slack: <SlackMenuIcon />,
  gchat: <GoogleChatMenuIcon />,
  teams: <MicrosoftTeamsMenuIcon />,
};
