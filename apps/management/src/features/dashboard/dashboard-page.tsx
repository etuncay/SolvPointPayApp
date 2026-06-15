import { useState } from 'react';
import { RefreshCw, Shield, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, PageHead } from '@epay/ui';
import { useAuth } from '@/domain/auth-context';
import { useRole } from '@/domain/role-context';
import { useUserPreferences } from '@/domain/user-preferences';
import { useSettings } from '@/domain/settings-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import './dashboard.css';
import { FullscreenOverlay } from './components/fullscreen-overlay';
import { resolveVisibleWidgets } from './domain/widget-visibility';
import { DashboardProvider, useDashboard } from './hooks/use-dashboard';
import { exportWidgetCsv, TABLE_WIDGETS } from './lib/export-widget-csv';
import { ALL_WIDGETS } from './widget-registry';
import type { WidgetCode } from './domain/types';

function WelcomeBanner({
  displayName,
  msg,
  onDismiss,
  onReview,
}: {
  displayName: string;
  msg: string;
  onDismiss: () => void;
  onReview: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="welcome">
      <div className="welcome-icon">
        <Shield size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong>
          {t('welcome_back')}, {displayName}.
        </strong>{' '}
        <span style={{ opacity: 0.85 }}>{msg}</span>
        {' — '}
        <span style={{ opacity: 0.75 }}>{t('failed_attempt_warn')}</span>{' '}
        <button
          type="button"
          onClick={onReview}
          style={{
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 500,
            background: 'none',
            border: 'none',
            color: 'inherit',
            padding: 0,
          }}
        >
          {t('review')}
        </button>
      </div>
      <button type="button" className="x" onClick={onDismiss} aria-label="Kapat">
        <X size={14} />
      </button>
    </div>
  );
}

function DashboardContent() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { role } = useRole();
  const { preferences } = useUserPreferences();
  const { openSettings } = useSettings();
  const { snapshot, refresh, refreshCount } = useDashboard();
  const [bannerOpen, setBannerOpen] = useState(true);
  const [fsId, setFsId] = useState<string | null>(null);

  const fullName = user?.fullName ?? getCurrentUser(role).displayName;
  const displayName = fullName.split(/\s+/)[0] ?? fullName;
  const visible = resolveVisibleWidgets(role, ALL_WIDGETS);
  const fsWidget = fsId ? visible.find((w) => w.id === fsId) : null;

  const refreshedLabel = snapshot?.refreshedAt
    ? snapshot.refreshedAt.toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

  const handleRefresh = () => void refresh();

  const handleExport = (code: WidgetCode) => {
    void exportWidgetCsv(code, role, refreshCount);
  };

  return (
    <>
      {bannerOpen && (
        <WelcomeBanner
          displayName={displayName}
          msg={preferences.welcomeMessage}
          onDismiss={() => setBannerOpen(false)}
          onReview={() => openSettings('failed')}
        />
      )}
      <PageHead
        title={t('page_title')}
        subtitle={t('page_subtitle')}
        actions={
          <>
            <span className="t-mute fs-11" style={{ marginRight: 6 }}>
              {t('refreshed_at')} · {refreshedLabel}
            </span>
            <Button onClick={handleRefresh}>
              <RefreshCw size={14} /> {t('refresh_all')}
            </Button>
          </>
        }
      />
      <div className="grid dashboard-grid">
        {visible.map((w) => {
          const Comp = w.comp;
          return (
            <div key={w.id} className={`col-${w.col}`}>
              <Comp onFullscreen={() => setFsId(w.id)} mode="compact" detailLevel={w.detailLevel} />
            </div>
          );
        })}
      </div>
      <p style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: 'var(--fg-faint)' }}>
        {i18n.language === 'tr'
          ? "Yetkinize göre filtrelenmiş — diğer widget'lar farklı rollerde görünebilir."
          : 'Filtered by your role — other widgets may appear for different roles.'}
      </p>
      {fsWidget && (
        <FullscreenOverlay
          widget={fsWidget}
          onClose={() => setFsId(null)}
          onRefresh={handleRefresh}
          onExportCsv={
            TABLE_WIDGETS.has(fsWidget.id as WidgetCode)
              ? () => handleExport(fsWidget.id as WidgetCode)
              : undefined
          }
        >
          {(filterText) => {
            const Fs = fsWidget.comp;
            return <Fs mode="scr_fullscreen" filterText={filterText} detailLevel={fsWidget.detailLevel} />;
          }}
        </FullscreenOverlay>
      )}
    </>
  );
}

export function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
