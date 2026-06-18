import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { DynamicTable, type TableCustomFunctions } from '@epay/ui';
import { printReceipt } from '@/features/receipt/print-receipt';
import { agentTransactionsService } from '@/features/transaction-confirmation/api/agent-transactions-service';
import { buildReceiptsTableConfig } from '../settings-table-config';
import { useAgentUiPermissions } from '@/hooks/use-agent-ui-permissions';

/** 1.3 › Dekontlarım — DynamicTable + JSON config. */
export function ReceiptsTab() {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const hasRows = useMemo(() => agentTransactionsService.listAgentReceipts().length > 0, []);
  const ui = useAgentUiPermissions();

  const tableConfig = useMemo(
    () => buildReceiptsTableConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const customFunctions: TableCustomFunctions = useMemo(
    () => ({
      renderReceiptDownload: (_val: unknown, row: Record<string, unknown>) => (
        <button type="button" className="link-btn" onClick={() => printReceipt(Number(row.transactionId))}>
          <Download size={13} /> {t('ag_rc_download')}
        </button>
      ),
    }),
    [t],
  );

  if (!hasRows) {
    return <p className="t-mute" style={{ fontSize: 12.5 }}>{t('ag_rc_empty')}</p>;
  }

  return (
    <DynamicTable
      config={tableConfig}
      permissions={ui.table.settingsReceipts}
      customFunctions={customFunctions}
      locale={i18n.language}
      t={translate}
    />
  );
}
