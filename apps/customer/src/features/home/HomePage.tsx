import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customerPortalApi } from '@epay/data';
import { Trans, useTranslation } from 'react-i18next';
import { WalletCard } from '@/components/money/WalletCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/icons/Icon';
import { DirBadge } from '@/components/ui/DirBadge';
import { StatusPill } from '@/components/ui/StatusPill';
import { fmtMoney } from '@/lib/format';
import { TxDetailModal } from '@/features/activity/TxDetailModal';
import type { CustomerTransaction } from '@epay/data';
import { useAuth } from '@/app/AuthProvider';

export function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [showFail, setShowFail] = useState(true);
  const [selTx, setSelTx] = useState<CustomerTransaction | null>(null);

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => customerPortalApi.listWallets(),
  });
  const { data: recent = [] } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => customerPortalApi.recentTransactions(7),
  });

  const persistent = wallets.filter((w) => w.editable);
  const viewOnly = wallets.filter((w) => !w.editable);
  const firstName = profile?.name.split(' ')[0] ?? '';
  const fail = profile?.failedAttempt;

  return (
    <div className="page">
      <div className="container">
        {showFail && fail && (
          <AlertBanner tone="warn" icon="shield" onClose={() => setShowFail(false)}>
            <Trans
              i18nKey="failed_access"
              values={{ when: fail.when, city: fail.city, ip: fail.ip }}
              components={{ strong: <strong /> }}
            />
          </AlertBanner>
        )}

        <div className="page-head">
          <div>
            <div className="eyebrow">{t('welcome_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('welcome_greeting', { name: firstName })}
              <span className="home-greeting-wave" aria-hidden>
                {' '}
                👋
              </span>
            </h1>
            <p className="page-sub">
              <Trans
                i18nKey="welcome_key"
                values={{ phrase: profile?.welcomeMessage ?? '—' }}
                components={{
                  strong: <strong style={{ color: 'var(--ink)' }} />,
                }}
              />
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
            <Button variant="soft" onClick={() => navigate('/receive')}>
              <Icon name="receive" /> {t('receive_money')}
            </Button>
            <Button variant="primary" onClick={() => navigate('/send')}>
              <Icon name="send" /> {t('send_money')}
            </Button>
          </div>
        </div>

        <div className="home-wallets">
          {persistent.map((w, i) => (
            <WalletCard
              key={w.id}
              wallet={w}
              featured={i === 0}
              onClick={() => navigate('/activity')}
            />
          ))}
          {viewOnly.map((w) => (
            <WalletCard key={w.id} wallet={w} />
          ))}
        </div>

        <div className="card card-pad home-tx-card">
          <div className="card-head">
            <h3 className="card-title">{t('recent_tx')}</h3>
            <Link to="/activity" className="btn btn-quiet">
              {t('see_all')} <Icon name="right" style={{ width: 15, height: 15 }} />
            </Link>
          </div>
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: 44 }} aria-hidden />
                  <th>{t('tx_col_type')}</th>
                  <th>{t('tx_col_counterparty')}</th>
                  <th>{t('tx_col_date')}</th>
                  <th>{t('tx_col_status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('tx_col_amount')}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((tx) => (
                  <tr key={tx.id} onClick={() => setSelTx(tx)} style={{ cursor: 'pointer' }}>
                    <td>
                      <DirBadge dir={tx.direction} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{tx.type}</div>
                      <div className="tnum" style={{ fontSize: 12, color: 'var(--faint)' }}>
                        {tx.id}
                      </div>
                    </td>
                    <td>{tx.counterparty}</td>
                    <td className="tnum" style={{ whiteSpace: 'nowrap' }}>
                      {tx.date.split(' ')[0]}
                    </td>
                    <td>
                      <StatusPill status={tx.status} />
                    </td>
                    <td className="tnum" style={{ textAlign: 'right' }}>
                      <span className={tx.direction === 'in' ? 'amt-in' : 'amt-out'}>
                        {tx.direction === 'in' ? '+' : '−'}
                        {fmtMoney(tx.amount, tx.symbol)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {selTx && <TxDetailModal tx={selTx} onClose={() => setSelTx(null)} />}
    </div>
  );
}
