import * as React from 'react';
import { createPortal } from 'react-dom';

export type DemoClickIndicatorProps = {
  visible: boolean;
  /** CSS selector for the element to outline (e.g. `[data-demo-anchor="pcm-ai-ide-dock"]`) */
  anchorSelector: string;
};

/** Padding between the anchor rect and the dashed outline (px). */
const OUTLINE_PAD = 5;

const syncOutline = (anchor: Element | null, host: HTMLDivElement | null): void => {
  if (!anchor || !host) {
    return;
  }
  const r = anchor.getBoundingClientRect();
  const cs = window.getComputedStyle(anchor);
  const br = cs.borderRadius;
  host.style.left = `${r.left - OUTLINE_PAD}px`;
  host.style.top = `${r.top - OUTLINE_PAD}px`;
  host.style.width = `${r.width + OUTLINE_PAD * 2}px`;
  host.style.height = `${r.height + OUTLINE_PAD * 2}px`;
  host.style.borderRadius = br && br !== '0px' ? br : '12px';
};

/**
 * Pink dashed outline around a target (not PatternFly). Portal + pointer-events: none so the control stays clickable.
 */
const DemoClickIndicator: React.FunctionComponent<DemoClickIndicatorProps> = ({ visible, anchorSelector }) => {
  const hostRef = React.useRef<HTMLDivElement | null>(null);

  const sync = React.useCallback(() => {
    if (!visible) {
      return;
    }
    const anchor = document.querySelector(anchorSelector);
    syncOutline(anchor, hostRef.current);
  }, [anchorSelector, visible]);

  React.useLayoutEffect(() => {
    if (!visible) {
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

  if (!visible || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      ref={hostRef}
      className="hcc-demo-click-outline"
      aria-hidden="true"
    />,
    document.body,
  );
};

export { DemoClickIndicator };
