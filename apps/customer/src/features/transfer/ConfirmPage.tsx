import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { customerPortalApi } from '@epay/data';
import { useAuth } from '@/app/AuthProvider';
import { useTransferDraft } from '@/app/TransferDraftContext';
import { OtpInput } from '@/components/ui/OtpInput';
import { DemoOtpHint } from '@/components/DemoOtpHint';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Field } from '@/components/ui/Field';
import { Icon } from '@/components/icons/Icon';
import { fmtMoney } from '@/lib/format';
import { firstFreeTextError } from '@/lib/validators';
import { paymentPurposeI18nKey } from '@/lib/enums';
import { useTranslation } from 'react-i18next';

function ConfirmPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="confirm-panel">
      <div className="confirm-panel-title">{title}</div>
      <div className="card confirm-panel-body">{children}</div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value?: ReactNode }) {
  if (value === undefined || value === null || value === '' || value === '—') return null;
  return (
    <div className="kv">
      <span className="k">{label}</span>
      <span className="v">{value}</span>
    </div>
  );
}

export function ConfirmPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { draft, confirmation, approve, cancel, hydrating, transferTabConflict } = useTransferDraft();
  const [otp, setOtp] = useState('');
  const [declaration, setDeclaration] = useState('');
  const [declarationErr, setDeclarationErr] = useState<string | null>(null);
  const [showDeclaration, setShowDeclaration] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [secs, setSecs] = useState(58);

  const { data: wallets = [] } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => customerPortalApi.listWallets(),
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecs((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (hydrating) {
    return null;
  }

  if (!draft || !confirmation) {
    return (
      <div className="page">
        <div className="container empty">{t('confirm_empty')}</div>
      </div>
    );
  }

  const currentDraft = draft;
  const currentConfirmation = confirmation;
  const wallet = wallets.find((w) => w.id === currentDraft.sourceWalletId);
  const refNo = currentConfirmation.referenceNo;
  const foreignRefNo = currentConfirmation.foreignReferenceNo;
  const isReceive = currentDraft.kind === 'receive';
  const isIntl = currentDraft.kind === 'intl';
  const isCorporate = profile?.type === 'corporate';

  async function onApprove() {
    if (currentConfirmation.requiresDeclaration && !declaration.trim()) {
      setShowDeclaration(true);
      return;
    }
    const sensitiveErr = firstFreeTextError(declaration);
    if (sensitiveErr) {
      const msg = t(sensitiveErr);
      setDeclarationErr(msg);
      if (currentConfirmation.requiresDeclaration) setShowDeclaration(true);
      else setError(msg);
      return;
    }
    setDeclarationErr(null);
    setError(null);
    setSending(true);
    const err = await approve(otp, declaration);
    setSending(false);
    if (err) setError(t(err, { defaultValue: err }));
    else navigate('/success');
  }

  function editBack() {
    const path =
      currentDraft.kind === 'intl'
        ? '/send/intl'
        : currentDraft.kind === 'receive'
          ? '/receive'
          : '/send/domestic';
    navigate(path);
  }

  return (
    <div className="page confirm-page">
      <div className="container">
        <button
          type="button"
          className="btn btn-quiet"
          style={{ marginBottom: 10 }}
          onClick={() => navigate(-1)}
        >
          <Icon name="left" style={{ width: 16, height: 16 }} /> {t('confirm_back')}
        </button>

        <div className="page-head">
          <div>
            <div className="eyebrow">{t('confirm_eyebrow')}</div>
            <h1 className="page-title" style={{ marginTop: 6 }}>
              {t('confirm_headline')}
            </h1>
            <p className="page-sub">{t('confirm_subtitle')}</p>
          </div>
        </div>

        <div className="confirm-layout">
          <div>
            <ConfirmPanel title={t('confirm_sender')}>
              <ConfirmRow label={t('confirm_name')} value={profile?.name} />
              <ConfirmRow label={t('confirm_customer_no')} value={profile?.customerNo} />
              <ConfirmRow label={t('confirm_wallet')} value={wallet?.walletNo} />
              {isCorporate ? (
                <>
                  <ConfirmRow
                    label={t('confirm_authorized_no')}
                    value={profile?.authorizedPersonNo}
                  />
                  <ConfirmRow
                    label={t('confirm_authorized_name')}
                    value={profile?.authorizedPersonName}
                  />
                </>
              ) : null}
            </ConfirmPanel>

            <ConfirmPanel title={isReceive ? t('confirm_target_account') : t('confirm_recipient')}>
              <ConfirmRow label={t('confirm_name')} value={draft.recipientName} />
              {!isReceive ? (
                <>
                  <ConfirmRow label={t('confirm_customer_no')} value={draft.recipientCustomerNo} />
                  <ConfirmRow label={t('confirm_phone')} value={draft.phone} />
                  <ConfirmRow label={t('confirm_email')} value={draft.email} />
                </>
              ) : null}
              <ConfirmRow label="IBAN" value={draft.iban} />
              <ConfirmRow label={t('confirm_bank')} value={draft.bank} />
              <ConfirmRow label={t('confirm_country')} value={draft.country} />
            </ConfirmPanel>

            <ConfirmPanel title={t('confirm_amounts')}>
              <ConfirmRow
                label={t('confirm_sent_amount')}
                value={<span className="tnum">{fmtMoney(draft.amount, draft.symbol)}</span>}
              />
              <ConfirmRow
                label={t('confirm_total_fee')}
                value={<span className="tnum">{fmtMoney(draft.fee, draft.symbol)}</span>}
              />
              {isIntl && draft.fxRate != null && draft.srcCurrency && draft.dstCurrency ? (
                <ConfirmRow
                  label={t('confirm_fx_rate')}
                  value={
                    <span className="tnum">
                      1 {draft.srcCurrency} ={' '}
                      {draft.fxRate.toLocaleString('tr-TR', { maximumFractionDigits: 4 })}{' '}
                      {draft.dstCurrency}
                    </span>
                  }
                />
              ) : null}
              {isIntl && draft.netAmount != null && draft.dstSymbol ? (
                <ConfirmRow
                  label={t('confirm_net_recipient')}
                  value={<span className="tnum">{fmtMoney(draft.netAmount, draft.dstSymbol)}</span>}
                />
              ) : null}
              <div className="kv confirm-total-row">
                <span className="k">{t('confirm_payable_total')}</span>
                <span className="v tnum confirm-total-value">
                  {fmtMoney(draft.total, draft.symbol)}
                </span>
              </div>
            </ConfirmPanel>

            <ConfirmPanel title={t('confirm_details')}>
              <ConfirmRow label={t('confirm_tx_type')} value={draft.title} />
              <ConfirmRow
                label={t('confirm_payment_type')}
                value={
                  draft.purpose
                    ? t(paymentPurposeI18nKey(draft.purpose), { defaultValue: draft.purpose })
                    : undefined
                }
              />
              <ConfirmRow label={t('confirm_description')} value={draft.description} />
              <ConfirmRow
                label={t('confirm_reference')}
                value={<span className="tnum">{refNo}</span>}
              />
              {isIntl && foreignRefNo ? (
                <ConfirmRow
                  label={t('confirm_foreign_reference')}
                  value={<span className="tnum">{foreignRefNo}</span>}
                />
              ) : null}
            </ConfirmPanel>
          </div>

          <div className="card card-pad confirm-otp-card">
            <span className="confirm-otp-icon">
              <Icon name="shield" style={{ width: 26, height: 26 }} />
            </span>
            <h3 className="confirm-otp-title">{t('confirm_otp_title')}</h3>
            <p className="confirm-otp-desc">
              {t('confirm_otp_desc', { phone: profile?.phone ?? '' })}
            </p>
            <DemoOtpHint onUseCode={setOtp} />
            <OtpInput value={otp} onChange={setOtp} />
            <div className="confirm-otp-timer">
              {secs > 0 ? (
                t('confirm_otp_timer', { secs })
              ) : (
                <button
                  type="button"
                  className="btn btn-quiet"
                  style={{ color: 'var(--brand-600)' }}
                  onClick={() => setSecs(58)}
                >
                  <Icon name="refresh" style={{ width: 15, height: 15 }} /> {t('confirm_otp_resend')}
                </button>
              )}
            </div>
            {error ? (
              <p style={{ color: 'var(--neg)', marginTop: 12, fontSize: 14 }}>{error}</p>
            ) : null}
            <Button
              variant="primary"
              block
              className="btn-lg"
              style={{ marginTop: 16 }}
              onClick={() => void onApprove()}
              disabled={otp.length < 6 || sending || transferTabConflict}
            >
              {sending ? (
                t('confirm_approving')
              ) : (
                <>
                  <Icon name="check" /> {t('confirm_approve')}
                </>
              )}
            </Button>
            <div className="confirm-otp-actions">
              <Button variant="ghost" block onClick={editBack}>
                <Icon name="edit" /> {t('confirm_edit')}
              </Button>
              <Button
                variant="ghost"
                block
                onClick={async () => {
                  await cancel();
                  navigate('/');
                }}
              >
                {t('confirm_cancel')}
              </Button>
            </div>
            <p className="confirm-otp-footnote">{t('confirm_otp_footnote')}</p>
          </div>
        </div>
      </div>

      {showDeclaration && (
        <Modal onClose={() => setShowDeclaration(false)} max={480}>
          <span className="confirm-decl-icon">
            <Icon name="info" style={{ width: 24, height: 24 }} />
          </span>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>{t('confirm_declaration_title')}</h2>
          <p className="hint" style={{ marginBottom: 18 }}>
            {t('confirm_declaration_desc')}
          </p>
          <Field label={t('confirm_declaration_label')} required full>
            <textarea
              className="textarea"
              style={{ minHeight: 90 }}
              value={declaration}
              onChange={(e) => {
                setDeclaration(e.target.value);
                setDeclarationErr(null);
              }}
              placeholder={t('confirm_declaration_ph')}
            />
          </Field>
          {declarationErr ? (
            <p style={{ color: 'var(--neg)', fontSize: 13.5, marginTop: 8 }}>{declarationErr}</p>
          ) : null}
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setShowDeclaration(false)}>
              {t('confirm_declaration_abort')}
            </Button>
            <Button
              variant="primary"
              disabled={!declaration.trim()}
              onClick={() => {
                const sensitiveErr = firstFreeTextError(declaration);
                if (sensitiveErr) {
                  setDeclarationErr(t(sensitiveErr));
                  return;
                }
                setDeclarationErr(null);
                setShowDeclaration(false);
                void onApprove();
              }}
            >
              {t('confirm_declaration_submit')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
