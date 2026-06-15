/* ──────────────────────────────────────────────────────
 *  Tablo hücre formatlama + CSV dışa aktarma (tek kaynak).
 *  DynamicTable hücre render'ı ve export aynı util'i kullanır.
 * ────────────────────────────────────────────────────── */
import type { ColumnConfig, TranslateFn } from './types';

export interface FormatOptions {
  /** 'tr' | 'en' — sayı/tarih yerelleştirmesi */
  locale?: string;
  /** boolean etiketleri için (Evet/Hayır) */
  t?: TranslateFn;
}

function localeTag(locale?: string): string {
  return locale && locale.toLowerCase().startsWith('en') ? 'en-US' : 'tr-TR';
}

export function formatCellValue(value: unknown, format?: string, opts?: FormatOptions): string {
  if (value == null) return '—';
  const tag = localeTag(opts?.locale);
  switch (format) {
    case 'date': {
      const d = new Date(String(value));
      return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(tag);
    }
    case 'datetime': {
      const d = new Date(String(value));
      return Number.isNaN(d.getTime())
        ? String(value)
        : d.toLocaleString(tag, {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          });
    }
    case 'currency':
      return typeof value === 'number'
        ? value.toLocaleString(tag, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : String(value);
    case 'boolean': {
      const t = opts?.t;
      const yes = t ? t('common_yes', 'Evet') : 'Evet';
      const no = t ? t('common_no', 'Hayır') : 'Hayır';
      return value ? yes : no;
    }
    default:
      return String(value);
  }
}

/** Kolon config + satırlar → CSV indir (BOM + RFC-4180 kaçışlama). */
export function exportTableCsv(
  columns: ColumnConfig[],
  data: Record<string, unknown>[],
  filename: string,
  opts?: FormatOptions,
): void {
  const exportCols = columns.filter((c) => !c.excludeFromExport && c.key !== 'actions');
  const header = exportCols.map((c) => `"${c.title.replace(/"/g, '""')}"`).join(',');
  const rows = data.map((row) =>
    exportCols
      .map((c) => {
        const formatted = formatCellValue(row[c.dataIndex], c.format, opts);
        return `"${formatted.replace(/"/g, '""')}"`;
      })
      .join(','),
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
