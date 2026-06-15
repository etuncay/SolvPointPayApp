import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
};

export function WalletNoteModal({ open, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  if (!open) return null;

  const submit = () => {
    if (!text.trim()) return;
    onConfirm(text.trim());
    setText('');
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 480 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('wd_add_note')}</h2>
          <p>{t('wd_note_modal_sub')}</p>
        </div>
        <div className="modal-body">
          <Field label={t('wd_note_text')} required>
            <textarea className="textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
          </Field>
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button type="button" variant="primary" onClick={submit} disabled={!text.trim()}>
            {t('wd_note_submit')}
          </Button>
        </div>
      </div>
    </div>
  );
}
