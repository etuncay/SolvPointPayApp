import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { AgentGroupInput, AgentGroupListRow, AgentGroupUpdateInput } from '../domain/types';

type Mode = 'create' | 'edit';

type Props = {
  open: boolean;
  mode: Mode;
  group: AgentGroupListRow | null;
  onClose: () => void;
  onSaveCreate: (input: AgentGroupInput) => void;
  onSaveUpdate: (id: number, input: AgentGroupUpdateInput) => void;
};

const EMPTY: AgentGroupInput = {
  groupCode: '',
  name: '',
  description: '',
};

export function AgentGroupFormModal({
  open,
  mode,
  group,
  onClose,
  onSaveCreate,
  onSaveUpdate,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<AgentGroupInput>(EMPTY);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && group) {
      setDraft({
        groupCode: group.groupCode,
        name: group.name,
        description: group.description,
      });
      return;
    }
    setDraft(EMPTY);
  }, [open, mode, group]);

  if (!open) return null;

  const save = () => {
    const payload = {
      ...draft,
      groupCode: draft.groupCode.trim().toUpperCase(),
      name: draft.name.trim(),
      description: draft.description.trim(),
    };
    if (mode === 'create') {
      onSaveCreate(payload);
      return;
    }
    if (group) {
      const { groupCode: _c, ...rest } = payload;
      onSaveUpdate(group.id, rest);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <h3 className="modal-title">
          {mode === 'create' ? t('agg_new') : t('ib_edit')}
        </h3>
        <div className="form-grid" style={{ gap: 12 }}>
          <Field label={t('agg_col_code')}>
            <input
              className="input mono fs-12"
              value={draft.groupCode}
              readOnly={mode === 'edit'}
              disabled={mode === 'edit'}
              onChange={(e) =>
                setDraft((d) => ({ ...d, groupCode: e.target.value.toUpperCase() }))
              }
              placeholder="VIP_TIER"
            />
          </Field>
          <Field label={t('agg_col_name')}>
            <input
              className="input fs-12"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </Field>
          <Field label={t('rpt_col_desc')}>
            <input
              className="input fs-12"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
          </Field>
        </div>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button variant="primary" onClick={save}>
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
