/**
 * KVKK: TCKN ve kart numarası girişini engelle.
 * Boşluklar atıldıktan sonra; 11+ ardışık rakam dizisi (harfe bitişik olsa da, ör.
 * "Odeme12345678901ref") veya tire ile gruplanmış kart numarası yakalanır.
 */
const SENSITIVE_PATTERN = /\d{11,}|(?:\d{4}-?){3}\d{4}/;

export function trimInput(value: string): string {
  return value.trim();
}

export function hasSensitiveData(value: string): boolean {
  return SENSITIVE_PATTERN.test(value.replace(/\s/g, ''));
}

export function validateFreeText(value: string): string | null {
  const t = trimInput(value);
  if (t && hasSensitiveData(t)) {
    return 'Bu alana kimlik veya kart numarası girilemez.';
  }
  return null;
}

export function validateAmount(
  amount: number,
  balance: number,
  dailyLimit: number,
): string | null {
  if (amount <= 0) return 'Tutar sıfırdan büyük olmalıdır.';
  if (amount > balance) return 'Yetersiz bakiye.';
  if (amount > dailyLimit) return 'Günlük limit aşıldı.';
  return null;
}
