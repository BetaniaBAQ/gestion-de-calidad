import { useDocumentosStore } from '#/lib/stores/documentos.store'
import { diasHasta } from '#/lib/utils-sgc'
import type { Documento } from '#/lib/types'

export function useDocumentos(): Documento[] {
  return useDocumentosStore((s) => s.documentos)
}

export function useDocumento(id: string | undefined): Documento | undefined {
  return useDocumentosStore((s) =>
    id ? s.documentos.find((d) => d.id === id) : undefined
  )
}

export function useUpsertDocumento() {
  const addDocumento = useDocumentosStore((s) => s.addDocumento)
  const updateDocumento = useDocumentosStore((s) => s.updateDocumento)
  return (d: Documento) => {
    const existing = useDocumentosStore
      .getState()
      .documentos.find((x) => x.id === d.id)
    if (existing) updateDocumento(d.id, d)
    else addDocumento(d)
  }
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
  return useDocumentos().filter((d) => diasHasta(d.fechaVigencia) < 0)
}
