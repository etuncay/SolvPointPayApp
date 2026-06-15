import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const configureDataLayer = vi.fn();
const initMockDataLayer = vi.fn().mockResolvedValue(undefined);

vi.mock('@epay/data', () => ({
  configureDataLayer,
  initMockDataLayer,
}));

describe('bootstrapDataLayer', () => {
  beforeEach(() => {
    configureDataLayer.mockClear();
    initMockDataLayer.mockClear();
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('http + apiBaseUrl → configureDataLayer', async () => {
    vi.stubEnv('VITE_DATA_DRIVER', 'http');
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.test');
    const { bootstrapDataLayer } = await import('./data-layer');
    await bootstrapDataLayer();
    expect(configureDataLayer).toHaveBeenCalledWith({
      driver: 'http',
      apiBaseUrl: 'http://api.test',
    });
    expect(initMockDataLayer).not.toHaveBeenCalled();
  });

  it('http without base → dexie fallback', async () => {
    vi.stubEnv('VITE_DATA_DRIVER', 'http');
    vi.stubEnv('VITE_API_BASE_URL', '');
    const { bootstrapDataLayer } = await import('./data-layer');
    await bootstrapDataLayer();
    expect(configureDataLayer).not.toHaveBeenCalled();
    expect(initMockDataLayer).toHaveBeenCalled();
  });

  it('varsayılan → initMockDataLayer', async () => {
    const { bootstrapDataLayer } = await import('./data-layer');
    await bootstrapDataLayer();
    expect(configureDataLayer).not.toHaveBeenCalled();
    expect(initMockDataLayer).toHaveBeenCalled();
  });
});
