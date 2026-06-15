import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import { DEPARTMENT_OPTIONS } from '../mocks/departments';
import { STAFF_OPTIONS } from '../mocks/staff';
import { RESOLUTION_OPTIONS } from '../domain/transitions';
import type { ActionKind } from '../domain/transitions';

type Props = {
  kind: ActionKind | null;
  onClose: () => void;
  onSubmit: (payload: Record<string, string>) => void;
};

export function CaseActionModal({ kind, onClose, onSubmit }: Props) {
  const { t } = useTranslation();
  const [payload, setPayload] = useState<Record<string, string>>({ note: '' });

  if (!kind) return null;

  const titleKey: Record<ActionKind, string> = {
    take: 'scf_btn_take',
    transfer: 'scf_btn_transfer',
    contact: 'scf_modal_contact',
    infoRequest: 'scf_modal_info',
    resolve: 'scf_btn_resolve',
    reject: 'scf_btn_reject',
    reopen: 'scf_btn_reopen',
  };

  const set = (key: string, value: string) => setPayload((p) => ({ ...p, [key]: value }));

  return (
    <div className="modal-overlay" role="dialog" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <h3>{t(titleKey[kind])}</h3>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {kind === 'transfer' ? (
            <>
              <Field label={t('scf_department')}>
                <select
                  className="select"
                  value={payload.departmentId ?? ''}
                  onChange={(e) => set('departmentId', e.target.value)}
                >
                  <option value="">{t('scf_none')}</option>
                  {DEPARTMENT_OPTIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {t(d.nameKey)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('scf_owner')}>
                <select
                  className="select"
                  value={payload.ownerUserId ?? ''}
                  onChange={(e) => set('ownerUserId', e.target.value)}
                >
                  <option value="">{t('scf_none')}</option>
                  {STAFF_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}
          {(kind === 'contact' || kind === 'infoRequest') && (
            <>
              <Field label={t('scf_party')}>
                <select
                  className="select"
                  value={payload.contactedParty ?? 'customer'}
                  onChange={(e) => set('contactedParty', e.target.value)}
                >
                  <option value="customer">{t('scf_entity_customer')}</option>
                  <option value="agent">{t('rpt_col_agent')}</option>
                  <option value="thirdParty">{t('scf_entity_third')}</option>
                </select>
              </Field>
              <Field label={t('rpt_col_channel')}>
                <input
                  className="input"
                  value={payload.channel ?? ''}
                  onChange={(e) => set('channel', e.target.value)}
                />
              </Field>
            </>
          )}
          {kind === 'resolve' ? (
            <>
              <Field label={t('scf_resolution')} required>
                <select
                  className="select"
                  value={payload.resolutionCode ?? ''}
                  onChange={(e) => set('resolutionCode', e.target.value)}
                >
                  <option value="">{t('scf_select')}</option>
                  {RESOLUTION_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {t(`case_status_${r}`, r)}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}
          {kind === 'reject' ? (
            <Field label={t('scf_reject_reason')} required>
              <input
                className="input"
                value={payload.reasonCode ?? ''}
                onChange={(e) => set('reasonCode', e.target.value)}
              />
            </Field>
          ) : null}
          {kind === 'reopen' ? (
            <Field label={t('scf_reopen_reason')} required>
              <input
                className="input"
                value={payload.reopenReason ?? ''}
                onChange={(e) => set('reopenReason', e.target.value)}
              />
            </Field>
          ) : null}
          <Field label={t('scf_note')} required={kind !== 'take'}>
            <textarea
              className="input"
              rows={3}
              value={payload.note ?? ''}
              onChange={(e) => set('note', e.target.value)}
            />
          </Field>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('ib_cancel')}
          </Button>
          <Button type="button" variant="primary" onClick={() => onSubmit(payload)}>
            {t('scf_confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
