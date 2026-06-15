import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { DocumentCategory, RequestAdditionalPayload } from '../domain/types';
import { DOCUMENT_CATEGORIES, DOCUMENT_TYPES_BY_CATEGORY } from '../domain/types';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: RequestAdditionalPayload) => void;
};

export function RequestAdditionalModal({ open, onClose, onConfirm }: Props) {
  const { t } = useTranslation();

  const [category, setCategory] = useState<DocumentCategory>('Identity');
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES_BY_CATEGORY.Identity[0]!);
  const [comment, setComment] = useState('');

  if (!open) return null;

  const types = DOCUMENT_TYPES_BY_CATEGORY[category] ?? [];

  const submit = () => {
    if (!documentType.trim()) return;
    onConfirm({ category, documentType, comment: comment.trim() });
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('dr_modal_additional_title')}</h2>
          <p>{t('dr_modal_additional_sub')}</p>
        </div>
        <div className="modal-body" style={{ gap: 14 }}>
          <Field label={t('dr_col_category')} required>
            <select
              className="select"
              value={category}
              onChange={(e) => {
                const c = e.target.value as DocumentCategory;
                setCategory(c);
                setDocumentType(DOCUMENT_TYPES_BY_CATEGORY[c][0] ?? '');
              }}
            >
              {DOCUMENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{t(`dr_cat_${c}`, c)}</option>
              ))}
            </select>
          </Field>
          <Field label={t('dr_col_type')} required>
            <select className="select" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
              {types.map((tp) => (
                <option key={tp} value={tp}>{tp}</option>
              ))}
            </select>
          </Field>
          <Field label={t('dr_comment')}>
            <textarea className="textarea" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
        </div>
        <div className="modal-foot" style={{ justifyContent: 'flex-end', gap: 8 }}>
          <Button type="button" onClick={onClose}>{t('dr_cancel')}</Button>
          <Button type="button" variant="primary" onClick={submit}>{t('dr_submit')}</Button>
        </div>
      </div>
    </div>
  );
}
