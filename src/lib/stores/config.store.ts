import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Sede, Usuario } from '../types'
import { SEDES0, USUARIOS } from '../data'

interface ConfigState {
  sedes: Sede[]
  usuarios: Usuario[]
  sedeActiva: string
  vistaCompleta: boolean
  usuarioActual: Usuario | null
  setSedeActiva: (id: string) => void
  setVistaCompleta: (v: boolean) => void
  login: (email: string, clave: string) => boolean
  logout: () => void
  addSede: (s: Sede) => void
  updateSede: (id: string, data: Partial<Sede>) => void
  addUsuario: (u: Usuario) => void
  updateUsuario: (id: string, data: Partial<Usuario>) => void
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      sedes: SEDES0,
      usuarios: USUARIOS,
      sedeActiva: 'BAQ',
      vistaCompleta: false,
      usuarioActual: USUARIOS[0], // Default: admin for dev
      setSedeActiva: (id) => set({ sedeActiva: id }),
      setVistaCompleta: (v) => set({ vistaCompleta: v }),
      login: (email, clave) => {
        const user = get().usuarios.find(
          (u) => u.email === email && u.clave === clave
        )
        if (user) {
          set({ usuarioActual: user, sedeActiva: user.sede })
          return true
        }
        return false
      },
      logout: () => set({ usuarioActual: null }),
      addSede: (s) => set((st) => ({ sedes: [...st.sedes, s] })),
      updateSede: (id, data) =>
        set((st) => ({
          sedes: st.sedes.map((x) => (x.id === id ? { ...x, ...data } : x)),
        })),
      addUsuario: (u) => set((st) => ({ usuarios: [...st.usuarios, u] })),
      updateUsuario: (id, data) =>
        set((st) => ({
          usuarios: st.usuarios.map((x) =>
            x.id === id ? { ...x, ...data } : x
          ),
        })),
    }),
    { name: 'sgc-config' }
  )
)
