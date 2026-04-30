import * as React from 'react';
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  CheckCircleIcon,
  ClipboardIcon,
  ClockIcon,
  CodeIcon,
  CubesIcon,
  ExclamationTriangleIcon,
  FileAltIcon,
  FlagIcon,
  FolderIcon,
  InfoCircleIcon,
  ListIcon,
  QuestionCircleIcon,
  TagIcon,
  WrenchIcon
} from '@patternfly/react-icons';

export const WIDGET_BUILDER_HEADER_ICON_OPTIONS = [
  { id: 'file', label: 'Document', Icon: FileAltIcon },
  { id: 'folder', label: 'Folder', Icon: FolderIcon },
  { id: 'code', label: 'Code', Icon: CodeIcon },
  { id: 'list', label: 'List', Icon: ListIcon },
  { id: 'infoCircle', label: 'Information', Icon: InfoCircleIcon },
  { id: 'checkCircle', label: 'Success', Icon: CheckCircleIcon },
  { id: 'questionCircle', label: 'Help', Icon: QuestionCircleIcon },
  { id: 'exclamationTriangle', label: 'Warning', Icon: ExclamationTriangleIcon },
  { id: 'clock', label: 'Time', Icon: ClockIcon },
  { id: 'arrowCircleUp', label: 'Up arrow circle', Icon: ArrowCircleUpIcon },
  { id: 'arrowCircleDown', label: 'Down arrow circle', Icon: ArrowCircleDownIcon },
  { id: 'clipboard', label: 'Clipboard', Icon: ClipboardIcon },
  { id: 'cubes', label: 'Cubes', Icon: CubesIcon },
  { id: 'flag', label: 'Flag', Icon: FlagIcon },
  { id: 'tag', label: 'Tag', Icon: TagIcon },
  { id: 'wrench', label: 'Wrench', Icon: WrenchIcon }
] as const;

export type WidgetBuilderHeaderIconId = (typeof WIDGET_BUILDER_HEADER_ICON_OPTIONS)[number]['id'];

export const WIDGET_BUILDER_DEFAULT_HEADER_ICON_ID: WidgetBuilderHeaderIconId = 'file';

const HEADER_ICON_MAP = Object.fromEntries(WIDGET_BUILDER_HEADER_ICON_OPTIONS.map((o) => [o.id, o.Icon])) as Record<
  WidgetBuilderHeaderIconId,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
>;

export function getWidgetBuilderHeaderIconComponent(
  id: string
): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  if (id in HEADER_ICON_MAP) {
    return HEADER_ICON_MAP[id as WidgetBuilderHeaderIconId];
  }
  return FileAltIcon;
}

export function getWidgetBuilderHeaderIconLabel(id: string): string {
  const found = WIDGET_BUILDER_HEADER_ICON_OPTIONS.find((o) => o.id === id);
  return found?.label ?? 'Document';
}
