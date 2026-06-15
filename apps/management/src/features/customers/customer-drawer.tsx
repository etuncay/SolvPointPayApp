import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Eye, Info, X } from 'lucide-react';
import { Button, IconButton } from '@epay/ui';
import type { CustomerListItem } from './domain/types';
import { fmtMoney, fmtNumber } from '@/lib/format';
import { CustomerAvatar } from './domain/customer-avatar';
import { StatusPill } from './domain/status-pill';
import { TypeBadge } from './domain/type-badge';
import { KycPill } from './domain/kyc-pill';

export function CustomerDrawer({ customer: c, onClose }: { customer: CustomerListItem; onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const lang = i18n.language;
  const tr = lang === 'tr';

  useEffect(() => {
    setTab('overview');
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [c, onClose]);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(tr ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });

  const segLabel =
    c.riskSeg === 'low'
      ? t('rs_level_low')
      : c.riskSeg === 'med'
        ? t('rs_level_medium')
        : c.riskSeg === 'high'
          ? t('scf_level_High')
          : t('scf_level_Critical');

  const openDetail = () => {
    onClose();
    if (c.type === 'corporate') {
      navigate(`/customers/${c.id}/corporate`);
      return;
    }
    navigate(`/customers/${c.id}/individual`);
  };

  const tabs = [
    { id: 'overview', label: t('nav_overview') },
    { id: 'kyc', label: t('rpt_col_kyc') },
    { id: 'wallets', label: t('cd_wallets') },
    { id: 'txns', label: t('cd_txns') },
    { id: 'notes', label: t('scf_notes') },
  ];

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} role="presentation" />
      <div className="cust-drawer open" role="dialog">
        <div className="head">
          <CustomerAvatar customer={c} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{c.name}</h2>
            <div className="sub">
              <span className="mono">#{c.id}</span>
              <TypeBadge type={c.type} />
              <StatusPill customer={c} />
            </div>
          </div>
          <IconButton onClick={onClose} aria-label="close">
            <X size={16} />
          </IconButton>
        </div>
        <div className="drawer-tabs2">
          {tabs.map((tb) => (
            <button
              key={tb.id}
              type="button"
              className={tab === tb.id ? 'on' : ''}
              onClick={() => setTab(tb.id)}
            >
              {tb.label}
            </button>
          ))}
        </div>
        <div className="body">
          {tab === 'overview' && (
            <>
              <div className="kv-grid">
                <div className="kv">
                  <span className="k">{t('fcd_customer_email')}</span>
                  <span className="v" title={c.email}>
                    {c.email}
                  </span>
                </div>
                <div className="kv">
                  <span className="k">{t('fcd_customer_phone')}</span>
                  <span className="v mono">{c.phone}</span>
                </div>
                <div className="kv">
                  <span className="k">
                    {t('cd_id')} ({c.idKind})
                  </span>
                  <span className="v mono">{c.idNo}</span>
                </div>
                <div className="kv">
                  <span className="k">{t('rpt_col_city')}</span>
                  <span className="v">{c.city}</span>
                </div>
                <div className="kv">
                  <span className="k">{t('cc_risk_seg')}</span>
                  <span className="v">
                    <span className={`risk-seg ${c.riskSeg}`}>{segLabel}</span>
                  </span>
                </div>
                <div className="kv">
                  <span className="k">{t('cc_risk_score')}</span>
                  <span className="v mono">
                    {c.riskScore} / 100
                  </span>
                </div>
                <div className="kv">
                  <span className="k">{t('cc_campaign')}</span>
                  <span className="v">{c.campaign ?? t('scf_none')}</span>
                </div>
                <div className="kv">
                  <span className="k">KYC</span>
                  <span className="v">
                    <KycPill customer={c} />
                  </span>
                </div>
                <div className="kv">
                  <span className="k">{t('frd_exc_created')}</span>
                  <span className="v mono">{fmtDate(c.createdAt)}</span>
                </div>
              </div>
              <div className="section-h" style={{ marginTop: 22 }}>
                {tr ? 'Son 7 Gün Özet' : 'Last 7 days'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="kpi">
                  <span className="kpi-label">{tr ? 'İşlem' : 'Transactions'}</span>
                  <span className="kpi-value sm">{Math.floor(c.riskScore / 5) + 3}</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">{tr ? 'Hacim' : 'Volume'}</span>
                  <span className="kpi-value sm">{fmtMoney(c.riskScore * 1820 + 4200, lang)}</span>
                </div>
                <div className="kpi">
                  <span className="kpi-label">{tr ? 'Bekleyen' : 'Pending'}</span>
                  <span className="kpi-value sm">{c.status === 'active' ? 0 : 1}</span>
                </div>
              </div>
            </>
          )}
          {tab !== 'overview' && (
            <div className="empty-state">
              <div className="glyph">
                <Info size={22} />
              </div>
              <h3>{tr ? 'Önizleme dışında' : 'Out of preview'}</h3>
              <p>
                {tr
                  ? 'Bu sekmenin içeriği ilgili modül ekranında görüntülenir.'
                  : "Open the full detail screen to see this tab's content."}
              </p>
            </div>
          )}
        </div>
        <div className="foot">
          <Button type="button" onClick={openDetail}>
            <Eye size={13} /> {t('ib_edit')}
          </Button>
          <Button type="button" variant="primary" onClick={openDetail}>
            {t('cd_open')} <ArrowRight size={13} />
          </Button>
        </div>
      </div>
    </>
  );
}
