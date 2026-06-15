import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, X } from 'lucide-react';
import { Button, Field, IconButton } from '@epay/ui';
import type { ReportDefinition, ReportParams } from '../domain/types';

export function ReportParamDrawer({
  definition,
  initialParams,
  loading,
  onClose,
  onGenerate,
}: {
  definition: ReportDefinition | null;
  initialParams?: ReportParams;
  loading?: boolean;
  onClose: () => void;
  onGenerate: (params: ReportParams) => void;
}) {
  const { t } = useTranslation();
  const [params, setParams] = useState<ReportParams>({
    dateFrom: '2026-04-01',
    dateTo: '2026-05-24',
    reportDate: '2026-05-24',
    currency: 'any',
    channel: 'any',
    entityType: 'any',
  });

  useEffect(() => {
    if (initialParams) {
      setParams((p) => ({ ...p, ...initialParams }));
    }
  }, [initialParams, definition?.code]);

  useEffect(() => {
    if (!definition) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [definition, onClose]);

  if (!definition) return null;

  const daily = definition.requiresReportDate;

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} role="presentation" />
      <div className="drawer open rpt-param-drawer" role="dialog" aria-labelledby="rpt-param-title">
        <div className="drawer-head">
          <h2 id="rpt-param-title">{t(definition.titleKey)}</h2>
          <IconButton onClick={onClose} aria-label={t('lf_cancel_back')}>
            <X size={16} />
          </IconButton>
        </div>

        <div className="drawer-body">
          <p className="fs-12 t-mute" style={{ margin: '0 0 14px' }}>
            {t(definition.descriptionKey)}
          </p>

          <div className="rpt-param-form">
            {daily ? (
              <Field label={t('rpt_param_report_date')} hint={t('rpt_schedule_daily_hint')}>
                <input
                  type="date"
                  className="input"
                  value={params.reportDate ?? ''}
                  onChange={(e) => setParams((p) => ({ ...p, reportDate: e.target.value }))}
                />
              </Field>
            ) : (
              <>
                <Field label={t('rpt_param_date_from')}>
                  <input
                    type="date"
                    className="input"
                    value={params.dateFrom ?? ''}
                    onChange={(e) => setParams((p) => ({ ...p, dateFrom: e.target.value }))}
                  />
                </Field>
                <Field label={t('rpt_param_date_to')}>
                  <input
                    type="date"
                    className="input"
                    value={params.dateTo ?? ''}
                    onChange={(e) => setParams((p) => ({ ...p, dateTo: e.target.value }))}
                  />
                </Field>
                {definition.code === 'financial_transactions' && (
                  <Field label={t('rpt_param_currency')}>
                    <select
                      className="select"
                      value={params.currency ?? 'any'}
                      onChange={(e) => setParams((p) => ({ ...p, currency: e.target.value }))}
                    >
                      <option value="any">{t('ib_all')}</option>
                      <option value="TRY">TRY</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </Field>
                )}
              </>
            )}
          </div>
        </div>

        <div className="drawer-foot" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button type="button" variant="primary" disabled={loading} onClick={() => onGenerate(params)}>
            <Play size={14} /> {t('rpt_generate')}
          </Button>
        </div>
      </div>
    </>
  );
}
