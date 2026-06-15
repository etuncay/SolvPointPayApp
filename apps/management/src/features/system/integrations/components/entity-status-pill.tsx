import { useTranslation } from 'react-i18next';
import type { EntityStatus } from '../domain/types';

export function EntityStatusPill({ status }: { status: EntityStatus }) {
  const { t } = useTranslation();
  const tone = status === 'Active' ? 'success' : 'neutral';
  return (
    <span className={`pill fs-11 pill-${tone}`}>{t(`int_entity_${status}`, status)}</span>
  );
}
