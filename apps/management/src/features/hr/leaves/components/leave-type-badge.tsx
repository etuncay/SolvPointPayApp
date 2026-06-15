import { useTranslation } from 'react-i18next';
import type { LeaveType } from '../domain/types';

export function LeaveTypeBadge({ type }: { type: LeaveType }) {
  const { t } = useTranslation();
  return <span className="pill fs-11">{t(`lv_type_${type}`)}</span>;
}
