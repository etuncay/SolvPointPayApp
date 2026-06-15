import {
  CustomerAvatar as UiAvatar,
  customerAvatarVariant,
  customerInitials,
} from '@epay/ui';
import type { CustomerListItem } from './types';

export function CustomerAvatar({ customer: c, size = 26 }: { customer: CustomerListItem; size?: number }) {
  return (
    <UiAvatar
      initials={customerInitials(c.name, c.type)}
      variant={customerAvatarVariant(c.type, c.isFemale)}
      size={size}
    />
  );
}
