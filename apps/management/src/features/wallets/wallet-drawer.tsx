import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Eye, X, type LucideIcon } from 'lucide-react';
import { Button, IconButton, WALLET_TYPE_META, type WalletTypeCode } from '@epay/ui';
import type { Wallet } from './domain/types';
import { fmtNumber } from '@/lib/format';

const AVATAR_STYLE: Record<string, { bg: string; color: string }> = {
  cust: { bg: 'var(--info-soft)', color: 'var(--info-fg)' },
  savg: { bg: 'var(--accent-soft)', color: 'var(--accent-fg)' },
  adv: { bg: 'var(--warn-soft)', color: 'var(--warn-fg)' },
  com: { bg: 'var(--ok-soft)', color: 'var(--ok-fg)' },
  res: { bg: 'oklch(0.93 0.04 280)', color: 'oklch(0.42 0.13 280)' },
  rev: { bg: 'var(--ok-soft)', color: 'var(--ok-fg)' },
  sus: { bg: 'var(--danger-soft)', color: 'var(--danger-fg)' },
  set: { bg: 'oklch(0.93 0.03 195)', color: 'oklch(0.42 0.12 195)' },
};

export function WalletDrawer({ wallet: w, onClose }: { wallet: Wallet; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const lang = i18n.language;

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);

  const meta = WALLET_TYPE_META[w.type as WalletTypeCode] ?? WALLET_TYPE_META.customer_main;
  const Icon = meta.Icon as LucideIcon;
  const avatar = AVATAR_STYLE[meta.iconCls] ?? AVATAR_STYLE.cust;

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} role="presentation" />
      <div className="cust-drawer open" role="dialog">
        <div className="head">
          <div
            className="avatar"
            style={{
              width: 44,
              height: 44,
              borderRadius: w.cat === 'customer' ? '50%' : 10,
              display: 'grid',
              placeItems: 'center',
              background: avatar.bg,
              color: avatar.color,
              flexShrink: 0,
            }}
          >
            <Icon size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-mono)' }}>{w.walletNo}</span>
              <span className={`cat-badge ${w.cat}`}>{t(`wl_owner_${w.cat}`)}</span>
            </h2>
            <div className="sub">
              <span>{t(`wt_${w.type}`)}</span>
              <span className="t-mute">·</span>
              <span className="mono">{w.ccy}</span>
              {w.blocked === -1 && <span className="badge danger">{t('wl_full_blocked')}</span>}
            </div>
          </div>
          <IconButton onClick={onClose} aria-label="close">
            <X size={16} />
          </IconButton>
        </div>
        <div className="body">
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
              padding: '16px 18px',
              marginBottom: 18,
              background: 'var(--bg-sunken)',
            }}
          >
            <div className="kpi-label" style={{ marginBottom: 2 }}>
              {t('wl_c_available')}
            </div>
            <div className="kpi-value" style={{ fontSize: 26 }}>
              {fmtNumber(w.available, lang)}
              <span style={{ fontSize: 14, color: 'var(--fg-muted)', marginLeft: 6 }}>{w.ccy}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12 }}>
              <div>
                <span className="t-mute">{t('cba_col_balance')}: </span>
                <span className="mono">{fmtNumber(w.balance, lang)}</span>
              </div>
              <div>
                <span className="t-mute">{t('fcd_blocked')}: </span>
                <span
                  className="mono"
                  style={{
                    color:
                      w.blocked === -1
                        ? 'var(--danger-fg)'
                        : w.blocked > 0
                          ? 'var(--warn-fg)'
                          : 'var(--fg-faint)',
                  }}
                >
                  {w.blocked === -1
                    ? tr
                      ? '-1 (Tam Bloke)'
                      : '-1 (Full block)'
                    : fmtNumber(w.blocked, lang)}
                </span>
              </div>
            </div>
          </div>

          {w.cat !== 'system' && (
            <>
              <div className="section-h">{tr ? 'Hesap Sahibi' : 'Owner'}</div>
              <div className="kv-grid">
                <div className="kv">
                  <span className="k">{w.cat === 'agent' ? 'Temsilci No' : 'Müşteri No'}</span>
                  <span className="v mono">#{w.ownerNo}</span>
                </div>
                <div className="kv">
                  <span className="k">{tr ? 'Ad / Unvan' : 'Name / Title'}</span>
                  <span className="v">{w.ownerName}</span>
                </div>
                <div className="kv">
                  <span className="k">{t('fcd_customer_phone')}</span>
                  <span className="v mono">{w.phone}</span>
                </div>
                <div className="kv">
                  <span className="k">{w.idKind ?? 'ID'}</span>
                  <span className="v mono">{w.idNo}</span>
                </div>
                {w.city && (
                  <div className="kv" style={{ gridColumn: '1 / -1' }}>
                    <span className="k">{t('rpt_col_city')}</span>
                    <span className="v">{w.city}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="section-h" style={{ marginTop: 22 }}>
            {tr ? 'Bugün' : 'Today'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="kpi">
              <span className="kpi-label">{t('wl_c_tx_count')}</span>
              <span className="kpi-value sm">{w.txToday}</span>
            </div>
            <div className="kpi">
              <span className="kpi-label">{t('wl_c_tx_amount')}</span>
              <span className="kpi-value sm">
                {fmtNumber(w.txAmtToday, lang)} <span className="t-mute fs-11">{w.ccy}</span>
              </span>
            </div>
          </div>

          <div className="section-h" style={{ marginTop: 22 }}>
            {tr ? 'Sistem Bilgisi' : 'System'}
          </div>
          <div className="kv-grid">
            <div className="kv">
              <span className="k">{t('cba_col_account')}</span>
              <span className="v mono">{w.walletNo}</span>
            </div>
            <div className="kv">
              <span className="k">{tr ? 'Cüzdan ID' : 'Wallet ID'}</span>
              <span className="v mono">{w.id}</span>
            </div>
            <div className="kv">
              <span className="k">{t('sc_col_created')}</span>
              <span className="v mono">{w.createdAt}</span>
            </div>
            <div className="kv">
              <span className="k">{t('wl_c_ccy')}</span>
              <span className="v mono">{w.ccy}</span>
            </div>
          </div>
        </div>
        <div className="foot">
          <Button type="button" asChild>
            <Link to={`/wallets/${w.id}/activities`}>
              <Eye size={13} />
              {t('wd_activities')}
            </Link>
          </Button>
          <Button type="button" variant="primary" asChild>
            <Link to={`/wallets/${w.id}`}>
              {t('wd_detail')} <ArrowRight size={13} />
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
