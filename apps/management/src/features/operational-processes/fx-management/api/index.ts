import { mockFxAdapter } from './mock-fx-adapter';

export const fxService = mockFxAdapter;

export type { FxService } from './fx-service';
export { getEffectiveRate, type EffectiveRateCurrency } from '../domain/get-effective-rate';
