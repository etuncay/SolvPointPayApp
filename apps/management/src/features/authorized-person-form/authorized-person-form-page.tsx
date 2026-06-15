import { useTranslation } from 'react-i18next';
import { useAuthorizedPerson } from './hooks/use-authorized-person';
import { AuthorizedPersonProvider } from './context/authorized-person-context';
import { AuthorizedPersonForm } from './authorized-person-form';

export function AuthorizedPersonFormPage() {
  const { t } = useTranslation();
  const api = useAuthorizedPerson();

  if (api.loading) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">{t('loading')}</p>
      </div>
    );
  }

  if (api.notFound) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('ap2_not_found')}</h3>
      </div>
    );
  }

  return (
    <AuthorizedPersonProvider value={api}>
      <AuthorizedPersonForm />
    </AuthorizedPersonProvider>
  );
}
