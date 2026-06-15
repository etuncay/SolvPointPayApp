import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getRiskScoresPermissions } from './domain/permissions';
import { useRiskScores } from './hooks/use-risk-scores';
import { EntitySearchBar } from './components/entity-search-bar';
import { ScoreHeaderPanel } from './components/score-header-panel';
import { ScoreBreakdownPanel } from './components/score-breakdown-panel';
import { ScoreHistoryPanel } from './components/score-history-panel';
import { ManualChangePanel } from './components/manual-change-panel';
import './risk-scores.css';

export function RiskScoresPage() {
  const { t } = useTranslation();
  const { role } = useRole();
  const permissions = getRiskScoresPermissions(role);
  const vm = useRiskScores();

  if (!permissions.canView) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageHead
        title={t('s_rk_scores')}
        subtitle={t('rsc_page_subtitle')}
        status={<span className="mono fs-11 t-mute">7.3</span>}
      />

      <EntitySearchBar
        source={vm.source}
        entityId={vm.entityId}
        loading={vm.loading}
        onSourceChange={vm.setSource}
        onEntityIdChange={vm.setEntityId}
        onSearch={() => vm.search()}
      />

      {vm.loading && <p className="fs-12 t-mute rsc-empty-state">{t('loading')}</p>}

      {!vm.loading && vm.notFound && vm.entityId.trim() && (
        <p className="rsc-not-found">{t('rsc_not_found')}</p>
      )}

      {!vm.loading && vm.detail && (
        <div className="rsc-layout">
          <ScoreHeaderPanel detail={vm.detail} />
          <div className="rsc-panels-grid">
            <ScoreBreakdownPanel items={vm.detail.breakdown} />
            <ScoreHistoryPanel history={vm.detail.history} />
          </div>
          <ManualChangePanel
            detail={vm.detail}
            disabled={!permissions.canManualChange}
            submitting={vm.submitting}
            onSubmit={(newScore, reason) => {
              vm.submitManualChange({ newScore, reason });
            }}
          />
        </div>
      )}

      {!vm.loading && !vm.detail && !vm.notFound && (
        <p className="rsc-empty-state">{t('rsc_empty_hint')}</p>
      )}
    </>
  );
}
