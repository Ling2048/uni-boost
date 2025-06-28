declare module 'vitest/config' {
  export interface UserConfig {
    test?: {
      globals?: boolean;
      environment?: string;
      include?: string[];
      coverage?: {
        provider?: string;
        reporter?: string[];
      };
    };
  }
  export function defineConfig(config: UserConfig): UserConfig;
}