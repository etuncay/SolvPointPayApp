import { useTranslation } from 'react-i18next';

export function LimitValueInput({
  value,
  onChange,
  readOnly,
}: {
  value: number;
  onChange: (v: number) => void;
  readOnly?: boolean;
}) {
  const { t } = useTranslation();

  const isUnlimited = value === -1;
  const isClosed = value === 0;

  return (
    <div className="rl-limit-cell">
      <input
        className={`rl-limit-input${isUnlimited ? ' is-unlimited' : ''}${isClosed ? ' is-closed' : ''}`}
        type="number"
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange(Number(e.target.value))}
        title={t('rl_limit_hint')}
        aria-label={t('rl_limit_hint')}
      />
      {isUnlimited ? (
        <span className="rl-limit-tag is-unlimited">{t('rl_unlimited')}</span>
      ) : isClosed ? (
        <span className="rl-limit-tag is-closed">{t('rl_closed')}</span>
      ) : null}
    </div>
  );
}
