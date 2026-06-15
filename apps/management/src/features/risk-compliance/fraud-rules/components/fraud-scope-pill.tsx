import { useTranslation } from 'react-i18next';
import type { FraudScope } from '../domain/types';

export function FraudScopePill({ scope }: { scope: FraudScope }) {
  const { t } = useTranslation();
  return (
    <span className={`pill ${scope === 'Onboarding' ? 'info' : 'accent'}`}>
      {t(scope === 'Onboarding' ? 'fr_scope_onboarding' : 'fr_scope_remittance')}
    </span>
  );
}
