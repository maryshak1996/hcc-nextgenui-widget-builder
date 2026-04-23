export type ShareDirectoryEntryKind = 'user' | 'group';

export interface ShareDirectoryEntry {
  id: string;
  kind: ShareDirectoryEntryKind;
  /** Login (users) or group identifier shown in the UI. */
  displayName: string;
}

export function shareDirectoryEntryKey(entry: Pick<ShareDirectoryEntry, 'kind' | 'id'>): string {
  return `${entry.kind}:${entry.id}`;
}

/**
 * Mock Hybrid Cloud Console org directory for the share-dashboard typeahead (replace with API later).
 */
export const SHARE_DIRECTORY: ShareDirectoryEntry[] = [
  { id: 'akumar', kind: 'user', displayName: 'akumar' },
  { id: 'bwolfe', kind: 'user', displayName: 'bwolfe' },
  { id: 'cnguyen', kind: 'user', displayName: 'cnguyen' },
  { id: 'dgarcia', kind: 'user', displayName: 'dgarcia' },
  { id: 'emartinez', kind: 'user', displayName: 'emartinez' },
  { id: 'fsingh', kind: 'user', displayName: 'fsingh' },
  { id: 'gpatel', kind: 'user', displayName: 'gpatel' },
  { id: 'hcho', kind: 'user', displayName: 'hcho' },
  { id: 'iyamamoto', kind: 'user', displayName: 'iyamamoto' },
  { id: 'jchen', kind: 'user', displayName: 'jchen' },
  { id: 'koconnor', kind: 'user', displayName: 'koconnor' },
  { id: 'lrivera', kind: 'user', displayName: 'lrivera' },
  { id: 'platform-sre', kind: 'group', displayName: 'platform-sre' },
  { id: 'app-owners', kind: 'group', displayName: 'app-owners' },
  { id: 'cost-mgmt', kind: 'group', displayName: 'cost-mgmt' },
  { id: 'security-reviewers', kind: 'group', displayName: 'security-reviewers' },
  { id: 'hcc-admins', kind: 'group', displayName: 'hcc-admins' },
  { id: 'dev-portal', kind: 'group', displayName: 'dev-portal' }
];

export function findShareDirectoryEntry(key: string): ShareDirectoryEntry | undefined {
  return SHARE_DIRECTORY.find((e) => shareDirectoryEntryKey(e) === key);
}
