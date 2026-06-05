import { createContext, useContext } from 'react';
import type { ColumnSpan } from '@app/Homepage/widgetTypes';

/** Effective grid column span for the current widget cell (1–4). */
export const WidgetColSpanContext = createContext<ColumnSpan>(1);

export function useWidgetColSpan(): ColumnSpan {
  return useContext(WidgetColSpanContext);
}
