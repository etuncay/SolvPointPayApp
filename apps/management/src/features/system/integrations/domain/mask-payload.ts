const SENSITIVE_KEYS = ['password', 'secret', 'token', 'apikey', 'authorization', 'credential'];

export function maskPayloadJson(raw: string): string {
  try {
    const obj = JSON.parse(raw) as unknown;
    return JSON.stringify(redact(obj), null, 0).slice(0, 240);
  } catch {
    return raw.length > 120 ? `${raw.slice(0, 120)}…` : raw;
  }
}

function redact(value: unknown): unknown {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(redact);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s))) {
      out[k] = '***';
    } else if (typeof v === 'object') {
      out[k] = redact(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}
