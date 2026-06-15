import * as React from 'react';
import { cn } from '../lib/utils';

export type CatTab = {
  key: string;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
};

/** Kategori sekmeleri — müşteri / temsilci / sistem filtreleri */
export function CatTabs({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: CatTab[];
  value: string;
  onChange: (key: string) => void;
  className?: string;
}) {
  if (tabs.length <= 2) return null;

  return (
    <div className={cn(className)} style={{ marginBottom: 12 }}>
      <div className="cat-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={cn('cat-tab', value === tab.key && 'on', tab.disabled && 'dis')}
            onClick={() => !tab.disabled && onChange(tab.key)}
            disabled={tab.disabled}
          >
            {tab.label}
            {tab.count != null && <span className="ct-count">{tab.count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
