import { useTranslation } from 'react-i18next';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { AgentRole } from '../domain/types';

/** Temsilci rolü rozeti — gönderen (çıkış) / alıcı (giriş) temsilcisi. */
export function AgentRoleBadge({ role }: { role: AgentRole }) {
  const { t } = useTranslation();
  const isSender = role === 'SenderAgent';
  return (
    <span
      className={`badge ${isSender ? 'badge--danger' : 'badge--success'}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
    >
      {isSender ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
      {t(isSender ? 'ag_tx_hist_role_sender' : 'ag_tx_hist_role_receiver')}
    </span>
  );
}
