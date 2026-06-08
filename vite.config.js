/**
 * Input Translation
 * Copyright (C) 2026 kelin
 */

import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
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
          { src: '_locales', dest: '.' },
          { src: 'scripts/content.js', dest: 'scripts' },
          { src: 'scripts/panel.js', dest: 'scripts' },
          { src: 'popup/popup.js', dest: 'popup' },
          { src: 'popup/popup.css', dest: 'popup' }
        ],
      }),
    ],
  };
});

