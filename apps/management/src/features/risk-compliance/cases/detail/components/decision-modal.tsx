import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { CaseDecisionInput } from '../domain/types';

type Props = {
  open: boolean;
  title: string;
  variant?: 'primary' | 'danger';
  requireManagerNote: boolean;
  onClose: () => void;
  onConfirm: (input: CaseDecisionInput) => void;
};

export function DecisionModal({
  open,
  title,
  variant = 'primary',
  requireManagerNote,
  onClose,
  onConfirm,
}: Props) {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const [managerNote, setManagerNote] = useState('');

  useEffect(() => {
    if (!open) {
      setComment('');
      setManagerNote('');
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    if (!comment.trim()) return;
    if (requireManagerNote && !managerNote.trim()) return;
    onConfirm({ comment: comment.trim(), managerNote: managerNote.trim() || undefined });
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{title}</h2>
          <p className="t-mute fs-13">{t('fcd_comment_required_hint')}</p>
        </div>
        <div className="modal-body">
          <Field label={t('fcd_comment')} required>
            <textarea className="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
          </Field>
          {requireManagerNote ? (
            <Field label={t('fcd_manager_note')} required>
              <textarea
                className="textarea"
                rows={2}
                value={managerNote}
                onChange={(e) => setManagerNote(e.target.value)}
              />
            </Field>
          ) : null}
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('ib_cancel')}
          </Button>
          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={submit}
            disabled={!comment.trim() || (requireManagerNote && !managerNote.trim())}
          >
            {title}
          </Button>
        </div>
      </div>
    </div>
  );
}
