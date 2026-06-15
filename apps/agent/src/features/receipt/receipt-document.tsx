import { QRCode } from '@epay/ui';
import { receiptLabels, receiptTxType } from '@epay/data';
import type { ReceiptModel } from './build-receipt-model';
import './receipt.css';

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="rcpt-row">
      <span className="rcpt-row-label">{label}</span>
      <span className="rcpt-row-value">{value}</span>
    </div>
  );
}

/** Yazdırılabilir dekont — docs/Sablonlar/dekont-template.html yapısı; AR için dir=rtl. */
export function ReceiptDocument({ model }: { model: ReceiptModel }) {
  const L = receiptLabels(model.lang);
  const c = model.company;
  const d = model.details;
  const hasDetails =
    d.iban || d.exchangeRate || d.netAmount || d.totalFee !== '0' || d.description;

  return (
    <div className="rcpt" dir={model.dir} lang={model.lang}>
      <header className="rcpt-head">
        <div className="rcpt-head-col">
          <strong>{c.name}</strong>
          <span>{c.email}</span>
          <span>{c.website}</span>
        </div>
        <div className="rcpt-head-col rcpt-head-brand">{c.brand}</div>
        <div className="rcpt-head-col rcpt-head-right">
          <span>{c.taxOffice} · {c.taxNo}</span>
          <span>{c.address}</span>
          <span>{c.phone}</span>
        </div>
      </header>

      <h1 className="rcpt-title">{L.payment_receipt}</h1>

      <div className="rcpt-meta">
        <Row label={L.date_time} value={model.dateTime} />
        <Row label={L.receipt_no} value={model.receiptNo} />
        <Row label={L.partner_ref_no} value={model.partnerRefNo} />
        <Row label={L.sending_point} value={model.sendingPoint} />
      </div>

      <div className="rcpt-parties">
        <section className="rcpt-party">
          <h2>{L.receiver_information}</h2>
          <Row label={L.full_name} value={model.receiver.name} />
          <Row label={L.identity_no} value={model.receiver.identityNo} />
          <Row label={L.tel} value={model.receiver.tel} />
          <Row label={L.address} value={model.receiver.address} />
        </section>
        <section className="rcpt-party">
          <h2>{L.sender_information}</h2>
          <Row label={L.full_name} value={model.sender.name} />
          <Row label={L.tel} value={model.sender.tel} />
        </section>
      </div>

      <section className="rcpt-block">
        <h2>{L.payment_information}</h2>
        <Row label={L.country} value={model.payment.country} />
        <Row label={L.city} value={model.payment.city} />
        <Row label={L.payment_amount} value={`${model.payment.amount} (${model.payment.amountWords})`} />
        <Row label={L.currency} value={model.payment.currency} />
      </section>

      {hasDetails && (
        <section className="rcpt-block">
          <h2>{L.transaction_details}</h2>
          <Row label={L.transaction_type} value={receiptTxType(model.lang, d.transactionType)} />
          <Row label={L.payment_purpose} value={d.paymentPurpose} />
          <Row label={L.iban} value={d.iban} />
          <Row label={L.fixed_fee} value={d.fixedFee} />
          <Row label={L.proportional_fee} value={d.proportionalFee} />
          <Row label={L.total_fee} value={d.totalFee} />
          <Row label={L.total_paid} value={d.totalPaid} />
          <Row label={L.exchange_rate} value={d.exchangeRate} />
          <Row label={L.target_currency} value={d.targetCurrency} />
          <Row label={L.net_amount} value={d.netAmount} />
          <Row label={L.description} value={d.description} />
        </section>
      )}

      <footer className="rcpt-foot">
        <div className="rcpt-legal">
          <strong>{L.legal_heading}</strong>
          <p>{model.legalText}</p>
        </div>
        <div className="rcpt-qr">
          <QRCode value={model.qrUrl} size={96} />
        </div>
      </footer>

      <div className="rcpt-signs">
        <div className="rcpt-sign">{L.agent_signature}</div>
        <div className="rcpt-sign">{L.customer_signature}</div>
      </div>
    </div>
  );
}
