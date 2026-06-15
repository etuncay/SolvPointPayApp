import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
};

export function ApproveModal({ open, onClose, onConfirm }: Props) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const [comment, setComment] = useState('');

  if (!open) return null;

  const submit = () => {
    onConfirm(comment.trim() || undefined);
    setComment('');
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 440 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{tr ? 'Onayla' : 'Approve'}</h2>
          <p>{tr ? 'Yorum opsiyoneldir.' : 'Comment is optional.'}</p>
        </div>
        <div className="modal-body">
          <Field label={tr ? 'Yorum' : 'Comment'}>
            <textarea className="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {tr ? 'Vazgeç' : 'Cancel'}
          </Button>
          <Button type="button" variant="primary" onClick={submit}>
            {tr ? 'Onayla' : 'Approve'}
          </Button>
        </div>
      </div>
    </div>
  );
}
