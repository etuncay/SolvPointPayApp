import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
};

export function RejectModal({ open, onClose, onConfirm }: Props) {
  const { i18n } = useTranslation();
  const tr = i18n.language === 'tr';
  const [comment, setComment] = useState('');

  if (!open) return null;

  const submit = () => {
    if (!comment.trim()) return;
    onConfirm(comment.trim());
    setComment('');
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 440 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2 style={{ color: 'var(--danger-fg)' }}>{tr ? 'Reddet' : 'Reject'}</h2>
          <p>{tr ? 'Red gerekçesi zorunludur.' : 'Rejection reason is required.'}</p>
        </div>
        <div className="modal-body">
          <Field label={tr ? 'Yorum' : 'Comment'} required>
            <textarea className="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {tr ? 'Vazgeç' : 'Cancel'}
          </Button>
          <Button type="button" variant="danger" onClick={submit} disabled={!comment.trim()}>
            {tr ? 'Reddet' : 'Reject'}
          </Button>
        </div>
      </div>
    </div>
  );
}
