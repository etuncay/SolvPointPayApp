import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { withdrawalService } from '../api';
import { currencyOptions, isTransactional, resolveWithdrawalWallet } from '../domain/wallet-selection';
import { validateWithdrawalForm } from '../domain/validation';
import { runIdentityOcrCompare } from '../domain/identity-ocr';
import type { IdentityScanState, RecipientLookupResult, RecipientWallet } from '../domain/types';
import type { IdentityDocPayload } from '../components/identity-doc-upload-modal';

const EMPTY_IDENTITY_SCAN: IdentityScanState = {
  country: 'TUR',
  idType: 'IdentityCard',
  birthDate: '',
  frontFile: '',
  backFile: '',
};

interface FormDraft {
  currency: string;
  amount: number;
  transactionReferenceNo: string;
  foreignReferenceNo: string;
  isSuspicious: boolean;
  authorizedPersonIdNo: string;
}

const EMPTY_DRAFT: FormDraft = {
  currency: '',
  amount: 0,
  transactionReferenceNo: '',
  foreignReferenceNo: '',
  isSuspicious: false,
  authorizedPersonIdNo: '',
};

function draftForWallet(result: RecipientLookupResult, wallet: RecipientWallet | null): FormDraft {
  // §8: Transactional → tüm bakiye kilitli; Persistent → bakiye varsayılan gelir, değiştirilebilir
  return {
    ...EMPTY_DRAFT,
    currency: wallet?.currency ?? '',
    amount: wallet?.available ?? 0,
  };
}

export function useWithdrawal() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [notFoundIdNo, setNotFoundIdNo] = useState('');
  const [result, setResult] = useState<RecipientLookupResult | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<RecipientWallet | null>(null);
  const [draft, setDraft] = useState<FormDraft>(EMPTY_DRAFT);
  const [formKey, setFormKey] = useState(0);

  const [identity, setIdentity] = useState<IdentityScanState>(EMPTY_IDENTITY_SCAN);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'ok' | 'mismatch'>('idle');
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const initialQuery = useMemo(
    () => ({
      customerNo: searchParams.get('customerNo') ?? '',
      idNo: searchParams.get('idNo') ?? '',
    }),
    [searchParams],
  );

  const currencies = useMemo(() => (result ? currencyOptions(result.wallets) : []), [result]);

  const runSearch = useCallback(
    (query: { customerNo: string; idNo: string }) => {
      const customerNo = query.customerNo.trim();
      const idNo = query.idNo.trim();
      if (!customerNo && !idNo) {
        toast.error(t('ag_wd_err_search_required'));
        return;
      }

      setLoading(true);
      setNotFound(false);
      setResult(null);
      setSelectedWallet(null);
      setIdentity(EMPTY_IDENTITY_SCAN);
      setOcrStatus('idle');

      try {
        const found = withdrawalService.lookupRecipient({ customerNo, idNo });
        if (!found) {
          setNotFound(true);
          setNotFoundIdNo(idNo || customerNo);
          return;
        }
        const wallet = resolveWithdrawalWallet(found.wallets);
        setResult(found);
        setSelectedWallet(wallet);
        setDraft(draftForWallet(found, wallet));
        setFormKey((k) => k + 1);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (initialQuery.customerNo || initialQuery.idNo) {
      runSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** DynamicForm alan değişimi — para birimi değişince cüzdan ve tutar kilidi yeniden hesaplanır. */
  const handleFieldChange = useCallback(
    (name: string, value: unknown, allValues: Record<string, unknown>) => {
      setDraft((prev) => ({
        ...prev,
        currency: String(allValues.currency ?? prev.currency),
        amount: Number(allValues.amount ?? prev.amount) || 0,
        transactionReferenceNo: String(allValues.transactionReferenceNo ?? prev.transactionReferenceNo),
        foreignReferenceNo: String(allValues.foreignReferenceNo ?? prev.foreignReferenceNo),
        isSuspicious: Boolean(allValues.isSuspicious ?? prev.isSuspicious),
        authorizedPersonIdNo: String(allValues.authorizedPersonIdNo ?? prev.authorizedPersonIdNo),
      }));

      if (name === 'currency' && result) {
        const wallet = resolveWithdrawalWallet(result.wallets, String(value));
        setSelectedWallet(wallet);
        // §8: Cüzdan değişince yeni cüzdanın mevcut bakiyesi varsayılan olarak gelir
        setDraft((prev) => ({
          ...prev,
          currency: String(value),
          amount: wallet?.available ?? prev.amount,
        }));
        setFormKey((k) => k + 1);
      }
    },
    [result],
  );

  const handleIdentityDocs = useCallback(
    (payload: IdentityDocPayload) => {
      if (!result) return;
      const ocr = runIdentityOcrCompare(result.idNo);
      setOcrStatus(ocr.ok ? 'ok' : 'mismatch');
      if (ocr.ok) toast.success(t('ag_wd_ocr_ok'));
      else toast.error(t('ag_wd_err_ocr_mismatch'));
      void payload;
    },
    [result, t],
  );

  const goToRegistration = useCallback(() => {
    const params = new URLSearchParams({ returnTo: '/withdrawal', context: 'withdraw' });
    if (notFoundIdNo) params.set('idNo', notFoundIdNo);
    navigate(`/customers/new?${params.toString()}`);
  }, [navigate, notFoundIdNo]);

  const submit = useCallback(
    async (formValues: Record<string, unknown>) => {
      if (!result || !selectedWallet || submitting) return;
      const isCorporate = result.customerType === 'corporate';
      const merged = { ...draft, ...formValues, isCorporate };

      const errors = validateWithdrawalForm(merged);
      if (errors.length > 0) {
        toast.error(t(errors[0]!.message));
        return;
      }

      // Kimlik tarama zorunluysa ve eşleşme yoksa engelle
      if (result.requiresIdentityScan && ocrStatus === 'mismatch') {
        toast.error(t('ag_wd_err_ocr_mismatch'));
        return;
      }

      // Sanction taranacak gerçek kişi
      let screenIdNo = result.idNo;
      let screenName = result.fullName;
      if (isCorporate) {
        const authIdNo = String(merged.authorizedPersonIdNo ?? '').trim();
        const person = result.authorizedPersons.find((p) => p.idNo === authIdNo);
        if (!person) {
          toast.error(t('ag_wd_err_authorized_invalid'));
          return;
        }
        screenIdNo = person.idNo;
        screenName = person.name;
      }

      setSubmitting(true);
      try {
        const res = await withdrawalService.initiateWithdrawal({
          customerId: result.customerId,
          walletId: selectedWallet.walletId,
          currency: String(merged.currency),
          amount: Number(merged.amount),
          transactionReferenceNo: String(merged.transactionReferenceNo ?? ''),
          foreignReferenceNo: String(merged.foreignReferenceNo ?? ''),
          isSuspicious: Boolean(merged.isSuspicious),
          authorizedPersonIdNo: isCorporate ? String(merged.authorizedPersonIdNo) : undefined,
          screenIdNo,
          screenName,
        });

        if (!res.ok) {
          toast.error(t(res.message));
          return;
        }

        if (res.sanctionHit) {
          toast.warning(t('ag_wd_sanction_hit'));
        } else {
          toast.success(t('ag_wd_submit_ok'));
        }
        navigate(`/transactions/${res.transactionId}?mode=confirm&from=withdrawal`);
      } finally {
        setSubmitting(false);
      }
    },
    [draft, navigate, ocrStatus, result, selectedWallet, submitting, t],
  );

  const cancel = useCallback(() => {
    navigate(returnTo ?? '/');
  }, [navigate, returnTo]);

  return {
    loading,
    submitting,
    notFound,
    result,
    selectedWallet,
    draft,
    formKey,
    currencies,
    identity,
    ocrStatus,
    docModalOpen,
    initialQuery,
    setIdentity,
    setDocModalOpen,
    runSearch,
    handleFieldChange,
    handleIdentityDocs,
    goToRegistration,
    submit,
    cancel,
  };
}
