import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customerPortalApi } from '@epay/data';
import { useTransferDraft } from '@/app/TransferDraftContext';
import { SourceWalletPicker } from '@/components/money/SourceWalletPicker';
import { MoneyInput } from '@/components/money/MoneyInput';
import { FeeTable } from '@/components/money/FeeTable';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Icon } from '@/components/icons/Icon';
import { PAYMENT_PURPOSES, paymentPurposeI18nKey, TRANSFER_CURRENCIES } from '@/lib/enums';
import { firstFreeTextError } from '@/lib/validators';
import { useTransferLimits } from '@/lib/use-transfer-limits';
import { fmtMoney } from '@/lib/format';
import { Trans, useTranslation } from 'react-i18next';
import { TransferLimitDemoBanner } from '@/components/TransferLimitDemoBanner';
import { amountToInput, buildDraft, parseAmount, type TransferPrefill } from './transfer-form-shared';

function calcDomesticFee(amount: number): number {
  if (amount <= 0) return 0;
  return Math.max(amount * 0.002, amount > 5000 ? 5 : 0);
}

export function DomesticTransferPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as { prefill?: TransferPrefill } | null)?.prefill;
  const { submitForReview, draft: existingDraft, transferTabConflict } = useTransferDraft();
  // İşlem Onay → Düzenle ile dönüldüğünde alanlar dolu gelir.
  const editDraft = existingDraft?.kind === 'domestic' ? existingDraft : null;

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => customerPortalApi.listWallets(),
  });

  const persistent = useMemo(
    () => wallets.filter((w) => w.type === 'CustomerPersistent' && w.editable),
    [wallets],
  );

  const [walletId, setWalletId] = useState(editDraft?.sourceWalletId ?? '');
  const [currency, setCurrency] = useState<string>(editDraft?.currency ?? 'TRY');
  const [amountStr, setAmountStr] = useState(amountToInput(editDraft?.amount));
  const [name, setName] = useState(prefill?.recipientName ?? editDraft?.recipientName ?? '');
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

  useEffect(() => {
    if (walletId || persistent.length === 0) return;
    const first = persistent[0];
    setWalletId(first.id);
    setCurrency(first.currency);
  }, [persistent, walletId]);

  const wallet = wallets.find((w) => w.id === walletId);
  const currencyMeta =
    TRANSFER_CURRENCIES.find((c) => c.code === currency) ??
    TRANSFER_CURRENCIES.find((c) => c.code === wallet?.currency) ??
    TRANSFER_CURRENCIES[0];
  const sym = currencyMeta.symbol;
  const amount = parseAmount(amountStr);
  const fee = calcDomesticFee(amount);
  const total = amount + fee;
  const valid = Boolean(walletId && name.trim() && amount > 0);

  function onWalletChange(id: string) {
    setWalletId(id);
    const w = wallets.find((x) => x.id === id);
    if (w) setCurrency(w.currency);
  }

  async function onReview(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet || !valid) return;
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
      'domestic',
      'Yurt İçi Transfer',
      wallet.id,
      currency as 'TRY' | 'USD' | 'EUR',
      sym,
      amount,
      fee,
      {
        recipientName: name,
        recipientCustomerNo: prefill?.customerNo,
        phone,
        email,
        country: 'Türkiye',
        purpose,
        description: desc,
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
            <div className="eyebrow">{t('domestic_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('domestic_title')}
            </h1>
          </div>
        </div>

        <form onSubmit={onReview} className="transfer-domestic-layout">
          <div className="card card-pad transfer-form-card">
            <TransferLimitDemoBanner limit={internetDailyLimit} symbol={sym} />
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
              <Field label={t('domestic_recipient_name')} required full>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('domestic_recipient_ph')}
                />
              </Field>
              <Field label={t('domestic_recipient_phone')}>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 ..."
                />
              </Field>
              <Field label={t('domestic_recipient_email')}>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label={t('domestic_currency')} required>
                <select
                  className="select"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  {TRANSFER_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} · {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('domestic_purpose')} required>
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
              <MoneyInput
                label={t('domestic_amount')}
                value={amountStr}
                onChange={setAmountStr}
                sym={sym}
                large
              />
              <Field
                label={t('domestic_description')}
                hint={t('domestic_description_hint')}
                full
              >
                <textarea
                  className="textarea"
                  style={{ minHeight: 80 }}
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder={t('domestic_description_ph')}
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
                <span className="v tnum">{fmtMoney(amount, sym)}</span>
              </div>
              <div className="kv">
                <span className="k">{t('domestic_summary_fee')}</span>
                <span className="v tnum">{fmtMoney(fee, sym)}</span>
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
                <span className="v tnum">{fmtMoney(total, sym)}</span>
              </div>
              <Button
                type="submit"
                variant="primary"
                block
                className="btn-lg"
                style={{ marginTop: 18 }}
                disabled={!valid || transferTabConflict}
              >
                {t('domestic_continue')}{' '}
                <Icon name="right" style={{ width: 18, height: 18 }} />
              </Button>
              <p className="transfer-otp-note">
                <Icon name="lock" style={{ width: 14, height: 14 }} />
                {t('domestic_otp_note')}
              </p>
            </div>
            <FeeTable />
          </aside>
        </form>
      </div>
    </div>
  );
}
