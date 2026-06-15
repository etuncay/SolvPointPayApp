import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { PageHead } from '@epay/ui';

export function HrSectionPlaceholder({ specNo, titleKey }: { specNo: string; titleKey: string }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <>
      <PageHead title={t(titleKey)} subtitle={t('hr_stub_sub')} status={<span className="mono fs-11 t-mute">{specNo}</span>} />
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">{t('coming_soon')}</p>
        <Link className="link fs-12" to="/hr/employees">
          {t('hr_back_list')}
        </Link>
        <p className="t-mute fs-11 mono" style={{ marginTop: 8 }}>
          {pathname}
        </p>
      </div>
    </>
  );
}
