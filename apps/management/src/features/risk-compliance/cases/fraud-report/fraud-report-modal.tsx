import { useTranslation } from 'react-i18next';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
} from '@epay/ui';
import { useFraudReport } from './hooks/use-fraud-report';
import type { FraudVerdict } from './domain/types';

export function FraudReportModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { t } = useTranslation();
  const {
    form,
    lookupLoading,
    linkedCaseId,
    amountsDisabled,
    typeRequired,
    submitting,
    lookupTransaction,
    handleSave,
    handleSaveWithCase,
    verdictOptions,
    typeOptions,
    sourceOptions,
  } = useFraudReport({ open, onClose, onSaved });

  const { register, setValue } = form;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="frp-modal" style={{ maxWidth: 520 }}>
        <DialogHeader>
          <DialogTitle>{t('fc_fraud_report_btn')}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {linkedCaseId ? (
            <div className="info-banner" style={{ marginBottom: 12 }}>
              <AlertCircle size={16} />
              <span>{t('frp_linked_case_banner', { caseId: linkedCaseId })}</span>
            </div>
          ) : null}

          <div className="form-grid" style={{ gap: 12 }}>
            <Field label={t('fc_fraud_report_tx')}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input mono"
                  {...register('transactionNo')}
                  onBlur={() => void lookupTransaction()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void lookupTransaction();
                    }
                  }}
                />
                {lookupLoading ? <Loader2 size={18} className="spin" /> : null}
              </div>
            </Field>

            <Field label={t('frp_verdict')}>
              <select
                className="input"
                {...register('verdict')}
                onChange={(e) => setValue('verdict', e.target.value as FraudVerdict)}
              >
                {verdictOptions.map((v) => (
                  <option key={v} value={v}>
                    {t(`frp_verdict_${v}`, v)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t('frp_type')} hint={typeRequired ? t('frp_required') : undefined}>
              <select className="input" {...register('fraudType')}>
                <option value="">{t('frp_type_none')}</option>
                {typeOptions.map((ft) => (
                  <option key={ft} value={ft}>
                    {t(`frp_type_${ft}`, ft)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t('frp_source')}>
              <select className="input" {...register('detectionSource')}>
                {sourceOptions.map((s) => (
                  <option key={s} value={s}>
                    {t(`frp_source_${s}`, s)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t('frp_discovery_at')}>
              <input className="input" type="datetime-local" {...register('discoveryAt')} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={t('frp_loss')}>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={amountsDisabled}
                  {...register('lossAmount', { valueAsNumber: true })}
                />
              </Field>
              <Field label={t('frp_recovered')}>
                <input
                  className="input"
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={amountsDisabled}
                  {...register('recoveredAmount', { valueAsNumber: true })}
                />
              </Field>
            </div>

            <Field label={t('scf_notes')}>
              <textarea className="input" rows={3} {...register('notes')} />
            </Field>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            {t('ib_cancel')}
          </Button>
          <Button type="button" variant="default" onClick={() => void handleSave()} disabled={submitting}>
            {t('ib_save')}
          </Button>
          <Button type="button" variant="primary" onClick={() => void handleSaveWithCase()} disabled={submitting}>
            {t('frp_save_with_case')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
