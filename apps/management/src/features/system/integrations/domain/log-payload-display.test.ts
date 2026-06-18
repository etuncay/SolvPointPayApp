import { describe, expect, it } from 'vitest';
import { formatLogPayloadForDisplay } from './log-payload-display';

describe('formatLogPayloadForDisplay', () => {
  const masked = '{"apiKey":"***","ref":"ACC-001"}';
  const full = '{"apiKey":"secret-x","ref":"ACC-001"}';

  it('returns masked payload by default', () => {
    const out = formatLogPayloadForDisplay({ masked, full, developerMode: false });
    expect(out).toContain('"***"');
    expect(out).not.toContain('secret-x');
  });

  it('returns full payload in developer mode', () => {
    const out = formatLogPayloadForDisplay({ masked, full, developerMode: true });
    expect(out).toContain('secret-x');
    expect(out).not.toContain('"***"');
  });
});
