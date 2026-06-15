import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Field } from '@epay/ui';
import type { RiskScoreScope } from '../../shared/rule-dsl/variables';
import type { RiskScoreRule, RiskScoreRuleInput } from '../domain/types';
import { DslEditor } from './dsl-editor';
import type { DslValidationResult } from '../../shared/rule-dsl/parser';

type Props = {
  open: boolean;
  mode: 'create' | 'edit';
  scope: RiskScoreScope;
  rule: RiskScoreRule | null;
  onClose: () => void;
  onValidate: (dsl: string) => DslValidationResult;
  onSaveCreate: (input: RiskScoreRuleInput) => void;
  onSaveUpdate: (id: string, input: RiskScoreRuleInput) => void;
};

const EMPTY: RiskScoreRuleInput = {
  title: '',
  conditionDsl: '',
  scoreContribution: 0,
  description: null,
  validatedAt: null,
};

export function AddScoreItemModal({
  open,
  mode,
  scope,
  rule,
  onClose,
  onValidate,
  onSaveCreate,
  onSaveUpdate,
}: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<RiskScoreRuleInput>(EMPTY);
  const readOnly = mode === 'edit' && rule?.status === 'Passive';

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && rule) {
      setDraft({
        title: rule.title,
        conditionDsl: rule.conditionDsl,
        scoreContribution: rule.scoreContribution,
        description: rule.description,
        validatedAt: rule.validatedAt,
      });
    } else {
      setDraft({ ...EMPTY });
    }
  }, [open, mode, rule]);

  if (!open) return null;

  const submit = () => {
    if (!draft.validatedAt) return;
    if (mode === 'edit' && rule) onSaveUpdate(rule.id, draft);
    else onSaveCreate(draft);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{mode === 'edit' ? t('rs_edit_item') : t('rs_add_item')}</h3>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label={t('rs_col_title')} required>
            <input
              className="input"
              value={draft.title}
              disabled={readOnly}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            />
          </Field>
          <Field label={t('rs_col_condition')} required>
            <DslEditor
              value={draft.conditionDsl}
              onChange={(conditionDsl) => setDraft((d) => ({ ...d, conditionDsl }))}
              scope={scope}
              onValidate={onValidate}
              validatedAt={draft.validatedAt ?? null}
              onValidated={(validatedAt) => setDraft((d) => ({ ...d, validatedAt }))}
              readOnly={readOnly}
            />
          </Field>
          <Field label={t('rs_col_score')} required>
            <input
              className="input mono"
              type="number"
              disabled={readOnly}
              value={draft.scoreContribution}
              onChange={(e) =>
                setDraft((d) => ({ ...d, scoreContribution: Number(e.target.value) }))
              }
            />
          </Field>
          <Field label={t('rpt_col_desc')}>
            <input
              className="input"
              value={draft.description ?? ''}
              disabled={readOnly}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value || null }))}
            />
          </Field>
        </div>
        <div className="modal-foot">
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('ib_cancel')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={submit}
            disabled={readOnly || !draft.validatedAt || !draft.title.trim()}
          >
            {t('ib_save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
