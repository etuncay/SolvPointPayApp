import { CustomerAvatar, customerInitials, type CustomerAvatarVariant } from '@epay/ui';
import { isCorporatePartyName } from '../domain/transaction-type-spec';

function avatarVariant(name: string): CustomerAvatarVariant {
  return isCorporatePartyName(name) ? 'corp' : 'indv-m';
}

/** Gönderen / alıcı — avatar + ad (referans cust-cell). */
export function PartyCell({ name }: { name: string }) {
  const corp = isCorporatePartyName(name);
  const initials = customerInitials(name, corp ? 'corporate' : 'individual');
  return (
    <span className="cust-cell">
      <CustomerAvatar initials={initials} variant={avatarVariant(name)} size={24} />
      <span className="meta-2">
        <b style={{ maxWidth: 150, fontWeight: 600 }}>{name}</b>
      </span>
    </span>
  );
}
