import path from 'node:path'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const isVercel = !!process.env.VERCEL

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, '../..')
  const envVars = loadEnv(mode, envDir, '')
  Object.assign(process.env, envVars)

  return {
    envDir,
    ssr: isVercel
      ? { noExternal: true }
      : { noExternal: ['@cualia/convex', '@cualia/ui'] },
    plugins: [
      tsconfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
      tanstackStart({ srcDirectory: 'src' }),
      nitro({ preset: 'vercel' }),
      viteReact(),
    ],
  }
})
