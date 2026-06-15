import { useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button, FormLayout, PageHead, SectionRail } from '@epay/ui';
import { CaseActionBar } from './components/case-action-bar';
import { CaseHeaderStrip } from './components/case-header-strip';
import { DecisionModal } from './components/decision-modal';
import { ExceptionModal } from './components/exception-modal';
import { RouteCaseModal } from './components/route-case-modal';
import {
  AccessSignalsPanel,
  AgentInfoPanel,
  CustomerAccountsPanel,
  CustomerInfoPanel,
  CustomerTxMetricsPanel,
  RelatedCustomersPanel,
  SharedContactPanel,
  TransactionPanel,
  TriggerRulePanel,
} from './components/panels/case-detail-panels';
import { useFraudCaseDetail } from './hooks/use-fraud-case-detail';

type ModalKind = 'approve' | 'reject' | 'route' | 'exception' | 'report' | null;

export function FraudCaseDetailPage() {
  const { t } = useTranslation();
  const {
    detail,
    notFound,
    listPermissions,
    permissions,
    persona,
    setPersona,
    approve,
    reject,
    route,
    addException,
    report,
  } = useFraudCaseDetail();

  const [modal, setModal] = useState<ModalKind>(null);
  const [activeSec, setActiveSec] = useState('customer');

  const sections = useMemo(() => {
    if (!detail) return [];
    const base: { id: string; no: string; label: string }[] = [
      { id: 'customer', no: '1', label: t('fcd_panel_customer') },
      { id: 'accounts', no: '2', label: t('fcd_panel_accounts') },
      { id: 'tx-metrics', no: '3', label: t('fcd_panel_tx_metrics') },
      { id: 'access', no: '4', label: t('fcd_panel_access') },
    ];
    let n = 5;
    if (detail.agent) {
      base.push({ id: 'agent', no: String(n++), label: t('fcd_panel_agent') });
    }
    base.push({ id: 'transaction', no: String(n++), label: t('rs_scope_transaction') });
    if (detail.sharedContact) {
      base.push({ id: 'shared', no: String(n++), label: t('fcd_panel_shared') });
    }
    base.push(
      { id: 'related', no: String(n++), label: t('fcd_panel_related') },
      { id: 'rule', no: String(n++), label: t('fcd_panel_rule') },
      { id: 'log', no: String(n++), label: t('fcd_panel_log') },
    );
    return base;
  }, [detail, t]);

  if (!listPermissions.viewDetail) {
    return <Navigate to="/" replace />;
  }

  if (notFound) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('fc_not_found')}</h3>
        <Button type="button" onClick={() => window.history.back()} style={{ marginTop: 16 }}>
          {t('fr_back_list')}
        </Button>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <p className="t-mute">…</p>
      </div>
    );
  }

  return (
    <>
      <PageHead
        title={detail.header.id}
        subtitle={t('fcd_page_subtitle')}
        status={<span className="mono fs-11 t-mute">7.5.2</span>}
      />

      <Link
        to="/risk/cases"
        className="btn btn-ghost btn-sm"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}
      >
        <ArrowLeft size={14} /> {t('fr_back_list')}
      </Link>

      <CaseHeaderStrip header={detail.header} />

      <CaseActionBar
        permissions={permissions}
        persona={persona}
        onPersonaChange={setPersona}
        onApprove={() => setModal('approve')}
        onReject={() => setModal('reject')}
        onRoute={() => setModal('route')}
        onException={() => setModal('exception')}
        onReport={() => setModal('report')}
      />

      <FormLayout
        rail={
          <SectionRail
            sections={sections}
            activeId={activeSec}
            title={t('fcd_page_subtitle')}
            onNavigate={setActiveSec}
          />
        }
      >
        <CustomerInfoPanel customer={detail.customer} />
        <CustomerAccountsPanel accounts={detail.accounts} />
        <CustomerTxMetricsPanel metrics={detail.txMetrics} />
        <AccessSignalsPanel signals={detail.accessSignals} />
        {detail.agent ? <AgentInfoPanel agent={detail.agent} metrics={detail.agentMetrics} /> : null}
        <TransactionPanel tx={detail.transaction} transactionId={detail.header.transactionId} />
        {detail.sharedContact ? <SharedContactPanel contact={detail.sharedContact} /> : null}
        <RelatedCustomersPanel rows={detail.relatedCustomers} />
        <TriggerRulePanel rule={detail.rule} />

        <div id="sec-log" className="form-card">
          <h3>{t('fcd_panel_log')}</h3>
          {detail.actionLog.length === 0 ? (
            <p className="t-mute fs-13">{t('fcd_log_empty')}</p>
          ) : (
            <ul className="fs-13" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {detail.actionLog.map((e) => (
                <li key={e.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span className="mono">{e.at.slice(0, 16)}</span>
                  {' — '}
                  <strong>{t(`fcd_log_${e.action}`, e.action)}</strong>
                  {' — '}
                  {e.actorName}: {e.comment}
                </li>
              ))}
            </ul>
          )}
        </div>
      </FormLayout>

      <DecisionModal
        open={modal === 'approve'}
        title={t('fcd_action_approve')}
        requireManagerNote={permissions.requireManagerNote}
        onClose={() => setModal(null)}
        onConfirm={approve}
      />
      <DecisionModal
        open={modal === 'reject'}
        title={t('scf_btn_reject')}
        variant="danger"
        requireManagerNote={permissions.requireManagerNote}
        onClose={() => setModal(null)}
        onConfirm={reject}
      />
      <DecisionModal
        open={modal === 'report'}
        title={t('fcd_action_report')}
        requireManagerNote={permissions.requireManagerNote}
        onClose={() => setModal(null)}
        onConfirm={report}
      />
      <RouteCaseModal
        open={modal === 'route'}
        requireManagerNote={permissions.requireManagerNote}
        onClose={() => setModal(null)}
        onConfirm={route}
      />
      <ExceptionModal
        open={modal === 'exception'}
        onClose={() => setModal(null)}
        onConfirm={addException}
      />
    </>
  );
}
