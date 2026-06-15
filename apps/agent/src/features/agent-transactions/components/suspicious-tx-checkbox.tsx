import { useTranslation } from 'react-i18next';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** Şüpheli işlem işareti (form içi veya bağımsız). */
export function SuspiciousTxCheckbox({ checked, onChange, disabled }: Props) {
  const { t } = useTranslation();
  return (
    <label className="field" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="field-label">{t('ag_tr_own_field_suspicious')}</span>
    </label>
  );
}
