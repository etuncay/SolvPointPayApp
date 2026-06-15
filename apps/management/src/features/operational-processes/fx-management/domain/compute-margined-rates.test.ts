import { describe, expect, it } from 'vitest';
import { computeMarginedBuy, computeMarginedSell } from './compute-margined-rates';

const margin = {
  buyFixedMargin: 0.05,
  buyVariableMarginPct: 1,
  sellFixedMargin: 0.1,
  sellVariableMarginPct: 0.5,
  roundingDecimals: 4,
};

describe('compute-margined-rates', () => {
  it('§20 #1 — marjlı alış/satış formülü ve yuvarlama sırası', () => {
    const buy = 34.5;
    const sell = 34.8;
    expect(computeMarginedBuy(buy, margin)).toBe(34.105);
    expect(computeMarginedSell(sell, margin)).toBe(35.074);
  });

  it('negatif marj kabul edilir', () => {
    const neg = {
      ...margin,
      buyFixedMargin: -0.02,
      buyVariableMarginPct: 0,
      sellFixedMargin: -0.01,
      sellVariableMarginPct: 0,
    };
    expect(computeMarginedBuy(10, neg)).toBe(10.02);
  });
});
