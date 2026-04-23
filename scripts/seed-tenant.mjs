#!/usr/bin/env node
// CLI local para crear un tenant nuevo:
//   - Organization en WorkOS (con external_id = slug)
//   - Invitación al owner por email
//   - Registro en tabla `tenants` de Convex
//
// Uso:
//   pnpm seed:tenant -- --name "Betania" --slug betania --email admin@betania.com
//   pnpm seed:tenant -- --name "Test" --slug test --email me@example.com --plan pro

import { spawnSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { values } = parseArgs({
  args: process.argv.slice(process.argv.indexOf('--') + 1),
  options: {
    name: { type: 'string' },
    slug: { type: 'string' },
    email: { type: 'string' },
    'first-name': { type: 'string' },
    'last-name': { type: 'string' },
    plan: { type: 'string', default: 'trial' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
})

if (values.help || !values.name || !values.slug || !values.email) {
  console.log(`
Crea un nuevo tenant (Organization en WorkOS + invitación + registro en Convex).

Flags obligatorios:
  --name <str>         Nombre de la organización (ej. "Betania")
  --slug <str>         Slug único (ej. "betania") — será el subdominio <slug>.cualia.app
  --email <str>        Email del owner — recibe invitación

Flags opcionales:
  --first-name <str>   Nombre del owner
  --last-name <str>    Apellido del owner
  --plan <str>         trial | pro | enterprise  (default: trial)

Ejemplo:
  pnpm seed:tenant -- --name "Betania" --slug betania --email admin@betania.com
`)
  process.exit(values.help ? 0 : 1)
}

const payload = {
  name: values.name,
  slug: values.slug,
  ownerEmail: values.email,
  ...(values['first-name'] && { ownerFirstName: values['first-name'] }),
  ...(values['last-name'] && { ownerLastName: values['last-name'] }),
  plan: values.plan,
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const convexDir = path.join(__dirname, '..', 'packages', 'convex')

console.log(`→ Creando tenant "${values.name}" (slug: ${values.slug})...`)

const result = spawnSync(
  'npx',
  ['convex', 'run', 'tenants:createTenant', JSON.stringify(payload)],
  { cwd: convexDir, stdio: 'inherit' }
)

process.exit(result.status ?? 1)
