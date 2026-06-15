import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DynamicTable, FormCard, type CustomFunctions, type TableConfig } from '@epay/ui';
import type { DmsDocumentDetail } from '../domain/types';

type Props = { detail: DmsDocumentDetail };

export function RelationsPanel({ detail }: Props) {
  const { t } = useTranslation();

  return (
    <FormCard title={t('du_relations_title')}>
      {detail.relations.length === 0 ? (
        <p className="fs-12 t-mute">{t('du_relations_empty')}</p>
      ) : (
        <DynamicTable
          config={
            {
              rowKey: 'id',
              hideTitleBar: true,
              hideColumnFilters: true,
              pagination: false,
              columns: [
                { key: 'relationType', title: t('du_relation_type'), dataIndex: 'relationType', render: 'renderType' },
                { key: 'relatedId', title: 'ID', dataIndex: 'relatedId', mono: true, width: 180 },
                { key: 'href', title: t('dd_link'), dataIndex: 'href', render: 'renderLink', width: 160 },
              ],
              api: {
                method: async () => ({
                  data: detail.relations.map((r) => ({ ...r, id: `${r.relationType}-${r.relatedId}` })) as unknown as Record<string, unknown>[],
                  total: detail.relations.length,
                  success: true,
                }),
              },
            } satisfies TableConfig
          }
          permissions={{}}
          customFunctions={
            {
              renderType: (val: unknown) => t(`du_rel_${String(val)}`, String(val)),
              renderLink: (val: unknown) =>
                val ? (
                  <Link to={String(val)} className="link">
                    {t('dd_open_entity')}
                  </Link>
                ) : (
                  <span className="t-mute">—</span>
                ),
            } satisfies CustomFunctions
          }
          locale="tr"
          t={(k, fb) => t(k, { defaultValue: fb ?? k })}
        />
      )}
    </FormCard>
  );
}
