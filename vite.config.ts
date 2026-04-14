// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve: {
    // Reemplaza el plugin externo por la opción nativa de Vite
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      router: {
        // CORRECCIÓN: Usa la ruta sin el ./ inicial o mejor aún, 
        // define el directorio base de la app si todo está en src
        routesDirectory: 'src/routes', 
      }
    }),
  ],
})
