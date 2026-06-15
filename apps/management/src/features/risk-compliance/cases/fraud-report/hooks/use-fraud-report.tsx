import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { fraudRecordsService } from '../api';
import {
  EMPTY_FRAUD_RECORD_INPUT,
  FRAUD_DETECTION_SOURCES,
  FRAUD_TYPES,
  FRAUD_VERDICTS,
  type FraudRecordInput,
  type FraudVerdict,
} from '../domain/types';
import { toDatetimeLocalValue, validateFraudRecordInput } from '../domain/validation';

export function useFraudReport({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const { t } = useTranslation();
  const form = useForm<FraudRecordInput>({ defaultValues: EMPTY_FRAUD_RECORD_INPUT });
  const [lookupLoading, setLookupLoading] = useState(false);
  const [transactionDate, setTransactionDate] = useState<string | null>(null);
  const [linkedCaseId, setLinkedCaseId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const verdict = form.watch('verdict');
  const amountsDisabled = verdict === 'NotFraud';
  const typeRequired = verdict === 'ConfirmedFraud';

  const resetModal = useCallback(() => {
    form.reset(EMPTY_FRAUD_RECORD_INPUT);
    setTransactionDate(null);
    setLinkedCaseId(null);
  }, [form]);

  useEffect(() => {
    if (!open) resetModal();
  }, [open, resetModal]);

  useEffect(() => {
    if (verdict === 'NotFraud') {
      form.setValue('lossAmount', 0);
      form.setValue('recoveredAmount', 0);
      form.setValue('fraudType', '');
    }
  }, [verdict, form]);

  const lookupTransaction = useCallback(async () => {
    const txNo = form.getValues('transactionNo').trim();
    if (!txNo) return;
    setLookupLoading(true);
    try {
      const lookup = fraudRecordsService.getByTransactionNo(txNo);
      if (!lookup) {
        toast.error(t('frp_tx_not_found'));
        setTransactionDate(null);
        setLinkedCaseId(null);
        return;
      }
      setTransactionDate(lookup.transactionDate);
      setLinkedCaseId(lookup.linkedCaseId);
      if (lookup.record) {
        form.reset({
          transactionNo: lookup.transactionNo,
          fraudType: lookup.record.fraudType ?? '',
          detectionSource: lookup.record.detectionSource,
          verdict: lookup.record.verdict,
          discoveryAt: toDatetimeLocalValue(lookup.record.discoveryAt),
          lossAmount: lookup.record.lossAmount,
          recoveredAmount: lookup.record.recoveredAmount,
          notes: lookup.record.notes,
        });
      } else {
        form.reset({
          ...EMPTY_FRAUD_RECORD_INPUT,
          transactionNo: lookup.transactionNo,
          discoveryAt: toDatetimeLocalValue(new Date().toISOString()),
        });
      }
    } finally {
      setLookupLoading(false);
    }
  }, [form, t]);

  const validateClient = useCallback(
    (input: FraudRecordInput) => {
      const v = validateFraudRecordInput(input, { transactionDate });
      if (!v.ok) {
        toast.error(t(v.error, v.error));
        return false;
      }
      return true;
    },
    [transactionDate, t],
  );

  const handleSave = useCallback(async () => {
    const input = form.getValues();
    if (!validateClient(input)) return;
    setSubmitting(true);
    try {
      const r = fraudRecordsService.save(input);
      if (!r.ok) {
        toast.error(t(r.error ?? 'frd_save_failed', r.error ?? ''));
        return;
      }
      toast.success(t('frp_save_ok'));
      onSaved?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [form, validateClient, t, onSaved, onClose]);

  const handleSaveWithCase = useCallback(async () => {
    const input = form.getValues();
    if (!validateClient(input)) return;

    if (linkedCaseId) {
      const ok = window.confirm(t('frp_linked_case_confirm'));
      if (!ok) return;
      void handleSave();
      return;
    }

    setSubmitting(true);
    try {
      const r = fraudRecordsService.saveWithCase(input);
      if (!r.ok) {
        if (r.error === 'frp_linked_case_warn') {
          const ok = window.confirm(t('frp_linked_case_confirm'));
          if (!ok) return;
          const retry = fraudRecordsService.saveWithCase(input, true);
          if (!retry.ok) {
            toast.error(t(retry.error ?? 'frd_save_failed', retry.error ?? ''));
            return;
          }
          toast.success(t('frp_save_ok'));
          onSaved?.();
          onClose();
          return;
        }
        toast.error(t(r.error ?? 'frd_save_failed', r.error ?? ''));
        return;
      }
      toast.success(r.caseId ? t('frp_save_case_ok') : t('frp_save_ok'));
      onSaved?.();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [form, validateClient, linkedCaseId, t, onSaved, onClose, handleSave]);

  return {
    form,
    lookupLoading,
    linkedCaseId,
    amountsDisabled,
    typeRequired,
    submitting,
    lookupTransaction,
    handleSave,
    handleSaveWithCase,
    verdictOptions: FRAUD_VERDICTS,
    typeOptions: FRAUD_TYPES,
    sourceOptions: FRAUD_DETECTION_SOURCES,
    setVerdict: (v: FraudVerdict) => form.setValue('verdict', v),
  };
}
