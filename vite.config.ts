import react from '@vitejs/plugin-react'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import dts from 'vite-plugin-dts'
import { defineConfig } from 'vite'

const path = require('path')

export default defineConfig({
  build: {
    target: 'esnext',
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'mui-admin',
      fileName: format => `mui-admin.${format}.js`
    },
    rollupOptions: {
      output: {
        sourcemapExcludeSources: true,
        globals: {
          react: 'React',
          'react/jsx-runtime': 'jsxRuntime',
          '@mui/material/Box': 'Box',
          '@mui/material/TextField': 'TextField',
          '@mui/material/styles': 'styles',
        }
      }
    }
  },
  plugins: [
    peerDepsExternal(),
    dts({
      exclude: ['src/components/**/*'],
      insertTypesEntry: true
    }),
    react()
  ]
})
