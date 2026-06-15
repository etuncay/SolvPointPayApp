import { useTranslation } from 'react-i18next';

export function CancelContextBanner({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) {
  const { t } = useTranslation();
  const range = startDate === endDate ? startDate : `${startDate} – ${endDate}`;
  return (
    <p className="banner-info fs-12" style={{ marginBottom: 16 }}>
      {t('lf_cancel_context', { range })}
    </p>
  );
}
