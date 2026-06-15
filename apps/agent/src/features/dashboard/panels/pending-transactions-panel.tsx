import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { DynamicTable, type TableCustomFunctions } from '@epay/ui';
import { agentTransactionsService } from '@/features/transaction-confirmation/api/agent-transactions-service';
import { buildPendingTransactionsTableConfig } from '../dashboard-table-config';

/** §5 — Bekleyen İşlemler (DynamicTable + JSON config). Boşsa panel render edilmez. */
export function PendingTransactionsPanel() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const initialCount = useMemo(() => agentTransactionsService.listPendingTransactions().length, []);
  const [visible, setVisible] = useState(initialCount > 0);

  const tableConfig = useMemo(
    () => buildPendingTransactionsTableConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderTxType: (val: unknown) => t(`wa_tx_${String(val)}`, { defaultValue: String(val) }),
      renderStatus: (val: unknown) => t(`tx_status_${String(val)}`, { defaultValue: String(val) }),
    }),
    [t],
  );

  if (!visible) return null;

  return (
    <div className="fcard" style={{ marginBottom: 16 }}>
      <div className="fcard-body">
        <div className="section-h">
          <Clock size={15} /> {t('ag_home_pending_tx')}
        </div>
        <DynamicTable
          config={tableConfig}
          permissions={{}}
          customFunctions={customFunctions}
          locale={i18n.language}
          t={translate}
          onDataChange={(rows) => setVisible(rows.length > 0)}
          onRowClick={(row) =>
            navigate(
              row.status === 'Pending'
                ? `/transactions/${row.id}/approve`
                : `/transactions/${row.id}`,
            )
          }
        />
      </div>
    </div>
  );
}
