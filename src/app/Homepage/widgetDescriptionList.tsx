import * as React from 'react';
import { DescriptionList, type DescriptionListProps } from '@patternfly/react-core';

type ColumnModifier = DescriptionListProps['columnModifier'];

/** PatternFly columnModifier caps at 3Col; use grid count classes for multi-up rows. */
export const WIDGET_DESCRIPTION_LIST_2_COL_CLASS = 'widget-description-list--2-col';
export const WIDGET_DESCRIPTION_LIST_4_COL_CLASS = 'widget-description-list--4-col';

export function getHorizontalFluidDescriptionListLayout(
  colSpan: number,
  pairCount: number
): {
  columnModifier?: ColumnModifier;
  className?: string;
} {
  if (colSpan <= 1) {
    return { columnModifier: { default: '1Col' } };
  }

  if (pairCount <= 2) {
    return { columnModifier: { default: '2Col' } };
  }

  if (colSpan >= 4 && pairCount >= 4) {
    return { className: WIDGET_DESCRIPTION_LIST_4_COL_CLASS };
  }

  if (colSpan === 3 && pairCount >= 4) {
    return { columnModifier: { default: '3Col' } };
  }

  if (colSpan >= 2 && pairCount >= 4) {
    return { columnModifier: { default: '2Col' } };
  }

  return { columnModifier: { default: '3Col' } };
}

export interface WidgetDescriptionListProps
  extends Omit<DescriptionListProps, 'isHorizontal' | 'isFluid' | 'columnModifier'> {
  /** When true, render term and description on one line per pair. */
  horizontalFluid?: boolean;
  /** Column modifier while horizontal fluid layout is active. */
  horizontalColumnModifier?: ColumnModifier;
  /** Grid class for multi-up rows while horizontal fluid (e.g. two-up / four-up). */
  horizontalGridClassName?: string;
  /** Column modifier when horizontal fluid is disabled. */
  columnModifier?: ColumnModifier;
  children: React.ReactNode;
}

export function WidgetDescriptionList({
  horizontalFluid = false,
  horizontalColumnModifier,
  horizontalGridClassName,
  columnModifier,
  className,
  children,
  isCompact = true,
  ...rest
}: WidgetDescriptionListProps) {
  const resolvedClassName = [className, horizontalFluid ? horizontalGridClassName : undefined]
    .filter(Boolean)
    .join(' ');

  const resolvedHorizontalColumnModifier =
    horizontalColumnModifier ?? (horizontalGridClassName ? undefined : { default: '1Col' });

  return (
    <DescriptionList
      {...rest}
      isCompact={isCompact}
      isHorizontal={horizontalFluid}
      isFluid={horizontalFluid}
      columnModifier={horizontalFluid ? resolvedHorizontalColumnModifier : columnModifier}
      className={resolvedClassName || undefined}
    >
      {children}
    </DescriptionList>
  );
}

/** Styles injected with dashboard widget grid styles. */
export const WIDGET_DESCRIPTION_LIST_STYLES = `
  .${WIDGET_DESCRIPTION_LIST_2_COL_CLASS} {
    --pf-v6-c-description-list--GridTemplateColumns--count: 2;
    --pf-v6-c-description-list--GridTemplateColumns--min: 0;
  }

  .${WIDGET_DESCRIPTION_LIST_4_COL_CLASS} {
    --pf-v6-c-description-list--GridTemplateColumns--count: 4;
    --pf-v6-c-description-list--GridTemplateColumns--min: 0;
  }
`;
