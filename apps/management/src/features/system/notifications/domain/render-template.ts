/** `{key}` placeholder değerlerini doldurur */
export function renderTemplate(
  content: string,
  params: Record<string, string>,
): string {
  return content.replace(/\{([a-z0-9_]+)\}/gi, (_, key: string) => {
    const k = key.toLowerCase();
    return params[k] ?? params[key] ?? `{${key}}`;
  });
}
