/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adherencia from "../adherencia.js";
import type * as alertas_sanitarias from "../alertas_sanitarias.js";
import type * as auditTrail from "../auditTrail.js";
import type * as capacitaciones from "../capacitaciones.js";
import type * as cargos from "../cargos.js";
import type * as documentos from "../documentos.js";
import type * as equipos from "../equipos.js";
import type * as indicadores from "../indicadores.js";
import type * as lib_auth from "../lib/auth.js";
import type * as mantenimientos from "../mantenimientos.js";
import type * as medicamentos from "../medicamentos.js";
import type * as pamec from "../pamec.js";
import type * as personal from "../personal.js";
import type * as pqrs from "../pqrs.js";
import type * as sedes from "../sedes.js";
import type * as seed from "../seed.js";
import type * as tenants from "../tenants.js";
import type * as usuarios from "../usuarios.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adherencia: typeof adherencia;
  alertas_sanitarias: typeof alertas_sanitarias;
  auditTrail: typeof auditTrail;
  capacitaciones: typeof capacitaciones;
  cargos: typeof cargos;
  documentos: typeof documentos;
  equipos: typeof equipos;
  indicadores: typeof indicadores;
  "lib/auth": typeof lib_auth;
  mantenimientos: typeof mantenimientos;
  medicamentos: typeof medicamentos;
  pamec: typeof pamec;
  personal: typeof personal;
  pqrs: typeof pqrs;
  sedes: typeof sedes;
  seed: typeof seed;
  tenants: typeof tenants;
  usuarios: typeof usuarios;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
