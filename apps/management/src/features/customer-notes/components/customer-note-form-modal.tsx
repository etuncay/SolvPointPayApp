import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import {
  PRIORITY_OPTIONS,
  TARGET_ENTITY_OPTIONS,
  type CustomerNote,
  type CustomerNoteInput,
  type PriorityLevel,
  type TargetEntityType,
} from '../domain/types';
import { MAX_NOTE_LENGTH } from '../domain/validation';

type Mode = 'create' | 'edit';

type Props = {
  open: boolean;
  mode: Mode;
  note: CustomerNote | null;
  onClose: () => void;
  onSaveCreate: (input: CustomerNoteInput) => boolean;
  onSaveUpdate: (id: number, input: CustomerNoteInput) => boolean;
};

const EMPTY: CustomerNoteInput = {
  customerNo: '',
  noteText: '',
  targetEntityType: 'IndividualCustomer',
  priorityLevel: 'Medium',
  displayLimit: null,
  endDate: null,
};

export function CustomerNoteFormModal({ open, mode, note, onClose, onSaveCreate, onSaveUpdate }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<CustomerNoteInput>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && note) {
      setDraft({
        customerNo: note.customerNo,
        noteText: note.noteText,
        targetEntityType: note.targetEntityType,
        priorityLevel: note.priorityLevel,
        displayLimit: note.displayLimit,
        endDate: note.endDate,
      });
    } else {
      setDraft(EMPTY);
    }
  }, [open, mode, note]);

  if (!open) return null;

  const targetLabel: Record<TargetEntityType, string> = {
    IndividualCustomer: t('cn_target_IndividualCustomer'),
    CorporateCustomer: t('cn_target_CorporateCustomer'),
    Agent: t('cn_target_Agent'),
  };

  const priorityLabel: Record<PriorityLevel, string> = {
    Low: t('rs_level_low'),
    Medium: t('rs_level_medium'),
    High: t('scf_level_High'),
    Critical: t('scf_level_Critical'),
  };

  const patch = (p: Partial<CustomerNoteInput>) => setDraft((prev) => ({ ...prev, ...p }));

  const submit = () => {
    const payload: CustomerNoteInput = {
      ...draft,
      customerNo: draft.customerNo.trim(),
      noteText: draft.noteText.trim(),
      displayLimit: draft.displayLimit != null && draft.displayLimit > 0 ? draft.displayLimit : null,
      endDate: draft.endDate?.trim() ? draft.endDate : null,
    };
    const ok = mode === 'create' ? onSaveCreate(payload) : note ? onSaveUpdate(note.id, payload) : false;
    if (ok) onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 560 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{mode === 'create' ? t('cn_new_note') : t('cn_act_edit')}</h2>
          <p>{t('cn_subtitle')}</p>
        </div>
        <div className="modal-body" style={{ display: 'grid', gap: 12 }}>
          <Field label={t('cn_col_customer')} required>
            <input
              className="input mono"
              value={draft.customerNo}
              placeholder="MUS-099901"
              onChange={(e) => patch({ customerNo: e.target.value })}
            />
          </Field>
          <Field label={t('cn_col_text')} required>
            <textarea
              className="textarea"
              rows={3}
              maxLength={MAX_NOTE_LENGTH}
              value={draft.noteText}
              onChange={(e) => patch({ noteText: e.target.value })}
            />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label={t('cn_col_target')} required>
              <select
                className="select"
                value={draft.targetEntityType}
                onChange={(e) => patch({ targetEntityType: e.target.value as TargetEntityType })}
              >
                {TARGET_ENTITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {targetLabel[opt]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t('cn_col_priority')} required>
              <select
                className="select"
                value={draft.priorityLevel}
                onChange={(e) => patch({ priorityLevel: e.target.value as PriorityLevel })}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {priorityLabel[opt]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label={t('cn_col_display_limit')}>
              <input
                className="input mono"
                type="number"
                min={1}
                placeholder="—"
                value={draft.displayLimit ?? ''}
                onChange={(e) => patch({ displayLimit: e.target.value ? Number(e.target.value) : null })}
              />
            </Field>
            <Field label={t('cn_col_end_date')}>
              <input
                className="input"
                type="date"
                value={draft.endDate ?? ''}
                onChange={(e) => patch({ endDate: e.target.value || null })}
              />
            </Field>
          </div>
          <p className="fs-11 t-mute">{t('cn_footer_hint')}</p>
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('cn_act_cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={submit}>
            {t('cn_act_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
