import { DEFAULT_MAX_FILE_SIZE_MB } from '@/mocks/document-upload-params';

const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'docx',
  'xlsx',
]);

const MACRO_EXTENSIONS = new Set(['docm', 'xlsm']);

const LEGACY_OFFICE = new Set(['doc', 'xls']);

const EXTENSION_MIME: Record<string, string[]> = {
  pdf: ['application/pdf'],
  jpg: ['image/jpeg'],
  jpeg: ['image/jpeg'],
  png: ['image/png'],
  docx: [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ],
  xlsx: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream',
  ],
};

export type FileValidationInput = {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  maxSizeMb?: number;
};

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length < 2) return '';
  return parts[parts.length - 1]!.toLowerCase();
}

export function validateUploadFile(input: FileValidationInput): string | null {
  const ext = getFileExtension(input.fileName);

  if (!ext || MACRO_EXTENSIONS.has(ext) || LEGACY_OFFICE.has(ext)) {
    return 'du_invalid_extension';
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return 'du_invalid_extension';
  }

  const allowedMimes = EXTENSION_MIME[ext];
  if (allowedMimes && input.mimeType) {
    const mime = input.mimeType.toLowerCase();
    const ok =
      allowedMimes.some((m) => mime === m) ||
      (ext === 'jpg' && mime === 'image/jpg');
    if (!ok && mime !== '' && mime !== 'application/octet-stream') {
      return 'du_invalid_mime';
    }
  }

  const maxMb = input.maxSizeMb ?? DEFAULT_MAX_FILE_SIZE_MB;
  const maxBytes = maxMb * 1024 * 1024;
  if (input.sizeBytes > maxBytes) {
    return 'du_file_too_large';
  }

  return null;
}
