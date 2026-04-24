import { createContext, useContext } from 'react'

// Provee el orgId del tenant activo a todos los hooks de Convex.
// Se inicializa desde la sesión en __root.tsx y se consume en los
// hooks de dominio para filtrar queries por tenant.
export const OrgContext = createContext<string>('')
export const useOrgId = () => useContext(OrgContext)
