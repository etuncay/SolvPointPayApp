import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import type { UseFieldArrayReturn, UseFormRegister } from 'react-hook-form';
import { Button, Field } from '@epay/ui';
import type { UploadFormValues } from '../domain/types';
import type { DocumentRelationType } from '@/features/dms/domain/types';

const RELATION_TYPES: DocumentRelationType[] = [
  'Customer',
  'Agent',
  'Transaction',
  'Complaint',
  'Employee',
];

type Props = {
  fieldArray: UseFieldArrayReturn<UploadFormValues, 'relations'>;
  register: UseFormRegister<UploadFormValues>;
};

export function RelationFieldArray({ fieldArray, register }: Props) {
  const { t } = useTranslation();
  const { fields, append, remove } = fieldArray;

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: 10 }}>
        <span className="fs-13 fw-600">{t('du_relations_title')}</span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => append({ relationType: 'Customer', relatedId: '' })}
        >
          <Plus size={14} /> {t('du_add_relation')}
        </Button>
      </div>
      {fields.length === 0 && (
        <p className="fs-12 t-mute" style={{ marginBottom: 8 }}>
          {t('du_relations_empty')}
        </p>
      )}
      <p className="fs-11 t-mute" style={{ marginBottom: 12 }}>
        {t('du_relations_order_hint')}
      </p>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="fgrid cols-2"
          style={{ gap: 12, marginBottom: 12, alignItems: 'end' }}
        >
          <Field label={t('du_relation_type')}>
            <select
              className="select"
              {...register(`relations.${index}.relationType`)}
            >
              {RELATION_TYPES.map((rt) => (
                <option key={rt} value={rt}>
                  {t(`du_rel_${rt}`, rt)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t('du_relation_id')}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                placeholder={t('du_relation_id_ph')}
                {...register(`relations.${index}.relatedId`)}
              />
              <Button type="button" variant="ghost" onClick={() => remove(index)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Field>
        </div>
      ))}
    </div>
  );
}
