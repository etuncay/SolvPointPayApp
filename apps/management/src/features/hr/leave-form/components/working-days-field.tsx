import { useTranslation } from 'react-i18next';
import { Field } from '@epay/ui';

export function WorkingDaysField({ value }: { value: number }) {
  const { t } = useTranslation();
  return (
    <Field label={t('lf_working_days')}>
      <input className="input mono" readOnly value={String(value)} />
    </Field>
  );
}
