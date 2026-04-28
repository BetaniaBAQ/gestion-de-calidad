# Cualia SGC

Software de gestion de calidad multi-tenant para IPS colombianas.

## Estructura del monorepo

```
cualia/
├── apps/
│   ├── portal/        ← App principal SGC (puerto 3000)
│   └── admin/         ← Panel de administracion de tenants (puerto 3001)
├── packages/
│   ├── convex/        ← Backend: schema, queries, mutations, actions
│   ├── ui/            ← Componentes shadcn/ui compartidos
│   └── shared/        ← Utilidades compartidas entre apps
├── bin/
│   └── cualia         ← CLI del proyecto
└── turbo.json
```

## Requisitos previos

- **Node.js** >= 20
- **pnpm** >= 10
- Acceso a **Convex** (pedir invitacion al equipo)
- Credenciales de **WorkOS** (pedir al admin del proyecto)

## Setup paso a paso

### 1. Clonar e instalar

```bash
git clone git@github.com:BetaniaBAQ/gestion-de-calidad.git
cd gestion-de-calidad
pnpm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env.local
```

Llena las variables. Necesitas pedir estas credenciales:

| Variable | Donde obtenerla | Quien te la da |
|---|---|---|
| `CONVEX_DEPLOYMENT` | Se genera al correr `npx convex dev` | Te invitan al proyecto en Convex |
| `VITE_CONVEX_URL` | Convex Dashboard → Settings → Deployment URL | Mismo paso anterior |
| `WORKOS_API_KEY` | WorkOS Dashboard → API Keys | Admin del proyecto |
| `WORKOS_CLIENT_ID` | WorkOS Dashboard → Applications | Admin del proyecto |
| `WORKOS_COOKIE_PASSWORD` | Generar uno nuevo (ver abajo) | Tu lo generas |
| `CUALIA_ADMIN_ORG_ID` | WorkOS Dashboard → Organizations → Cualia | Admin del proyecto |

Genera tu cookie password:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Las demas variables estan documentadas dentro de `.env.example`.

### 3. Configurar Convex

Necesitas que alguien del equipo te invite al proyecto en Convex. Una vez invitado:

```bash
cd packages/convex
npx convex dev
```

Esto te pide login, selecciona el proyecto compartido, y genera `CONVEX_DEPLOYMENT` automaticamente. Copia el valor a tu `.env.local`.

### 4. Configurar WorkOS

Necesitas que el admin del proyecto:

1. Te comparta las keys (`WORKOS_API_KEY`, `WORKOS_CLIENT_ID`)
2. Te invite a la organizacion admin "Cualia" en WorkOS (para acceder al admin panel)
3. Te invite a la organizacion del tenant (ej. "Betania") para acceder al portal

Asegurate de que estos Redirect URIs esten registrados en WorkOS Dashboard → Settings → Redirects:

- `http://localhost:3000/api/auth/callback` (portal local)
- `http://localhost:3001/api/auth/callback` (admin local)

### 5. Configuracion inicial (solo la primera vez del proyecto)

> **Nota:** Si el proyecto ya esta configurado y alguien te invito, salta al paso 7.

Si estas arrancando el proyecto desde cero (no existe org admin ni tenants):

#### a. Crear la org admin en WorkOS

Desde el WorkOS Dashboard → Organizations → Create Organization:

- **Name:** `Cualia`
- **External ID:** `admin`

Copia el **Organization ID** (ej. `org_01KPY2P7...`) — este es tu `CUALIA_ADMIN_ORG_ID`.

#### b. Agregar tu usuario a la org admin

En WorkOS Dashboard → Organizations → Cualia → Members → Add Member. Agrega tu email.

#### c. Registrar redirect URIs en WorkOS

WorkOS Dashboard → Settings → Redirects. Agrega:

- `http://localhost:3000/api/auth/callback` (portal local)
- `http://localhost:3001/api/auth/callback` (admin local)

#### d. Configurar Home URL en WorkOS

WorkOS Dashboard → Settings → Home URL → `http://localhost:3000`

(Necesario para que el logout funcione correctamente.)

#### e. Setear env vars en Convex

```bash
cd packages/convex
npx convex env set WORKOS_CLIENT_ID <tu_client_id>
npx convex env set WORKOS_API_KEY <tu_api_key>
npx convex env set CUALIA_ADMIN_ORG_ID <org_id_admin>
```

#### f. Crear el primer tenant

Levanta el admin (`./bin/cualia dev:admin`), entra a http://localhost:3001, y desde la UI crea una nueva organizacion (ej. "Betania"). Esto:

1. Crea la Organization en WorkOS con el slug como `external_id`
2. Envia invitacion al email del owner
3. Registra el tenant en Convex

#### g. Seed de datos de prueba

```bash
# Usa el WorkOS Org ID del tenant que acabas de crear
./bin/cualia db:seed <orgId>
```

#### h. Configurar DEV_ORG_SLUG

En `.env.local`, cambia `DEV_ORG_SLUG` al slug del tenant que creaste (ej. `betania`). Asi el portal local carga esa org.

### 6. Levantar el proyecto

```bash
# Todo junto (portal + admin + convex)
pnpm dev

# O por separado
./bin/cualia dev:portal   # Solo portal en :3000
./bin/cualia dev:admin    # Solo admin en :3001
./bin/cualia dev:db       # Solo Convex
```

### 7. Verificar

- **Portal:** http://localhost:3000 → te redirige a login de WorkOS → dashboard SGC
- **Admin:** http://localhost:3001 → login con org admin → lista de organizaciones

## CLI

```bash
./bin/cualia help          # Ver todos los comandos

./bin/cualia dev            # Arranca todo
./bin/cualia dev:portal     # Solo portal
./bin/cualia dev:admin      # Solo admin
./bin/cualia dev:db         # Solo Convex

./bin/cualia db:seed <orgId>  # Seed de datos de prueba para una org
./bin/cualia db:deploy        # Deploy Convex a produccion
./bin/cualia db:run <fn> <args>  # Ejecutar funcion de Convex
./bin/cualia db:dashboard     # Abrir dashboard de Convex

./bin/cualia build          # Build de produccion
./bin/cualia typecheck      # Type check
./bin/cualia check          # Lint + format
```

## Stack

| Capa | Tecnologia |
|---|---|
| Frontend | React 19 + TanStack Start + shadcn/ui + Tailwind CSS v4 |
| Backend | Convex |
| Auth | WorkOS AuthKit (JWKS-verified, multi-tenant) |
| Monorepo | Turborepo + pnpm workspaces |
| Deploy | Vercel (portal + admin como proyectos separados) |

## Agregar componentes UI

Los componentes shadcn viven en `packages/ui/`. Para agregar uno nuevo:

```bash
cd packages/ui
npx shadcn add <componente>
```

Los componentes se importan como:

```tsx
import { Button } from '@cualia/ui/components/button'
```
