import { useQuery, useMutation } from 'convex/react'
import { api } from '@cualia/convex'
import { useOrgId } from '#/lib/org-context'
import { diasHasta } from '#/lib/utils-sgc'
import type { GenericId } from 'convex/values'
import type { DocumentoTipo, DocumentoEstado } from '#/lib/types'

type Id<T extends string> = GenericId<T>

// Tipo proyectado que mantiene compatibilidad con los consumers existentes
export type DocSGC = {
  _id: Id<'documentos'>
  id: string // alias de _id para compatibilidad
  codigo: string
  nombre: string
  tipo: DocumentoTipo
  proceso: string
  version: string
  fechaElaboracion: string
  fechaVigencia: string
  responsable: string // alias de elaboradoPor
  elaboradoPor: string
  estado: DocumentoEstado
  archivo?: string
  spLink?: string
}

function project(doc: ReturnType<typeof useDocumentosRaw>[number]): DocSGC {
  return {
    ...doc,
    id: doc._id,
    tipo: doc.tipo as DocumentoTipo,
    estado: doc.estado as DocumentoEstado,
    proceso: doc.proceso ?? '',
    fechaVigencia: doc.fechaVigencia ?? '',
    responsable: doc.elaboradoPor,
  }
}

// Hook interno — devuelve los docs crudos de Convex
function useDocumentosRaw() {
  const orgId = useOrgId()
  return useQuery(api.documentos.listByOrg, orgId ? { orgId } : 'skip') ?? []
}

export function useDocumentos(): DocSGC[] {
  return useDocumentosRaw().map(project)
}

export function useDocumento(id: string | undefined): DocSGC | undefined {
  return useDocumentos().find((d) => d._id === id)
}

export function useCreateDocumento() {
  const orgId = useOrgId()
  const create = useMutation(api.documentos.create)
  return (
    args: Omit<DocSGC, '_id' | 'id' | 'responsable'> & { responsable: string }
  ) => {
    const { responsable, id: _id, ...rest } = args as any
    return create({ orgId, elaboradoPor: responsable, ...rest })
  }
}

export function useUpdateDocumento() {
  const update = useMutation(api.documentos.update)
  return (id: Id<'documentos'>, args: Partial<Omit<DocSGC, '_id' | 'id'>>) => {
    const { responsable, ...rest } = args as any
    const patch: any = { ...rest }
    if (responsable !== undefined) patch.elaboradoPor = responsable
    return update({ id, ...patch })
  }
}

export function useRemoveDocumento() {
  return useMutation(api.documentos.remove)
}

export function usePctVigentes(): number {
  const docs = useDocumentos()
  if (docs.length === 0) return 0
  const vigentes = docs.filter((d) => d.estado === 'vigente').length
  return Math.round((vigentes / docs.length) * 100)
}

export function usePctConSp(): number {
  const docs = useDocumentos()
  if (docs.length === 0) return 0
  const conSp = docs.filter((d) => !!d.spLink).length
  return Math.round((conSp / docs.length) * 100)
}

export function useDocumentosVencidos() {
  return useDocumentos().filter(
    (d) => d.fechaVigencia && diasHasta(d.fechaVigencia) < 0
  )
}
