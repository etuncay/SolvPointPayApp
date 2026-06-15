import { useTranslation } from 'react-i18next';
import type { FraudRuleStatus } from '../domain/types';

export function FraudRuleStatusPill({ status }: { status: FraudRuleStatus }) {
  const { t } = useTranslation();
  const active = status === 'Active';
  return (
    <span className={`pill ${active ? 'ok' : 'mute'}`}>
      {t(active ? 'ib_status_Active' : 'rs_status_passive')}
    </span>
  );
}
