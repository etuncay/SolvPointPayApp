import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
import { FormLayout, FormPrimaryActions, PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { integrationsService } from './api/mock-integrations-adapter';
import { ConnectionSecurityTab } from './components/tabs/connection-security-tab';
import { ConfigurationTab } from './components/tabs/configuration-tab';
import { canMutateIntegrations } from './domain/permissions';
import type { CreateIntegrationInput, IntegrationDefinition } from './domain/types';

const DEFAULT_INPUT: CreateIntegrationInput = {
  name: '',
  integrationType: 'Accounting',
  systemName: '',
  status: 'Active',
  description: '',
  baseUrl: 'https://',
  authType: 'ApiKey',
  keyRotationRequired: false,
  timeoutMs: 30_000,
  connectionTimeoutMs: 5000,
  ipAllowlist: '',
  tlsInfo: '',
  rateLimitPerMin: 60,
  retryPolicy: 'FixedDelay',
  maxRetry: 3,
  fixedDelayMs: 1000,
  useSignature: false,
  webhookUrl: null,
  apiVersion: 'v1',
  circuitBreakerEnabled: false,
  errorRateThresholdPct: null,
  windowSeconds: null,
  minRequestCount: null,
  openDurationSeconds: null,
  logLevel: 'Info',
};

export function IntegrationFormPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const user = getCurrentUser(role);
  const [input, setInput] = useState<CreateIntegrationInput>(DEFAULT_INPUT);

  const pseudo: IntegrationDefinition = {
    ...input,
    id: '__new__',
    code: '',
    credentialRef: 'pending',
    createdAt: '',
    createdBy: '',
    updatedAt: '',
    updatedBy: '',
  };

  if (!canMutateIntegrations(role)) return <Navigate to="/" replace />;

  const submit = () => {
    const result = integrationsService.create(role, user.id, input);
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    toast.success(t('int_created_ok'));
    navigate(`/system/integrations/${result.integration.id}`);
  };

  return (
    <>
      <PageHead
        title={t('int_new')}
        subtitle={t('int_new_subtitle', { defaultValue: t('int_new') })}
        actions={
          <FormPrimaryActions
            showSave
            onSave={submit}
            saveLabel={
              <>
                <Save size={14} /> {t('sj_create')}
              </>
            }
            saveDisabled={!input.name.trim()}
            showCancel
            onCancel={() => navigate('/system/integrations')}
            cancelLabel={t('fr_back_list')}
          />
        }
      />
      <FormLayout>
        <ConnectionSecurityTab
          draft={input}
          integration={pseudo}
          canEdit
          onPatch={(p) => setInput((prev) => ({ ...prev, ...p }))}
          onRotate={() => undefined}
        />
        <ConfigurationTab
          draft={input}
          integration={pseudo}
          canEdit
          onPatch={(p) => setInput((prev) => ({ ...prev, ...p }))}
        />
      </FormLayout>
    </>
  );
}
