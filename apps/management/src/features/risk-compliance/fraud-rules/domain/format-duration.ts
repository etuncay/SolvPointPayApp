/** Ortalama vaka süresi — spec humanize (45 dk, 1g 2s) */
export function formatCaseReviewDuration(minutes: number, lang: string): string {
  const tr = lang === 'tr';
  if (minutes < 60) {
    return tr ? `${Math.round(minutes)} dk` : `${Math.round(minutes)} min`;
  }

  const days = Math.floor(minutes / (60 * 24));
  const remAfterDays = minutes % (60 * 24);
  const hours = Math.floor(remAfterDays / 60);
  const mins = Math.round(remAfterDays % 60);

  if (days > 0) {
    if (hours > 0) return tr ? `${days}g ${hours}s` : `${days}d ${hours}h`;
    return tr ? `${days}g` : `${days}d`;
  }

  if (mins > 0) return tr ? `${hours}s ${mins}dk` : `${hours}h ${mins}m`;
  return tr ? `${hours}s` : `${hours}h`;
}
