import { exportCsv } from '@/lib/csv';
import type { BackOfficeRole } from '@epay/ui';
import { dashboardService } from '../api/dashboard-service';
import type { WidgetCode } from '../domain/types';

export async function exportWidgetCsv(
  code: WidgetCode,
  role: BackOfficeRole,
  refreshCount: number,
): Promise<void> {
  const snap = await dashboardService.refreshAll(role, refreshCount);

  switch (code) {
    case 'my_approvals':
      exportCsv('onaylar', snap.data.my_approvals, [
        { header: 'Referans', value: (r) => r.id },
        { header: 'Tip', value: (r) => r.type },
        { header: 'Talep Eden', value: (r) => r.requester },
        { header: 'Tutar', value: (r) => r.amount },
        { header: 'Bekleme', value: (r) => r.age },
        { header: 'Öncelik', value: (r) => r.priority },
      ]);
      break;
    case 'pending_xfer':
      exportCsv('bekleyen_transfer', snap.data.pending_xfer, [
        { header: 'Referans', value: (r) => r.id },
        { header: 'Müşteri', value: (r) => r.customer },
        { header: 'Tutar', value: (r) => r.amount },
        { header: 'Bekleme', value: (r) => r.age },
      ]);
      break;
    case 'aml_held':
      exportCsv('aml', snap.data.aml_held, [
        { header: 'Referans', value: (r) => r.id },
        { header: 'Müşteri', value: (r) => r.customer },
        { header: 'Kural', value: (r) => r.rule ?? '' },
        { header: 'Tutar', value: (r) => r.amount },
      ]);
      break;
    case 'kyc_manual':
      exportCsv('kyc', snap.data.kyc_manual, [
        { header: 'Referans', value: (r) => r.id },
        { header: 'Müşteri', value: (r) => r.customer },
        { header: 'Sebep', value: (r) => r.reason },
        { header: 'Bekleme', value: (r) => r.age },
      ]);
      break;
    case 'rejected':
      exportCsv('reddedilen', snap.data.rejected, [
        { header: 'Referans', value: (r) => r.id },
        { header: 'Müşteri', value: (r) => r.customer },
        { header: 'Sebep', value: (r) => r.reason ?? '' },
        { header: 'Tutar', value: (r) => r.amount },
      ]);
      break;
    case 'top_customers':
      exportCsv('top_musteri', snap.data.top_customers, [
        { header: 'Sıra', value: (r) => r.rank },
        { header: 'Müşteri', value: (r) => r.name },
        { header: 'Gönderilen', value: (r) => r.sent },
        { header: 'Alınan', value: (r) => r.received },
        { header: 'İşlem', value: (r) => r.txCount },
      ]);
      break;
    case 'top_agents':
      exportCsv('top_temsilci', snap.data.top_agents, [
        { header: 'Sıra', value: (r) => r.rank },
        { header: 'Temsilci', value: (r) => r.name },
        { header: 'Alınan', value: (r) => r.received },
        { header: 'Verilen', value: (r) => r.paid },
        { header: 'İşlem', value: (r) => r.txCount },
      ]);
      break;
    default:
      break;
  }
}

export const TABLE_WIDGETS = new Set<WidgetCode>([
  'my_approvals',
  'pending_xfer',
  'kyc_manual',
  'aml_held',
  'rejected',
  'top_customers',
  'top_agents',
]);
