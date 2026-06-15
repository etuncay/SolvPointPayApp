import * as React from 'react';
import { Avatar } from '../primitives/avatar';
import { Pill } from '../primitives/pill';
import { cn } from '../lib/utils';

export type CustomerAvatarVariant = 'corp' | 'pros' | 'indv-f' | 'indv-m';

/** Müşteri avatarı — baş harfler */
export function CustomerAvatar({
  initials,
  variant = 'indv-m',
  size = 26,
  className,
}: {
  initials: string;
  variant?: CustomerAvatarVariant;
  size?: number;
  className?: string;
}) {
  return (
    <Avatar variant={variant} size={size} className={className}>
      {initials}
    </Avatar>
  );
}

export function customerInitials(
  name: string,
  type: 'individual' | 'corporate' | 'prospective',
): string {
  if (type === 'corporate') {
    return name
      .split(/\s+/)
      .filter((w) => w.length > 1 && !/^(A\.Ş\.|Ltd\.|Şti\.|Koop\.)$/.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  }
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function customerAvatarVariant(
  type: 'individual' | 'corporate' | 'prospective',
  isFemale?: boolean,
): CustomerAvatarVariant {
  if (type === 'corporate') return 'corp';
  if (type === 'prospective') return 'pros';
  return isFemale ? 'indv-f' : 'indv-m';
}

/** Ad + şehir hücresi */
export function CustomerNameCell({
  name,
  city,
  avatar,
}: {
  name: string;
  city: string;
  avatar: React.ReactNode;
}) {
  return (
    <span className="cust-cell">
      {avatar}
      <span className="meta-2">
        <b>{name}</b>
        <span>{city}</span>
      </span>
    </span>
  );
}

/** E-posta + telefon */
export function ContactCell({ email, phone }: { email: string; phone: string }) {
  return (
    <span className="contact-cell">
      <b>{email}</b>
      <span>{phone}</span>
    </span>
  );
}

/** Kimlik no + tür rozeti */
export function IdNoCell({ idKind, idNo }: { idKind: string; idNo: string }) {
  return (
    <span className="idno">
      <span className="kind">{idKind}</span>
      <span className="mono">{idNo}</span>
    </span>
  );
}

/** Müşteri tipi rozeti */
export function CustomerTypeBadge({
  type,
  labels,
}: {
  type: 'individual' | 'corporate' | 'prospective';
  labels: { individual: string; corporate: string; prospective: string };
}) {
  if (type === 'corporate') return <Pill tone="corp">{labels.corporate}</Pill>;
  if (type === 'prospective') return <Pill tone="pros">{labels.prospective}</Pill>;
  return <Pill tone="indv">{labels.individual}</Pill>;
}

/** KYC — bireysel kyc_level / tüzel approval_status */
export function CustomerKycPill({
  kyc,
  customerType,
}: {
  kyc: string;
  customerType: 'individual' | 'corporate' | 'prospective';
}) {
  if (customerType === 'corporate') {
    const tone =
      kyc === 'Approved' ? 'ok' : kyc === 'Rejected' ? 'rejected' : 'pending';
    return <Pill tone={tone}>{kyc}</Pill>;
  }
  const tone =
    kyc === 'L3' ? 'l3' : kyc === 'L2' ? 'l2' : kyc === 'L1' ? 'l1' : 'l0';
  return <Pill tone={tone}>{kyc}</Pill>;
}

/** Risk skoru + segment çubuğu */
export function CustomerRiskCell({
  score,
  segment,
  segmentLabel,
}: {
  score: number;
  segment: 'low' | 'med' | 'high' | 'critical';
  segmentLabel: string;
}) {
  const w = Math.max(2, score);
  return (
    <div className="risk">
      <div className={cn('risk-bar', segment)}>
        <span style={{ width: `${w}%` }} />
      </div>
      <span className="risk-num">{score}</span>
      <span className={cn('risk-seg', segment)}>{segmentLabel}</span>
    </div>
  );
}

/** entity_status + gerekçe (§5) */
export function CustomerStatusPill({
  status,
  label,
  reason,
}: {
  status: string;
  label: string;
  reason?: string | null;
}) {
  return (
    <span className="status-cell">
      <span className={cn('st', status)}>
        {label}
        {reason ? ` – ${reason}` : ''}
      </span>
    </span>
  );
}
