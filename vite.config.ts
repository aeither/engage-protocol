import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
      // Include specific polyfills for Metaplex
      include: [
        'buffer',
        'process',
        'crypto',
        'stream',
        'util',
        'events',
        'string_decoder',
        'url',
        'querystring',
        'path',
        'os',
        'fs',
        'http',
        'https',
        'zlib',
        'assert',
        'constants',
        'timers',
        'tty',
        'vm',
        'punycode'
      ],
      // Globals for browser compatibility
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    })
  ],
  server: {
    allowedHosts: true,
  },
  define: {
    global: "globalThis",
    'process.env': {},
    'process.browser': true,
  },
  optimizeDeps: {
    exclude: ['pg'],
    include: [
      'buffer',
      'process',
      'crypto-browserify',
      'readable-stream',
      'browserify-sign'
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/eventemitter3/, /node_modules/],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      buffer: 'buffer',
      process: 'process/browser',
      crypto: 'crypto-browserify',
      stream: 'readable-stream',
      util: 'util',
      events: 'events',
      string_decoder: 'string_decoder',
      url: 'url',
      querystring: 'querystring-es3',
      path: 'path-browserify',
      os: 'os-browserify/browser',
      fs: 'browserify-fs',
      http: 'stream-http',
      https: 'https-browserify',
      zlib: 'browserify-zlib',
      assert: 'assert',
      constants: 'constants-browserify',
      timers: 'timers-browserify',
      tty: 'tty-browserify',
      vm: 'vm-browserify',
      punycode: 'punycode',
    },
  },
});
