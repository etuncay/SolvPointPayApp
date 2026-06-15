import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';

export function VersionHistoryBar({
  lastUpdatedAt,
  lastUpdatedBy,
  versionId,
  asOf,
  onAsOfChange,
  onClearAsOf,
  isHistorical,
}: {
  lastUpdatedAt: string;
  lastUpdatedBy: string;
  versionId: string;
  asOf: string;
  onAsOfChange: (v: string) => void;
  onClearAsOf: () => void;
  isHistorical: boolean;
}) {
  const { t, i18n } = useTranslation();
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

  return (
    <div className="rl-version-bar">
      <div className="rl-version-meta">
        <span className="t-mute">{t('refreshed_at')}: </span>
        <span className="mono">{fmt(lastUpdatedAt)}</span>
        <span className="t-mute"> · {lastUpdatedBy}</span>
        <span className="t-mute"> · {versionId}</span>
        {isHistorical && <span className="rl-version-historical">{t('rl_historical_mode')}</span>}
      </div>
      <div className="rl-version-query">
        <label className="fs-12 t-mute" htmlFor="rl-as-of">
          {t('rl_as_of_query')}
        </label>
        <input
          id="rl-as-of"
          className="input"
          type="date"
          value={asOf}
          onChange={(e) => onAsOfChange(e.target.value)}
        />
        {asOf ? (
          <Button type="button" variant="ghost" size="sm" onClick={onClearAsOf}>
            {t('rl_clear_as_of')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
