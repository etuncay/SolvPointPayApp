import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button, DynamicForm, FormMode, PageHead, type CustomFunctions, type SelectOption } from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import { MAX_RESERVE_CORRECTION_TRY, validateReserveMax } from './domain/reserve-guard';
import { buildManualCorrectionFormConfig } from './manual-correction-form-config';
import { useRole } from '@/domain/role-context';
import { correctionsService } from './api';
import { getCorrectionPermissions } from './domain/correction-permissions';
import { computeCorrectionFx } from './domain/fx-convert';
import type {
  CorrectionCurrency,
  CorrectionFxPreview,
  CorrectionReason,
  CorrectionFormValues,
} from './domain/correction-types';
import { CORRECTION_REASONS, EMPTY_CORRECTION_FORM } from './domain/correction-types';
import { CUSTOMERS } from '@/mocks/data';
import { getWallets } from '@/lib/wallets-store';
import './manual-correction.css';

export function ManualCorrectionPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const correctionIdParam = searchParams.get('correctionId');
  const editingId = correctionIdParam ? Number(correctionIdParam) : null;

  const { role } = useRole();
  const permissions = useMemo(() => getCorrectionPermissions(role), [role]);

  const customerOptions = useMemo(
    () => CUSTOMERS.filter((c) => c.status === 'active').map((c) => ({ id: c.id, name: c.name })),
    [],
  );
  const walletOptions = useMemo(() => getWallets().filter((w) => w.recordStatus === 1), []);

  const [formKey, setFormKey] = useState(0);
  const [initialValues, setInitialValues] = useState<Record<string, unknown>>(EMPTY_CORRECTION_FORM);
  const [lastValues, setLastValues] = useState<Record<string, unknown>>(EMPTY_CORRECTION_FORM);
  const [reserveError, setReserveError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(editingId ?? NaN) || !permissions.view) return;
    const draft = correctionsService.getDraft(editingId!, role);
    if (!draft) return;
    setInitialValues({
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
      document: [],
    });
    setFormKey((k) => k + 1);
  }, [editingId, permissions.view, role]);

  const walletsForCustomer = useMemo(
    () => (customerId: number | null) => {
      if (customerId == null) return walletOptions;
      return walletOptions.filter((w) => w.customerId === customerId || w.cat === 'system');
    },
    [walletOptions],
  );

  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const formConfig = useMemo(
    () => buildManualCorrectionFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const fxPreview: CorrectionFxPreview | null = useMemo(() => {
    const sourceWalletId = Number(lastValues.sourceWalletId ?? NaN);
    const targetWalletId = Number(lastValues.targetWalletId ?? NaN);
    const requestedAmount = Number(lastValues.requestedAmount ?? 0);
    const requestedCurrency = (lastValues.requestedCurrency as CorrectionCurrency) ?? 'TRY';
    const sourceWallet = walletOptions.find((w) => w.id === sourceWalletId) ?? null;
    const targetWallet = walletOptions.find((w) => w.id === targetWalletId) ?? null;
    if (!sourceWallet || !targetWallet || !requestedAmount || requestedAmount <= 0) return null;
    const walletCurrency = (ccy: string): CorrectionCurrency =>
      ccy === 'USD' || ccy === 'EUR' || ccy === 'GBP' ? (ccy as CorrectionCurrency) : 'TRY';
    return computeCorrectionFx(
      requestedAmount,
      requestedCurrency,
      walletCurrency(sourceWallet.ccy),
      walletCurrency(targetWallet.ccy),
    );
  }, [lastValues, walletOptions]);

  useEffect(() => {
    const sourceWalletId = Number(lastValues.sourceWalletId ?? NaN);
    const sourceWallet = walletOptions.find((w) => w.id === sourceWalletId) ?? null;
    if (!sourceWallet) {
      setReserveError(null);
      return;
    }
    const requestedAmount = Number(lastValues.requestedAmount ?? 0);
    const requestedCurrency = (lastValues.requestedCurrency as CorrectionCurrency) ?? 'TRY';
    setReserveError(
      validateReserveMax(sourceWallet.type, sourceWallet.cat, requestedAmount, requestedCurrency),
    );
  }, [lastValues, walletOptions]);

  const reasons: CorrectionReason[] = [...CORRECTION_REASONS];

  const customFunctions: CustomFunctions = useMemo(
    () => ({
      apiCall: async (endpoint: string, dependsOnValue?: unknown): Promise<SelectOption[]> => {
        if (endpoint === 'customers') {
          return customerOptions.map((c) => ({ label: `${c.name} (#${c.id})`, value: c.id }));
        }
        if (endpoint === 'wallets') {
          const id = dependsOnValue != null && String(dependsOnValue).trim() ? Number(dependsOnValue) : null;
          return walletsForCustomer(id).map((w) => ({
            label: `${w.walletNo} · ${w.ownerName} (${w.ccy})`,
            value: w.id,
          }));
        }
        if (endpoint === 'reasons') {
          return reasons.map((r) => ({ label: t(`cr_reason_${r}`, r), value: r }));
        }
        return [];
      },
      onFieldChange: (_name, _value, allValues) => setLastValues(allValues),
    }),
    [customerOptions, walletsForCustomer, reasons, t],
  );

  const canSubmit = useMemo(() => {
    const sourceWalletId = lastValues.sourceWalletId != null ? Number(lastValues.sourceWalletId) : null;
    const targetWalletId = lastValues.targetWalletId != null ? Number(lastValues.targetWalletId) : null;
    const requestedAmount = Number(lastValues.requestedAmount ?? 0);
    const reason = String(lastValues.correctionReason ?? '');
    const manualDescription = String(lastValues.manualDescription ?? '').trim();
    return (
      sourceWalletId != null &&
      targetWalletId != null &&
      requestedAmount > 0 &&
      reason.length > 0 &&
      manualDescription.length > 0 &&
      !reserveError
    );
  }, [lastValues, reserveError]);

  if (!permissions.view) {
    return (
      <div className="empty-state" style={{ padding: 48 }}>
        <h3>{t('finrec_forbidden_title')}</h3>
        <p className="t-mute">{t('cr_forbidden_sub')}</p>
        <Button type="button" onClick={() => navigate('/transfers')} style={{ marginTop: 16 }}>
          {t('cr_back_transfers')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHead title={t('cr_title')} subtitle={t('cr_subtitle')} />

      <div className="fcard" style={{ marginBottom: 16 }}>
        <div className="fcard-body">
          <DynamicForm
            key={formKey}
            config={formConfig}
            mode={FormMode.Create}
            permissions={{ create: permissions.create }}
            customFunctions={customFunctions}
            initialValues={initialValues}
            t={translate}
            onButtonClick={(key, values) => {
              setLastValues(values);
              if (key === 'cancel') {
                if (window.confirm('Formdan çıkılsın mı?')) navigate('/transfers');
                return;
              }
              if (key === 'lookup') {
                const txNo = String(values.sourceTransactionNo ?? '').trim();
                const tx = correctionsService.lookupTransaction(txNo, role);
                if (!tx) return;
                const next: Record<string, unknown> = {
                  ...values,
                  sourceCustomerId: tx.senderCustomerId,
                  sourceWalletId: tx.senderWalletId,
                  targetCustomerId: tx.receiverCustomerId,
                  targetWalletId: tx.receiverWalletId,
                };
                setInitialValues(next);
                setFormKey((k) => k + 1);
                return;
              }
              if (key === 'submit') {
                const payload: CorrectionFormValues = {
                  complaintId: String(values.complaintId ?? ''),
                  sourceTransactionNo: String(values.sourceTransactionNo ?? ''),
                  sourceCustomerId: values.sourceCustomerId != null ? Number(values.sourceCustomerId) : null,
                  sourceWalletId: values.sourceWalletId != null ? Number(values.sourceWalletId) : null,
                  targetCustomerId: values.targetCustomerId != null ? Number(values.targetCustomerId) : null,
                  targetWalletId: values.targetWalletId != null ? Number(values.targetWalletId) : null,
                  requestedAmount: Number(values.requestedAmount ?? 0),
                  requestedCurrency: (values.requestedCurrency as CorrectionCurrency) ?? 'TRY',
                  transactionDescription: String(values.transactionDescription ?? ''),
                  correctionReason: (values.correctionReason as CorrectionReason) ?? '',
                  manualDescription: String(values.manualDescription ?? ''),
                };

                if (!canSubmit) {
                  toast.error(t(reserveError ?? 'cr_validation_failed'));
                  return;
                }

                const run =
                  editingId != null
                    ? correctionsService.updateDraft(editingId, payload, role)
                    : correctionsService.createDraft(payload, role);

                if (!run.ok) {
                  toast.error(t(run.error ?? 'cr_save_failed'));
                  return;
                }

                const files = values.document as File[] | undefined;
                const fileName = files?.[0]?.name ?? null;
                if (fileName) {
                  correctionsService.attachDocument(run.correctionId, fileName, role);
                }

                toast.success(t('td_submit_approval_ok', { id: run.correctionId }));
                navigate(`/transfers/${run.transactionId}?from=manual&correctionId=${run.correctionId}`);
              }
            }}
          />
        </div>
      </div>

      <div className="fcard">
        <div className="fcard-body">
          <div className="section-h">{t('cr_card_preview')}</div>
          {reserveError ? (
            <div className="banner banner-warn">
              {t(reserveError, { max: fmtNumber(MAX_RESERVE_CORRECTION_TRY, lang) })}
            </div>
          ) : null}

          {fxPreview ? (
            <div className="cr-preview">
              <div>
                <div className="t-mute fs-11">{t('cr_try_equiv')}</div>
                <div className="mono">{fmtNumber(fxPreview.amountTryEquivalent, lang)} TRY</div>
              </div>
              <div>
                <div className="t-mute fs-11">{t('cr_source_out')}</div>
                <div className="mono">
                  {fmtNumber(fxPreview.sourceOutAmount, lang)} {fxPreview.sourceOutCurrency}
                </div>
              </div>
              <div>
                <div className="t-mute fs-11">{t('cr_target_in')}</div>
                <div className="mono">
                  {fmtNumber(fxPreview.targetInAmount, lang)} {fxPreview.targetInCurrency}
                </div>
              </div>
            </div>
          ) : (
            <p className="t-mute">{t('cr_preview_empty')}</p>
          )}

          <p className="t-mute fs-12" style={{ marginTop: 10 }}>
            {t('cr_reserve_limit_note', { max: fmtNumber(MAX_RESERVE_CORRECTION_TRY, lang) })}
          </p>
        </div>
      </div>
    </>
  );
}

