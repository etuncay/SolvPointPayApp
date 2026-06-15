import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { AgentOption } from '../domain/assignment-types';

type Props = {
  open: boolean;
  groupCode: string;
  agents: AgentOption[];
  onClose: () => void;
  onAssign: (agentId: number) => void;
};

export function AssignAgentModal({ open, groupCode, agents, onClose, onAssign }: Props) {
  const { t } = useTranslation();
  const [selectedAgentId, setSelectedAgentId] = useState<number | ''>('');

  const availableAgents = useMemo(
    () =>
      agents.filter((o) => {
        if (o.activeGroupCode === groupCode.toUpperCase()) return false;
        return true;
      }),
    [agents, groupCode],
  );

  if (!open) return null;

  const save = () => {
    if (selectedAgentId === '') return;
    onAssign(selectedAgentId);
    setSelectedAgentId('');
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 440 }}
      >
        <h3 className="modal-title">{t('aga_new_assign')}</h3>
        <Field label={t('aga_pick_agent')}>
          <select
            className="select fs-12"
            value={selectedAgentId}
            onChange={(e) =>
              setSelectedAgentId(e.target.value ? Number(e.target.value) : '')
            }
          >
            <option value="">{t('aga_pick_agent')}</option>
            {availableAgents.map((o) => (
              <option key={o.id} value={o.id}>
                {o.code} — {o.name}
                {o.activeGroupCode ? ` (${o.activeGroupCode})` : ''}
              </option>
            ))}
          </select>
        </Field>
        <div className="modal-actions" style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button variant="primary" onClick={save} disabled={selectedAgentId === ''}>
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
