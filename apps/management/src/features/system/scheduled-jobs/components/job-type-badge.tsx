import { useTranslation } from 'react-i18next';
import type { JobType } from '../domain/types';

type Props = { jobType: JobType };

export function JobTypeBadge({ jobType }: Props) {
  const { t } = useTranslation();
  return (
    <span className={`pill fs-11 ${jobType === 'Recurring' ? 'pill-info' : 'pill-neutral'}`}>
      {t(`sj_type_${jobType}`, jobType)}
    </span>
  );
}
