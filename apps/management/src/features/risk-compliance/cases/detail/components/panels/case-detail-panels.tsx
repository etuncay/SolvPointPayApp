import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { DynamicTable, FormCard, type TableConfig } from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import type { CaseDetail } from '../../domain/types';
import { KvPanel } from './kv-panel';

export function CustomerInfoPanel({ customer }: { customer: CaseDetail['customer'] }) {
  const { t } = useTranslation();
  return (
    <KvPanel
      id="sec-customer"
      title={t('fcd_panel_customer')}
      rows={[
        { label: t('frd_exc_customer'), value: String(customer.customerId) },
        { label: t('rpt_col_name'), value: customer.name },
        { label: t('fcd_customer_risk_category'), value: customer.riskCategory },
        { label: t('rsc_source'), value: customer.type },
        { label: t('fcd_customer_id_no'), value: customer.idNo },
        { label: t('fcd_customer_id_type'), value: customer.idType },
        { label: t('fcd_customer_id_country'), value: customer.idCountry },
        { label: t('fcd_customer_birth_country'), value: customer.birthCountry },
        { label: t('fcd_customer_address_country'), value: customer.addressCountry },
        { label: t('fcd_customer_birth_date'), value: customer.birthDate },
        { label: t('fcd_customer_income'), value: customer.declaredIncome },
        { label: t('fcd_customer_occupation'), value: customer.occupation },
        { label: t('fcd_customer_address'), value: customer.address },
        { label: t('fcd_customer_phone'), value: customer.phone },
        { label: t('fcd_customer_email'), value: customer.email },
        { label: t('fcd_customer_account_age'), value: customer.accountAge },
        { label: t('fcd_customer_addr_verified'), value: customer.addressVerified },
        { label: t('rpt_col_kyc'), value: customer.kyc },
        { label: t('rc_col_risk_score'), value: String(customer.riskScore) },
        { label: t('rpt_col_status'), value: customer.status },
      ]}
    />
  );
}

export function CustomerAccountsPanel({ accounts }: { accounts: CaseDetail['accounts'] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <FormCard id="sec-accounts" title={t('fcd_panel_accounts')}>
      {accounts.length === 0 ? (
        <p className="t-mute fs-13">{t('fcd_no_accounts')}</p>
      ) : (
        <DynamicTable
          config={
            {
              rowKey: 'walletId',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: false,
              columns: [
                { key: 'walletId', title: t('fcd_wallet_id'), dataIndex: 'walletId', render: 'renderWallet' },
                { key: 'currency', title: t('cba_col_currency'), dataIndex: 'currency' },
                { key: 'available', title: t('fcd_available'), dataIndex: 'available', render: 'renderAvailable' },
                { key: 'blocked', title: t('fcd_blocked'), dataIndex: 'blocked', render: 'renderBlocked' },
                { key: 'status', title: t('rpt_col_status'), dataIndex: 'status' },
              ],
              api: { method: async () => ({ success: true, data: accounts as unknown as Record<string, unknown>[], total: accounts.length }) },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={{
            renderWallet: (v: unknown) => <span className="mono">{String(v)}</span>,
            renderAvailable: (v: unknown) => <span className="mono">{fmtNumber(Number(v), lang)}</span>,
            renderBlocked: (v: unknown) => <span className="mono">{fmtNumber(Number(v), lang)}</span>,
          }}
          locale="tr"
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      )}
    </FormCard>
  );
}

export function CustomerTxMetricsPanel({ metrics }: { metrics: CaseDetail['txMetrics'] }) {
  const { t } = useTranslation();
  return (
    <KvPanel
      id="sec-tx-metrics"
      title={t('fcd_panel_tx_metrics')}
      rows={metrics.map((m) => ({
        label: t(`fcd_metric_${m.label}`, m.label),
        value: m.value,
      }))}
    />
  );
}

export function AccessSignalsPanel({ signals }: { signals: CaseDetail['accessSignals'] }) {
  const { t } = useTranslation();
  return (
    <KvPanel
      id="sec-access"
      title={t('fcd_panel_access')}
      rows={signals.map((s) => ({
        label: t(`fcd_signal_${s.label}`, s.label),
        value: s.value,
      }))}
    />
  );
}

export function AgentInfoPanel({
  agent,
  metrics,
}: {
  agent: NonNullable<CaseDetail['agent']>;
  metrics: CaseDetail['agentMetrics'];
}) {
  const { t } = useTranslation();
  return (
    <KvPanel
      id="sec-agent"
      title={t('fcd_panel_agent')}
      rows={[
        { label: t('fcd_agent_id'), value: String(agent.agentId) },
        { label: t('fcd_agent_name'), value: agent.name },
        { label: t('fcd_agent_group'), value: agent.groupCode },
        { label: t('fcd_agent_risk_category'), value: agent.riskCategory },
        { label: t('fcd_agent_country'), value: agent.country },
        { label: t('rpt_col_city'), value: agent.city },
        { label: t('rpt_col_status'), value: agent.status },
        ...metrics.map((m) => ({ label: t(`fcd_metric_${m.label}`, m.label), value: m.value })),
      ]}
    />
  );
}

export function TransactionPanel({
  tx,
  transactionId,
}: {
  tx: CaseDetail['transaction'];
  transactionId: number;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <FormCard id="sec-transaction" title={t('rs_scope_transaction')}>
      <div className="kv-grid">
        <div className="kv-item">
          <span className="kv-k">{t('rc_col_tx_no')}</span>
          <span className="kv-v">
            <Link to={`/transfers/${transactionId}`} className="mono">
              {tx.txNo}
            </Link>
          </span>
        </div>
        {[
          { label: t('fcd_tx_type'), value: tx.type },
          { label: t('fcd_tx_status'), value: tx.status },
          { label: t('rpt_col_amount'), value: `${fmtNumber(tx.amount, lang)} ${tx.currency}` },
          { label: t('fcd_tx_date'), value: tx.createdAt },
          { label: t('rpt_col_channel'), value: tx.channel },
          { label: t('fcd_tx_sender'), value: tx.senderName },
          { label: t('fcd_tx_receiver'), value: tx.receiverName },
          { label: t('cba_col_iban'), value: tx.iban ?? '—' },
        ].map((r) => (
          <div key={r.label} className="kv-item">
            <span className="kv-k">{r.label}</span>
            <span className="kv-v">{r.value}</span>
          </div>
        ))}
      </div>
    </FormCard>
  );
}

export function SharedContactPanel({ contact }: { contact: NonNullable<CaseDetail['sharedContact']> }) {
  const { t } = useTranslation();
  return (
    <FormCard id="sec-shared" title={t('fcd_panel_shared')}>
      {contact.disclaimer ? (
        <p className="t-mute fs-12" style={{ marginBottom: 8 }} title={t('fcd_shared_disclaimer')}>
          {t('fcd_shared_disclaimer')}
        </p>
      ) : null}
      <div className="kv-grid">
        <div className="kv-item">
          <span className="kv-k">{t('fcd_shared_emails')}</span>
          <span className="kv-v">{contact.sharedEmails.join(', ') || '—'}</span>
        </div>
        <div className="kv-item">
          <span className="kv-k">{t('fcd_shared_phones')}</span>
          <span className="kv-v">{contact.sharedPhones.join(', ') || '—'}</span>
        </div>
      </div>
    </FormCard>
  );
}

export function RelatedCustomersPanel({ rows }: { rows: CaseDetail['relatedCustomers'] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <FormCard id="sec-related" title={t('fcd_panel_related')}>
      <DynamicTable
        config={
          {
            rowKey: 'customerId',
            hideTitleBar: true,
            hideColumnFilters: true,
            pagination: false,
            columns: [
              { key: 'customerId', title: t('frd_exc_customer'), dataIndex: 'customerId', render: 'renderCustomerId' },
              { key: 'name', title: t('rpt_col_name'), dataIndex: 'name' },
              { key: 'relation', title: t('fcd_relation'), dataIndex: 'relation', render: 'renderRelation' },
              { key: 'txCount1y', title: t('fcd_tx_count_1y'), dataIndex: 'txCount1y', render: 'renderTxCount' },
              { key: 'totalAmount1y', title: t('fcd_amount_1y'), dataIndex: 'totalAmount1y', render: 'renderTotalAmount' },
            ],
            api: { method: async () => ({ success: true, data: rows as unknown as Record<string, unknown>[], total: rows.length }) },
          } satisfies TableConfig
        }
        permissions={{}}
        customFunctions={{
          renderCustomerId: (v: unknown) => (
            <span className="mono">
              <Link to={`/risk/scores?source=Customer&id=${String(v)}`}>{String(v)}</Link>
            </span>
          ),
          renderRelation: (v: unknown) => t(`fcd_relation_${String(v)}`, String(v)),
          renderTxCount: (v: unknown) => <span className="mono">{String(v)}</span>,
          renderTotalAmount: (v: unknown) => <span className="mono">{fmtNumber(Number(v), lang)}</span>,
        }}
        locale="tr"
        t={(k, fb) => t(k, { defaultValue: fb ?? k })}
      />
    </FormCard>
  );
}

export function TriggerRulePanel({ rule }: { rule: CaseDetail['rule'] }) {
  const { t } = useTranslation();
  return (
    <FormCard id="sec-rule" title={t('fcd_panel_rule')}>
      <div className="kv-grid">
        {[
          { label: t('fcd_rule_id'), value: rule.ruleId },
          { label: t('fr_col_title'), value: rule.title },
          { label: t('fr_col_scope'), value: rule.scope },
          { label: t('col_priority'), value: rule.priority },
          { label: t('fcd_rule_regulation'), value: rule.regulationReference },
        ].map((r) => (
          <div key={r.label} className="kv-item">
            <span className="kv-k">{r.label}</span>
            <span className="kv-v">{r.value}</span>
          </div>
        ))}
      </div>
      <p className="mono fs-12 t-mute" style={{ marginTop: 12 }}>
        {rule.dslSummary}
      </p>
      <Link to={`/risk/fraud-rules/${rule.ruleId}`} className="fs-13" style={{ marginTop: 8, display: 'inline-block' }}>
        {t('fcd_rule_detail_link')}
      </Link>
    </FormCard>
  );
}
