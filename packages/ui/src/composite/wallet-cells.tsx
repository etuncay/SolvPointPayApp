import * as React from 'react';
import {
  Building2,
  ChartLine,
  Key,
  Shield,
  TriangleAlert,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';

export type WalletCategory = 'customer' | 'agent' | 'system';

export type WalletTypeCode =
  | 'customer_main'
  | 'customer_savings'
  | 'agent_advance'
  | 'agent_commission'
  | 'system_reserve'
  | 'system_revenue'
  | 'system_suspense'
  | 'system_settlement';

export const WALLET_TYPE_META: Record<
  WalletTypeCode,
  { iconCls: string; Icon: LucideIcon }
> = {
  customer_main: { iconCls: 'cust', Icon: Wallet },
  customer_savings: { iconCls: 'savg', Icon: Wallet },
  agent_advance: { iconCls: 'adv', Icon: Building2 },
  agent_commission: { iconCls: 'com', Icon: Wallet },
  system_reserve: { iconCls: 'res', Icon: Shield },
  system_revenue: { iconCls: 'rev', Icon: ChartLine },
  system_suspense: { iconCls: 'sus', Icon: TriangleAlert },
  system_settlement: { iconCls: 'set', Icon: Key },
};

/** Hesap tipi hücresi — ikon + etiket */
export function WalletTypeCell({ type, label }: { type: WalletTypeCode; label: string }) {
  const meta = WALLET_TYPE_META[type] ?? WALLET_TYPE_META.customer_main;
  const Icon = meta.Icon;
  return (
    <div className="wt-cell">
      <div className={cn('ic', meta.iconCls)}>
        <Icon size={12} />
      </div>
      <span>{label}</span>
    </div>
  );
}

/** Kategori rozeti — müşteri / temsilci / sistem */
export function WalletCatBadge({ cat, label }: { cat: WalletCategory; label: string }) {
  return <span className={cn('cat-badge', cat)}>{label}</span>;
}

/** Para tutarı hücresi */
export function WalletMoneyCell({
  amount,
  currency,
  lang,
  big,
}: {
  amount: number;
  currency?: string;
  lang: string;
  big?: boolean;
}) {
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  const cls = amount < 0 ? 'neg' : amount === 0 ? 'zero' : '';

  return (
    <span className={cn('wl-amount', cls, big && 'big')}>
      {formatted}
      {currency ? <span className="ccy">{currency}</span> : null}
    </span>
  );
}

/** Bloke miktarı hücresi */
export function WalletBlockedCell({
  blocked,
  currency,
  lang,
  fullBlockLabel,
}: {
  blocked: number;
  currency: string;
  lang: string;
  fullBlockLabel: string;
}) {
  if (blocked === -1) return <span className="blk-cell full">{fullBlockLabel}</span>;
  if (blocked > 0) {
    const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
    const formatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(blocked);
    return (
      <span className="blk-cell part">
        {formatted}
        <span className="t-mute fs-11" style={{ marginLeft: 2 }}>
          {currency}
        </span>
      </span>
    );
  }
  return <span className="blk-cell none">0</span>;
}
