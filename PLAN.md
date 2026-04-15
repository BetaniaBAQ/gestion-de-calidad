# Plan Maestro — Cualia SGC

Fecha: 2026-04-15
Estado: Aprobado

---

## Visión

Software de gestión de calidad (SGC) multi-tenant para IPS colombianas. Cubre cumplimiento normativo (Res. 3100, PAMEC, indicadores Res. 256, seguridad del paciente) y calidad administrativa. Diseñado para ser usado por consultores externos de calidad que atienden múltiples IPS.

Caso piloto: Instituto Oncohematológico Betania — 4 sedes ambulatorias especializadas en hematología, hemofilia y oncología.

---

## Stack

| Capa          | Tecnología                                              |
| ------------- | ------------------------------------------------------- |
| Frontend      | React 19 + TanStack Start + shadcn/ui + Tailwind CSS v4 |
| Base de datos | Convex                                                  |
| Autenticación | WorkOS (Organizations = tenants)                        |
| Archivos      | Uploadthing (o SharePoint)                              |
| Gráficos      | shadcn charts (Recharts) + D3 para avanzados            |
| Email         | Resend (vía Convex scheduled functions)                 |
| Monorepo      | Turborepo + pnpm workspaces                             |
| Deploy        | Vercel                                                  |

---

## Estructura del monorepo

```
cualia/
├── apps/
│   ├── app/              ← cualia.app (SGC principal, TanStack Start)
│   └── web/              ← cualia.com (landing/marketing)
├── packages/
│   ├── convex/           ← Schema, queries, mutations, actions (compartido)
│   ├── ui/               ← Componentes shadcn/ui + design system (compartido)
│   ├── types/            ← Tipos TypeScript del dominio (compartido)
│   └── config/           ← ESLint, TypeScript, Tailwind configs compartidas
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Dominios y multi-tenancy

- **cualia.com** → Landing page / marketing / pricing
- **cualia.app** → App principal (login genérico, org selector)
- **<slug>.cualia.app** → Acceso directo por tenant (wildcard DNS)
- **dominio-propio.com** → Custom domain por cliente

### Resolución de tenant (orden de prioridad)

1. Dominio personalizado → lookup en Convex: `customDomain` → tenant
2. Subdominio slug → extraer slug del hostname → tenant
3. cualia.app → login → WorkOS org selector

### Tabla `tenants` en Convex

```typescript
{
  slug: string           // "betania"
  nombre: string         // "Instituto Oncohematológico Betania"
  orgId: string          // WorkOS Organization ID
  customDomain?: string  // "sgc.betania.com"
  logo?: string          // URL del logo
  colores?: object       // Theme overrides
  plan: string           // "trial" | "pro" | "enterprise"
  activo: boolean
}
```

---

## Principios de diseño

1. **Mobile-first** — todo parte de móvil, escala a desktop con breakpoints
2. **Multi-tenant desde el día uno** — cada tabla con `orgId`, aislación en queries/mutations
3. **Catálogos configurables** — viven en Convex, no hard-coded en archivos .ts
4. **Flujos formales con permisos** — máquinas de estado con transiciones por rol + audit trail
5. **Enfoque pedagógico** — el sistema guía al usuario por los procesos normativos (wizards, instrucciones, plantillas)
6. **Genérico con datos pre-cargados** — todo configurable, pero el piloto viene pre-poblado

---

## Roles y permisos

| Rol          | Quién                        | Permisos                                                               |
| ------------ | ---------------------------- | ---------------------------------------------------------------------- |
| admin        | Administrador TI             | Configuración completa, gestión de usuarios                            |
| calidad      | Consultor externo de calidad | Todo: auditorías, indicadores, PAMEC, documentos, reportes, validación |
| coordinador  | Líder de sede                | TH de su sede, habilitación, mantenimiento, carga de evidencia         |
| farmaceutico | QF por sede                  | Medicamentos, farmacovigilancia                                        |
| director     | Director médico              | Dashboard, reportes, aprobación de documentos                          |
| view         | Auditor externo, gerencia    | Solo lectura                                                           |

### Flujo principal

```
Personal interno alimenta datos → Calidad (consultor externo) valida y organiza
```

---

## Flujos de aprobación (máquinas de estado)

### Documentos

```
borrador → en_revisión → en_aprobación → vigente → obsoleto
   ↑         ↑              ↑              ↑
 (autor/    (calidad)     (director)    (calidad)
  calidad)
```

3 actores obligatorios: elabora (interno ± calidad), revisa (calidad), aprueba (director).

### Hallazgos PAMEC

```
abierto → en_investigación → acción_definida → en_ejecución → verificación → cerrado
   ↑         ↑                   ↑                ↑              ↑            ↑
 (auditor) (calidad)          (calidad)      (responsable)   (calidad)    (calidad)
```

### Eventos adversos (Seguridad del Paciente)

```
reportado → clasificado → en_investigación → acciones_definidas → en_seguimiento → cerrado
   ↑           ↑              ↑                    ↑                  ↑              ↑
 (cualquiera) (calidad)    (calidad)           (calidad)          (responsable)  (calidad)
```

### Requisitos de TH

```
sin_cargar → por_validar → vigente → vencido
                ↑            ↑
           (coordinador   (calidad)
            sube doc)
```

Cada transición registra: `quién + cuándo + estado_anterior + estado_nuevo` (audit trail).

---

## Datos del piloto (Betania)

### Sedes y servicios (REPS real)

| Sede         | ID  | Servicios                                                                                                                                                                                                                        |
| ------------ | --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Barranquilla | BAQ | Enfermería, Fisioterapia, Hematología, Med. Física y Rehabilitación, Med. General, Med. Interna, Nutrición, Oncología Clínica, Onco-Hemato Pediátrica, Ortopedia, Psicología, Quimioterapia, Reumatología, Servicio Farmacéutico |
| Sincelejo    | SIN | Enfermería, Fisioterapia, Hematología, Med. General, Med. Interna, Nutrición, Oncología Clínica, Ortopedia, Psicología, Quimioterapia, Reumatología, Servicio Farmacéutico                                                       |
| Santa Marta  | STM | Enfermería, Fisioterapia, Hematología, Med. Física y Rehabilitación, Med. General, Med. Interna, Nutrición, Ortopedia, Psicología, Servicio Farmacéutico                                                                         |
| Montería     | MTR | Enfermería, Fisioterapia, Hematología, Servicio Farmacéutico                                                                                                                                                                     |

- Todo ambulatorio, sin hospitalización, sin telemedicina
- ~70 personal, ~80 equipos, ~130 documentos, ~50 medicamentos
- <40 PQRS/mes, 4 auditorías/año (objetivo)

---

## Checklist de habilitación

**Opción C**: Catálogo único de criterios con etiquetas de servicios aplicables + filtro dinámico por servicio/sede. Los criterios se cargan en Convex y son configurables por tenant.

---

## Indicadores

### Fase 1

- Obligatorios Res. 256/2016 (los que aplican a ambulatorio)
- Gestión interna (los 14 que ya existen)

### Fase 2

- Cuenta de Alto Costo / GAUDI (hemofilia + cáncer)
- Guía WFH (World Federation of Hemophilia)
- Indicadores clínicos especializados

Fichas técnicas configurables, no hard-coded.

---

## Notificaciones

- **In-app**: Centro de notificaciones en el header
- **Email**: Alertas críticas vía Resend + Convex scheduled functions
- Push / WhatsApp: fase posterior

---

## Fases de implementación

### Paso 0 — Setup monorepo + migración a Convex + WorkOS

- Crear estructura monorepo (Turborepo + pnpm workspaces)
- Mover código actual a apps/app
- Definir schema Convex multi-tenant
- Configurar WorkOS (organizations, roles)
- Migrar los 7 módulos existentes de Zustand/localStorage a Convex
- Configurar middleware de resolución de tenant (subdomain + custom domain)
- Verificar que todo sigue funcionando

### Fase 1 — Normativo básico (8 ítems)

1. **Talento Humano** — CRUD completo + requisitos + suficiencia + terceros/contratistas
2. **PAMEC** — CRUD auditorías y acciones + ciclo PHVA guiado (wizard pedagógico)
3. **Indicadores** — CRUD fichas técnicas + registro de mediciones + tendencias (shadcn charts)
4. **Habilitación** — evidencia por criterio + autoevaluación por servicio + plan de mejora automático
5. **Seguridad del Paciente** — reporte de eventos (mobile-first, anónimo) + gestión + London Protocol guiado
6. **Auditoría en vivo** — acta PDF al finalizar
7. **Reportes** — más secciones en PDF (equipos, habilitación, PAMEC)
8. **Proveedores y terceros** — evaluación + credenciales de contratistas

### Fase 2 — Calidad asistencial completa

- Vigilancia sanitaria (farmacovigilancia, tecnovigilancia)
- Gestión del riesgo (matriz institucional + riesgo clínico)
- Comités institucionales (actas + compromisos + seguimiento)
- Historia clínica (auditoría de HC + custodia)
- Indicadores CAC/GAUDI + WFH
- Inventario IT (PCs, servidores, periféricos, licencias)

### Fase 3 — Calidad administrativa + plataforma

- Infraestructura y ambiente (PGIRASA + planta física)
- Experiencia del usuario (SIAU + encuestas + derechos/deberes)
- Interdependencia (red de referencia + contratos)
- Acreditación (opcional)
- Motor de alertas centralizado con escalamiento
- Landing page (cualia.com)

### Fase 4 — SaaS completo

- Onboarding wizard para nuevos clientes
- Reportes regulatorios (ROSS-2, formatos INVIMA)
- Planes y pricing
- Custom domains automatizados (Vercel API)
- White-labeling completo

---

## Marco normativo cubierto

| Norma          | Componente                            | Módulo(s)                                          |
| -------------- | ------------------------------------- | -------------------------------------------------- |
| Res. 3100/2019 | Habilitación (7 grupos de estándares) | Habilitación, TH, Dotación, Medicamentos, Procesos |
| Dec. 780/2016  | SOGCS (PAMEC, calidad)                | PAMEC, Gestión Documental, Gestión del Riesgo      |
| Res. 256/2016  | Seguridad del paciente, indicadores   | Seguridad del Paciente, Indicadores                |
| Dec. 4725/2005 | Dispositivos médicos                  | Dotación (equipos)                                 |
| Res. 4816/2008 | Tecnovigilancia                       | Vigilancia Sanitaria                               |
| Res. 2004/2008 | Farmacovigilancia                     | Vigilancia Sanitaria                               |
| Dec. 2200/2005 | Servicio farmacéutico                 | Medicamentos                                       |
| Res. 1552/2013 | PQRS en salud                         | PQRS                                               |
| Res. 1995/1999 | Historia clínica                      | Historia Clínica                                   |
| Res. 0312/2019 | SG-SST                                | Talento Humano                                     |
| Res. 459/2012  | Violencia sexual                      | Talento Humano (capacitación)                      |
| CAC / GAUDI    | Cuenta de alto costo                  | Indicadores (Fase 2)                               |
| Guía WFH       | Hemofilia                             | Indicadores (Fase 2)                               |
