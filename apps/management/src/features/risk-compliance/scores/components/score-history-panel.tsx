import { History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DynamicTable, FormCard, type TableConfig } from '@epay/ui';
import {
  historyBarWidthPercent,
  historyRowClassForLevel,
} from '../domain/history-colors';
import type { RiskLevel } from '../../shared/risk-classification';
import type { ScoreHistoryEntry } from '../domain/types';

const LEVEL_KEYS: Record<RiskLevel, string> = {
  Low: 'rs_level_low',
  Medium: 'rs_level_medium',
  High: 'scf_level_High',
  Critical: 'rs_level_critical',
};

const LEVEL_SEG: Record<RiskLevel, string> = {
  Low: 'low',
  Medium: 'med',
  High: 'high',
  Critical: 'critical',
};

export function ScoreHistoryPanel({ history }: { history: ScoreHistoryEntry[] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  return (
    <FormCard
      title={t('rsc_panel_history')}
      icon={<History size={13} />}
      meta={<span className="mono fs-11 t-mute">{history.length}</span>}
      id="sec-history"
      padless
    >
      <div className="rsc-table-wrap">
        <DynamicTable
          config={
            {
              rowKey: 'id',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: false,
              columns: [
                { key: 'at', title: t('rpt_col_date'), dataIndex: 'at', render: 'renderDate' },
                { key: 'score', title: t('rsc_col_score'), dataIndex: 'score', render: 'renderScore', align: 'right', width: 110 },
                { key: 'category', title: t('scf_doc_category'), dataIndex: 'category', render: 'renderCategory' },
                { key: 'bar', title: t('rsc_col_bar'), dataIndex: 'score', render: 'renderBar' },
              ],
              api: {
                method: async () => ({
                  success: true,
                  data: history as unknown as Record<string, unknown>[],
                  total: history.length,
                }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={{
            renderDate: (v: unknown) => (
              <span className="mono fs-12">
                {new Date(String(v ?? '')).toLocaleString(lang === 'tr' ? 'tr-TR' : 'en-US', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </span>
            ),
            renderScore: (v: unknown) => <span className="rsc-history-score">{String(v ?? '0')}</span>,
            renderCategory: (v: unknown) => {
              const category = (String(v ?? 'Low') as RiskLevel);
              return <span className={`risk-seg ${LEVEL_SEG[category]}`}>{t(LEVEL_KEYS[category])}</span>;
            },
            renderBar: (v: unknown, row: Record<string, unknown>) => {
              const score = Number(v ?? 0);
              const category = (String(row.category ?? 'Low') as RiskLevel);
              const rowClass = historyRowClassForLevel(category);
              return (
                <div className="rsc-history-visual">
                  <div className="score-history-bar-track">
                    <div className={`score-history-bar-fill ${rowClass}`} style={{ width: `${historyBarWidthPercent(score)}%` }} />
                  </div>
                  <span className="mono fs-11 t-mute">{score}</span>
                </div>
              );
            },
          }}
          locale={i18n.language}
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      </div>
    </FormCard>
  );
}
