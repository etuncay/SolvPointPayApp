import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CUSTOMERS } from '@/mocks/data';
import { getWallets } from '@/lib/wallets-store';
import { useRole } from '@/domain/role-context';
import { correctionsService } from '../api';
import { getCorrectionPermissions } from '../domain/correction-permissions';
import { correctionFormSchema, type CorrectionFormSchema } from '../domain/correction-validation';
import { computeCorrectionFx } from '../domain/fx-convert';
import type { CorrectionCurrency, CorrectionFxPreview } from '../domain/correction-types';
import { validateReserveMax } from '../domain/reserve-guard';
import { CORRECTION_REASONS, EMPTY_CORRECTION_FORM } from '../domain/correction-types';

function walletCurrency(ccy: string): CorrectionCurrency {
  if (ccy === 'USD' || ccy === 'EUR' || ccy === 'GBP') return ccy;
  return 'TRY';
}

export function useManualCorrection() {
  const { role } = useRole();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const correctionIdParam = searchParams.get('correctionId');
  const editingId = correctionIdParam ? Number(correctionIdParam) : null;

  const permissions = useMemo(() => getCorrectionPermissions(role), [role]);

  const form = useForm<CorrectionFormSchema>({
    resolver: zodResolver(correctionFormSchema) as Resolver<CorrectionFormSchema>,
    defaultValues: EMPTY_CORRECTION_FORM as CorrectionFormSchema,
    mode: 'onChange',
  });

  const { watch, setValue, reset, formState } = form;
  const values = watch();

  const [attachedFile, setAttachedFile] = useState<string | null>(null);
  const [reserveError, setReserveError] = useState<string | null>(null);

  const customerOptions = useMemo(
    () => CUSTOMERS.filter((c) => c.status === 'active'),
    [],
  );

  const walletOptions = useMemo(() => getWallets().filter((w) => w.recordStatus === 1), []);

  const walletsForCustomer = useCallback(
    (customerId: number | null) => {
      if (customerId == null) return walletOptions;
      return walletOptions.filter((w) => w.customerId === customerId || w.cat === 'system');
    },
    [walletOptions],
  );

  const sourceWallet = walletOptions.find((w) => w.id === values.sourceWalletId) ?? null;
  const targetWallet = walletOptions.find((w) => w.id === values.targetWalletId) ?? null;

  const fxPreview: CorrectionFxPreview | null = useMemo(() => {
    if (
      !sourceWallet ||
      !targetWallet ||
      !values.requestedAmount ||
      values.requestedAmount <= 0
    ) {
      return null;
    }
    return computeCorrectionFx(
      values.requestedAmount,
      values.requestedCurrency,
      walletCurrency(sourceWallet.ccy),
      walletCurrency(targetWallet.ccy),
    );
  }, [sourceWallet, targetWallet, values.requestedAmount, values.requestedCurrency]);

  useEffect(() => {
    if (!sourceWallet) {
      setReserveError(null);
      return;
    }
    setReserveError(
      validateReserveMax(
        sourceWallet.type,
        sourceWallet.cat,
        values.requestedAmount || 0,
        values.requestedCurrency,
      ),
    );
  }, [sourceWallet, values.requestedAmount, values.requestedCurrency]);

  useEffect(() => {
    if (!Number.isFinite(editingId ?? NaN) || !permissions.view) return;
    const draft = correctionsService.getDraft(editingId!, role);
    if (!draft) return;
    reset({
      complaintId: draft.complaintId,
      sourceTransactionNo: draft.sourceTransactionNo,
      sourceCustomerId: draft.sourceCustomerId,
      sourceWalletId: draft.sourceWalletId,
      targetCustomerId: draft.targetCustomerId,
      targetWalletId: draft.targetWalletId,
      requestedAmount: draft.requestedAmount,
      requestedCurrency: draft.requestedCurrency,
      transactionDescription: draft.transactionDescription,
      correctionReason: draft.correctionReason,
      manualDescription: draft.manualDescription,
    } as CorrectionFormSchema);
    setAttachedFile(draft.documentFileName);
  }, [editingId, permissions.view, reset, role]);

  const lookupTransaction = () => {
    const tx = correctionsService.lookupTransaction(values.sourceTransactionNo, role);
    if (!tx) return;
    setValue('sourceCustomerId', tx.senderCustomerId);
    setValue('sourceWalletId', tx.senderWalletId);
    setValue('targetCustomerId', tx.receiverCustomerId);
    setValue('targetWalletId', tx.receiverWalletId);
  };

  const attachFile = (fileName: string) => {
    if (attachedFile) return;
    setAttachedFile(fileName);
    if (editingId) {
      correctionsService.attachDocument(editingId, fileName, role);
    }
  };

  const submitToReview = () => {
    const payload = form.getValues();
    const run =
      editingId != null
        ? correctionsService.updateDraft(editingId, payload, role)
        : correctionsService.createDraft(payload, role);

    if (!run.ok) return run;

    if (!editingId && run.correctionId && attachedFile) {
      correctionsService.attachDocument(run.correctionId, attachedFile, role);
    }

    navigate(
      `/transfers/${run.transactionId}?from=manual&correctionId=${run.correctionId}`,
    );
    return run;
  };

  const cancelForm = () => {
    if (window.confirm('Formdan çıkılsın mı?')) navigate('/transfers');
  };

  const canSubmit =
    formState.isValid &&
    !reserveError &&
    values.sourceWalletId != null &&
    values.targetWalletId != null;

  return {
    form,
    permissions,
    customerOptions,
    walletOptions,
    walletsForCustomer,
    fxPreview,
    reserveError,
    attachedFile,
    attachFile,
    lookupTransaction,
    submitToReview,
    cancelForm,
    canSubmit,
    correctionReasons: CORRECTION_REASONS,
  };
}
