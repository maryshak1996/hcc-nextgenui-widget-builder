import * as React from 'react';
import { createPortal } from 'react-dom';
import { HCC_DEMO_ANNOTATIONS_PREF_CHANGED } from '@app/DemoAnnotations/demoAnnotationEvents';

const STORAGE_KEY = 'hcc-demo-annotations-visible';

export function readAnnotationsVisiblePreference(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== '0';
  } catch {
    return true;
  }
}

export function persistAnnotationsVisiblePreference(on: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? '1' : '0');
    window.dispatchEvent(
      new CustomEvent(HCC_DEMO_ANNOTATIONS_PREF_CHANGED, { detail: { visible: on } }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

export type DemoAnnotationsViewToggleProps = {
  /** When true, callouts and click outline are shown (subject to page logic). */
  annotationsOn: boolean;
  onToggle: () => void;
};

/**
 * Fixed above the fake dock: turn demo callouts / click cue on or off (not PatternFly).
 */
const DemoAnnotationsViewToggle: React.FunctionComponent<DemoAnnotationsViewToggleProps> = ({
  annotationsOn,
  onToggle,
}) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="hcc-demo-annotations-view-toggle-wrap">
      <button
        type="button"
        className="hcc-demo-annotations-view-toggle"
        role="switch"
        aria-checked={annotationsOn}
        aria-label={
          annotationsOn
            ? 'Demo annotations on. Activate to hide walkthrough callouts and highlights.'
            : 'Demo annotations off. Activate to show walkthrough callouts and highlights.'
        }
        onClick={onToggle}
      >
        <span className="hcc-demo-annotations-view-toggle__text">View annotations</span>
        <span
          className={[
            'hcc-demo-annotations-view-toggle__pill',
            annotationsOn ? 'hcc-demo-annotations-view-toggle__pill--on' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden="true"
        >
          {annotationsOn ? 'On' : 'Off'}
        </span>
      </button>
    </div>,
    document.body,
  );
};

export { DemoAnnotationsViewToggle };
