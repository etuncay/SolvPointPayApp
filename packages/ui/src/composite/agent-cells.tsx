import * as React from 'react';
import { Avatar } from '../primitives/avatar';
import { cn } from '../lib/utils';

export type AgentGroupKey = 'platinum' | 'gold' | 'silver' | 'bronze' | 'standard';

export type AgentGroup = {
  key: AgentGroupKey;
  label: string;
  commission: number;
};

export type AgentBalances = { TRY: number; USD: number; EUR: number };

export type SettlementFrequency = 'realtime' | 'daily' | 'weekly' | 'monthly';

/** Ticari unvan baş harfleri */
export function agentInitials(name: string): string {
  const words = name.split(/\s+/).filter((w) => w.length > 1 && !/^(A\.Ş\.|Ltd\.|Şti\.)$/.test(w));
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/** Temsilci adı + şehir / şube */
export function AgentNameCell({
  name,
  subtitle,
  initials,
}: {
  name: string;
  subtitle: string;
  initials: string;
}) {
  return (
    <span className="agent-cell">
      <span className="ic">
        <Avatar variant="corp" size={26}>
          {initials}
        </Avatar>
      </span>
      <span className="meta">
        <b>{name}</b>
        <span>{subtitle}</span>
      </span>
    </span>
  );
}

/** Temsilci grubu rozeti */
export function AgentGroupPill({ group }: { group: AgentGroup }) {
  return <span className={cn('grp-pill', group.key)}>{group.label}</span>;
}

/** TRY / USD / EUR avans bakiyeleri (§5) */
export function AgentBalanceCell({
  balance,
  lang,
  lowThreshold = 5000,
}: {
  balance: AgentBalances;
  lang: string;
  lowThreshold?: number;
}) {
  const locale = lang === 'tr' ? 'tr-TR' : 'en-US';
  const fmt = (n: number) =>
    new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

  const row = (ccy: keyof AgentBalances, amt: number) => {
    const cls =
      amt < 0 ? 'neg' : amt === 0 ? 'zero' : ccy === 'TRY' && amt < lowThreshold ? 'low' : '';
    return (
      <React.Fragment key={ccy}>
        <span className="ccy">{ccy}</span>
        <span className={cn('amt', cls)}>{fmt(amt)}</span>
      </React.Fragment>
    );
  };

  return (
    <div className="balance">
      {row('TRY', balance.TRY)}
      {row('USD', balance.USD)}
      {row('EUR', balance.EUR)}
    </div>
  );
}

/** Mahsuplaşma sıklığı */
export function SettlementFreqLabel({
  frequency,
  label,
}: {
  frequency: SettlementFrequency;
  label: string;
}) {
  return (
    <span className={cn('freq', frequency)}>
      <span className="dot" />
      {label}
    </span>
  );
}

/** entity_status + gerekçe */
export function AgentStatusPill({
  status,
  label,
  reason,
}: {
  status: string;
  label: string;
  reason?: string | null;
}) {
  return (
    <span className={cn('st', status)}>
      {label}
      {reason ? ` – ${reason}` : ''}
    </span>
  );
}
