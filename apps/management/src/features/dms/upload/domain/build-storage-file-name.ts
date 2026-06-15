import { getFileExtension } from './file-validation';

/** ID-TypeCode-Timestamp — spec §8 */
export function formatStorageTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
  );
}

export function buildStorageFileName(
  primaryEntityId: string,
  typeCode: string,
  originalFileName: string,
  at: Date = new Date(),
): string {
  const ext = getFileExtension(originalFileName) || 'bin';
  const safeId = primaryEntityId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeCode = typeCode.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${safeId}-${safeCode}-${formatStorageTimestamp(at)}.${ext}`;
}
