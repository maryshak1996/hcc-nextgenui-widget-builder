import * as React from 'react';
import { BullseyeIcon } from '@patternfly/react-icons';

export type DemoGoalConnectionAnnotationProps = {
  /** Shown with enter animation when true */
  visible: boolean;
  /** Second line: context-specific goal copy */
  children: React.ReactNode;
  id?: string;
  /** When `ide`, nudges below the mock IDE menubar so the chip reads as part of the IDE chrome. Ignored when `inStack`. */
  anchor?: 'default' | 'ide';
  /** Inside `DemoGoalConnectionStack`: no fixed positioning; stacks vertically with siblings */
  inStack?: boolean;
};

export type DemoGoalConnectionStackProps = {
  /** Pin stack to viewport corner (same as single annotation `anchor`) */
  anchor?: 'default' | 'ide';
  children: React.ReactNode;
  'aria-label'?: string;
  /** Appended to stack host `className` (e.g. z-index over fake Slack UI). */
  className?: string;
};

/** Fixed-position column for multiple goal connections (matches stacked callout pattern). */
function DemoGoalConnectionStack({
  anchor = 'default',
  children,
  'aria-label': ariaLabel = 'UIE goal connections',
  className,
}: DemoGoalConnectionStackProps): React.ReactElement {
  const base =
    anchor === 'ide'
      ? 'hcc-demo-goal-connection-stack hcc-demo-goal-connection-stack--ide'
      : 'hcc-demo-goal-connection-stack';
  const cls = [base, className].filter(Boolean).join(' ');

  return (
    <div className={cls} aria-label={ariaLabel}>
      {children}
    </div>
  );
}

/**
 * Demo-only “goal connection” marker: red frame + icon, labels a moment in the flow that meets a UIE goal/target.
 * (Not PatternFly — matches other demo annotation styling.)
 */
const DemoGoalConnectionAnnotation: React.FunctionComponent<DemoGoalConnectionAnnotationProps> = ({
  visible,
  children,
  id,
  anchor = 'default',
  inStack = false,
}) => {
  if (!visible) {
    return null;
  }

  let hostClass = 'hcc-demo-goal-connection-host';
  if (inStack) {
    hostClass = 'hcc-demo-goal-connection-host hcc-demo-goal-connection-host--in-stack';
  } else if (anchor === 'ide') {
    hostClass = 'hcc-demo-goal-connection-host hcc-demo-goal-connection-host--ide';
  }

  return (
    <div id={id} className={hostClass} role="note" aria-live="polite">
      <div className="hcc-demo-goal-connection">
        <div className="hcc-demo-goal-connection__title-row">
          <span className="hcc-demo-goal-connection__icon-wrap" aria-hidden>
            <BullseyeIcon className="hcc-demo-goal-connection__icon" />
          </span>
          <span className="hcc-demo-goal-connection__label">UIE Goal Connection</span>
        </div>
        <div className="hcc-demo-goal-connection__context">{children}</div>
      </div>
    </div>
  );
};

export { DemoGoalConnectionAnnotation, DemoGoalConnectionStack };
