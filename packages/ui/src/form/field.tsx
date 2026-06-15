import * as React from 'react';
import { CircleAlert, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  col = 1,
  locked,
  lockReason,
  changed,
  diffNode,
  children,
  className,
}: {
  label: string;
  /** Kontrolün id'si — label ile ilişkilendirir (a11y) */
  htmlFor?: string;
  required?: boolean;
  hint?: string | null;
  error?: string;
  col?: 1 | 2 | 3 | 4;
  locked?: boolean;
  lockReason?: string;
  /** Onay/inceleme görünümünde değişen alan — kırmızı vurgu */
  changed?: boolean;
  /** Değişen alanın "Eski: …" satırı (changed true ise gösterilir) */
  diffNode?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'field',
        `col-${col}`,
        locked && 'locked',
        error && 'has-error',
        changed && 'has-diff',
        className,
      )}
    >
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className="req">*</span>}
        {changed && <span className="diff-tag">●</span>}
        {locked && (
          <span className="lock" title={lockReason}>
            <Lock size={10} />
            KPS
          </span>
        )}
      </label>
      {children}
      {changed && diffNode}
      {hint && <span className="hint">{hint}</span>}
      {error && (
        <span className="err" role="alert">
          <CircleAlert size={12} />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}
