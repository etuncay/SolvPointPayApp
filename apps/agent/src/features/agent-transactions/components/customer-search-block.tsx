import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

interface Props {
  initialCustomerNo?: string;
  initialIdNo?: string;
  loading?: boolean;
  onSearch: (query: { customerNo: string; idNo: string }) => void;
}

/** Ortak müşteri sorgu bloğu (gönderen). */
export function CustomerSearchBlock({ initialCustomerNo = '', initialIdNo = '', loading, onSearch }: Props) {
  const { t } = useTranslation();
  const [customerNo, setCustomerNo] = useState(initialCustomerNo);
  const [idNo, setIdNo] = useState(initialIdNo);

  const submit = () => onSearch({ customerNo: customerNo.trim(), idNo: idNo.trim() });

  return (
    <div className="fcard" style={{ marginBottom: 16 }}>
      <div className="fcard-body">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label className="field" style={{ flex: '1 1 200px' }}>
            <span className="field-label">{t('ag_tr_field_sender_no')}</span>
            <input
              className="input"
              placeholder={t('ag_tr_field_sender_no_ph')}
              value={customerNo}
              onChange={(e) => setCustomerNo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </label>
          <label className="field" style={{ flex: '1 1 200px' }}>
            <span className="field-label">{t('ag_tr_field_sender_id')}</span>
            <input
              className="input"
              placeholder={t('ag_tr_field_sender_id_ph')}
              value={idNo}
              onChange={(e) => setIdNo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </label>
          <button type="button" className="btn btn-primary" disabled={loading} onClick={submit}>
            <Search size={14} /> {t('ag_tr_btn_search')}
          </button>
        </div>
      </div>
    </div>
  );
}
