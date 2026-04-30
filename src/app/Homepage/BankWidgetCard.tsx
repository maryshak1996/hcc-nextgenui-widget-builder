import * as React from 'react';
import {
  Button,
  Card,
  CardBody,
  Content,
  Flex,
  FlexItem,
  Tooltip
} from '@patternfly/react-core';
import { CheckCircleIcon, PlusCircleIcon } from '@patternfly/react-icons';
import { WidgetTitleLeadIcon } from '@app/Homepage/homepageWidgetHeaderIcons';
import type { Widget } from '@app/Homepage/widgetTypes';

export interface BankWidgetCardProps {
  widget: Widget;
  /** Called when the user activates add (only when allowed and not already on canvas). */
  onAdd: (widget: Widget) => void;
  /** True when this widget is already on the current dashboard canvas */
  isAlreadyOnDashboard?: boolean;
  /** When false, add is disabled (e.g. no dashboard editor context or read-only dashboard). */
  addAllowed?: boolean;
  /** Tooltip when add is disabled */
  disabledAddTooltip?: string;
  /**
   * Find-widgets bank: show green check like “already added”, then run exit animation before the card is removed.
   */
  celebrationPhase?: 'success' | 'exit';
}

const ADDED_TOOLTIP = 'Widget added to dashboard';
const ADD_TO_DASHBOARD_TOOLTIP = 'Add to dashboard';

/** Compact card as in Find widgets (title + add control or added state). */
export const BankWidgetCard: React.FC<BankWidgetCardProps> = ({
  widget,
  onAdd,
  isAlreadyOnDashboard = false,
  addAllowed = true,
  disabledAddTooltip = 'You cannot add this widget here.',
  celebrationPhase
}) => {
  const plusControl = (
    <Button
      type="button"
      variant="plain"
      className="add-widgets-bank-add"
      icon={<PlusCircleIcon />}
      aria-label={`Add ${widget.title} to your dashboard`}
      onClick={() => onAdd(widget)}
      isDisabled={!addAllowed}
    />
  );

  const showCelebrationCheck = celebrationPhase === 'success' || celebrationPhase === 'exit';

  let action: React.ReactNode;
  if (isAlreadyOnDashboard || showCelebrationCheck) {
    action = (
      <Tooltip content={ADDED_TOOLTIP}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--pf-t--global--icon--color--status--success--default)'
          }}
          aria-label={ADDED_TOOLTIP}
        >
          <CheckCircleIcon />
        </span>
      </Tooltip>
    );
  } else if (!addAllowed) {
    action = (
      <Tooltip content={disabledAddTooltip}>
        <span style={{ display: 'inline-flex' }}>{plusControl}</span>
      </Tooltip>
    );
  } else {
    action = (
      <Tooltip content={ADD_TO_DASHBOARD_TOOLTIP}>
        <span style={{ display: 'inline-flex' }}>{plusControl}</span>
      </Tooltip>
    );
  }

  return (
    <div
      className={
        celebrationPhase === 'exit'
          ? 'bank-widget-wrapper bank-widget-wrapper--celebrate-exit'
          : 'bank-widget-wrapper'
      }
    >
      <Card className="bank-widget-card" isCompact>
        <CardBody
          style={{ paddingBlock: 8, paddingInline: 'var(--pf-t--global--spacer--md)' }}
        >
          <Flex alignItems={{ default: 'alignItemsCenter' }} justifyContent={{ default: 'justifyContentSpaceBetween' }}>
            <FlexItem flex={{ default: 'flex_1' }}>
              <Flex alignItems={{ default: 'alignItemsCenter' }} spaceItems={{ default: 'spaceItemsSm' }}>
                <FlexItem>
                  <WidgetTitleLeadIcon widgetId={widget.id} />
                </FlexItem>
                <FlexItem flex={{ default: 'flex_1' }}>
                  <Content
                    component="p"
                    style={{
                      fontSize: 'var(--pf-v6-global--FontSize--sm)',
                      fontWeight: 'var(--pf-t--global--font--weight--body--bold)',
                      margin: 0
                    }}
                  >
                    {widget.title}
                  </Content>
                </FlexItem>
              </Flex>
            </FlexItem>
            <FlexItem className="bank-widget-card__action-slot">{action}</FlexItem>
          </Flex>
        </CardBody>
      </Card>
    </div>
  );
};
