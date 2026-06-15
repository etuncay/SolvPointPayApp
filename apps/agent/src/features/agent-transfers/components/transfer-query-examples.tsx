import { useTranslation } from 'react-i18next';

const EXAMPLES = [
  { value: '78568632556', labelKey: 'ag_tr_ex_indv_l2' },
  { value: '75683988090', labelKey: 'ag_tr_ex_indv_l1' },
  { value: '1792956117', labelKey: 'ag_tr_ex_corp' },
  { value: '00000000000', labelKey: 'ag_tr_ex_none' },
] as const;

type Props = {
  value?: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
  onExamplePick?: (value: string) => void;
};

/** DynamicForm CustomComponent — örnek kimlik chip'leri. */
export function TransferQueryExamples({ disabled, onExamplePick }: Props) {
  const { t } = useTranslation();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span className="t-mute fs-11">{t('ag_tr_try_examples')}</span>
      {EXAMPLES.map((ex) => (
        <button
          key={ex.value}
          type="button"
          className="chip"
          disabled={disabled}
          style={{
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: 6,
            border: '1px solid var(--line, #e5e7eb)',
            background: 'var(--surface-2, #f8fafc)',
            cursor: disabled ? 'default' : 'pointer',
            fontFamily: 'var(--font-mono, monospace)',
          }}
          onClick={() => onExamplePick?.(ex.value)}
        >
          {ex.value} · {t(ex.labelKey)}
        </button>
      ))}
    </div>
  );
}
