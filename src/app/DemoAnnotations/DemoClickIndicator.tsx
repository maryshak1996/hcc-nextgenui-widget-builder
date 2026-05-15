import * as React from 'react';
import { createPortal, flushSync } from 'react-dom';

type HintArrowSide = 'top' | 'right' | 'bottom' | 'left';

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
  /**
   * Pink blinking arrow toward the anchor. Default `left`; use `top` for the dock “open AI IDE” cue only.
   * Set false to hide.
   */
  hintArrow?: boolean;
  hintArrowSide?: HintArrowSide;
  /** When false with `onActivate`, outline is border + pulse only (no pink fill) — e.g. Slack notification. */
  interactiveFill?: boolean;
};

const DEFAULT_OUTLINE_PAD = 5;

function syncOutline(anchor: Element | null, host: HTMLElement | null, padPx: number): void {
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
}

/** Arrow box: long axis along pointer direction, short axis across. */
const HINT_LONG = 56;
const HINT_SHORT = 44;
const HINT_GAP = 8;
const HINT_MARGIN = 6;
function positionHintArrowBox(anchor: Element, el: HTMLElement, side: HintArrowSide): void {
  const r = anchor.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  let left = 0;
  let top = 0;
  let w = 0;
  let h = 0;

  switch (side) {
    case 'top':
      w = HINT_SHORT;
      h = HINT_LONG;
      left = cx - w / 2;
      top = r.top - HINT_GAP - h;
      break;
    case 'bottom':
      w = HINT_SHORT;
      h = HINT_LONG;
      left = cx - w / 2;
      top = r.bottom + HINT_GAP;
      break;
    case 'left':
      w = HINT_LONG;
      h = HINT_SHORT;
      left = r.left - HINT_GAP - w;
      top = cy - h / 2;
      break;
    case 'right':
      w = HINT_LONG;
      h = HINT_SHORT;
      left = r.right + HINT_GAP;
      top = cy - h / 2;
      break;
    default:
      return;
  }

  left = Math.max(HINT_MARGIN, Math.min(left, vw - w - HINT_MARGIN));
  top = Math.max(HINT_MARGIN, Math.min(top, vh - h - HINT_MARGIN));

  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  el.style.width = `${w}px`;
  el.style.height = `${h}px`;
}

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
  hintArrow = true,
  hintArrowSide = 'left',
  interactiveFill = true,
}) => {
  const buttonHostRef = React.useRef<HTMLButtonElement | null>(null);
  const divHostRef = React.useRef<HTMLDivElement | null>(null);
  const arrowHostRef = React.useRef<HTMLDivElement | null>(null);
  const activatedRef = React.useRef(false);
  const [resolvedArrowSide, setResolvedArrowSide] = React.useState<HintArrowSide>('left');

  const sync = React.useCallback(() => {
    if (!visible) {
      return;
    }
    const anchor = document.querySelector(anchorSelector);
    const host = onActivate ? buttonHostRef.current : divHostRef.current;
    syncOutline(anchor, host, outlinePaddingPx);
    if (hintArrow && anchor && arrowHostRef.current) {
      const side = hintArrowSide;
      flushSync(() => {
        setResolvedArrowSide((prev) => (prev === side ? prev : side));
      });
      positionHintArrowBox(anchor, arrowHostRef.current, side);
    }
  }, [anchorSelector, hintArrow, hintArrowSide, onActivate, outlinePaddingPx, visible]);

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
    interactive && !interactiveFill ? 'hcc-demo-click-outline--border-only' : '',
    elevated ? 'hcc-demo-click-outline--elevated' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const arrowClass = [
    'hcc-demo-click-hint-arrow',
    `hcc-demo-click-hint-arrow--from-${resolvedArrowSide}`,
    elevated ? 'hcc-demo-click-hint-arrow--elevated' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return createPortal(
    <>
      {interactive ? (
        <button
          type="button"
          ref={buttonHostRef}
          className={outlineClass}
          aria-label={activateAriaLabel}
          onClick={handleInteractiveClick}
        />
      ) : (
        <div ref={divHostRef} className={outlineClass} aria-hidden="true" />
      )}
      {hintArrow ? (
        <div ref={arrowHostRef} className={arrowClass} aria-hidden="true">
          <svg
            className="hcc-demo-click-hint-arrow__svg"
            viewBox="0 0 48 56"
            width="100%"
            height="100%"
            focusable="false"
          >
            <path
              fill="none"
              stroke="#ff1493"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M24 6v30M10 30l14 14 14-14"
            />
          </svg>
        </div>
      ) : null}
    </>,
    document.body,
  );
};

export { DemoClickIndicator };
