import * as React from 'react';

const COPY_FEEDBACK_DURATION_MS = 2000;

/** Brief “Copied!” tooltip on a single kebab (homepage / dashboard detail). */
export function useCopyConfigFeedback(durationMs = COPY_FEEDBACK_DURATION_MS): {
  copiedTooltipVisible: boolean;
  triggerCopiedFeedback: () => void;
} {
  const [copiedTooltipVisible, setCopiedTooltipVisible] = React.useState(false);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  const triggerCopiedFeedback = React.useCallback(() => {
    const prev = timeoutRef.current;
    if (prev !== undefined) {
      window.clearTimeout(prev);
    }
    setCopiedTooltipVisible(true);
    timeoutRef.current = window.setTimeout(() => {
      setCopiedTooltipVisible(false);
      timeoutRef.current = undefined;
    }, durationMs);
  }, [durationMs]);

  React.useEffect(
    () => () => {
      const prev = timeoutRef.current;
      if (prev !== undefined) {
        window.clearTimeout(prev);
      }
    },
    []
  );

  return { copiedTooltipVisible, triggerCopiedFeedback };
}

/** Brief “Copied!” tooltip on hub table row kebabs (which row was copied). */
export function useCopyConfigRowFeedback(durationMs = COPY_FEEDBACK_DURATION_MS): {
  copiedFeedbackRowId: string | null;
  triggerCopiedFeedbackForRow: (rowId: string) => void;
} {
  const [copiedFeedbackRowId, setCopiedFeedbackRowId] = React.useState<string | null>(null);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  const triggerCopiedFeedbackForRow = React.useCallback(
    (rowId: string) => {
      const prev = timeoutRef.current;
      if (prev !== undefined) {
        window.clearTimeout(prev);
      }
      setCopiedFeedbackRowId(rowId);
      timeoutRef.current = window.setTimeout(() => {
        setCopiedFeedbackRowId(null);
        timeoutRef.current = undefined;
      }, durationMs);
    },
    [durationMs]
  );

  React.useEffect(
    () => () => {
      const prev = timeoutRef.current;
      if (prev !== undefined) {
        window.clearTimeout(prev);
      }
    },
    []
  );

  return { copiedFeedbackRowId, triggerCopiedFeedbackForRow };
}
