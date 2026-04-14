// ─── Domain types for SGC Betania ────────────────────────────────────────────

export type Rol =
  | 'admin'
  | 'calidad'
  | 'director'
  | 'coordinador'
  | 'aux_adm'
  | 'view'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: Rol
  sede: string
  clave: string
}

export interface Sede {
  id: string
  nombre: string
  ciudad: string
  direccion: string
  activa: boolean
}

export interface Cargo {
  id: string
  nombre: string
  area: string
  perfil: string
  docRequeridos: string[]
  capRequeridas: string[]
}

export interface Persona {
  id: string
  nombre: string
  cedula: string
  cargo: string
  sede: string
  fechaIngreso: string
  estado: 'activo' | 'inactivo' | 'vacaciones' | 'licencia'
  docs: DocumentoPersona[]
  caps: CapacitacionPersona[]
}

export interface DocumentoPersona {
  tipo: string
  numero?: string
  fechaExp: string
  fechaVenc: string | null
  archivo?: string
}

export interface CapacitacionPersona {
  tema: string
  fecha: string
  horas: number
  entidad: string
  certificado?: string
}

export interface Equipo {
  id: string
  nombre: string
  marca: string
  modelo: string
  serie: string
  sede: string
  area: string
  fechaCompra: string
  ultimaMant: string
  proxMant: string
  estado: 'operativo' | 'mantenimiento' | 'baja' | 'reparacion'
  invima: string
  vida: number
  prioridad: 'alta' | 'media' | 'baja'
  docs: string[]
}

export interface PlanMant {
  id: string
  equipoId: string
  tipo: 'preventivo' | 'correctivo' | 'calibracion'
  fecha: string
  tecnico: string
  empresa: string
  observaciones: string
  costo: number
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'
  proxFecha?: string
}

export type CheckEstado = 'cumple' | 'no_cumple' | 'parcial' | 'na'

export interface CheckItem {
  id: string
  criterio: string
  estandar: string
  estado: CheckEstado
  observacion: string
  evidencia?: string
}

export interface Habilitacion {
  sedeId: string
  fechaRevision: string
  responsable: string
  items: CheckItem[]
}

export interface Indicador {
  id: string
  nombre: string
  descripcion: string
  formula: string
  meta: number
  unidad: string
  frecuencia: 'mensual' | 'trimestral' | 'semestral' | 'anual'
  proceso: string
  responsable: string
}

export interface MedicionIndicador {
  indicadorId: string
  periodo: string
  valor: number
  meta: number
  observacion: string
  responsable: string
  fecha: string
}

export type CicloFase = 'planear' | 'hacer' | 'verificar' | 'actuar'

export interface AccionPAMEC {
  id: string
  hallazgo: string
  causa: string
  accion: string
  responsable: string
  fechaLimite: string
  fechaCierre?: string
  estado: 'pendiente' | 'en_proceso' | 'cerrado' | 'vencido'
  fase: CicloFase
  resultado?: string
  sede: string
}

export interface Auditoria {
  id: string
  tipo: 'interna' | 'externa' | 'seguimiento'
  proceso: string
  sede: string
  auditor: string
  fechaInicio: string
  fechaFin: string
  estado: 'planeada' | 'en_proceso' | 'cerrada'
  hallazgos: Hallazgo[]
  observaciones: string
}

export interface Hallazgo {
  id: string
  tipo: 'no_conformidad' | 'observacion' | 'oportunidad_mejora'
  descripcion: string
  criterio: string
  accionCorrectiva?: string
  responsable?: string
  fechaLimite?: string
  estado: 'abierto' | 'cerrado' | 'vencido'
}

export interface Documento {
  id: string
  codigo: string
  nombre: string
  tipo:
    | 'procedimiento'
    | 'instructivo'
    | 'formato'
    | 'politica'
    | 'manual'
    | 'otro'
  proceso: string
  version: string
  fechaElaboracion: string
  fechaVigencia: string
  responsable: string
  estado: 'vigente' | 'obsoleto' | 'en_revision' | 'borrador'
  archivo?: string
}

export interface Medicamento {
  id: string
  nombre: string
  principioActivo: string
  concentracion: string
  forma: string
  laboratorio: string
  registro: string
  lote: string
  fechaVenc: string
  stock: number
  stockMinimo: number
  sede: string
  condicionAlm: string
  estado: 'activo' | 'agotado' | 'vencido' | 'suspendido'
}

export interface Proceso {
  id: string
  nombre: string
  tipo: 'estrategico' | 'misional' | 'apoyo' | 'evaluacion'
  responsable: string
  objetivo: string
  indicadores: string[]
  documentos: string[]
  riesgos: string[]
}

export interface PQRS {
  id: string
  tipo: 'peticion' | 'queja' | 'reclamo' | 'sugerencia'
  radicado: string
  fecha: string
  sede: string
  nombreInteresado: string
  contacto: string
  descripcion: string
  respuesta?: string
  fechaRespuesta?: string
  responsable: string
  estado: 'recibido' | 'en_tramite' | 'respondido' | 'cerrado' | 'vencido'
}

export interface Adherencia {
  id: string
  protocolo: string
  sede: string
  periodo: string
  totalAplicaciones: number
  conformes: number
  noConformes: number
  observaciones: string
  responsable: string
  fecha: string
}

// Semáforo de alertas
export type Semaforo = 'verde' | 'amarillo' | 'rojo' | 'gris'

// Score de cumplimiento (0–100)
export interface Score {
  valor: number
  semaforo: Semaforo
  label: string
}
