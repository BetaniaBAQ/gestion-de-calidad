import path from 'node:path'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig(({ mode }) => {
  const envDir = path.resolve(__dirname, '../..')

  // Carga TODAS las vars del .env.local (prefijo '' = sin filtro) en process.env.
  // Necesario porque Vite solo expone VITE_* al bundle; las vars de servidor
  // deben estar en process.env para que el SSR las lea.
  const envVars = loadEnv(mode, envDir, '')
  Object.assign(process.env, envVars)

  return {
    envDir,
    plugins: [
      tsconfigPaths({ projects: ['./tsconfig.json'] }),
      tailwindcss(),
      tanstackStart(),
      nitro({ preset: 'vercel' }),
      viteReact(),
    ],
  }
})
