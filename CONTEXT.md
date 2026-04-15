# Resumen del Proyecto — Sistema de Gestión de Calidad (SGC)

Fecha: 2026-04-14

---

## Qué es

Aplicación web para gestionar el Sistema de Gestión de Calidad de una IPS con múltiples sedes. Corre en el navegador, sin servidor ni base de datos real todavía — todo el estado se guarda en localStorage mientras se consolida la interfaz.

---

## Dónde está parado el proyecto

La aplicación tiene un shell funcional con sidebar de navegación, selector de sede, usuario activo y un score global de calidad en el footer. Todos los módulos tienen pantalla, pero ninguno está terminado del todo — algunos tienen más avance que otros.

### Módulos con más avance

- **Dashboard** — KPIs por sede, score global, alertas cruzadas de varios módulos
- **Dotación** (equipos biomédicos) — tabla con CRUD y KPIs de vencimiento
- **Mantenimiento** — órdenes de mantenimiento con CRUD y semáforo de estado
- **Gestión Documental** — listado de documentos con CRUD y tab de control
- **Medicamentos y DM** — inventario con alertas de vencimiento y stock
- **Procesos / PQRS** — registro de procesos y PQRS con estados en colores
- **Configuración** — sedes, cargos y usuarios con CRUD completo

### Módulos con avance intermedio

- **Talento Humano** — personal con requisitos por cargo, falta pulir validaciones
- **Habilitación** — checklist interactivo por sede y plan de visitas, falta CRUD completo
- **Indicadores** — visualización de indicadores, falta edición y metas
- **PAMEC** — auditorías y acciones de mejora, falta CRUD y formularios

### Módulos con poco avance

- **Auditoría en vivo** — wizard iniciado pero incompleto
- **Reporte de visita** — vista de resumen por sede, sin generación de PDF todavía

---

## Qué sigue

1. Terminar los módulos intermedios (Talento Humano, Habilitación, Indicadores, PAMEC)
2. Completar Auditoría en vivo y Reporte de visita con exportación a PDF
3. Revisar y commitear los cambios pendientes en `config`, `mantenimiento`, `medicamentos`, `pamec` y estilos
4. Evaluar si conectar a un backend o base de datos real

---

## Stack (para orientar a otro desarrollador o agente)

React 19 · TanStack Router · Zustand (estado local) · shadcn/ui · Tailwind CSS v4 · TypeScript · pnpm

Cada módulo vive en `src/routes/[modulo].tsx`. El estado de cada módulo está en `src/lib/stores/[modulo].store.ts`. Los hooks que derivan datos van en `src/lib/domain/[modulo].ts`.

Para correr: `pnpm dev` → http://localhost:3000
