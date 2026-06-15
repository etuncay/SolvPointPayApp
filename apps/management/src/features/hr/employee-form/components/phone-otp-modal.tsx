import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@epay/ui';

type Props = {
  open: boolean;
  phone: string;
  onClose: () => void;
  onConfirm: (code: string) => boolean;
};

export function PhoneOtpModal({ open, phone, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');

  if (!open) return null;

  return (
    <div className="modal-backdrop open" onClick={onClose} role="presentation">
      <div className="modal" style={{ width: 400 }} onClick={(e) => e.stopPropagation()} role="dialog">
        <div className="modal-head">
          <h2>{t('ef_otp_title')}</h2>
          <p className="t-mute fs-12">{phone}</p>
        </div>
        <div className="modal-body">
          <input
            className="input mono"
            placeholder={t('ef_otp_ph')}
            value={code}
            maxLength={6}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <p className="t-mute fs-11">{t('ef_otp_hint')}</p>
        </div>
        <div className="modal-foot" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t('lf_cancel_back')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              if (onConfirm(code)) setCode('');
            }}
          >
            {t('scf_confirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
