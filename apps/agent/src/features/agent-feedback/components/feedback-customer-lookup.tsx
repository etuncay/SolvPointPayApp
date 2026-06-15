import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { findCustomerByQuery } from '@/features/agent-transactions/domain/customer-lookup';
import { formatCustomerNo } from '@/features/customer-search/domain/format-customer-no';

interface Props {
  value?: unknown;
  onChange?: (v: unknown) => void;
  disabled?: boolean;
}

/** Müşteri no + Sorgula — referans input-affix. */
export function FeedbackCustomerLookup({ value, onChange, disabled }: Props) {
  const { t } = useTranslation();
  const [foundName, setFoundName] = useState<string | null>(null);
  const customerNo = String(value ?? '');

  const lookup = () => {
    const trimmed = customerNo.trim();
    if (!trimmed) {
      setFoundName(null);
      return;
    }
    const customer = findCustomerByQuery({ customerNo: trimmed });
    if (customer) {
      setFoundName(customer.name);
      onChange?.(formatCustomerNo(customer.id));
      return;
    }
    setFoundName(trimmed.toUpperCase());
  };

  return (
    <div className="input-affix">
      <input
        className="input mono"
        value={customerNo}
        disabled={disabled}
        placeholder={t('ag_fb_ph_customer_no')}
        onChange={(e) => {
          setFoundName(null);
          onChange?.(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            lookup();
          }
        }}
      />
      {foundName ? (
        <span className="affix ok">✓ {foundName}</span>
      ) : (
        <button type="button" className="affix" disabled={disabled} onClick={lookup}>
          {t('ag_fb_cust_lookup')}
        </button>
      )}
    </div>
  );
}
