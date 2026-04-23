/**
 * Input Translation
 * Copyright (C) 2026 kelin
 */

import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

export default defineConfig(({ mode }) => {
  // 显式加载 .env 文件
  const env = loadEnv(mode, process.cwd(), '');

  return {
    build: {
      outDir: 'dist',
      minify: 'esbuild',
      rollupOptions: {
        input: {
          background: resolve(__dirname, 'background.js'),
          popup: resolve(__dirname, 'popup/popup.html'),
        },
        output: {
          entryFileNames: (chunkInfo) => {
            return chunkInfo.name === 'background' ? '[name].js' : 'assets/[name]-[hash].js';
          },
        },
      },
    },
    plugins: [
      viteStaticCopy({
        targets: [
          { src: 'manifest.json', dest: '.' },
          { src: 'images', dest: '.' },
          { src: 'scripts/content.js', dest: 'scripts' },
          { src: 'scripts/panel.js', dest: 'scripts' },
          { src: 'popup/popup.js', dest: 'popup' },
          { src: 'popup/popup.css', dest: 'popup' }
        ],
      }),
      obfuscatorPlugin({
        include: ['background.js', 'scripts/**/*.js', 'popup/**/*.js'],
        exclude: [/node_modules/],
        apply: 'build',
        options: {
          compact: true,
          controlFlowFlattening: true, // 控制流平坦化
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true, // 注入死代码
          deadCodeInjectionThreshold: 0.4,
          identifierNamesGenerator: 'hexadecimal', // 变量名十六进制化
          renameGlobals: false,
          stringArray: true, // 字符串加密
          stringArrayEncoding: ['base64'], // 字符串 Base64 加密
          stringArrayThreshold: 0.75, // 75% 的字符串会被加密
          transformObjectKeys: true,
          unicodeEscapeSequence: false
        },
      }),
    ],
    define: {
      // 强制替换代码中的环境变量占位符
      'import.meta.env.VITE_BAIDU_APP_ID': JSON.stringify(env.VITE_BAIDU_APP_ID),
      'import.meta.env.VITE_BAIDU_KEY': JSON.stringify(env.VITE_BAIDU_KEY),
    }
  };
});

