import * as React from 'react';
import { Content, FormGroup, Label, LabelGroup, Spinner } from '@patternfly/react-core';
import { useSupportCaseDraft } from '@app/Support/SupportCaseDraftContext';

export interface ISupportCaseNotificationLabelsFieldProps {
  fieldId: string;
  emptyPlaceholder: string;
}

/** Send notifications — dismissable group labels inside a field-style container */
const SupportCaseNotificationLabelsField: React.FunctionComponent<ISupportCaseNotificationLabelsFieldProps> = ({
  fieldId,
  emptyPlaceholder,
}) => {
  const { draft, updateDraft } = useSupportCaseDraft();
  const groups = draft.notificationGroups ?? [];

  const scrollAnchorRef = React.useRef<HTMLDivElement>(null);
  const prevGroupCountRef = React.useRef(0);
  const [showAppliedPulse, setShowAppliedPulse] = React.useState(false);

  React.useEffect(() => {
    const n = groups.length;
    const prev = prevGroupCountRef.current;
    if (n > 0 && prev === 0) {
      setShowAppliedPulse(true);
      const clearPulse = window.setTimeout(() => setShowAppliedPulse(false), 950);
      requestAnimationFrame(() => {
        scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      prevGroupCountRef.current = n;
      return () => window.clearTimeout(clearPulse);
    }
    prevGroupCountRef.current = n;
    return undefined;
  }, [groups.length]);

  const removeGroup = React.useCallback(
    (name: string) => {
      updateDraft({ notificationGroups: groups.filter((g) => g !== name) });
    },
    [groups, updateDraft]
  );

  return (
    <FormGroup label="Send notifications" fieldId={fieldId}>
      <div ref={scrollAnchorRef} style={{ position: 'relative' }}>
        <div
          style={{
            boxSizing: 'border-box',
            border: '1px solid var(--pf-t--global--border--color--default)',
            borderRadius: 'var(--pf-t--global--border--radius--medium)',
            padding: 'var(--pf-t--global--spacer--sm)',
            minHeight: '2.25rem',
            backgroundColor: 'var(--pf-t--global--background--color--primary--default)',
          }}
        >
        {groups.length === 0 ? (
          <span
            style={{
              color: 'var(--pf-t--global--text--color--subtle)',
              fontSize: 'var(--pf-t--global--font--size--body--default)',
            }}
          >
            {emptyPlaceholder}
          </span>
        ) : (
          <LabelGroup aria-label="Notification groups" numLabels={10}>
            {groups.map((g) => (
              <Label key={g} color="blue" isCompact onClose={() => removeGroup(g)}>
                {g}
              </Label>
            ))}
          </LabelGroup>
        )}
        </div>
        {showAppliedPulse ? (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--pf-t--global--spacer--sm)',
              borderRadius: 'var(--pf-t--global--border--radius--medium)',
              background:
                'color-mix(in srgb, var(--pf-t--global--background--color--primary--default) 75%, transparent)',
              backdropFilter: 'blur(2px)',
              pointerEvents: 'none',
            }}
          >
            <Spinner size="md" />
            <Content component="small">Applying notification groups…</Content>
          </div>
        ) : null}
      </div>
    </FormGroup>
  );
};

export { SupportCaseNotificationLabelsField };
