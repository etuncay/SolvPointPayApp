import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, PageHead } from '@epay/ui';

/** Tanımsız route — React Router 404 ErrorResponse yerine okunabilir sayfa */
export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <>
      <PageHead title={t('app_not_found_title')} subtitle={t('app_not_found_body')} />
      <div className="empty-state" style={{ padding: 48 }}>
        <Button variant="primary" size="sm" asChild>
          <Link to="/">{t('page_title')}</Link>
        </Button>
      </div>
    </>
  );
}
