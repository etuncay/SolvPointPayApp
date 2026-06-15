import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3 } from 'lucide-react';
import { fmtMoney, fmtNumber } from '@/lib/format';
import { agentTransactionsService } from '@/features/transaction-confirmation/api/agent-transactions-service';
import { aggregateDaily, type DailyAggRow } from '../domain/agent-home';

type Metric = 'count' | 'amount';

function GroupedBars({ rows, metric, lang }: { rows: DailyAggRow[]; metric: Metric; lang: string }) {
  const max = Math.max(
    1,
    ...rows.map((r) =>
      metric === 'count'
        ? Math.max(r.successCount, r.failedCount)
        : Math.max(r.successAmount, r.failedAmount),
    ),
  );

  return (
    <div className="agch-plot" role="img" aria-label="daily chart">
      {rows.map((r) => {
        const success = metric === 'count' ? r.successCount : r.successAmount;
        const failed = metric === 'count' ? r.failedCount : r.failedAmount;
        const tip =
          metric === 'count'
            ? `${r.label} · ✓ ${fmtNumber(success, lang)} · ✕ ${fmtNumber(failed, lang)}`
            : `${r.label} · ✓ ${fmtMoney(success, lang)} · ✕ ${fmtMoney(failed, lang)}`;
        return (
          <div className="agch-col" key={r.day} title={tip}>
            <div className="agch-bars">
              <span
                className="agch-bar agch-bar--ok"
                style={{ height: `${(success / max) * 100}%` }}
              />
              <span
                className="agch-bar agch-bar--bad"
                style={{ height: `${(failed / max) * 100}%` }}
              />
            </div>
            <span className="agch-x">{r.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function DailyCharts() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const rows = useMemo(() => aggregateDaily(agentTransactionsService.listDailyActivity()), []);

  const legend = (
    <div className="agch-legend">
      <span>
        <i className="agch-dot agch-dot--ok" /> {t('ag_home_success')}
      </span>
      <span>
        <i className="agch-dot agch-dot--bad" /> {t('ag_home_failed')}
      </span>
    </div>
  );

  return (
    <section className="agch-grid">
      <div className="fcard">
        <div className="fcard-body">
          <div className="section-h">
            <BarChart3 size={15} /> {t('ag_home_chart_count')}
          </div>
          {legend}
          <GroupedBars rows={rows} metric="count" lang={lang} />
        </div>
      </div>
      <div className="fcard">
        <div className="fcard-body">
          <div className="section-h">
            <BarChart3 size={15} /> {t('ag_home_chart_amount')}
          </div>
          {legend}
          <GroupedBars rows={rows} metric="amount" lang={lang} />
        </div>
      </div>
    </section>
  );
}
