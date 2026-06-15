import { useTranslation } from 'react-i18next';
import { Button, DynamicTable, FormCard, type TableConfig } from '@epay/ui';
import type { FraudRuleException } from '../domain/types';

export function ExceptionsPanel({
  exceptions,
  onAdd,
  canAdd,
}: {
  exceptions: FraudRuleException[];
  onAdd: () => void;
  canAdd: boolean;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const fmtDate = (d: string) =>
    new Date(d.includes('T') ? d : `${d}T00:00:00`).toLocaleDateString(
      lang === 'tr' ? 'tr-TR' : 'en-GB',
    );

  return (
    <FormCard
      id="sec-exceptions"
      title={t('frd_panel_exceptions')}
      meta={
        <Button type="button" variant="ghost" size="sm" onClick={onAdd} disabled={!canAdd}>
          {t('frd_add_exception')}
        </Button>
      }
    >
      {exceptions.length === 0 ? (
        <p className="t-mute fs-13">{t('frd_no_exceptions')}</p>
      ) : (
        <DynamicTable
          config={
            {
              rowKey: 'id',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: { defaultPageSize: 8, pageSizeOptions: [8, 15, 30] },
              columns: [
                { key: 'customerNo', title: t('frd_exc_customer'), dataIndex: 'customerNo', mono: true, width: 160 },
                { key: 'expiresAt', title: t('frd_exc_expires'), dataIndex: 'expiresAt', render: 'renderDate', width: 140 },
                { key: 'note', title: t('frd_exc_note'), dataIndex: 'note', render: 'renderNote' },
                { key: 'createdAt', title: t('frd_exc_created'), dataIndex: 'createdAt', render: 'renderDate', mono: true, width: 140 },
              ],
              api: {
                method: async () => ({
                  data: exceptions as unknown as Record<string, unknown>[],
                  total: exceptions.length,
                  success: true,
                }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={{
            renderDate: (val: unknown) => (typeof val === 'string' ? fmtDate(val) : '—'),
            renderNote: (val: unknown) => String(val ?? '—'),
          }}
          locale={lang}
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      )}
    </FormCard>
  );
}
