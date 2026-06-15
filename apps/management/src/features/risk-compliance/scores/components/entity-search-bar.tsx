import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Field, FormCard, FormGrid } from '@epay/ui';
import type { FraudRiskSource } from '../domain/types';

export function EntitySearchBar({
  source,
  entityId,
  loading,
  onSourceChange,
  onEntityIdChange,
  onSearch,
}: {
  source: FraudRiskSource;
  entityId: string;
  loading: boolean;
  onSourceChange: (s: FraudRiskSource) => void;
  onEntityIdChange: (id: string) => void;
  onSearch: () => void;
}) {
  const { t } = useTranslation();

  return (
    <FormCard title={t('rsc_search_title')} icon={<Search size={13} />} padless>
      <div className="rsc-search-form">
        <FormGrid cols={2}>
          <Field label={t('rsc_source')}>
            <select
              className="select"
              value={source}
              onChange={(e) => onSourceChange(e.target.value as FraudRiskSource)}
            >
              <option value="Customer">{t('scf_entity_customer')}</option>
              <option value="Agent">{t('rpt_col_agent')}</option>
              <option value="Transaction">{t('rs_scope_transaction')}</option>
            </select>
          </Field>
          <Field label={t('rsc_entity_id')}>
            <input
              className="input mono"
              value={entityId}
              placeholder={t('rsc_entity_id_ph')}
              onChange={(e) => onEntityIdChange(e.target.value)}
            />
          </Field>
        </FormGrid>
        <Button type="button" variant="primary" disabled={loading} onClick={onSearch}>
          <Search size={14} /> {t('rsc_search_btn')}
        </Button>
      </div>
      <p className="rsc-search-hint">{t('rsc_demo_hint')}</p>
    </FormCard>
  );
}
