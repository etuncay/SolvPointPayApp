import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import { useRole } from '@/domain/role-context';
import { riskManagementService } from '@/features/risk-compliance/management/api';
import type { CaseRouteInput } from '../domain/types';

type Props = {
  open: boolean;
  requireManagerNote: boolean;
  onClose: () => void;
  onConfirm: (input: CaseRouteInput) => void;
};

export function RouteCaseModal({ open, requireManagerNote, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const { role } = useRole();
  const assignableGroups = useMemo(
    () => (open ? riskManagementService.listAssignableGroups(role) : []),
    [open, role],
  );

  const routeOptions = useMemo(() => {
    const opts: { userId: string }[] = [];
    for (const g of assignableGroups) {
      for (const m of g.members) {
        opts.push({ userId: m.userId });
      }
    }
    return opts;
  }, [assignableGroups]);

  const [targetUserId, setTargetUserId] = useState('');
  const [comment, setComment] = useState('');
  const [managerNote, setManagerNote] = useState('');

  useEffect(() => {
    if (!open) {
      setComment('');
      setManagerNote('');
      setTargetUserId('');
      return;
    }
    setTargetUserId(routeOptions[0]?.userId ?? '');
  }, [open, routeOptions]);

  if (!open) return null;

  const submit = () => {
    if (!comment.trim() || !targetUserId) return;
    if (requireManagerNote && !managerNote.trim()) return;
    onConfirm({
      targetUserId,
      comment: comment.trim(),
      managerNote: managerNote.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 460 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('fcd_action_route')}</h2>
        </div>
        <div className="modal-body">
          <Field label={t('fcd_route_target')} required>
            <select className="input" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)}>
              {assignableGroups.map((g) => (
                <optgroup key={g.id} label={g.name}>
                  {g.members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.displayName}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
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
            variant="primary"
            onClick={submit}
            disabled={!comment.trim() || !targetUserId || routeOptions.length === 0}
          >
            {t('fcd_action_route')}
          </Button>
        </div>
      </div>
    </div>
  );
}
