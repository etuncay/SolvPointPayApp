/** Spec §8 — append-only not formatı */
export function formatTransactionNote(params: {
  authorName: string;
  createdAt: string;
  action: string;
  text: string;
}): string {
  const date = params.createdAt.slice(0, 10);
  return `${params.authorName} – ${date} – ${params.action}: ${params.text}`;
}

export function joinTransactionNotes(notes: Array<{ formatted: string }>): string {
  return notes.map((n) => n.formatted).join('\n');
}
