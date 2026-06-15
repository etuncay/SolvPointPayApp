import { useQuery } from '@tanstack/react-query';
import { customerPortalApi } from '@epay/data';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/icons/Icon';

export function FeeTable() {
  const { t } = useTranslation();
  const { data: fees = [] } = useQuery({
    queryKey: ['fees'],
    queryFn: () => customerPortalApi.listFees(),
  });

  return (
    <div className="card fee-table-card">
      <div className="fee-table-head">
        <Icon name="info" style={{ width: 17, height: 17, color: 'var(--brand-600)' }} />
        <strong style={{ fontSize: 14 }}>{t('transfer_fee_title')}</strong>
      </div>
      <div className="table-wrap" style={{ boxShadow: 'none', border: 'none' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>{t('transfer_fee_range')}</th>
              <th>{t('transfer_fee_fixed')}</th>
              <th>{t('transfer_fee_rate')}</th>
              <th>{t('transfer_fee_campaign')}</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.id} style={{ cursor: 'default' }}>
                <td className="tnum" style={{ color: 'var(--ink)', fontWeight: 600 }}>
                  {f.range} {f.currency}
                </td>
                <td className="tnum">{f.fixed}</td>
                <td className="tnum">{f.rate}</td>
                <td>
                  {f.campaign === '—' || !f.campaign ? (
                    <span style={{ color: 'var(--faint)' }}>—</span>
                  ) : (
                    <span className="pill pill-completed" style={{ fontSize: 11 }}>
                      {t('transfer_fee_until', { date: f.campaign })}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
