import type { SenderLookupResult } from '@/features/agent-transactions/domain/customer-lookup';
import { SenderCard } from './sender-card';

type Props = {
  value?: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
};

/** DynamicForm CustomComponent — gönderen profil kartı. */
export function TransferSenderCardField({ value, onChange }: Props) {
  const sender = value as SenderLookupResult | null | undefined;
  if (!sender) return null;
  return <SenderCard sender={sender} onChange={() => onChange(null)} />;
}
