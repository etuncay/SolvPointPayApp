import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { DynamicTable, type TableCustomFunctions } from '@epay/ui';
import { AGENT_PATHS } from '@/config/agent-nav-paths';
import { agentTransactionsService } from '@/features/transaction-confirmation/api/agent-transactions-service';
import { buildPendingCustomersTableConfig } from '../dashboard-table-config';

/** §5 — Bekleyen Müşteriler (DynamicTable + JSON config). Boşsa panel render edilmez. */
export function PendingCustomersPanel() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const initialCount = useMemo(() => agentTransactionsService.listPendingCustomers().length, []);
  const [visible, setVisible] = useState(initialCount > 0);

  const tableConfig = useMemo(
    () => buildPendingCustomersTableConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderCustStatus: (val: unknown) =>
        t(`ag_home_cust_status_${String(val)}`, { defaultValue: String(val) }),
    }),
    [t],
  );

  if (!visible) return null;

  return (
    <div className="fcard" style={{ marginBottom: 16 }}>
      <div className="fcard-body">
        <div className="section-h">
          <UserPlus size={15} /> {t('ag_home_pending_customers')}
        </div>
        <DynamicTable
          config={tableConfig}
          permissions={{}}
          customFunctions={customFunctions}
          locale={i18n.language}
          t={translate}
          onDataChange={(rows) => setVisible(rows.length > 0)}
          onRowClick={(row) => {
            const idNo = String(row.idNo ?? '');
            navigate(idNo ? `${AGENT_PATHS.customers}?idNo=${encodeURIComponent(idNo)}` : AGENT_PATHS.customers);
          }}
        />
      </div>
    </div>
  );
}
