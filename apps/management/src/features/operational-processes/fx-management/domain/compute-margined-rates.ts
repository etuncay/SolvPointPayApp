import type { FxMarginRow } from './types';

type MarginFields = Pick<
  FxMarginRow,
  'buyFixedMargin' | 'buyVariableMarginPct' | 'sellFixedMargin' | 'sellVariableMarginPct' | 'roundingDecimals'
>;

export function roundFx(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function computeMarginedBuy(buy: number, margin: MarginFields): number {
  const raw = buy - margin.buyFixedMargin - (buy * margin.buyVariableMarginPct) / 100;
  return roundFx(raw, margin.roundingDecimals);
}

export function computeMarginedSell(sell: number, margin: MarginFields): number {
  const raw = sell + margin.sellFixedMargin + (sell * margin.sellVariableMarginPct) / 100;
  return roundFx(raw, margin.roundingDecimals);
}

export function computeMarginedPair(
  buy: number,
  sell: number,
  inside: MarginFields,
  outside: MarginFields,
): {
  marginedBuyInside: number;
  marginedSellInside: number;
  marginedBuyOutside: number;
  marginedSellOutside: number;
} {
  return {
    marginedBuyInside: computeMarginedBuy(buy, inside),
    marginedSellInside: computeMarginedSell(sell, inside),
    marginedBuyOutside: computeMarginedBuy(buy, outside),
    marginedSellOutside: computeMarginedSell(sell, outside),
  };
}
