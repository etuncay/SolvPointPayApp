import { useTranslation } from 'react-i18next';
import {
  Checkbox,
  FormCard,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
} from '@epay/ui';
import type { SecurityChecks } from '../domain/types';
import { ApprovalOtpDemoHint } from './approval-otp-demo-hint';

type Props = {
  editable: boolean;
  requiresAuthority: boolean;
  otp: string;
  checks: SecurityChecks;
  onOtpChange: (otp: string) => void;
  onChecksChange: (checks: SecurityChecks) => void;
};

function CheckRow({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: disabled ? 'default' : 'pointer' }}>
      <Checkbox checked={checked} disabled={disabled} onCheckedChange={(v) => onChange(v === true)} />
      <span style={{ fontSize: 13 }}>{label}</span>
    </label>
  );
}

/** §5 Güvenlik paneli — Onay Modu'nda düzenlenebilir, Detay Modu'nda salt-okunur. */
export function SecurityPanel({
  editable,
  requiresAuthority,
  otp,
  checks,
  onOtpChange,
  onChecksChange,
}: Props) {
  const { t } = useTranslation();
  const set = (patch: Partial<SecurityChecks>) => onChecksChange({ ...checks, ...patch });

  return (
    <FormCard id="sec-security" title={t('ag_cf_panel_security')}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="form-grp">
          <label>{t('ag_cf_otp')}</label>
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={otp}
            onChange={onOtpChange}
            disabled={!editable}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {editable ? <ApprovalOtpDemoHint onUseCode={onOtpChange} /> : null}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <CheckRow
            label={t('ag_cf_chk_identity')}
            checked={checks.identityChecked}
            disabled={!editable}
            onChange={(v) => set({ identityChecked: v })}
          />
          <CheckRow
            label={t('ag_cf_chk_photo')}
            checked={checks.photoMatched}
            disabled={!editable}
            onChange={(v) => set({ photoMatched: v })}
          />
          {requiresAuthority && (
            <CheckRow
              label={t('ag_cf_chk_authority')}
              checked={checks.authorityChecked}
              disabled={!editable}
              onChange={(v) => set({ authorityChecked: v })}
            />
          )}
          <CheckRow
            label={t('ag_cf_chk_no_suspicion')}
            checked={checks.noSuspicion}
            disabled={!editable}
            onChange={(v) => set({ noSuspicion: v })}
          />
        </div>
      </div>
    </FormCard>
  );
}
