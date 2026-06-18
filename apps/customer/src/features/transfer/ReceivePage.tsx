import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customerPortalApi } from '@epay/data';
import { useAuth } from '@/app/AuthProvider';
import { useTransferDraft } from '@/app/TransferDraftContext';
import { MoneyInput } from '@/components/money/MoneyInput';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { Icon } from '@/components/icons/Icon';
import { useTransferLimits } from '@/lib/use-transfer-limits';
import { fmtMoney } from '@/lib/format';
import { Trans, useTranslation } from 'react-i18next';
import { TransferLimitDemoBanner } from '@/components/TransferLimitDemoBanner';
import { amountToInput, buildDraft, parseAmount } from './transfer-form-shared';

export function ReceivePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { submitForReview, draft: existingDraft, transferTabConflict } = useTransferDraft();
  // İşlem Onay → Düzenle ile dönüldüğünde alanlar dolu gelir.
  const editDraft = existingDraft?.kind === 'receive' ? existingDraft : null;

  const { data: ibans = [] } = useQuery({
    queryKey: ['ibans'],
    queryFn: () => customerPortalApi.listIbans(),
  });
  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => customerPortalApi.listWallets(),
  });

  const [ibanId, setIbanId] = useState('');
  const [amountStr, setAmountStr] = useState(amountToInput(editDraft?.amount));
  const [amountErr, setAmountErr] = useState<string | null>(null);
  const { internetDailyLimit, validateTransferTotal } = useTransferLimits();

  // Düzenle akışında draft IBAN değerini, liste yüklendiğinde id'ye eşle.
  useEffect(() => {
    if (!editDraft?.iban || ibanId || ibans.length === 0) return;
    const match = ibans.find((i) => i.iban === editDraft.iban);
    if (match) setIbanId(match.id);
  }, [editDraft, ibanId, ibans]);

  const iban = ibans.find((i) => i.id === ibanId);
  const wallet = wallets.find((w) => w.id === iban?.walletId);
  const amount = parseAmount(amountStr);
  const valid = Boolean(iban && wallet && amount > 0);

  async function onReview(e: React.FormEvent) {
    e.preventDefault();
    if (!wallet || !iban) return;
    const limitErr = validateTransferTotal(amount, wallet.balance);
    if (limitErr) {
      setAmountErr(t(limitErr));
      return;
    }
    setAmountErr(null);
    const draft = buildDraft(
      'receive',
      t('receive_confirm_type'),
      wallet.id,
      wallet.currency,
      wallet.symbol,
      amount,
      0,
      {
        recipientName: profile?.name ?? '',
        country: t('receive_country'),
        purpose: t('receive_purpose'),
        description: t('receive_description'),
        iban: iban.iban,
        bank: iban.bank,
      },
    );
    const ok = await submitForReview(draft);
    if (!ok) return;
    navigate('/confirm');
  }

  return (
    <div className="page receive-page">
      <div className="container">
        <div className="page-head">
          <div>
            <div className="eyebrow">{t('receive_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('receive_title')}
            </h1>
            <p className="page-sub">
              <Trans
                i18nKey="receive_subtitle"
                components={{ strong: <strong /> }}
              />
            </p>
          </div>
        </div>

        <form onSubmit={onReview} className="card card-pad receive-form-card">
          <TransferLimitDemoBanner limit={internetDailyLimit} symbol={wallet?.symbol ?? '₺'} />
          {amountErr ? (
            <div style={{ marginBottom: 16 }}>
              <AlertBanner tone="error" icon="warn">
                {amountErr}
              </AlertBanner>
            </div>
          ) : null}
          <Field label="IBAN" required hint={t('receive_iban_hint')} full>
            <select
              className="select"
              value={ibanId}
              onChange={(e) => setIbanId(e.target.value)}
            >
              <option value="">{t('receive_iban_placeholder')}</option>
              {ibans.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.bank} — {i.iban} ({i.currency})
                </option>
              ))}
            </select>
          </Field>

          {iban && wallet ? (
            <div className="receive-meta-grid">
              <div className="receive-meta-tile">
                <div className="receive-meta-label">{t('receive_meta_wallet')}</div>
                <div className="receive-meta-value tnum">{iban.walletNo}</div>
                <span className="tag" style={{ marginTop: 6, fontSize: 10.5 }}>
                  {t('receive_meta_auto')}
                </span>
              </div>
              <div className="receive-meta-tile">
                <div className="receive-meta-label">{t('receive_meta_currency')}</div>
                <div className="receive-meta-value tnum">{iban.currency}</div>
                <span className="tag" style={{ marginTop: 6, fontSize: 10.5 }}>
                  {t('receive_meta_auto')}
                </span>
              </div>
              <div className="receive-meta-tile">
                <div className="receive-meta-label">{t('receive_meta_balance')}</div>
                <div className="receive-meta-value tnum">
                  {fmtMoney(wallet.balance, wallet.symbol)}
                </div>
                <span className="tag" style={{ marginTop: 6, fontSize: 10.5 }}>
                  {t('receive_meta_auto')}
                </span>
              </div>
            </div>
          ) : null}

          <MoneyInput
            label={t('receive_amount')}
            value={amountStr}
            onChange={setAmountStr}
            sym={wallet?.symbol ?? '₺'}
            large
          />

          <Button
            type="submit"
            variant="primary"
            className="btn-lg btn-block"
            disabled={!valid || transferTabConflict}
          >
            {t('receive_continue')}{' '}
            <Icon name="right" style={{ width: 18, height: 18 }} />
          </Button>
        </form>
      </div>
    </div>
  );
}
