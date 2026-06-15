import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Ban, Check, Download, Pencil, X } from 'lucide-react';
import { DynamicTable } from '@epay/ui';
import type { TranslateFn } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { integratedBanksService } from './api';
import { isFeatureOperational } from './domain/default-rules';
import { getIntegratedBankPermissions } from './domain/permissions';
import type { IntegratedBank, IntegratedBankFilters, IntegratedBankInput } from './domain/types';
import { DEFAULT_INTEGRATED_BANK_FILTERS } from './domain/types';
import { buildIntegratedBanksTableConfig } from './integrated-banks-table-config';
import { IntegratedBankFormModal } from './components/integrated-bank-form-modal';

function TickCell({ value }: { value: boolean }) {
  return (
    <span className={value ? 't-ok' : 't-mute'} style={{ display: 'inline-flex' }}>
      {value ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2} />}
    </span>
  );
}

export function IntegratedBanksPage() {
  const { t, i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const { role } = useRole();
  const permissions = getIntegratedBankPermissions(role);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedBank, setSelectedBank] = useState<IntegratedBank | null>(null);
  const [tableVersion, setTableVersion] = useState(0);

  const lastFilters = useRef<IntegratedBankFilters>(DEFAULT_INTEGRATED_BANK_FILTERS);

  const translate: TranslateFn = (key, fb) => t(key, { defaultValue: fb ?? key });

  const tableConfig = useMemo(
    () =>
      buildIntegratedBanksTableConfig(translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, tableVersion],
  );

  const allRows = useMemo(
    () => integratedBanksService.list({ query: '', status: 'any' }),
    [tableVersion],
  );

  const featureWarnings = useMemo(() => {
    const features = ['eft', 'ibanCheck', 'fast'] as const;
    return features.filter((f) => !isFeatureOperational(f, allRows));
  }, [allRows]);

  const closeModal = () => {
    setModalOpen(false);
    setSelectedBank(null);
  };

  const openCreate = () => {
    if (!permissions.insert) return;
    setModalMode('create');
    setSelectedBank(null);
    setModalOpen(true);
  };

  const openEdit = (b: IntegratedBank) => {
    if (!permissions.update) return;
    if (b.status !== 'Active') return;
    setModalMode('edit');
    setSelectedBank(b);
    setModalOpen(true);
  };

  const handleSaveCreate = (input: IntegratedBankInput) => {
    const result = integratedBanksService.create(input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return false;
    }
    toast.success(t('ib_created'));
    setTableVersion((v) => v + 1);
    return true;
  };

  const handleSaveUpdate = (id: number, input: IntegratedBankInput) => {
    const result = integratedBanksService.update(id, input);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_save_failed'));
      return false;
    }
    toast.success(t('ib_updated'));
    setTableVersion((v) => v + 1);
    return true;
  };

  const handleDeactivate = (b: IntegratedBank) => {
    if (!permissions.deactivate) return;
    if (!window.confirm(t('ib_deactivate_confirm', { name: b.bankName }))) return;
    const result = integratedBanksService.deactivate(b.id);
    if (!result.ok) {
      toast.error(t(result.error ?? 'ib_deactivate_failed'));
      return;
    }
    toast.success(t('ib_deactivated'));
    setTableVersion((v) => v + 1);
    if (selectedBank?.id === b.id) closeModal();
  };

  const fmtDate = (iso: string | null) =>
    iso
      ? new Date(iso.replace(' ', 'T')).toLocaleString(tr ? 'tr-TR' : 'en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  const csvColumns: CsvColumn<IntegratedBank>[] = useMemo(
    () => [
      { header: t('ib_col_bank'), value: (r) => r.bankName },
      { header: t('col_service'), value: (r) => r.service },
      { header: t('ib_col_eft_start'), value: (r) => r.eftStartTime ?? '' },
      { header: t('ib_col_eft_end'), value: (r) => r.eftEndTime ?? '' },
      { header: t('ib_col_default_eft'), value: (r) => (r.isDefaultEft ? 'Y' : 'N') },
      { header: t('ib_col_iban'), value: (r) => (r.hasIbanCheck ? 'Y' : 'N') },
      { header: t('ib_col_default_iban'), value: (r) => (r.isDefaultIbanCheck ? 'Y' : 'N') },
      { header: t('ib_col_fast'), value: (r) => (r.hasFast ? 'Y' : 'N') },
      { header: t('ib_col_default_fast'), value: (r) => (r.isDefaultFast ? 'Y' : 'N') },
      { header: t('ib_col_recon_fee'), value: (r) => (r.reconciliationFeeApplied ? 'Y' : 'N') },
      { header: t('rpt_col_status'), value: (r) => r.status },
    ],
    [t],
  );

  const handleExport = () => {
    const rows = integratedBanksService.list(lastFilters.current);
    exportCsv('entegre-bankalar', rows, csvColumns);
    toast.success(t('ib_export_ok'));
  };

  if (!permissions.list) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('ib_forbidden_title')}</h3>
        <p className="t-mute">{t('ib_forbidden_sub')}</p>
      </div>
    );
  }

  const customFunctions = {
    renderOptional: (v: unknown) => <span className="mono fs-12">{v ? String(v) : '—'}</span>,
    renderBool: (v: unknown) => <TickCell value={Boolean(v)} />,
    renderLastCall: (v: unknown) => <span className="mono fs-12">{fmtDate(v as string | null)}</span>,
    renderStatus: (_v: unknown, row: Record<string, unknown>) => {
      const b = row as IntegratedBank;
      return (
        <span className={b.status === 'Active' ? 'st active' : 'st inactive'}>
          {t(`ib_status_${b.status}`, b.status)}
        </span>
      );
    },
    renderActions: (_v: unknown, row: Record<string, unknown>) => {
      const b = row as IntegratedBank;
      return (
        <div className="row-actions">
          {permissions.update && b.status === 'Active' && (
            <button type="button" title={t('ib_edit')} onClick={() => openEdit(b)}>
              <Pencil size={14} />
            </button>
          )}
          {permissions.deactivate && b.status === 'Active' && (
            <button type="button" title={t('ib_deactivate')} onClick={() => handleDeactivate(b)}>
              <Ban size={14} />
            </button>
          )}
        </div>
      );
    },
  };

  return (
    <>
      {featureWarnings.length > 0 && (
        <div
          className="banner banner-warn"
          style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13 }}
        >
          {featureWarnings.map((f) => (
            <div key={f}>{t(`ib_feature_down_${f}`)}</div>
          ))}
        </div>
      )}

      <DynamicTable
        config={tableConfig}
        header={{
          title: t('s_bk_integrated'),
          subtitle: t('ib_subtitle'),
          status: (
            <span className="fs-12 t-mute">
              {t('ib_active_count', { count: integratedBanksService.list({ query: '', status: 'Active' }).length })}
            </span>
          ),
        }}
        permissions={{
          new: permissions.insert,
          edit: false,
          delete: false,
          view: true,
          export: permissions.export,
        }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onNew={permissions.insert ? openCreate : undefined}
        onExport={permissions.export ? () => handleExport() : undefined}
      />

      <IntegratedBankFormModal
        open={modalOpen}
        mode={modalMode}
        bank={modalMode === 'edit' ? selectedBank : null}
        onClose={closeModal}
        onSaveCreate={handleSaveCreate}
        onSaveUpdate={handleSaveUpdate}
      />
    </>
  );
}

