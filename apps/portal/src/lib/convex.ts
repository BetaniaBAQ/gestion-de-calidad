import { ConvexReactClient } from 'convex/react'

// Cliente React singleton — se inicializa una vez y se comparte en toda la app
export const convexClient = new ConvexReactClient(
  import.meta.env.VITE_CONVEX_URL as string
)
