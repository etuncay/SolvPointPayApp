import type { CaseActionLogEntry } from '../../domain/types';

function formatTs(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const ACTION_LABELS: Record<string, string> = {
  scf_action_create: 'Talep Oluştur',
  scf_action_take: 'Üzerime Al',
  scf_action_transfer: 'Havale Et',
  scf_action_contact: 'İletişim Kaydı',
  scf_action_info_request: 'Bilgi İsteği',
  scf_action_resolve: 'Çözümle ve Kapat',
  scf_action_reject: 'Reddet',
  scf_action_reopen: 'Yeniden Aç',
  scf_action_recon_rerun: 'Mutabakat Tekrar',
};

export function formatCaseNoteLine(entry: CaseActionLogEntry, actionLabel: string): string {
  return `${entry.performedByName} – ${formatTs(entry.createdAt)} – ${actionLabel}: ${entry.note}`;
}

export function appendCaseNote(existing: string, line: string): string {
  if (!existing.trim()) return line;
  return `${existing.trim()}\n${line}`;
}
