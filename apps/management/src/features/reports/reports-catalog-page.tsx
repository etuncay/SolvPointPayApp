import { useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BarChart3, Landmark, ShieldAlert } from 'lucide-react';
import { PageHead } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { getCurrentUser } from '@/features/approval-pool/domain/current-user';
import { reportsService } from './api/mock-reports-adapter';
import { ReportArchiveList } from './components/report-archive-list';
import { ReportCategorySection } from './components/report-category-section';
import { ReportParamDrawer } from './components/report-param-drawer';
import { ReportPreviewGrid } from './components/report-preview-grid';
import { canViewReportCatalog } from './domain/permissions';
import { REPORT_CATALOG } from './domain/report-catalog';
import type { ReportCode } from './domain/report-codes';
import { useReportsCatalog } from './hooks/use-reports-catalog';
import type { ReportDefinition, ReportParams, ReportResult } from './domain/types';
import './reports.css';

const CATEGORY_META: Record<
  string,
  { titleKey: string; icon: typeof BarChart3 }
> = {
  operational: { titleKey: 'rpt_cat_operational', icon: BarChart3 },
  tcmb: { titleKey: 'rpt_cat_tcmb', icon: Landmark },
  masak: { titleKey: 'rpt_cat_masak', icon: ShieldAlert },
};

export function ReportsCatalogPage() {
  const { t } = useTranslation();
  const { role } = useRole();
  const navigate = useNavigate();
  const { code: codeParam } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const user = getCurrentUser(role);

  const { search, setSearch, catalog, categories, byCategory } = useReportsCatalog(role);
  const [activeDef, setActiveDef] = useState<ReportDefinition | null>(null);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<ReportResult | null>(null);
  const [previewTitleKey, setPreviewTitleKey] = useState<string | undefined>();
  const [lastReportCode, setLastReportCode] = useState<ReportCode | undefined>();
  const [archiveRev, setArchiveRev] = useState(0);

  const totalVisible = useMemo(
    () => categories.reduce((sum, cat) => sum + (byCategory[cat]?.length ?? 0), 0),
    [categories, byCategory],
  );

  const openDefinition = useCallback(
    (def: ReportDefinition) => {
      setActiveDef(def);
      navigate(`/reports/${def.code}${searchParams.get('reportDate') ? `?reportDate=${searchParams.get('reportDate')}` : ''}`);
    },
    [navigate, searchParams],
  );

  useEffect(() => {
    if (!codeParam) return;
    const def = REPORT_CATALOG.find((d) => d.code === codeParam);
    if (def && canViewReportCatalog(role)) {
      setActiveDef(def);
    }
  }, [codeParam, role]);

  const initialParams: ReportParams | undefined = searchParams.get('reportDate')
    ? { reportDate: searchParams.get('reportDate')! }
    : undefined;

  const handleGenerate = async (params: ReportParams) => {
    if (!activeDef) return;
    setGenerating(true);
    const result = await reportsService.generate(role, user.id, activeDef.code as ReportCode, params);
    setGenerating(false);
    if (!result.ok) {
      toast.error(t(result.errorCode, result.errorCode));
      return;
    }
    setPreview(result.result);
    setPreviewTitleKey(activeDef.titleKey);
    setLastReportCode(activeDef.code as ReportCode);
    setArchiveRev((v) => v + 1);
    setActiveDef(null);
    navigate('/reports');
    toast.success(t('rpt_generated_ok'));
  };

  const archiveEntries = reportsService.listArchive(role, lastReportCode, 5);

  if (!canViewReportCatalog(role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <PageHead
        title={t('nav_reports')}
        subtitle={t('rpt_page_subtitle')}
        status={<span className="mono fs-11 t-mute">11</span>}
      />

      <div className="rpt-layout">
        <div className="rpt-info-banner">
          <strong>{t('rpt_info_title')}</strong>
          <span>{t('rpt_info_body')}</span>
        </div>

        <div className="rpt-searchbar">
          <input
            className="input fs-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('rpt_search_ph')}
            aria-label={t('rpt_search_ph')}
          />
          <span className="mono fs-11 t-mute">
            {totalVisible} / {catalog.length} {t('rpt_catalog_count')}
          </span>
        </div>

        {totalVisible > 0 && (
          <div className="rpt-stats">
            {categories.map((cat) => {
              const count = byCategory[cat]?.length ?? 0;
              if (count === 0) return null;
              return (
                <span key={cat} className="rpt-stat-chip">
                  {t(CATEGORY_META[cat]?.titleKey ?? cat)}
                  <strong>{count}</strong>
                </span>
              );
            })}
          </div>
        )}

        {totalVisible === 0 ? (
          <div className="fcard">
            <div className="fcard-body">
              <p className="rpt-empty-catalog">{t('rpt_no_results')}</p>
            </div>
          </div>
        ) : (
          categories.map((cat) => {
            const meta = CATEGORY_META[cat];
            if (!meta) return null;
            return (
              <ReportCategorySection
                key={cat}
                titleKey={meta.titleKey}
                icon={meta.icon}
                reports={byCategory[cat] ?? []}
                onGenerate={openDefinition}
              />
            );
          })
        )}

        <ReportPreviewGrid result={preview} titleKey={previewTitleKey} />

        <ReportArchiveList key={archiveRev} entries={archiveEntries} />
      </div>

      <ReportParamDrawer
        definition={activeDef}
        initialParams={initialParams}
        loading={generating}
        onClose={() => {
          setActiveDef(null);
          navigate('/reports');
        }}
        onGenerate={handleGenerate}
      />
    </>
  );
}
