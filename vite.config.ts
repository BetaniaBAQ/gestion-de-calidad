import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      router: {
        // Esto garantiza que siempre busque desde la raíz del proyecto
        routesDirectory: fileURLToPath(new URL('./src/routes', import.meta.url)),
      },
    }),
  ],
})
