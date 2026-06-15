const LATENCY_MS = { min: 120, max: 280 };

/** Ağ gecikmesi simülasyonu */
export function simulateNetworkLatency(): Promise<void> {
  const ms = LATENCY_MS.min + Math.random() * (LATENCY_MS.max - LATENCY_MS.min);
  return new Promise((r) => setTimeout(r, ms));
}
