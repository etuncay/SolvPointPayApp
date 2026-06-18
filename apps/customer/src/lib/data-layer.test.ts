import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const configureDataLayer = vi.fn();
const initMockDataLayer = vi.fn().mockResolvedValue(undefined);
const getActiveDataDriver = vi.fn(() => 'dexie' as const);

vi.mock('@epay/data', () => ({
  configureDataLayer,
  initMockDataLayer,
  getActiveDataDriver,
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

describe('shouldPrefillLoginDemo', () => {
  beforeEach(() => {
    getActiveDataDriver.mockReturnValue('dexie');
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('dexie + dev → prefill', async () => {
    vi.stubEnv('PROD', false);
    const { shouldPrefillLoginDemo } = await import('./data-layer');
    expect(shouldPrefillLoginDemo()).toBe(true);
  });

  it('dexie + prod build → no prefill', async () => {
    vi.stubEnv('PROD', true);
    const { shouldPrefillLoginDemo } = await import('./data-layer');
    expect(shouldPrefillLoginDemo()).toBe(false);
  });

  it('http + dev → no prefill', async () => {
    getActiveDataDriver.mockReturnValue('http');
    vi.stubEnv('PROD', false);
    const { shouldPrefillLoginDemo } = await import('./data-layer');
    expect(shouldPrefillLoginDemo()).toBe(false);
  });
});

describe('getSettingsEnvironmentKind', () => {
  beforeEach(() => {
    getActiveDataDriver.mockReturnValue('dexie');
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('dexie → demo', async () => {
    const { getSettingsEnvironmentKind } = await import('./data-layer');
    expect(getSettingsEnvironmentKind()).toBe('demo');
  });

  it('http + dev → staging', async () => {
    getActiveDataDriver.mockReturnValue('http');
    vi.stubEnv('PROD', false);
    const { getSettingsEnvironmentKind } = await import('./data-layer');
    expect(getSettingsEnvironmentKind()).toBe('staging');
  });

  it('http + prod → hidden', async () => {
    getActiveDataDriver.mockReturnValue('http');
    vi.stubEnv('PROD', true);
    const { getSettingsEnvironmentKind } = await import('./data-layer');
    expect(getSettingsEnvironmentKind()).toBe(null);
  });
});
