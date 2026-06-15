import { useTranslation } from 'react-i18next';
import type { IntegrationType } from '../domain/types';

export function IntegrationTypeBadge({ type }: { type: IntegrationType }) {
  const { t } = useTranslation();
  return <span className="pill fs-11 pill-info">{t(`int_type_${type}`, type)}</span>;
}
