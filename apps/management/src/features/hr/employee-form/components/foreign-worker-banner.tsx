import { useTranslation } from 'react-i18next';

type Props = { nationality: string };

export function ForeignWorkerBanner({ nationality }: Props) {
  const { t } = useTranslation();
  if (nationality === 'TUR' || !nationality) return null;

  return (
    <div className="card" style={{ padding: 12, marginBottom: 16, background: 'var(--bg-subtle)' }}>
      <p className="fs-12 t-mute">{t('ef_foreign_worker_hint')}</p>
    </div>
  );
}
