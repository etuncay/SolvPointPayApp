import { useTranslation } from 'react-i18next';
import { fmtNumber } from '@/lib/format';
import type { SenderLookupResult } from '@/features/agent-transactions/domain/customer-lookup';

interface Props {
  sender: SenderLookupResult;
  onChange: () => void;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase();
}

/** Sorgu sonrası gönderen profil kartı (referans tasarım). */
export function SenderCard({ sender, onChange }: Props) {
  const { t, i18n } = useTranslation();
  const isCorporate = sender.customerType === 'corporate';
  const balanceWallet = sender.wallets.find((w) => w.currency === 'TRY') ?? sender.wallets[0];

  return (
    <div
      className="fcard"
      style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16, padding: 16, flexWrap: 'wrap' }}
    >
      <div
        aria-hidden
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: 14,
          color: '#fff',
          background: isCorporate ? '#6366f1' : '#0d9488',
          flexShrink: 0,
        }}
      >
        {initials(sender.fullName)}
      </div>

      <div style={{ flex: '1 1 220px', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 14 }}>{sender.fullName}</strong>
          <span className="badge" style={{ fontSize: 10 }}>
            {isCorporate ? t('ag_tr_sender_corp') : t('ag_tr_sender_indv')}
          </span>
          {sender.status === 'active' ? (
            <span className="badge badge--success" style={{ fontSize: 10 }}>
              {t('ag_tr_st_active')}
            </span>
          ) : null}
        </div>
        <div className="t-mute fs-12" style={{ marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="mono">{sender.customerNo}</span>
          <span>·</span>
          <span className="mono">{isCorporate ? `VKN ${sender.idNo}` : `TCKN ${sender.idNo}`}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        <div>
          <div className="t-mute fs-11" style={{ textTransform: 'uppercase' }}>
            {isCorporate ? t('ag_tr_kyc_status') : t('ag_tr_kyc_level')}
          </div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{sender.kycLevel}</div>
        </div>
        {balanceWallet ? (
          <div>
            <div className="t-mute fs-11" style={{ textTransform: 'uppercase' }}>
              {t('ag_tr_wallet_balance')}
            </div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>
              {fmtNumber(balanceWallet.available, i18n.language)} {balanceWallet.currency}
            </div>
          </div>
        ) : null}
      </div>

      <button type="button" className="btn btn-secondary" onClick={onChange}>
        {t('ag_tr_change_sender')}
      </button>
    </div>
  );
}
