import { useTranslation } from 'react-i18next';
import { FileText, ShieldCheck } from 'lucide-react';
import { fmtNumber } from '@/lib/format';
import type { TransferVariant } from '../domain/types';

interface Props {
  variantLabel: string;
  variant: TransferVariant;
  senderName: string;
  recipientName?: string;
  currency: string;
  amount: number;
  fee: number;
  targetCurrency?: string;
  targetAmount?: number;
  canSubmit: boolean;
  onSubmit: () => void;
  onReset: () => void;
}

function Row({ k, v, strong, accent }: { k: string; v: string; strong?: boolean; accent?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        padding: '7px 0',
        fontSize: 12.5,
        borderTop: strong ? '1px solid var(--line, #e5e7eb)' : 'none',
        marginTop: strong ? 4 : 0,
      }}
    >
      <span className="t-mute">{k}</span>
      <span
        style={{
          fontWeight: strong ? 700 : 500,
          fontSize: strong ? 15 : 12.5,
          color: accent ? 'var(--accent, #0d9488)' : 'inherit',
          textAlign: 'right',
        }}
      >
        {v}
      </span>
    </div>
  );
}

/** İşlem Özeti — yapışkan sağ sidebar (referans tasarım). */
export function TransferSummary({
  variantLabel,
  variant,
  senderName,
  recipientName,
  currency,
  amount,
  fee,
  targetCurrency,
  targetAmount,
  canSubmit,
  onSubmit,
  onReset,
}: Props) {
  const { t, i18n } = useTranslation();
  const money = (n: number, ccy: string) => `${fmtNumber(n, i18n.language)} ${ccy}`;

  return (
    <div className="fcard" style={{ position: 'sticky', top: 16 }}>
      <div className="fcard-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <FileText size={15} />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{t('ag_tr_summary')}</h3>
        </div>

        {amount > 0 ? (
          <>
            <Row k={t('ag_tr_sum_type')} v={variantLabel} />
            <Row k={t('ag_tr_sum_sender')} v={senderName} />
            {variant !== 'ownWallet' ? (
              <Row k={t('ag_tr_sum_recv')} v={recipientName || '—'} />
            ) : null}
            <Row k={t('ag_tr_sum_amount')} v={money(amount, currency)} />
            <Row k={t('ag_tr_sum_fee')} v={money(fee, currency)} />
            <Row k={t('ag_tr_sum_total')} v={money(amount + fee, currency)} strong accent />
            {variant === 'abroad' && targetCurrency ? (
              <Row k={t('ag_tr_sum_net')} v={money(targetAmount ?? 0, targetCurrency)} />
            ) : null}

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button type="button" className="btn btn-primary" disabled={!canSubmit} onClick={onSubmit}>
                <ShieldCheck size={14} /> {t('ag_tr_btn_send_approval')}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ background: 'transparent' }}
                onClick={onReset}
              >
                {t('ag_tr_btn_form_reset')}
              </button>
            </div>
          </>
        ) : (
          <p className="t-mute fs-12" style={{ margin: 0 }}>
            {t('ag_tr_sum_empty')}
          </p>
        )}
      </div>
    </div>
  );
}
