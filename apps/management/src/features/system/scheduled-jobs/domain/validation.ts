export function validateMaxRetry(maxRetry: number): string | null {
  if (!Number.isInteger(maxRetry) || maxRetry < 1) return 'sj_max_retry_invalid';
  return null;
}

export function validateManualRunReason(reason: string): string | null {
  if (!reason.trim()) return 'sj_reason_required';
  return null;
}

export function validatePayloadJson(payload: string): string | null {
  const trimmed = payload.trim();
  if (!trimmed) return null;
  try {
    JSON.parse(trimmed);
    return null;
  } catch {
    return 'sj_payload_invalid';
  }
}

export function validateJobName(name: string): string | null {
  if (!name.trim()) return 'sj_name_required';
  return null;
}
