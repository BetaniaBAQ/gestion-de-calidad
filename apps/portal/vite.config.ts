import path from 'node:path'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'

const isVercel = !!process.env.VERCEL

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, '../..')
  const envVars = loadEnv(mode, envDir, '')
  Object.assign(process.env, envVars)

  return {
    envDir,
    resolve: {
      tsconfigPaths: true,
      alias: {
        tslib: 'tslib/tslib.es6.mjs',
      },
    },
    ssr: isVercel
      ? { noExternal: true }
      : { noExternal: ['@cualia/convex', '@cualia/ui'] },
    plugins: [
      tailwindcss(),
      tanstackStart({ srcDirectory: 'src' }),
      nitro({ preset: 'vercel' }),
      viteReact(),
    ],
  }
})
