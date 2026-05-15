import * as React from 'react';
import { createPortal } from 'react-dom';

export type DemoClickIndicatorProps = {
  visible: boolean;
  /** CSS selector for the element to outline (e.g. `[data-demo-anchor="pcm-ai-ide-dock"]`) */
  anchorSelector: string;
  /** When set, the outline accepts clicks and invokes this once (parent should hide `visible` after). */
  onActivate?: () => void;
  /** Extra padding around the anchor for the outline and hit target (default 5). Use a larger value for small dock targets. */
  outlinePaddingPx?: number;
  /** `onActivate` button accessible name (defaults to help-chat “yes” copy). */
  activateAriaLabel?: string;
  /** Raise above high z-index demo layers (e.g. macOS fake notification at 9100). */
  elevated?: boolean;
};

const DEFAULT_OUTLINE_PAD = 5;

const syncOutline = (anchor: Element | null, host: HTMLElement | null, padPx: number): void => {
  if (!anchor || !host) {
    return;
  }
  const r = anchor.getBoundingClientRect();
  const cs = window.getComputedStyle(anchor);
  const br = cs.borderRadius;
  host.style.left = `${r.left - padPx}px`;
  host.style.top = `${r.top - padPx}px`;
  host.style.width = `${r.width + padPx * 2}px`;
  host.style.height = `${r.height + padPx * 2}px`;
  host.style.borderRadius = br && br !== '0px' ? br : '12px';
};

/**
 * Pink dashed outline around a target (not PatternFly). Portal + pointer-events: none so the control stays clickable.
 */
const DemoClickIndicator: React.FunctionComponent<DemoClickIndicatorProps> = ({
  visible,
  anchorSelector,
  onActivate,
  outlinePaddingPx = DEFAULT_OUTLINE_PAD,
  activateAriaLabel = 'Demo: click to type yes and send in chat',
  elevated = false,
}) => {
  const buttonHostRef = React.useRef<HTMLButtonElement | null>(null);
  const divHostRef = React.useRef<HTMLDivElement | null>(null);
  const activatedRef = React.useRef(false);

  const sync = React.useCallback(() => {
    if (!visible) {
      return;
    }
    const anchor = document.querySelector(anchorSelector);
    const host = onActivate ? buttonHostRef.current : divHostRef.current;
    syncOutline(anchor, host, outlinePaddingPx);
  }, [anchorSelector, onActivate, outlinePaddingPx, visible]);

  React.useLayoutEffect(() => {
    if (!visible) {
      activatedRef.current = false;
      return undefined;
    }
    sync();
    const onWin = () => sync();
    window.addEventListener('resize', onWin);
    window.addEventListener('scroll', onWin, true);
    const anchor = document.querySelector(anchorSelector);
    let ro: ResizeObserver | undefined;
    if (anchor && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => sync());
      ro.observe(anchor);
    }
    const id = window.setInterval(sync, 400);
    return () => {
      window.removeEventListener('resize', onWin);
      window.removeEventListener('scroll', onWin, true);
      ro?.disconnect();
      window.clearInterval(id);
    };
  }, [anchorSelector, sync, visible]);

  const handleInteractiveClick = React.useCallback(() => {
    if (!onActivate || activatedRef.current) {
      return;
    }
    activatedRef.current = true;
    onActivate();
  }, [onActivate]);

  if (!visible || typeof document === 'undefined') {
    return null;
  }

  const interactive = Boolean(onActivate);
  const outlineClass = [
    'hcc-demo-click-outline',
    interactive ? 'hcc-demo-click-outline--interactive' : '',
    elevated ? 'hcc-demo-click-outline--elevated' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    interactive ? (
      <button
        type="button"
        ref={buttonHostRef}
        className={outlineClass}
        aria-label={activateAriaLabel}
        onClick={handleInteractiveClick}
      />
    ) : (
      <div ref={divHostRef} className={outlineClass} aria-hidden="true" />
    ),
    document.body,
  );
};

export { DemoClickIndicator };
