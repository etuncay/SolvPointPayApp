import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { SenderLookupResult } from '@/features/agent-transactions/domain/customer-lookup';
import { canInitiateTopUp } from '@/features/agent-transactions/domain/customer-lookup';
import { runIdentityOcrCompare } from '@/features/agent-transactions/domain/identity-rules';
import { AGENT_PATHS } from '@/config/agent-nav-paths';
import { transferService } from '../api';
import { isQuoteExpired } from '../domain/fx-quote';
import { shouldRedirectToAbroad } from '../domain/iban';
import { lookupRecipientMasked } from '../domain/mask-recipient';
import { resolveTopUpWallet, currencyOptions as walletCurrencies } from '../domain/wallet-resolve';
import { validateVariantForm } from '../domain/validation';
import type { TransferSubmitPayload, TransferVariant } from '../domain/types';
import type { IdentityScanState } from '@/features/withdrawal/domain/types';
import type { AdditionalInfoPayload } from '../components/additional-info-modal';

const EMPTY_IDENTITY: IdentityScanState = {
  country: 'TUR',
  idType: 'IdentityCard',
  birthDate: '',
  frontFile: '',
  backFile: '',
};

export function useTransferFlow(variant: TransferVariant) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const returnPath = location.pathname;

  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [notFoundIdNo, setNotFoundIdNo] = useState('');
  const [sender, setSender] = useState<SenderLookupResult | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const [identity, setIdentity] = useState<IdentityScanState>(EMPTY_IDENTITY);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'ok' | 'mismatch'>('idle');
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<TransferSubmitPayload | null>(null);
  const [fxExpiresAt, setFxExpiresAt] = useState<string | null>(null);
  const [kycBanner, setKycBanner] = useState(false);

  const initialQuery = useMemo(
    () => ({
      customerNo: searchParams.get('customerNo') ?? '',
      idNo: searchParams.get('idNo') ?? '',
    }),
    [searchParams],
  );

  const currencies = useMemo(() => (sender ? walletCurrencies(sender.wallets) : ['TRY']), [sender]);

  const applyWalletFields = useCallback(
    (s: SenderLookupResult, currency: string) => {
      const wallet = variant === 'ownWallet' ? resolveTopUpWallet(s.wallets, currency) : null;
      setDraft((prev) => ({
        ...prev,
        currency,
        walletNo: wallet?.walletNo ?? '',
        walletId: wallet?.walletId,
      }));
      setKycBanner(variant === 'ownWallet' && !canInitiateTopUp(s));
      setFormKey((k) => k + 1);
    },
    [variant],
  );

  const runSearch = useCallback(
    (query: { customerNo: string; idNo: string }) => {
      const customerNo = query.customerNo.trim();
      const idNo = query.idNo.trim();
      if (!customerNo && !idNo) {
        toast.error(t('ag_tr_err_search_required'));
        return;
      }
      setLoading(true);
      setSender(null);
      setIdentity(EMPTY_IDENTITY);
      setOcrStatus('idle');
      setFxExpiresAt(null);
      try {
        const found = transferService.lookupSender({ customerNo, idNo });
        if (!found) {
          setNotFound(true);
          setNotFoundIdNo(idNo || customerNo);
          return;
        }
        setNotFound(false);
        setSender(found);
        const ccy = found.wallets[0]?.currency ?? 'TRY';
        applyWalletFields(found, ccy);
        setDraft({
          fullName: found.fullName,
          currency: ccy,
          amount: 0,
          clientReference: '',
          isSuspicious: false,
          authorizedPersonIdNo: '',
          ...(variant === 'abroad'
            ? { targetCurrency: 'EUR', fxRate: '', targetAmount: '' }
            : {}),
        });
      } finally {
        setLoading(false);
      }
    },
    [applyWalletFields, t, variant],
  );

  useEffect(() => {
    const state = location.state as { prefill?: Record<string, unknown> } | null;
    if (state?.prefill && variant === 'abroad') {
      setDraft((prev) => ({ ...prev, ...state.prefill }));
      setFormKey((k) => k + 1);
    }
    if (initialQuery.customerNo || initialQuery.idNo) {
      runSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshFx = useCallback(
    (amount: number, sourceCcy: string, targetCcy: string) => {
      if (variant !== 'abroad' || amount <= 0) return;
      const q = transferService.getFxQuote(sourceCcy, targetCcy, amount);
      setFxExpiresAt(q.expiresAt);
      setDraft((prev) => ({
        ...prev,
        fxRate: String(q.rate),
        targetAmount: String(q.targetAmount),
      }));
      setFormKey((k) => k + 1);
    },
    [variant],
  );

  const handleFieldChange = useCallback(
    (name: string, value: unknown, allValues: Record<string, unknown>) => {
      setDraft((prev) => ({ ...prev, ...allValues }));

      if (name === 'currency' && sender && variant === 'ownWallet') {
        applyWalletFields(sender, String(value));
      }

      if (variant === 'abroad' && (name === 'amount' || name === 'targetCurrency' || name === 'currency')) {
        const amt = Number(allValues.amount ?? 0);
        const src = String(allValues.currency ?? 'TRY');
        const tgt = String(allValues.targetCurrency ?? 'EUR');
        if (amt > 0) refreshFx(amt, src, tgt);
      }

      if (variant === 'person' && name === 'receiverIdNo') {
        const masked = lookupRecipientMasked(String(value));
        if (masked) {
          setDraft((prev) => ({
            ...prev,
            receiverName: masked.isRegistered ? masked.name : prev.receiverName,
            receiverPhone: masked.phone,
            receiverEmail: masked.email,
            _maskedRecipient: true,
          }));
          setFormKey((k) => k + 1);
        }
      }

      if (variant === 'bankAccount' && name === 'iban') {
        const iban = String(value);
        if (iban.length > 10 && shouldRedirectToAbroad(iban)) {
          if (window.confirm(t('ag_tr_iban_redirect_confirm'))) {
            navigate(AGENT_PATHS.transfers.abroad, {
              state: { prefill: { iban, receiverName: allValues.receiverName } },
            });
          }
        }
      }
    },
    [applyWalletFields, navigate, refreshFx, sender, t, variant],
  );

  const handleIdentityDocs = useCallback(() => {
    if (!sender) return;
    const ocr = runIdentityOcrCompare(sender.idNo);
    setOcrStatus(ocr.ok ? 'ok' : 'mismatch');
    if (ocr.ok) toast.success(t('ag_tr_ocr_ok'));
    else toast.error(t('ag_tr_err_ocr_mismatch'));
  }, [sender, t]);

  const buildPayload = useCallback(
    (values: Record<string, unknown>): TransferSubmitPayload | null => {
      if (!sender) return null;
      const isCorporate = sender.customerType === 'corporate';
      const merged: Record<string, unknown> = { ...draft, ...values, isCorporate };
      const errors = validateVariantForm(variant, merged);
      if (errors.length) {
        toast.error(t(errors[0]!.message));
        return null;
      }

      if (variant === 'ownWallet' && !canInitiateTopUp(sender)) {
        toast.error(t('ag_tr_err_kyc_l2'));
        return null;
      }

      if (sender.requiresIdentityScan && ocrStatus === 'mismatch') {
        toast.error(t('ag_tr_err_ocr_mismatch'));
        return null;
      }

      let screenIdNo = sender.idNo;
      let screenName = sender.fullName;
      if (isCorporate) {
        const authId = String(merged.authorizedPersonIdNo ?? '').trim();
        const person = sender.authorizedPersons.find((p) => p.idNo === authId);
        if (!person) {
          toast.error(t('ag_tr_err_authorized_invalid'));
          return null;
        }
        screenIdNo = person.idNo;
        screenName = person.name;
      }

      const base = {
        senderCustomerId: sender.customerId,
        currency: String(merged.currency),
        amount: Number(merged.amount),
        clientReference: String(merged.clientReference),
        isSuspicious: Boolean(merged.isSuspicious),
        authorizedPersonIdNo: isCorporate ? String(merged.authorizedPersonIdNo) : undefined,
        screenIdNo,
        screenName,
        paymentPurpose: merged.paymentPurpose ? String(merged.paymentPurpose) : undefined,
        description: merged.description ? String(merged.description) : undefined,
      };

      if (variant === 'ownWallet') {
        return {
          ...base,
          variant: 'ownWallet',
          walletId: Number(merged.walletId ?? resolveTopUpWallet(sender.wallets, String(merged.currency))?.walletId),
        };
      }
      if (variant === 'bankAccount') {
        return {
          ...base,
          variant: 'bankAccount',
          receiverName: String(merged.receiverName),
          receiverPhone: String(merged.receiverPhone ?? ''),
          receiverEmail: String(merged.receiverEmail ?? ''),
          iban: String(merged.iban),
        };
      }
      if (variant === 'person') {
        const rid = String(merged.receiverIdNo ?? '').trim();
        if (rid && !lookupRecipientMasked(rid)) {
          transferService.createReceiverInfo({
            idNo: rid,
            name: String(merged.receiverName),
            phone: String(merged.receiverPhone ?? ''),
            email: String(merged.receiverEmail ?? ''),
          });
        }
        const masked = rid ? lookupRecipientMasked(rid) : null;
        return {
          ...base,
          variant: 'person',
          receiverName: String(merged.receiverName),
          receiverIdNo: rid || undefined,
          receiverPhone: String(merged.receiverPhone ?? ''),
          receiverEmail: String(merged.receiverEmail ?? ''),
          receiverCustomerId: masked?.customerId,
        };
      }
      return {
        ...base,
        variant: 'abroad',
        receiverName: String(merged.receiverName),
        country: String(merged.country),
        receiverPhone: String(merged.receiverPhone ?? ''),
        receiverEmail: String(merged.receiverEmail ?? ''),
        targetCurrency: String(merged.targetCurrency),
        fxRate: Number(merged.fxRate),
        targetAmount: Number(merged.targetAmount),
      };
    },
    [draft, ocrStatus, sender, t, variant],
  );

  const finishSubmit = useCallback(
    (payload: TransferSubmitPayload, receiverScreenName?: string, skipReceiverSanction = false) => {
      const res = transferService.initiateTransfer(payload, { receiverScreenName, skipReceiverSanction });
      if (!res.ok) {
        toast.error(t(res.message));
        return;
      }
      if (res.receiverSanctionHit) {
        setPendingPayload(payload);
        setAdditionalOpen(true);
        return;
      }
      if (res.sanctionHit) toast.warning(t('ag_tr_sanction_hit'));
      else toast.success(t('ag_tr_submit_ok'));
      navigate(`/transactions/${res.transactionId}?mode=confirm&from=transfer&variant=${variant}`);
    },
    [navigate, t, variant],
  );

  const submit = useCallback(
    (values: Record<string, unknown>) => {
      if (variant === 'abroad' && fxExpiresAt && isQuoteExpired(fxExpiresAt)) {
        toast.warning(t('ag_tr_fx_expired'));
        const amt = Number(values.amount ?? 0);
        refreshFx(amt, String(values.currency ?? 'TRY'), String(values.targetCurrency ?? 'EUR'));
        return;
      }
      const payload = buildPayload(values);
      if (!payload) return;
      const recvName =
        payload.variant === 'bankAccount' || payload.variant === 'person' || payload.variant === 'abroad'
          ? payload.receiverName
          : undefined;
      finishSubmit(payload, recvName);
    },
    [buildPayload, finishSubmit, fxExpiresAt, refreshFx, t, variant],
  );

  const handleAdditionalInfo = useCallback(
    (_info: AdditionalInfoPayload) => {
      if (!pendingPayload) return;
      const recvName =
        pendingPayload.variant !== 'ownWallet' ? pendingPayload.receiverName : undefined;
      const stillHit = recvName ? transferService.rescreenReceiver(recvName) : false;
      if (stillHit) {
        toast.warning(t('ag_tr_sanction_review'));
        setAdditionalOpen(false);
        return;
      }
      finishSubmit(pendingPayload, recvName, true);
      setAdditionalOpen(false);
      setPendingPayload(null);
    },
    [finishSubmit, pendingPayload, t],
  );

  const goToRegistration = useCallback(() => {
    const params = new URLSearchParams({ returnTo: returnPath, context: 'transfer' });
    if (notFoundIdNo) params.set('idNo', notFoundIdNo);
    navigate(`/customers/new?${params.toString()}`);
  }, [navigate, notFoundIdNo, returnPath]);

  const cancel = useCallback(() => navigate('/'), [navigate]);

  const reset = useCallback(() => {
    setSender(null);
    setNotFound(false);
    setNotFoundIdNo('');
    setDraft({});
    setIdentity(EMPTY_IDENTITY);
    setOcrStatus('idle');
    setFxExpiresAt(null);
    setKycBanner(false);
    setAdditionalOpen(false);
    setPendingPayload(null);
    setFormKey((k) => k + 1);
  }, []);

  return {
    variant,
    loading,
    notFound,
    sender,
    draft,
    formKey,
    currencies,
    identity,
    ocrStatus,
    docModalOpen,
    additionalOpen,
    kycBanner,
    fxExpiresAt,
    initialQuery,
    setIdentity,
    setDocModalOpen,
    setAdditionalOpen,
    runSearch,
    handleFieldChange,
    handleIdentityDocs,
    handleAdditionalInfo,
    goToRegistration,
    submit,
    cancel,
    reset,
  };
}
