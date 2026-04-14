import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Documento } from '../types'
import { DOCS0 } from '../data'

interface DocumentosState {
  documentos: Documento[]
  addDocumento: (d: Documento) => void
  updateDocumento: (id: string, data: Partial<Documento>) => void
  deleteDocumento: (id: string) => void
}

export const useDocumentosStore = create<DocumentosState>()(
  persist(
    (set) => ({
      documentos: DOCS0,
      addDocumento: (d) => set((s) => ({ documentos: [...s.documentos, d] })),
      updateDocumento: (id, data) =>
        set((s) => ({
          documentos: s.documentos.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
      deleteDocumento: (id) =>
        set((s) => ({ documentos: s.documentos.filter((x) => x.id !== id) })),
    }),
    { name: 'sgc-documentos', skipHydration: true }
  )
)
