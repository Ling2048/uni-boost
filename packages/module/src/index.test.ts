import { describe, it, expect } from 'vitest';
import { createUniBoostPlugins } from './index';

describe('createUniBoostPlugins', () => {
  it('should create plugins with default config', async () => {
    const plugins = await createUniBoostPlugins();
    expect(plugins).toBeDefined();
    expect(Array.isArray(plugins)).toBe(true);
  });

  it('should create plugins with custom config', async () => {
    const config = {
      logLevel: 'info' as const,
      enableVirtualModules: true,
      enableVueIntegration: false
    };
    
    const plugins = await createUniBoostPlugins(config);
    expect(plugins).toBeDefined();
    expect(Array.isArray(plugins)).toBe(true);
  });

  it('should handle empty config', async () => {
    const plugins = await createUniBoostPlugins({});
    expect(plugins).toBeDefined();
    expect(Array.isArray(plugins)).toBe(true);
  });
});