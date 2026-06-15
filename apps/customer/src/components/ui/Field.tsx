import type { ReactNode } from 'react';

export function Field({
  label,
  required,
  hint,
  full,
  children,
}: {
  label?: string;
  required?: boolean;
  hint?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`field${full ? ' full' : ''}`}>
      {label && (
        <label className="label">
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}
