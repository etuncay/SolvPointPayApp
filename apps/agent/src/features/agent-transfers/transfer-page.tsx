import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { DynamicForm, DynamicTable, FormMode, PageHead, type CustomFunctions, type FormConfig, type TableCustomFunctions } from '@epay/ui';
import { SearchWarningsBanner } from '@/features/customer-search/components/search-warnings-banner';
import { CorporateDocWarning, DocumentUploadPanel, IdentityScanSection } from '@/features/agent-transactions';
import { fmtNumber } from '@/lib/format';
import { AdditionalInfoModal } from './components/additional-info-modal';
import { TransferQueryExamples } from './components/transfer-query-examples';
import { TransferSenderCardField } from './components/transfer-sender-card-field';
import { TransferSummary } from './components/transfer-summary';
import { buildTransferFormConfig } from './transfer-form-config';
import { buildTransferQueryFormConfig } from './transfer-query-form-config';
import { buildSenderSummaryFormConfig } from './sender-summary-form-config';
import { buildTransferFeesTableConfig } from './transfer-table-config';
import { computeTransferFee, findActiveTier, getTransferFeeTiers } from './domain/fees';
import { isQuoteExpired } from './domain/fx-quote';
import { useTransferFlow } from './hooks/use-transfer-flow';
import { variantTitleKey } from './localize-config';
import type { TransferVariant } from './domain/types';

interface Props {
  variant: TransferVariant;
}

function isReadyToSubmit(variant: TransferVariant, draft: Record<string, unknown>, kycBlocked: boolean): boolean {
  if (kycBlocked) return false;
  if (Number(draft.amount ?? 0) <= 0) return false;
  if (variant === 'bankAccount') {
    if (!String(draft.iban ?? '').trim()) return false;
    if (!String(draft.receiverName ?? '').trim()) return false;
  }
  if (variant === 'person' && !String(draft.receiverName ?? '').trim()) return false;
  if (variant === 'abroad') {
    if (!String(draft.receiverName ?? '').trim()) return false;
    if (!String(draft.country ?? '').trim()) return false;
  }
  return true;
}

/** Agent Para Transferi — 2 kolonlu shell (form + İşlem Özeti). İşlem tipi menüden gelir (6.para-transferi.md). */
export function TransferPage({ variant }: Props) {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const flow = useTransferFlow(variant);
  const {
    loading,
    notFound,
    sender,
    draft,
    formKey,
    currencies,
    identity,
    ocrStatus,
    additionalOpen,
    kycBanner,
    fxExpiresAt,
    initialQuery,
    setIdentity,
    setAdditionalOpen,
    runSearch,
    handleFieldChange,
    handleIdentityDocs,
    handleAdditionalInfo,
    goToRegistration,
    submit,
    reset,
  } = flow;

  const hasSender = sender != null;
  const isCorporate = sender?.customerType === 'corporate';
  const currency = String(draft.currency ?? 'TRY');
  const amount = Number(draft.amount ?? 0);
  const fee = useMemo(() => computeTransferFee(variant, currency, amount), [variant, currency, amount]);
  const canSubmit = hasSender && isReadyToSubmit(variant, draft, kycBanner);

  const initialQueryValue = initialQuery.customerNo || initialQuery.idNo;
  const [corporateDocName, setCorporateDocName] = useState('');
  const [corporateDocOpen, setCorporateDocOpen] = useState(false);

  useEffect(() => {
    if (!hasSender) {
      setCorporateDocName('');
      setCorporateDocOpen(false);
    }
  }, [hasSender]);

  const queryFormConfig = useMemo(
    () => buildTransferQueryFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const senderSummaryConfig = useMemo(() => buildSenderSummaryFormConfig(), []);

  const [queryKey, setQueryKey] = useState(0);

  const queryCustomFns: CustomFunctions = useMemo(
    () => ({
      components: {
        TransferQueryExamples: (props) => (
          <TransferQueryExamples
            {...props}
            onExamplePick={(value) => {
              props.onChange(value);
              runSearch({ customerNo: value, idNo: value });
            }}
          />
        ),
        TransferSenderCard: TransferSenderCardField,
      },
      onFieldChange: (name, value) => {
        if (name === 'senderCard' && value == null) reset();
      },
    }),
    [runSearch, reset],
  );

  const formConfig = useMemo<FormConfig>(() => {
    const cfg = buildTransferFormConfig(variant, translate, { currencyOptions: currencies });
    return { ...cfg, buttonToolbar: undefined };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language, variant, currencies]);

  const feesConfig = useMemo(
    () => buildTransferFeesTableConfig(variant, currency, translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, variant, currency],
  );

  const activeTierId = useMemo(() => {
    const tiers = getTransferFeeTiers(variant, currency);
    return findActiveTier(amount, tiers)?.id ?? null;
  }, [variant, currency, amount]);

  const feeFns: TableCustomFunctions = useMemo(
    () => ({
      renderMoney: (val: unknown): ReactNode => fmtNumber(Number(val ?? 0), i18n.language),
      renderMax: (val: unknown): ReactNode =>
        val == null ? t('ag_tr_tier_open') : fmtNumber(Number(val), i18n.language),
      renderRate: (val: unknown): ReactNode => `%${fmtNumber(Number(val ?? 0), i18n.language)}`,
      renderActive: (val: unknown): ReactNode =>
        String(val) === activeTierId ? <span className="badge badge--success">{t('ag_tr_tier_active')}</span> : null,
    }),
    [activeTierId, i18n.language, t],
  );

  const initialValues = useMemo(
    () => ({ _hasSender: hasSender, _corporate: isCorporate, ...draft }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formKey],
  );

  const customFunctions: CustomFunctions = useMemo(
    () => ({ onFieldChange: handleFieldChange }),
    [handleFieldChange],
  );

  const variantLabel = t(variantTitleKey(variant));

  const formColumn = (
    <div style={{ minWidth: 0 }}>
      <div className="fcard" style={{ marginBottom: 16 }}>
        <div className="fcard-body">
          <div className="section-h" style={{ marginBottom: 8 }}>{t('ag_tr_query_title')}</div>
          <p className="t-mute fs-12" style={{ margin: '0 0 12px' }}>{t('ag_tr_query_hint')}</p>
          <DynamicForm
            key={queryKey}
            config={queryFormConfig}
            mode={FormMode.Create}
            permissions={{ create: false, update: false, delete: false }}
            initialValues={{
              query: initialQueryValue,
              _showClear: hasSender || notFound,
            }}
            loading={loading}
            customFunctions={queryCustomFns}
            t={translate}
            onButtonClick={(key, values) => {
              if (key === 'search') {
                const v = String(values.query ?? '').trim();
                if (v) runSearch({ customerNo: v, idNo: v });
              }
              if (key === 'clear') {
                setQueryKey((k) => k + 1);
                reset();
              }
            }}
          />
        </div>
      </div>

      {notFound ? (
        <div className="fcard" style={{ marginBottom: 16 }}>
          <div className="fcard-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span className="t-mute">{t('ag_tr_not_found')}</span>
            <button type="button" className="btn btn-secondary" onClick={goToRegistration}>
              <UserPlus size={14} /> {t('ag_tr_register_cta')}
            </button>
          </div>
        </div>
      ) : null}

      {hasSender ? (
        <>
          <div className="fcard" style={{ marginBottom: 16 }}>
            <div className="fcard-body">
              <DynamicForm
                config={senderSummaryConfig}
                mode={FormMode.View}
                permissions={{ view: true }}
                initialValues={{ senderCard: sender }}
                customFunctions={queryCustomFns}
                t={translate}
              />
            </div>
          </div>
          <SearchWarningsBanner warnings={sender.warnings} />

          {kycBanner ? (
            <div className="fcard" style={{ marginBottom: 16, borderColor: '#fecaca', background: '#fff1f2' }}>
              <div className="fcard-body">
                <span className="fs-12" style={{ color: '#991b1b', fontWeight: 500 }}>{t('ag_tr_kyc_l2_banner')}</span>
              </div>
            </div>
          ) : null}

          {isCorporate && sender.documentMissing ? (
            <>
              <CorporateDocWarning onAddDocument={() => setCorporateDocOpen(true)} />
              {corporateDocOpen ? (
                <DocumentUploadPanel
                  uploadedFileName={corporateDocName}
                  onFileSelected={(name) => {
                    setCorporateDocName(name);
                    setCorporateDocOpen(false);
                  }}
                />
              ) : null}
            </>
          ) : null}

          {sender.requiresIdentityScan ? (
            <IdentityScanSection
              value={identity}
              onChange={setIdentity}
              onDocsUploaded={handleIdentityDocs}
              ocrStatus={ocrStatus}
            />
          ) : null}

          {variant === 'abroad' && fxExpiresAt && isQuoteExpired(fxExpiresAt) ? (
            <div className="fcard" style={{ marginBottom: 16, background: '#fffbeb' }}>
              <div className="fcard-body">
                <span className="fs-12">{t('ag_tr_fx_expired_banner')}</span>
              </div>
            </div>
          ) : null}

          <div className="fcard" style={{ marginBottom: 16 }}>
            <div className="fcard-body">
              <div className="section-h" style={{ marginBottom: 12 }}>{variantLabel}</div>
              <DynamicForm
                key={formKey}
                config={formConfig}
                mode={FormMode.Create}
                permissions={{ create: true }}
                initialValues={initialValues}
                customFunctions={customFunctions}
                loading={loading}
                t={translate}
              />
            </div>
          </div>

          <div className="fcard" style={{ marginBottom: 16 }}>
            <div className="fcard-body">
              <div className="section-h" style={{ marginBottom: 12 }}>{t('ag_tr_panel_fees')}</div>
              <DynamicTable
                config={feesConfig}
                permissions={{}}
                customFunctions={feeFns}
                locale={i18n.language}
                t={translate}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  return (
    <>
      <PageHead title={t(variantTitleKey(variant))} subtitle={t('ag_tr_subtitle')} />

      {hasSender ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: 16, alignItems: 'start' }}>
          {formColumn}
          <TransferSummary
            variant={variant}
            variantLabel={variantLabel}
            senderName={sender.fullName}
            recipientName={String(draft.receiverName ?? '')}
            currency={currency}
            amount={amount}
            fee={fee}
            targetCurrency={String(draft.targetCurrency ?? '')}
            targetAmount={Number(draft.targetAmount ?? 0)}
            canSubmit={canSubmit}
            onSubmit={() => submit(draft)}
            onReset={reset}
          />
        </div>
      ) : (
        formColumn
      )}

      <AdditionalInfoModal
        open={additionalOpen}
        isCorporate={isCorporate}
        onClose={() => setAdditionalOpen(false)}
        onSubmit={handleAdditionalInfo}
      />
    </>
  );
}
