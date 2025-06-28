import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    onwarn(warning, warn) {
      // 忽略 TypeScript 项目文件列表警告
      if (warning.code === 'PLUGIN_WARNING' && warning.message.includes('TS6307')) {
        return;
      }
      warn(warning);
    },
    output: [
      {
        dir: 'dist',
        entryFileNames: '[name].cjs',
        format: 'cjs',
        sourcemap: true,
      },
      {
        dir: 'dist',
        entryFileNames: '[name].mjs',
        format: 'es',
        sourcemap: true,
      }
    ],
    plugins: [
      json(),
      nodeResolve({
        preferBuiltins: false
      }),
      commonjs({
        exclude: ['node_modules/**']
      }),
      typescript({ 
        tsconfig: './tsconfig.json',
        outputToFilesystem: false,
        compilerOptions: {
          skipLibCheck: true,
          noEmitOnError: false
        }
      }),
    ],
    external: (id) => {
      // Node.js 内置模块
      if (id.startsWith('node:')) {
        return true;
      }
      // 允许lodash-es被打包以启用tree shaking
      if (id.includes('lodash-es')) {
        return false;
      }
      // 排除其他node_modules依赖
      if (/node_modules/.test(id)) {
        return true;
      }
      // 排除特定的外部依赖
      return ['vite', 'vite-plugin-static-copy', 'fsevents'].includes(id);
    }
  },
];