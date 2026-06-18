/**
 * KVKK: TCKN ve kart numarası girişini engelle.
 * Boşluklar atıldıktan sonra; 11+ ardışık rakam dizisi (harfe bitişik olsa da, ör.
 * "Odeme12345678901ref") veya tire ile gruplanmış kart numarası yakalanır.
 */
const SENSITIVE_PATTERN = /\d{11,}|(?:\d{4}-?){3}\d{4}/;

/** i18n — `validation_no_sensitive_data` */
export const SENSITIVE_DATA_I18N_KEY = 'validation_no_sensitive_data';

export const AMOUNT_ZERO_I18N_KEY = 'validation_amount_zero';
export const AMOUNT_BALANCE_I18N_KEY = 'validation_insufficient_balance';
export const AMOUNT_LIMIT_I18N_KEY = 'validation_daily_limit_exceeded';

export function trimInput(value: string): string {
  return value.trim();
}

export function hasSensitiveData(value: string): boolean {
  return SENSITIVE_PATTERN.test(value.replace(/\s/g, ''));
}

export function validateFreeText(value: string): typeof SENSITIVE_DATA_I18N_KEY | null {
  const t = trimInput(value);
  if (t && hasSensitiveData(t)) {
    return SENSITIVE_DATA_I18N_KEY;
  }
  return null;
}

/** İlk hassas veri içeren serbest metin alanını döner. */
export function firstFreeTextError(...values: string[]): typeof SENSITIVE_DATA_I18N_KEY | null {
  for (const value of values) {
    const err = validateFreeText(value);
    if (err) return err;
  }
  return null;
}

export function validateAmount(
  amount: number,
  balance: number,
  dailyLimit: number,
): string | null {
  if (amount <= 0) return AMOUNT_ZERO_I18N_KEY;
  if (amount > balance) return AMOUNT_BALANCE_I18N_KEY;
  if (amount > dailyLimit) return AMOUNT_LIMIT_I18N_KEY;
  return null;
}
