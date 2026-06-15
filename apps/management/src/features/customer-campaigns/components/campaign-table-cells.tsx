type TruncateCellProps = {
  value: string | null | undefined;
  /** Boş değer gösterimi */
  empty?: string;
  className?: string;
};

/** Metin hücresi — tek satır, taşan kısım … ile kesilir; hover'da tam metin */
export function TruncateCell({ value, empty = '—', className }: TruncateCellProps) {
  const text = value?.trim() ? value.trim() : empty;
  const showTitle = text !== empty;

  return (
    <span className={className ? `ccm-truncate ${className}` : 'ccm-truncate'} title={showTitle ? text : undefined}>
      {text}
    </span>
  );
}

/** Tarih hücresi — tek satır, kırılmaz */
export function DateCell({ value }: { value: string | null | undefined }) {
  const text = value?.trim() ? value.trim() : '—';

  return (
    <span className="ccm-date mono fs-12" title={text !== '—' ? text : undefined}>
      {text}
    </span>
  );
}
