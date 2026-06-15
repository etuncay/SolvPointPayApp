import { extractPlaceholders, isAllowedPlaceholder } from './placeholder-catalog';

export function validateTemplateContent(content: string, subject = ''): string | null {
  const combined = `${subject}\n${content}`;
  for (const key of extractPlaceholders(combined)) {
    if (!isAllowedPlaceholder(key)) return 'nt_invalid_placeholder';
  }
  if (!content.trim()) return 'nt_content_required';
  return null;
}
