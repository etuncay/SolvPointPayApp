// CSV dışa aktarma yardımcıları.
// Excel (özellikle Türkçe yerel ayar) ile uyumlu olması için:
//  - UTF-8 BOM eklenir (Türkçe karakterler doğru görünür),
//  - alan ayracı olarak noktalı virgül (";") kullanılır.

export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

function escapeCell(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  // Ayraç, tırnak veya satır sonu içeren alanlar tırnak içine alınır.
  if (/[";\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const head = columns.map((c) => escapeCell(c.header)).join(';');
  const body = rows
    .map((row) => columns.map((c) => escapeCell(c.value(row))).join(';'))
    .join('\r\n');
  return body ? `${head}\r\n${body}` : head;
}

export function downloadCsv(filename: string, csv: string): void {
  // \uFEFF = UTF-8 BOM (Excel'in Türkçe karakterleri doğru açması için).
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Tarayıcının indirmeyi başlatmasına izin verdikten sonra serbest bırak.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Dosya adı için YYYY-MM-DD biçiminde bugünün tarihi. */
export function todayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

export function exportCsv<T>(baseName: string, rows: T[], columns: CsvColumn<T>[]): void {
  downloadCsv(`${baseName}_${todayStamp()}.csv`, buildCsv(rows, columns));
}
