// Vue 相关导出
export { default as moduleHookManager, ModuleHookManagerImpl } from './module-hook/index.js';
export type { 
  ModuleHookManager, 
  ModuleHookStats, 
  ModuleHookManagerOptions 
} from './module-hook/index.js';

export { 
  default as createVueModuleHookPlugin,
  createModuleHookDecorator,
  useModuleHooks
} from './module-hook/plugin.js';
export type { VueModuleHookPluginOptions } from './module-hook/plugin.js';

export { default as Hook } from './module-hook/hook.js';
export type { HookOptions } from './module-hook/hook.js';