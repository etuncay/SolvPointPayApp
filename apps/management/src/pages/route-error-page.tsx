import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, PageHead } from '@epay/ui';

/** Router ErrorBoundary — ErrorResponseImpl (404 vb.) için */
export function RouteErrorPage() {
  const { t } = useTranslation();
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText || t('app_not_found_title')}`
    : t('app_error_title');

  const body = isRouteErrorResponse(error)
    ? error.data && typeof error.data === 'string'
      ? error.data
      : t('app_not_found_body')
    : error instanceof Error
      ? error.message
      : t('app_error_body');

  return (
    <>
      <PageHead title={title} subtitle={body} />
      <div className="empty-state" style={{ padding: 48 }}>
        <Button variant="primary" size="sm" asChild>
          <Link to="/">{t('page_title')}</Link>
        </Button>
      </div>
    </>
  );
}
