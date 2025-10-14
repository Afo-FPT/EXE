import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  server: {
    port: 5000,
    host: true
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './app.js',
      exportName: 'viteNodeApp',
      tsCompiler: 'esbuild'
    })
  ],
  optimizeDeps: {
    exclude: [
      '@vitejs/plugin-vue',
      'vite-plugin-node'
    ]
  }
}) 