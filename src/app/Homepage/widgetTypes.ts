import type { ReactNode } from 'react';
import type { PreviewBlock } from '@app/Homepage/widgetBuilderPreviewParser';

/** Serializable body + header icon from the widget builder. */
export interface CustomBuilderWidgetContent {
  headerIconId: string;
  blocks: PreviewBlock[];
}

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
  /** Initial tab for RHEL/OpenShift tabbed widgets (e.g. OpenShift dashboard). */
  defaultProductTab?: 'rhel' | 'openshift';
  /** Widget builder output — custom title icon and parsed body blocks. */
  customBuilder?: CustomBuilderWidgetContent;
}
