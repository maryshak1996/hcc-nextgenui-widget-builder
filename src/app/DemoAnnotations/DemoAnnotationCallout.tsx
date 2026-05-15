import * as React from 'react';

export type DemoAnnotationCalloutProps = {
  /** Shown with enter animation when true */
  visible: boolean;
  children: React.ReactNode;
  /** Optional id for aria-labelledby */
  id?: string;
  /** When set, a footer button advances the demo */
  onNext?: () => void;
  /** When true, Next is disabled even if the user did not click it (e.g. another gesture advanced the step). */
  nextCompletedExternally?: boolean;
  /** Text before the arrow icon (default: Next) */
  nextLabel?: string;
};

const NextArrowIcon: React.FunctionComponent = () => (
  <svg
    className="hcc-demo-annotation-callout__next-arrow"
    viewBox="0 0 24 24"
    width={18}
    height={18}
    aria-hidden
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"
    />
  </svg>
);

/** Simple user silhouette (demo “customer thought” cue). */
const UserIcon: React.FunctionComponent = () => (
  <svg
    className="hcc-demo-annotation-callout__user-icon"
    viewBox="0 0 24 24"
    width={20}
    height={20}
    aria-hidden
    focusable="false"
  >
    <circle cx="12" cy="8" r="3.5" fill="currentColor" />
    <path
      fill="currentColor"
      d="M4.5 20.5c0-3.1 3.35-5.5 7.5-5.5s7.5 2.4 7.5 5.5V22h-15v-1.5z"
    />
  </svg>
);

/**
 * Demo-only bright pink callout (not PatternFly). Parent should use an overlay host for layout.
 */
const DemoAnnotationCallout: React.FunctionComponent<DemoAnnotationCalloutProps> = ({
  visible,
  children,
  id,
  onNext,
  nextCompletedExternally = false,
  nextLabel = 'Next',
}) => {
  const [nextUsed, setNextUsed] = React.useState(false);

  React.useEffect(() => {
    if (!visible) {
      setNextUsed(false);
    }
  }, [visible]);

  const handleNext = React.useCallback(() => {
    if (nextUsed || nextCompletedExternally || !onNext) {
      return;
    }
    setNextUsed(true);
    onNext();
  }, [nextUsed, nextCompletedExternally, onNext]);

  if (!visible) {
    return null;
  }

  const showNextFooter = Boolean(onNext) && !nextUsed && !nextCompletedExternally;

  return (
    <div
      id={id}
      className="hcc-demo-annotation-callout-host"
      role="note"
      aria-live="polite"
    >
      <div className="hcc-demo-annotation-callout">
        <div className="hcc-demo-annotation-callout__body">
          <UserIcon />
          <span className="hcc-demo-annotation-callout__text">{children}</span>
        </div>
        {showNextFooter ? (
          <div className="hcc-demo-annotation-callout__footer">
            <button
              type="button"
              className="hcc-demo-annotation-callout__next"
              onClick={handleNext}
              aria-label={`${nextLabel}, go to next demo step`}
            >
              <span className="hcc-demo-annotation-callout__next-inner">
                <span className="hcc-demo-annotation-callout__next-label">{nextLabel}</span>
                <NextArrowIcon />
              </span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export { DemoAnnotationCallout };
