type ShareholderLike = {
  refNo: string;
  startDate: string;
  endDate: string;
};

/** İki tarih aralığı çakışıyor mu — boş endDate açık uçlu (sonsuz) kabul edilir. Spec §6 */
function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const aFrom = aStart || '0000-01-01';
  const aTo = aEnd || '9999-12-31';
  const bFrom = bStart || '0000-01-01';
  const bTo = bEnd || '9999-12-31';
  return aFrom <= bTo && bFrom <= aTo;
}

/**
 * Aynı kişi (refNo) aynı tüzelde çakışan tarihlerde birden fazla ortak satırı olamaz.
 * Çakışan ilk satır indeksini döner; çakışma yoksa null.
 */
export function findShareholderOverlap(shareholders: ShareholderLike[]): number | null {
  for (let i = 0; i < shareholders.length; i += 1) {
    const a = shareholders[i];
    if (!a.refNo.trim()) continue;
    for (let j = i + 1; j < shareholders.length; j += 1) {
      const b = shareholders[j];
      if (a.refNo.trim() !== b.refNo.trim()) continue;
      if (rangesOverlap(a.startDate, a.endDate, b.startDate, b.endDate)) {
        return j;
      }
    }
  }
  return null;
}
