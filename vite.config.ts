import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      // En la última versión, se usa 'router' para configurar directorios
      router: {
        routesDirectory: './src/routes', // Apunta a tu carpeta de rutas en src
      }
    }),
  ],
})
