import { useTranslation } from 'react-i18next';
import { useAgent } from './hooks/use-agent';
import { AgentProvider } from './context/agent-context';
import { AgentForm } from './agent-form';

export function AgentFormPage({ mode: _routeMode = 'new' }: { mode?: 'new' | 'edit' | 'view' }) {
  const { t } = useTranslation();
  const api = useAgent();

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
        <h3>{t('af_not_found')}</h3>
      </div>
    );
  }

  return (
    <AgentProvider value={api}>
      <AgentForm />
    </AgentProvider>
  );
}
