import { useCallback, useEffect, useRef, useState } from 'react';
import { customerPortalApi, type CurrencyCode } from '@epay/data';
import { fxQuoteSecondsLeft, isFxQuoteExpired } from '@/lib/fx-quote';

export function useFxQuote(src: CurrencyCode, dst: CurrencyCode) {
  const sameCurrency = src === dst;
  const [rate, setRate] = useState(1);
  const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [secsLeft, setSecsLeft] = useState(0);
  const refreshGen = useRef(0);
  const loadingRef = useRef(false);
  const rateRef = useRef(1);

  const refresh = useCallback(async (): Promise<number> => {
    if (sameCurrency) {
      rateRef.current = 1;
      setRate(1);
      setExpiresAtMs(null);
      setSecsLeft(0);
      return 1;
    }
    const gen = ++refreshGen.current;
    loadingRef.current = true;
    setLoading(true);
    try {
      const quote = await customerPortalApi.getFxQuote(src, dst);
      if (gen !== refreshGen.current) return rateRef.current;
      const exp = new Date(quote.expiresAt).getTime();
      rateRef.current = quote.rate;
      setRate(quote.rate);
      setExpiresAtMs(exp);
      setSecsLeft(fxQuoteSecondsLeft(exp));
      return quote.rate;
    } finally {
      if (gen === refreshGen.current) {
        loadingRef.current = false;
        setLoading(false);
      }
    }
  }, [sameCurrency, src, dst]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (sameCurrency || expiresAtMs == null) {
      setSecsLeft(0);
      return;
    }

    const tick = () => {
      const left = fxQuoteSecondsLeft(expiresAtMs);
      setSecsLeft(left);
      if (left === 0 && isFxQuoteExpired(expiresAtMs) && !loadingRef.current) {
        void refresh();
      }
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sameCurrency, expiresAtMs, refresh]);

  const expired = !sameCurrency && isFxQuoteExpired(expiresAtMs);
  const stale = !sameCurrency && (expired || (secsLeft === 0 && !loading));

  return {
    rate: sameCurrency ? 1 : rate,
    secsLeft: sameCurrency ? 0 : secsLeft,
    loading,
    expired,
    stale,
    refresh,
  };
}
