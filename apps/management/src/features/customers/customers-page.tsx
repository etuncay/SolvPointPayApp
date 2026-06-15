import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';
import { DynamicTable } from '@epay/ui';
import { exportCsv, type CsvColumn } from '@/lib/csv';
import { useRole } from '@/domain/role-context';
import { CustomerAvatar } from './domain/customer-avatar';
import { KycPill } from './domain/kyc-pill';
import { StatusPill } from './domain/status-pill';
import { TypeBadge } from './domain/type-badge';
import { TypePickerModal } from './type-picker-modal';
import { getCustomerPermissions } from './domain/permissions';
import { DEFAULT_CUSTOMER_FILTERS, type CustomerFilters, type CustomerListItem } from './domain/types';
import { customersService } from './api/customers-service';
import { logCustomerAccess } from './api/mock-customers-adapter';
import { buildCustomersTableConfig } from './customers-table-config';

export function CustomersPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { role } = useRole();
  const permissions = getCustomerPermissions(role);

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [version, setVersion] = useState(0);
  const lastFilters = useRef<CustomerFilters>(DEFAULT_CUSTOMER_FILTERS);

  const lang = i18n.language === 'tr' ? 'tr-TR' : 'en-US';
  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang, { year: 'numeric', month: 'short', day: '2-digit' });

  const typeLabel = (ty: CustomerListItem['type']) =>
    ty === 'corporate' ? t('cust_new_corp') : ty === 'prospective' ? t('cust_new_prosp') : t('cust_new_indv');

  const segLabel = (s: CustomerListItem['riskSeg']) =>
    s === 'low'
      ? t('rs_level_low')
      : s === 'med'
        ? t('rs_level_medium')
        : s === 'high'
          ? t('scf_level_High')
          : t('scf_level_Critical');

  const statusLabel = (s: CustomerListItem['status']) =>
    ({
      active: t('ib_status_Active'),
      inactive: t('ib_status_Inactive'),
      blocked: t('fcd_blocked'),
      closed: t('rl_closed'),
    })[s] ?? s;

  const statusText = (c: CustomerListItem) => {
    const reason = c.blockReason || c.closeReason;
    return reason ? `${statusLabel(c.status)} – ${reason}` : statusLabel(c.status);
  };

  const tableConfig = useMemo(
    () =>
      buildCustomersTableConfig(translate, (f) => {
        lastFilters.current = f;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, version],
  );

  const customFunctions = useMemo(
    () => ({
      renderId: (_v: unknown, row: Record<string, unknown>) => (
        <span className="cust-no">#{(row as CustomerListItem).id}</span>
      ),
      renderName: (_v: unknown, row: Record<string, unknown>) => {
        const c = row as CustomerListItem;
        return (
          <span className="cust-cell">
            <CustomerAvatar customer={c} />
            <span className="meta-2">
              <b>{c.name}</b>
              <span>{c.city}</span>
            </span>
          </span>
        );
      },
      renderContact: (_v: unknown, row: Record<string, unknown>) => {
        const c = row as CustomerListItem;
        const primary = c.primaryContact === 'email' ? c.email : c.phone;
        return <span className="contact-cell mono fs-12">{primary}</span>;
      },
      renderIdNo: (_v: unknown, row: Record<string, unknown>) => {
        const c = row as CustomerListItem;
        return (
          <span className="idno">
            <span className="kind">{c.idKind}</span>
            <span className="mono">{c.idNo}</span>
          </span>
        );
      },
      renderType: (_v: unknown, row: Record<string, unknown>) => (
        <TypeBadge type={(row as CustomerListItem).type} />
      ),
      renderCampaign: (_v: unknown, row: Record<string, unknown>) => {
        const c = row as CustomerListItem;
        return c.campaign ? (
          <span className="t-soft fs-12">{c.campaign}</span>
        ) : (
          <span className="t-mute">—</span>
        );
      },
      renderKyc: (_v: unknown, row: Record<string, unknown>) => <KycPill customer={row as CustomerListItem} />,
      renderRiskSeg: (_v: unknown, row: Record<string, unknown>) => (
        <span className="t-soft fs-12">{segLabel((row as CustomerListItem).riskSeg)}</span>
      ),
      renderStatus: (_v: unknown, row: Record<string, unknown>) => <StatusPill customer={row as CustomerListItem} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const csvColumns: CsvColumn<CustomerListItem>[] = [
    { header: t('frd_exc_customer'), value: (c) => c.id },
    { header: t('cc_name'), value: (c) => c.name },
    { header: t('fcd_customer_email'), value: (c) => c.email },
    { header: t('fcd_customer_phone'), value: (c) => c.phone },
    { header: t('cd_id'), value: (c) => `${c.idKind} ${c.idNo}` },
    { header: t('rpt_col_city'), value: (c) => c.city },
    { header: t('rpt_col_type'), value: (c) => typeLabel(c.type) },
    { header: t('cc_campaign'), value: (c) => c.campaign ?? '' },
    { header: t('rpt_col_kyc'), value: (c) => c.kyc },
    { header: t('cc_risk_score'), value: (c) => c.riskScore },
    { header: t('cc_risk_seg'), value: (c) => segLabel(c.riskSeg) },
    { header: t('sc_col_created'), value: (c) => fmtDate(c.createdAt) },
    { header: t('scf_col_status'), value: (c) => statusText(c) },
  ];

  const navigateForm = (c: CustomerListItem, mode: 'view' | 'edit') => {
    const qs = mode === 'view' ? '?mode=view' : '';
    const seg = c.type === 'corporate' ? 'corporate' : 'individual';
    navigate(`/customers/${c.id}/${seg}${qs}`);
  };

  const handleRowClick = (row: Record<string, unknown>) => {
    navigateForm(row as CustomerListItem, permissions.update ? 'edit' : 'view');
  };

  const handleExport = () => {
    const rows = customersService.exportRows(lastFilters.current);
    logCustomerAccess('export', lastFilters.current);
    exportCsv('musteriler', rows, csvColumns);
  };

  const handleBulkAction = (key: string, rows: Record<string, unknown>[]) => {
    if (key === 'bulkExport') {
      exportCsv('musteriler-secili', rows as unknown as CustomerListItem[], csvColumns);
    }
  };

  const handleDelete = (row: Record<string, unknown>) => {
    const c = row as CustomerListItem;
    customersService.softDelete(c.id);
    toast.success(t('cust_delete_toast'));
    setVersion((v) => v + 1);
  };

  return (
    <>
      {role === 'compliance' && (
        <div className="ins-banner">
          <div className="ic">
            <Shield size={14} />
          </div>
          <div style={{ flex: 1 }}>{t('cust_role_compliance')}</div>
        </div>
      )}

      <DynamicTable
        config={tableConfig}
        header={{ title: t('nav_customers'), subtitle: t('cust_subtitle') }}
        permissions={{
          new: permissions.insert,
          edit: permissions.update,
          delete: permissions.delete,
          view: permissions.view,
          export: permissions.export,
        }}
        customFunctions={customFunctions}
        locale={i18n.language}
        t={translate}
        onNew={() => setTypePickerOpen(true)}
        onView={(row) => navigateForm(row as CustomerListItem, 'view')}
        onEdit={(row) => navigateForm(row as CustomerListItem, 'edit')}
        onDelete={handleDelete}
        onRowClick={handleRowClick}
        onExport={handleExport}
        onBulkAction={handleBulkAction}
      />

      {typePickerOpen && (
        <TypePickerModal
          onClose={() => setTypePickerOpen(false)}
          onPick={(kind) => {
            setTypePickerOpen(false);
            if (kind === 'individual' || kind === 'prospective') {
              navigate('/customers/new-individual');
            } else if (kind === 'corporate') {
              navigate('/customers/new-corporate');
            }
          }}
        />
      )}
    </>
  );
}
