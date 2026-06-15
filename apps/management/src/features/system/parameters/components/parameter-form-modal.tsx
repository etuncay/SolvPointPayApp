import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import {
  getCatalogEntry,
  getCreatableCatalogEntries,
} from '../domain/parameter-catalog';
import { getSystemParametersStore } from '@/mocks/system-parameters';
import type { ParameterFormInput, ParameterStatus, SystemParameter } from '../domain/types';
import { ParameterValueCell } from './parameter-value-cell';

type Mode = 'create' | 'edit';

type Props = {
  open: boolean;
  mode: Mode;
  parameter: SystemParameter | null;
  onClose: () => void;
  onSave: (input: ParameterFormInput, id?: string) => void;
};

function catalogToInput(key: string, value: string, status: ParameterStatus): ParameterFormInput | null {
  const entry = getCatalogEntry(key);
  if (!entry) return null;
  return {
    parameterKey: entry.parameterKey,
    groupName: entry.groupName,
    valueType: entry.valueType,
    description: entry.descriptionKey,
    value,
    status,
  };
}

export function ParameterFormModal({ open, mode, parameter, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<ParameterFormInput | null>(null);

  const activeKeys = useMemo(
    () => new Set(getSystemParametersStore().map((row) => row.parameterKey)),
    [open],
  );

  const creatable = useMemo(() => getCreatableCatalogEntries(activeKeys), [activeKeys]);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && parameter) {
      setDraft({
        parameterKey: parameter.parameterKey,
        groupName: parameter.groupName,
        valueType: parameter.valueType,
        description: parameter.description,
        value: parameter.value,
        status: parameter.status,
      });
      return;
    }
    const first = creatable[0];
    if (first) {
      setDraft(catalogToInput(first.parameterKey, first.defaultValue, 'Active'));
    } else {
      setDraft(null);
    }
  }, [open, mode, parameter, creatable]);

  if (!open) return null;

  const onKeyChange = (key: string) => {
    const entry = getCatalogEntry(key);
    if (!entry || !draft) return;
    setDraft({
      parameterKey: entry.parameterKey,
      groupName: entry.groupName,
      valueType: entry.valueType,
      description: entry.descriptionKey,
      value: entry.defaultValue,
      status: draft.status,
    });
  };

  const save = () => {
    if (!draft) return;
    onSave(draft, mode === 'edit' && parameter ? parameter.id : undefined);
  };

  const noCreatable = mode === 'create' && creatable.length === 0;

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 520 }}
      >
        <h3 className="modal-title">{mode === 'create' ? t('prm_new') : t('prm_edit')}</h3>

        {noCreatable ? (
          <p className="fs-12 t-mute">{t('prm_no_creatable')}</p>
        ) : draft ? (
          <div className="form-grid" style={{ gap: 12, gridTemplateColumns: '1fr 1fr' }}>
            {mode === 'create' ? (
              <Field label={t('prm_col_key')} style={{ gridColumn: '1 / -1' }}>
                <select
                  className="select fs-12 mono"
                  value={draft.parameterKey}
                  onChange={(e) => onKeyChange(e.target.value)}
                >
                  {creatable.map((entry) => (
                    <option key={entry.parameterKey} value={entry.parameterKey}>
                      {entry.parameterKey}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <Field label={t('prm_col_key')} style={{ gridColumn: '1 / -1' }}>
                <input className="input fs-12 mono" readOnly value={draft.parameterKey} />
              </Field>
            )}

            <Field label={t('fcd_agent_group')}>
              <input
                className="input fs-12"
                readOnly
                value={t(`prm_group_${draft.groupName}`, draft.groupName)}
              />
            </Field>
            <Field label={t('prm_col_value_type')}>
              <input className="input fs-12 mono" readOnly value={draft.valueType} />
            </Field>

            <Field label={t('rpt_col_desc')} style={{ gridColumn: '1 / -1' }}>
              <input
                className="input fs-12"
                readOnly
                value={t(draft.description, draft.description)}
              />
            </Field>

            <Field label={t('rm_hist_col_value')}>
              <ParameterValueCell
                valueType={draft.valueType}
                value={draft.value}
                onChange={(value) => setDraft((d) => (d ? { ...d, value } : d))}
              />
            </Field>
            <Field label={t('rpt_col_status')}>
              <select
                className="select fs-12"
                value={draft.status}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, status: e.target.value as ParameterStatus } : d))
                }
              >
                <option value="Active">{t('ib_status_Active')}</option>
                <option value="Passive">{t('rs_status_passive')}</option>
              </select>
            </Field>
          </div>
        ) : null}

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <Button variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button variant="primary" onClick={save} disabled={!draft || noCreatable}>
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
