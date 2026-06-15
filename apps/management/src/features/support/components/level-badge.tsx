import { useTranslation } from 'react-i18next';
import type { Level } from '../domain/types';

const TONE: Record<Level, string> = {
  Low: 'muted',
  Medium: 'info',
  High: 'warning',
  Critical: 'danger',
};

type Props = { level: Level };

export function LevelBadge({ level }: Props) {
  const { t } = useTranslation();
  return <span className={`badge ${TONE[level]}`}>{t(`scf_level_${level}`)}</span>;
}
