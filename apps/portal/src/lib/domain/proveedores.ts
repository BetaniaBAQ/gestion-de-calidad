import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useAuthArgs } from '#/lib/convex-helpers'
import { diasHasta } from '#/lib/utils-sgc'

export type ProveedorSGC = {
  _id: string
  nombre: string
  nit: string
  tipo: string
  contacto?: string
  telefono?: string
  email?: string
  activo: boolean
  rutUrl?: string
  camaraComercioUrl?: string
  camaraVigencia?: string
  habilitacionUrl?: string
  polizaUrl?: string
  polizaVigencia?: string
}

export function useProveedores(): ProveedorSGC[] {
  return (useQuery(api.proveedores.listByOrg, useAuthArgs()) ??
    []) as ProveedorSGC[]
}

export function useCreateProveedor() {
  return useMutation(api.proveedores.create)
}

export function useUpdateProveedor() {
  return useMutation(api.proveedores.update)
}

export function useRemoveProveedor() {
  return useMutation(api.proveedores.remove)
}

export function credencialEstado(
  vigencia: string | undefined
): 'vigente' | 'por_vencer' | 'vencido' | 'sin_cargar' {
  if (!vigencia) return 'sin_cargar'
  const dias = diasHasta(vigencia)
  if (dias < 0) return 'vencido'
  if (dias <= 30) return 'por_vencer'
  return 'vigente'
}

export function useProveedoresConAlertas() {
  const proveedores = useProveedores()
  return proveedores.filter((p) => {
    if (!p.activo) return false
    const camara = credencialEstado(p.camaraVigencia)
    const poliza = credencialEstado(p.polizaVigencia)
    return (
      camara !== 'vigente' ||
      poliza !== 'vigente' ||
      !p.rutUrl ||
      !p.habilitacionUrl
    )
  })
}
