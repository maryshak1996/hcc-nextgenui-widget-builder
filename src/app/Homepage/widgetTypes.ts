import type { ReactNode } from 'react';

export type ColumnSpan = 1 | 2 | 3 | 4;

/** Half-row grid units (2 units = one 80px logical row). Range 1–12 = 0.5–6 logical rows. */
export type RowSpan = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const MIN_ROW_SPAN = 1 as const;
export const MAX_ROW_SPAN = 12 as const;

export interface Widget {
  id: string;
  title: string;
  type: 'product' | 'settings' | 'recently-visited' | 'explore-capabilities' | 'subscriptions' | 'events' | 'integrations' | 'my-account' | 'placeholder';
  colSpan: ColumnSpan;
  rowSpan: RowSpan;
  content?: ReactNode;
  footerLink?: string;
  footerText?: string;
  footerIcon?: ReactNode;
  navigateTo?: string;
}
