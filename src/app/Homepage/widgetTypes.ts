import type { ReactNode } from 'react';

export type ColumnSpan = 1 | 2 | 3 | 4;

export type RowSpan = 1 | 2 | 3 | 4 | 5 | 6;

export interface Widget {
  id: string;
  title: string;
  type: 'product' | 'settings' | 'recently-visited' | 'explore-capabilities' | 'subscriptions' | 'placeholder';
  colSpan: ColumnSpan;
  rowSpan: RowSpan;
  content?: ReactNode;
  footerLink?: string;
  footerText?: string;
  footerIcon?: ReactNode;
  navigateTo?: string;
}
