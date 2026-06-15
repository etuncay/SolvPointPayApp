import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Beaker } from 'lucide-react';
import { DynamicTable, exportTableCsv } from '@epay/ui';
import { deleteCustomer, ensurePlaygroundCustomersSeeded } from '@epay/data';
import { buildPlaygroundTableConfig } from './playground-table-config';

export function PlaygroundPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });
  const [listVersion, setListVersion] = useState(0);
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    void ensurePlaygroundCustomersSeeded().then(() => setDbReady(true));
  }, []);

  const tableConfig = useMemo(
    () => buildPlaygroundTableConfig(translate),
    [i18n.language, listVersion],
  );

  const handleExport = (rows: Record<string, unknown>[]) => {
    exportTableCsv(tableConfig.columns, rows, 'playground-musteriler', {
      locale: i18n.language,
      t: translate,
    });
    toast.success(t('pg_export_ok'));
  };

  const bumpList = () => setListVersion((v) => v + 1);

  const handleBulkAction = async (key: string, rows: Record<string, unknown>[]) => {
    if (key === 'bulkExport') {
      exportTableCsv(tableConfig.columns, rows, 'playground-secili', {
        locale: i18n.language,
        t: translate,
      });
      toast.success(t('pg_export_ok'));
      return;
    }
    if (key === 'bulkDelete') {
      let n = 0;
      for (const r of rows) {
        if (await deleteCustomer(String(r.id ?? ''))) n += 1;
      }
      toast.success(translate('pg_bulk_deleted', `${n} kayıt silindi`));
      bumpList();
    }
  };

  if (!dbReady) {
    return (
      <p className="t-mute fs-12" style={{ padding: 24 }}>
        {t('pg_db_loading')}
      </p>
    );
  }

  return (
    <DynamicTable
      config={tableConfig}
      header={{
        title: (
          <>
            <Beaker size={16} style={{ marginRight: 6 }} />
            {t('pg_title')}
          </>
        ),
        subtitle: t('pg_subtitle_table'),
        status: <span className="badge muted">DEV</span>,
      }}
      permissions={{ new: true, edit: true, delete: true, view: true, export: true }}
      locale={i18n.language}
      t={translate}
      onNew={() => navigate('/playground/new')}
      onView={(row) => navigate(`/playground/view/${row.id}`)}
      onEdit={(row) => navigate(`/playground/edit/${row.id}`)}
      confirmOnDelete={false}
      onDelete={(row) => navigate(`/playground/delete/${row.id}`)}
      onRowClick={(row) => navigate(`/playground/view/${row.id}`)}
      onExport={handleExport}
      onBulkAction={(key, rows) => void handleBulkAction(key, rows)}
    />
  );
}
