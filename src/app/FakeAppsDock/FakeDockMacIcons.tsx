import * as React from 'react';

/**
 * Demo-only macOS-inspired dock tiles (squircle app icons). Not official brand assets.
 * Used by `FakeAppsDock` for a more lifelike desktop chrome pass.
 */

const TILE_RX = 11;

function gradientSuffix(reactId: string, prefix: string): string {
  return `${reactId.replace(/:/g, '')}${prefix}`;
}

/** Finder-style blue tile with a simple “happy face” mark. */
export const DockIconFinder: React.FunctionComponent = () => {
  const rid = React.useId();
  const gid = gradientSuffix(rid, 'finder');
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${gid}-g`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5EB8FF" />
          <stop offset="100%" stopColor="#0A84FF" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={TILE_RX} fill={`url(#${gid}-g)`} />
      <circle cx="18" cy="21" r="2.25" fill="#fff" opacity="0.95" />
      <circle cx="30" cy="21" r="2.25" fill="#fff" opacity="0.95" />
      <path
        d="M17 28.5c1.8 2.4 4.4 3.6 7 3.6s5.2-1.2 7-3.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.92"
      />
    </svg>
  );
};

/** Colorful browser tile (demo “Chrome”) — radial brand colors, not an official asset. */
export const DockIconChrome: React.FunctionComponent = () => {
  const rid = React.useId();
  const gid = gradientSuffix(rid, 'chrome');
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${gid}-c`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EA4335" />
          <stop offset="33%" stopColor="#FBBC04" />
          <stop offset="66%" stopColor="#34A853" />
          <stop offset="100%" stopColor="#4285F4" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={TILE_RX} fill={`url(#${gid}-c)`} />
      <circle cx="24" cy="24" r="9" fill="#fff" opacity="0.98" />
      <circle cx="24" cy="24" r="6" fill="#4285F4" />
    </svg>
  );
};

/** Messages-style green tile with speech bubbles. */
export const DockIconMessages: React.FunctionComponent = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
    <rect width="48" height="48" rx={TILE_RX} fill="#34C759" />
    <path
      d="M14 16h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H19l-4 4v-4h-1a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3z"
      fill="#fff"
      opacity="0.95"
    />
    <path
      d="M22 22h12a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5h-2l-3 3v-3h-7a2.5 2.5 0 0 1-2.5-2.5V22z"
      fill="#d8ffe4"
      opacity="0.95"
    />
  </svg>
);

/** Mail-style blue tile with envelope. */
export const DockIconMail: React.FunctionComponent = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
    <rect width="48" height="48" rx={TILE_RX} fill="#007AFF" />
    <path
      d="M14 19h20c.6 0 1 .4 1 1v10c0 .6-.4 1-1 1H14c-.6 0-1-.4-1-1V20c0-.6.4-1 1-1z"
      fill="none"
      stroke="#fff"
      strokeWidth="1.8"
      opacity="0.95"
    />
    <path d="M14 19l10 7 10-7" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
  </svg>
);

/** Notes-style yellow paper. */
export const DockIconNotes: React.FunctionComponent = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
    <rect width="48" height="48" rx={TILE_RX} fill="#FFD60A" />
    <path d="M11 14h26v4H11v-4z" fill="#d4a017" opacity="0.55" />
    <path d="M16 24h16M16 29h12M16 34h14" stroke="#3a3200" strokeWidth="1.8" strokeLinecap="round" opacity="0.35" />
  </svg>
);

/** Cloud drive–style wedges. */
export const DockIconDrive: React.FunctionComponent = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
    <rect width="48" height="48" rx={TILE_RX} fill="#f5f5f7" />
    <path d="M24 12 38 34H10L24 12z" fill="#0F9D58" />
    <path d="M10 34 17 22h22l7 12H10z" fill="#F4B400" />
    <path d="M17 22 24 12l14 22H17V22z" fill="#4285F4" />
  </svg>
);

/** Toolkit / utilities cube. */
export const DockIconToolkit: React.FunctionComponent = () => {
  const rid = React.useId();
  const gid = gradientSuffix(rid, 'tool');
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${gid}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9F0A" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={TILE_RX} fill={`url(#${gid}-g)`} />
      <path
        d="M24 14l10 6v8l-10 6-10-6v-8l10-6z"
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <path d="M24 20v8M18 17v8M30 17v8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
};

/** Settings gear on neutral tile. */
export const DockIconSettings: React.FunctionComponent = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
    <rect width="48" height="48" rx={TILE_RX} fill="#8e8e93" />
    <circle cx="24" cy="24" r="7.5" fill="none" stroke="#fff" strokeWidth="2" opacity="0.95" />
    <path
      d="M24 13.5v3M24 31.5v3M13.5 24h3M31.5 24h3M17.2 17.2l2.1 2.1M28.7 28.7l2.1 2.1M17.2 30.8l2.1-2.1M28.7 19.3l2.1-2.1"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.95"
    />
    <circle cx="24" cy="24" r="3" fill="#fff" opacity="0.95" />
  </svg>
);

/** Terminal tile. */
export const DockIconTerminal: React.FunctionComponent = () => (
  <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
    <rect width="48" height="48" rx={TILE_RX} fill="#1c1c1e" />
    <path d="M14 17 20 24l-6 7" stroke="#32d74b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M22 31h12" stroke="#32d74b" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/** Mock “AI IDE” tile — editor / intelligence vibe. */
export const DockIconIde: React.FunctionComponent = () => {
  const rid = React.useId();
  const gid = gradientSuffix(rid, 'ide');
  return (
    <svg viewBox="0 0 48 48" width="100%" height="100%" aria-hidden focusable="false">
      <defs>
        <linearGradient id={`${gid}-g`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b4bc4" />
          <stop offset="100%" stopColor="#3d2b7a" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx={TILE_RX} fill={`url(#${gid}-g)`} />
      <path
        d="M17 17l-4 7 4 7M22 31h10"
        fill="none"
        stroke="#c4b5fd"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M28 17h6" stroke="#a78bfa" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
};
