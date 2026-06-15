import { SecurityPanel } from './security-panel';
import type { SecurityChecks } from '../domain/types';

type SecurityValue = { otp: string; checks: SecurityChecks };

type Props = {
  value?: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
  componentProps?: {
    editable?: boolean;
    requiresAuthority?: boolean;
  };
};

/** DynamicForm CustomComponent — OTP ve güvenlik onay kutuları. */
export function ConfirmationSecurityField({ value, onChange, disabled, componentProps }: Props) {
  const current = (value as SecurityValue | undefined) ?? { otp: '', checks: { identityChecked: false, photoMatched: false, authorityChecked: false, noSuspicion: false } };
  const editable = componentProps?.editable ?? !disabled;

  return (
    <SecurityPanel
      editable={editable}
      requiresAuthority={componentProps?.requiresAuthority ?? false}
      otp={current.otp}
      checks={current.checks}
      onOtpChange={(otp) => onChange({ ...current, otp })}
      onChecksChange={(checks) => onChange({ ...current, checks })}
    />
  );
}
