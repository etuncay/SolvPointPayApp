/** Drawer / detay — tablo ile aynı maskeli metin veya geliştirici modunda tam payload. */
export function formatLogPayloadForDisplay(opts: {
  masked: string;
  full: string;
  developerMode: boolean;
}): string {
  const raw = opts.developerMode ? opts.full : opts.masked;
  return prettyJson(raw);
}

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}
