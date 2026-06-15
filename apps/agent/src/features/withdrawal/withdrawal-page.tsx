import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { DynamicForm, DynamicTable, FormMode, PageHead, type CustomFunctions, type TableCustomFunctions } from '@epay/ui';
import { fmtNumber } from '@/lib/format';
import { SearchWarningsBanner } from '@/features/customer-search/components/search-warnings-banner';
import { DocumentUploadPanel } from '@/features/agent-transactions';
import { buildWithdrawalFormConfig } from './withdrawal-form-config';
import { buildWithdrawalFeesTableConfig } from './withdrawal-table-config';
import { findActiveTier, getWithdrawalFeeTiers } from './domain/fees';
import { WithdrawalIdentitySection } from './components/withdrawal-identity-section';
import { CorporateDocWarning } from './components/corporate-doc-warning';
import { useWithdrawal } from './hooks/use-withdrawal';
import { buildWithdrawalSearchFormConfig } from './withdrawal-search-form-config';

/** Agent Para Çekme (5.para-cekme.md) — DynamicForm + ücret DynamicTable + kimlik tarama. */
export function WithdrawalPage() {
  const { t, i18n } = useTranslation();
  const translate: (key: string, fallback?: string) => string = (key, fb) =>
    t(key, { defaultValue: fb ?? key });

  const {
    loading,
    notFound,
    result,
    selectedWallet,
    draft,
    formKey,
    currencies,
    identity,
    ocrStatus,
    initialQuery,
    setIdentity,
    runSearch,
    handleFieldChange,
    handleIdentityDocs,
    goToRegistration,
    submit,
    cancel,
  } = useWithdrawal();

  const isCorporate = result?.customerType === 'corporate';
  const hasResult = result != null;
  const [corporateDocName, setCorporateDocName] = useState('');
  const [corporateDocOpen, setCorporateDocOpen] = useState(false);

  useEffect(() => {
    if (!hasResult) {
      setCorporateDocName('');
      setCorporateDocOpen(false);
    }
  }, [hasResult]);
  const amountLocked = selectedWallet?.walletKind === 'CustomerTransactional';
  const currencyLocked = currencies.length <= 1;

  const searchFormConfig = useMemo(
    () => buildWithdrawalSearchFormConfig(translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  const formConfig = useMemo(
    () => buildWithdrawalFormConfig(translate, { currencyOptions: currencies, currencyLocked }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, currencies, currencyLocked],
  );

  const feesConfig = useMemo(
    () => buildWithdrawalFeesTableConfig(draft.currency || 'TRY', translate),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language, draft.currency],
  );

  const activeTierId = useMemo(() => {
    const tiers = getWithdrawalFeeTiers(draft.currency || 'TRY');
    return findActiveTier(draft.amount, tiers)?.id ?? null;
  }, [draft.currency, draft.amount]);

  const feeFns: TableCustomFunctions = useMemo(
    () => ({
      renderMoney: (val: unknown): ReactNode => fmtNumber(Number(val ?? 0), i18n.language),
      renderMax: (val: unknown): ReactNode =>
        val == null ? t('ag_wd_tier_open') : fmtNumber(Number(val), i18n.language),
      renderRate: (val: unknown): ReactNode => `%${fmtNumber(Number(val ?? 0), i18n.language)}`,
      renderActive: (val: unknown): ReactNode =>
        String(val) === activeTierId ? <span className="badge badge--success">{t('ag_wd_tier_active')}</span> : null,
    }),
    [activeTierId, i18n.language, t],
  );

  const initialValues = useMemo(
    () => ({
      _hasResult: hasResult,
      _corporate: isCorporate,
      _currencyLocked: currencyLocked,
      _amountLocked: amountLocked,
      fullName: result?.fullName ?? '',
      currency: draft.currency,
      amount: draft.amount,
      authorizedPersonIdNo: draft.authorizedPersonIdNo,
      transactionReferenceNo: draft.transactionReferenceNo,
      foreignReferenceNo: draft.foreignReferenceNo,
      isSuspicious: draft.isSuspicious,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formKey],
  );

  const customFunctions: CustomFunctions = useMemo(
    () => ({ onFieldChange: handleFieldChange }),
    [handleFieldChange],
  );

  return (
    <>
      <PageHead title={t('ag_nav_withdrawal')} subtitle={t('ag_wd_subtitle')} />

      <div className="fcard" style={{ marginBottom: 16 }}>
        <div className="fcard-body">
          <DynamicForm
            config={searchFormConfig}
            mode={FormMode.Create}
            permissions={{ create: false, update: false, delete: false }}
            initialValues={{
              customerNo: initialQuery.customerNo ?? '',
              idNo: initialQuery.idNo ?? '',
            }}
            loading={loading}
            t={translate}
            onButtonClick={(key, values) => {
              if (key === 'search') {
                void runSearch({
                  customerNo: String(values.customerNo ?? ''),
                  idNo: String(values.idNo ?? ''),
                });
              }
            }}
          />
        </div>
      </div>

      {notFound ? (
        <div className="fcard" style={{ marginBottom: 16 }}>
          <div className="fcard-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span className="t-mute">{t('ag_wd_not_found')}</span>
            <button type="button" className="btn btn-secondary" onClick={goToRegistration}>
              <UserPlus size={14} /> {t('ag_wd_register_cta')}
            </button>
          </div>
        </div>
      ) : null}

      {hasResult ? (
        <>
          <SearchWarningsBanner warnings={result.warnings} />

          {isCorporate && result.documentMissing ? (
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

          {result.requiresIdentityScan ? (
            <WithdrawalIdentitySection
              value={identity}
              onChange={setIdentity}
              onDocsUploaded={handleIdentityDocs}
              ocrStatus={ocrStatus}
            />
          ) : null}

          <div className="fcard" style={{ marginBottom: 16 }}>
            <div className="fcard-body">
              <DynamicForm
                key={formKey}
                config={formConfig}
                mode={FormMode.Create}
                permissions={{ create: true }}
                initialValues={initialValues}
                customFunctions={customFunctions}
                loading={loading}
                t={translate}
                onButtonClick={(key, values) => {
                  if (key === 'continue') submit(values);
                  if (key === 'cancel') cancel();
                }}
                onSubmit={(values) => submit(values)}
                onCancel={cancel}
              />
            </div>
          </div>

          <div className="fcard" style={{ marginBottom: 16 }}>
            <div className="fcard-body">
              <div className="section-h" style={{ marginBottom: 12 }}>{t('ag_wd_panel_fees')}</div>
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
    </>
  );
}
