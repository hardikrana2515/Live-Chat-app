import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // Whether to polyfill `global` variable
      global: true,
      // Whether to polyfill `process` variable
      process: true,
      // Whether to polyfill `Buffer` variable
      buffer: true,
    }),
  ],
  define: {
    // By default, Vite doesn't include shims for NodeJS/Globals
    // simple-peer requires global object
    global: 'globalThis',
  },
})
