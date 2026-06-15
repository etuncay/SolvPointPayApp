import { getActiveParameterValue } from '@/mocks/system-parameters';
import { DEFAULT_MAX_FILE_SIZE_MB } from '@/mocks/document-upload-params';

/** Boş bırakılırsa parametre varsayılanı — spec §8 */
export function resolveDefaultMaxSizeMb(input: number | null | undefined): number {
  if (input == null || Number.isNaN(input)) {
    return getActiveParameterValue('upload_limits.default_max_file_size_mb', DEFAULT_MAX_FILE_SIZE_MB);
  }
  return input;
}

export function parseMaxFileSizeInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}
