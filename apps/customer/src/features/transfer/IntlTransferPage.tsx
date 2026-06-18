import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customerPortalApi, type CurrencyCode } from '@epay/data';
import { useTransferDraft } from '@/app/TransferDraftContext';
import { SourceWalletPicker } from '@/components/money/SourceWalletPicker';
import { MoneyInput } from '@/components/money/MoneyInput';
import { FeeTable } from '@/components/money/FeeTable';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Icon } from '@/components/icons/Icon';
import { COUNTRIES, PAYMENT_PURPOSES, paymentPurposeI18nKey, TRANSFER_CURRENCIES } from '@/lib/enums';
import { firstFreeTextError } from '@/lib/validators';
import { useTransferLimits } from '@/lib/use-transfer-limits';
import { fmtMoney } from '@/lib/format';
import { Trans, useTranslation } from 'react-i18next';
import { TransferLimitDemoBanner } from '@/components/TransferLimitDemoBanner';
import { useFxQuote } from '@/lib/use-fx-quote';
import { amountToInput, buildDraft, parseAmount, type TransferPrefill } from './transfer-form-shared';

const RISKY_COUNTRIES = ['BAE', 'Suudi Arabistan'] as const;

function calcIntlFee(amount: number): number {
  if (amount <= 0) return 0;
  return Math.max(amount * 0.0025, 5);
}

function symbolFor(cur: CurrencyCode): string {
  return TRANSFER_CURRENCIES.find((c) => c.code === cur)?.symbol ?? '₺';
}

export function IntlTransferPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { prefill?: TransferPrefill } | null)?.prefill;
  const { submitForReview, draft: existingDraft, transferTabConflict } = useTransferDraft();
  // İşlem Onay → Düzenle ile dönüldüğünde alanlar dolu gelir.
  const editDraft = existingDraft?.kind === 'intl' ? existingDraft : null;

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => customerPortalApi.listWallets(),
  });

  const persistent = useMemo(
    () => wallets.filter((w) => w.type === 'CustomerPersistent' && w.editable),
    [wallets],
  );

  const initialCountry =
    editDraft?.country ??
    (prefill?.country && prefill.country !== 'Türkiye' ? prefill.country : 'Almanya');

  const [walletId, setWalletId] = useState(editDraft?.sourceWalletId ?? '');
  const [srcCur, setSrcCur] = useState<CurrencyCode>(
    editDraft?.srcCurrency ?? editDraft?.currency ?? 'TRY',
  );
  const [dstCur, setDstCur] = useState<CurrencyCode>(editDraft?.dstCurrency ?? 'EUR');
  const [amountStr, setAmountStr] = useState(amountToInput(editDraft?.amount));
  const [name, setName] = useState(prefill?.recipientName ?? editDraft?.recipientName ?? '');
  const [country, setCountry] = useState(initialCountry);
  const [phone, setPhone] = useState(prefill?.phone ?? editDraft?.phone ?? '');
  const [email, setEmail] = useState(prefill?.email ?? editDraft?.email ?? '');
  const [purpose, setPurpose] = useState(
    prefill?.purpose ?? editDraft?.purpose ?? PAYMENT_PURPOSES[0],
  );
  const [desc, setDesc] = useState(editDraft?.description ?? '');
  const [saveRecipient, setSaveRecipient] = useState(editDraft?.saveRecipient ?? false);
  const [descErr, setDescErr] = useState<string | null>(null);
  const [amountErr, setAmountErr] = useState<string | null>(null);
  const { internetDailyLimit, validateTransferTotal } = useTransferLimits();
  const { rate: fxRate, secsLeft: fxSecsLeft, loading: fxLoading, stale: fxStale, refresh: refreshFx } =
    useFxQuote(srcCur, dstCur);

  useEffect(() => {
    if (walletId || persistent.length === 0) return;
    const first = persistent[0];
    setWalletId(first.id);
    setSrcCur(first.currency);
  }, [persistent, walletId]);

  const wallet = wallets.find((w) => w.id === walletId);
  const srcSym = symbolFor(srcCur);
  const dstSym = symbolFor(dstCur);
  const amount = parseAmount(amountStr);
  const fee = calcIntlFee(amount);
  const total = amount + fee;
  const rate = srcCur === dstCur ? 1 : fxRate;
  const net = amount * rate;
  const valid = Boolean(walletId && name.trim() && country && amount > 0);
  const risky = RISKY_COUNTRIES.includes(country as (typeof RISKY_COUNTRIES)[number]);

  function onWalletChange(id: string) {
    setWalletId(id);
    const w = wallets.find((x) => x.id === id);
    if (w) setSrcCur(w.currency);
  }

  async function onReview(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet || !valid) return;
    let effectiveRate = srcCur === dstCur ? 1 : fxRate;
    if (srcCur !== dstCur && fxStale) {
      effectiveRate = await refreshFx();
    }
    const effectiveNet = amount * effectiveRate;
    const sensitiveErr = firstFreeTextError(name, desc);
    if (sensitiveErr) {
      setDescErr(t(sensitiveErr));
      return;
    }
    const limitErr = validateTransferTotal(total, wallet.balance);
    if (limitErr) {
      setAmountErr(t(limitErr));
      return;
    }
    setDescErr(null);
    setAmountErr(null);
    const draft = buildDraft(
      'intl',
      'Yurt Dışı Transfer',
      wallet.id,
      srcCur,
      srcSym,
      amount,
      fee,
      {
        recipientName: name,
        recipientCustomerNo: prefill?.customerNo,
        phone,
        email,
        country,
        purpose,
        description: desc,
        dstCurrency: dstCur,
        fxRate: effectiveRate,
        netAmount: effectiveNet,
        dstSymbol: dstSym,
      },
    );
    draft.saveRecipient = saveRecipient;
    const ok = await submitForReview(draft);
    if (!ok) return;
    navigate('/confirm');
  }

  return (
    <div className="page transfer-page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">{t('intl_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('intl_title')}
            </h1>
          </div>
        </div>

        {risky && (
          <AlertBanner tone="warn" icon="warn">
            <Trans
              i18nKey="intl_risk_banner"
              values={{ country }}
              components={{ strong: <strong /> }}
            />
          </AlertBanner>
        )}

        <form onSubmit={onReview} className="transfer-domestic-layout">
          <div className="card card-pad transfer-form-card">
            <TransferLimitDemoBanner limit={internetDailyLimit} symbol={srcSym} />
            {(descErr || amountErr) && (
              <AlertBanner tone="error" icon="warn">
                {descErr ?? amountErr}
              </AlertBanner>
            )}
            <SourceWalletPicker
              value={walletId}
              onChange={onWalletChange}
              label={t('transfer_source_wallet')}
            />
            <hr className="divider" />
            <div className="form-grid">
              <Field label={t('intl_recipient_name')} required full>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label={t('intl_recipient_country')} required>
                <select
                  className="select"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                >
                  {COUNTRIES.filter((c) => c !== 'Türkiye').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('intl_recipient_phone')}>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field label={t('intl_recipient_email')}>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>

            <div className="intl-fx-panel">
              <div className="form-grid" style={{ gap: '16px 18px' }}>
                <Field label={t('intl_src_currency')} required>
                  <select
                    className="select"
                    value={srcCur}
                    onChange={(e) => setSrcCur(e.target.value as CurrencyCode)}
                  >
                    {TRANSFER_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t('intl_dst_currency')} required>
                  <select
                    className="select"
                    value={dstCur}
                    onChange={(e) => setDstCur(e.target.value as CurrencyCode)}
                  >
                    {TRANSFER_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                </Field>
                <MoneyInput
                  label={t('intl_amount')}
                  value={amountStr}
                  onChange={setAmountStr}
                  sym={srcSym}
                  large
                />
              </div>
              <div className="intl-fx-rate-row">
                <div className="intl-fx-rate-left">
                  <Icon name="swap" style={{ width: 18, height: 18, color: 'var(--brand-600)' }} />
                  {t('intl_fx_label')}{' '}
                  <span className="tnum" style={{ color: 'var(--ink)', fontWeight: 700 }}>
                    1 {srcCur} ={' '}
                    {rate.toLocaleString('tr-TR', { maximumFractionDigits: 4 })} {dstCur}
                  </span>
                </div>
                <div className="intl-fx-net">
                  <div className="intl-fx-net-label">{t('intl_net_label')}</div>
                  <div className="intl-fx-net-value tnum">{fmtMoney(net, dstSym)}</div>
                </div>
              </div>
              <p className={`intl-fx-refresh-note${fxStale ? ' is-expired' : ''}`}>
                <Icon name="refresh" style={{ width: 13, height: 13 }} />
                {fxLoading
                  ? t('intl_fx_refreshing')
                  : fxSecsLeft > 0
                    ? t('intl_fx_ttl', { secs: fxSecsLeft })
                    : t('intl_fx_expired')}
                <button
                  type="button"
                  className="btn btn-quiet"
                  style={{ padding: '2px 6px', marginLeft: 4, fontSize: 11.5 }}
                  onClick={() => void refreshFx()}
                  disabled={fxLoading}
                >
                  {t('intl_fx_refresh_now')}
                </button>
              </p>
            </div>

            <div className="form-grid">
              <Field label={t('intl_purpose')} required>
                <select
                  className="select"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  {PAYMENT_PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {t(paymentPurposeI18nKey(p))}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('intl_description')} full>
                <textarea
                  className="textarea"
                  style={{ minHeight: 70 }}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </Field>
            </div>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={saveRecipient}
                onChange={(e) => setSaveRecipient(e.target.checked)}
              />
              <span className="checkbox-label">
                <Trans
                  i18nKey="domestic_save_recipient"
                  components={{ strong: <strong /> }}
                />
              </span>
            </label>
          </div>

          <aside className="transfer-aside">
            <div className="card card-pad">
              <h3 className="card-title" style={{ marginBottom: 14 }}>
                {t('domestic_summary')}
              </h3>
              <div className="kv">
                <span className="k">{t('domestic_summary_amount')}</span>
                <span className="v tnum">{fmtMoney(amount, srcSym)}</span>
              </div>
              <div className="kv">
                <span className="k">{t('domestic_summary_fee')}</span>
                <span className="v tnum">{fmtMoney(fee, srcSym)}</span>
              </div>
              <div className="kv">
                <span className="k">{t('intl_summary_fx')}</span>
                <span className="v tnum">
                  {rate.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}
                </span>
              </div>
              <div className="kv">
                <span className="k">{t('intl_summary_recipient_gets')}</span>
                <span className="v tnum" style={{ color: 'var(--info)' }}>
                  {fmtMoney(net, dstSym)}
                </span>
              </div>
              <div
                className="kv transfer-summary-total"
                style={{
                  borderTop: '1px solid var(--line)',
                  marginTop: 4,
                  paddingTop: 12,
                  borderBottom: 'none',
                }}
              >
                <span className="k">{t('domestic_summary_total')}</span>
                <span className="v tnum">{fmtMoney(total, srcSym)}</span>
              </div>
              <Button
                type="submit"
                variant="primary"
                block
                className="btn-lg"
                style={{ marginTop: 18 }}
                disabled={!valid || transferTabConflict || (srcCur !== dstCur && (fxLoading || fxStale))}
              >
                {t('domestic_continue')}{' '}
                <Icon name="right" style={{ width: 18, height: 18 }} />
              </Button>
              <p className="intl-status-flow">{t('intl_status_flow')}</p>
            </div>
            <FeeTable />
          </aside>
        </form>
      </div>
    </div>
  );
}
