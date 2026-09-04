# AGENT.md — Backend Architecture & Coding Convention Guide

> This document is a **complete architectural specification** derived from an existing Express.js + TypeScript + Prisma (PostgreSQL) backend. It is written so that an AI coding agent, given only this file, can scaffold a **new project from scratch** that has the identical folder structure, naming conventions, and coding style — without ever seeing the original codebase.
>
> Follow every rule literally. Where the original code contains inconsistencies (documented below as "Known Inconsistencies"), prefer the **majority pattern** described in the main rule.

---

## 1. Tech Stack

| Concern            | Choice                                                              |
| ------------------- | -------------------------------------------------------------------- |
| Language            | TypeScript (`strict: true`), compiled with `tsc` to CommonJS         |
| Runtime             | Node.js, run in dev via `ts-node-dev`                                |
| Web framework       | Express 4                                                             |
| ORM                 | Prisma 5 (PostgreSQL)                                                 |
| Validation          | Zod                                                                    |
| Auth                | JSON Web Tokens (`jsonwebtoken`), manual middleware (no Passport)      |
| File uploads        | Multer (memory storage) + Sharp (image compression)                   |
| Logging             | Winston + `winston-daily-rotate-file`                                 |
| Linting/formatting  | ESLint (`@typescript-eslint`) + Prettier                              |
| Module system       | **CommonJS at compile target**, but source is written with **ES `import`/`export` syntax** (transpiled by TS) |

---

## 2. Full Directory Tree

```
project-root/
├── prisma/
│   └── schema/
│       ├── schema.prisma
│       └── migrations/
│           └── <timestamp>_<name>/migration.sql
├── src/
│   ├── app.ts                       # Express app setup (middleware, routes, error handlers)
│   ├── server.ts                    # Entry point — starts the HTTP server
│   ├── type.ts                      # (legacy/scratch) top-level shared types — usually empty/commented
│   ├── app/
│   │   ├── config/
│   │   │   └── index.ts             # Central env-var config object
│   │   ├── lib/
│   │   │   ├── db.ts                # Prisma Client singleton
│   │   │   └── type.ts              # Small shared types (e.g. decoded JWT payload)
│   │   ├── middlewares/
│   │   │   ├── authorization.ts             # Generic/role-specific auth middleware
│   │   │   ├── ownerAuthorization.ts        # Auth middleware for a specific role
│   │   │   ├── companyAuthorization.ts      # Auth middleware for a specific role
│   │   │   ├── globalErrorHandler.ts        # Express error-handling middleware
│   │   │   ├── validationRequest.ts         # Zod-schema-driven request validator
│   │   │   └── multer/
│   │   │       └── configureMulter.ts       # Factory function producing a configured multer instance
│   │   ├── modules/                 # Feature modules, grouped by domain
│   │   │   ├── <domain>/
│   │   │   │   ├── route.ts                 # Aggregates all sub-module routers for this domain
│   │   │   │   └── <feature>/
│   │   │   │       ├── <feature>.route.ts       # Express Router — endpoint definitions
│   │   │   │       ├── <feature>.controller.ts  # Request/response handling
│   │   │   │       ├── <feature>.services.ts    # Business logic + Prisma calls
│   │   │   │       └── <feature>.validation.ts  # Zod schemas
│   │   ├── routes/
│   │   │   └── route.ts             # Top-level router — mounts every domain's route.ts
│   │   └── utils/
│   │       ├── createfolder.ts
│   │       ├── dateFilter.ts
│   │       ├── deletePhoto.ts
│   │       ├── FileAllFunctionality.ts
│   │       ├── fileRename.ts
│   │       └── PhotoCompressWithLocallyStore.ts
│   ├── errors/
│   │   ├── ApiErrors.ts             # Custom `ApiError` class
│   │   ├── HandlePrismaError.ts     # Maps Prisma error codes → clean API error shape
│   │   └── HandleZodError.ts        # Maps ZodError → clean API error shape
│   ├── Interface/
│   │   ├── common.ts                # `IGenericResponse<T>`, `IGenericErrorResponse`
│   │   └── interface.error.ts       # `IGenericErrorMessages`
│   ├── share/
│   │   ├── catchAsync.ts            # Wraps async route handlers to forward errors to Express
│   │   ├── sendResponse.ts          # Standard response-shaping helper
│   │   └── logger.ts                # Winston logger + errorLogger instances
│   └── types/
│       └── express.d.ts             # Express type augmentation (e.g. `req.user`)
├── logs/
│   └── winston/
│       ├── success/
│       └── error/
├── .env
├── .eslintrc.json
├── .eslintignore
├── .prettierrc.json
├── tsconfig.json
├── package.json
├── Dockerfile
├── compose.yml
└── README.md
```

### Purpose of each top-level folder

- **`prisma/schema/`** — Prisma schema and migrations live in a *non-default* location (`prisma/schema/schema.prisma`, referenced explicitly in `package.json`'s `"prisma": { "schema": ... }` field), not directly under `prisma/`.
- **`src/app/config/`** — Single source of truth for all environment-derived configuration values.
- **`src/app/lib/`** — Low-level shared singletons/infra (Prisma client) and small shared types. Distinct from `Interface/` (project-wide DTO-style interfaces) and `utils/` (pure helper functions).
- **`src/app/middlewares/`** — All Express middleware: auth, validation, error handling, file upload config.
- **`src/app/modules/`** — The heart of the app. Organized by **business domain** (e.g. `factory`, `user-management`, `dashboard`), each with sub-folders per **feature/entity** (e.g. `product`, `customer`, `bank`). This is a **feature-based / modular monolith** layout, not a layer-based one (i.e., no top-level `controllers/`, `services/`, `routes/` folders holding all features together — each feature owns its own controller/service/route/validation files side by side).
- **`src/app/routes/route.ts`** — The single top-level router that mounts each domain's own `route.ts` aggregator under a path prefix.
- **`src/app/utils/`** — Stateless helper functions (file handling, date filters, image compression) not tied to Express req/res.
- **`src/errors/`** — Custom error class + translators that convert library-specific errors (Prisma, Zod) into a uniform internal error shape.
- **`src/Interface/`** — Cross-cutting TypeScript interfaces/types shared across the app (response and error envelopes). Note the capitalized folder name (`Interface`, singular) — an intentional deviation from the otherwise-lowercase convention.
- **`src/share/`** — Small reusable app-wide utilities directly related to the request/response lifecycle: `catchAsync`, `sendResponse`, `logger`.
- **`src/types/`** — Ambient TypeScript declaration files (`.d.ts`) for augmenting third-party types (e.g., Express's `Request`).

---

## 3. Naming Conventions

### Folders
- Domain folders under `modules/`: **lowercase**, sometimes **kebab-case** for multi-word domains (`user-management`), sometimes plain lowercase (`factory`, `dashboard`).
- Feature folders under a domain: **lowercase or camelCase** (`product`, `customer`, `productionToSellProduct`), occasionally **PascalCase** for sub-domains under `dashboard` (`Factory`, `ProjectOwnerView`) and `Cash`. Treat this as inconsistent legacy naming — **default to lowercase/camelCase for new folders**, matching the majority.
- Avoid spaces or parentheses in folder names (an existing folder `manager(admin)` is a known inconsistency — do not replicate this pattern in new code).

### Files (per feature, inside `modules/<domain>/<feature>/`)
Each feature is a set of 4 files, named `<featureName>.<layer>.ts`:

| Layer          | Suffix pattern (majority form)     | Notes on inconsistency in source |
| -------------- | ----------------------------------- | ---------------------------------- |
| Route          | `<feature>.route.ts`                 | Some files use `.router.ts` or `.routes.ts` (e.g. `bank.routes.ts`, `expense.router.ts`, `supplier.router.ts`). **Standardize on `.route.ts` for new code.** |
| Controller     | `<feature>.controller.ts`            | Consistent. One file (`authorization.contorller.ts`) has a typo — do not replicate. |
| Service        | `<feature>.services.ts`              | Some use singular `.service.ts` (e.g. `category.service.ts`, `user.service.ts`, `factory.service.ts`). **Standardize on `.services.ts` (plural) for new code**, matching the majority. |
| Validation     | `<feature>.validation.ts`            | One file uses plural `.validations.ts` (`bank.validations.ts`, `salesman.validations.ts`). **Standardize on singular `.validation.ts`.** |

- File base name = camelCase, matching the feature name (e.g. `product`, `dashboard`, `authorization`).
- Domain-level router aggregator is always literally named **`route.ts`** (not `<domain>.route.ts`).

### Code identifiers
- **Variables/functions**: `camelCase` (`createProduct`, `getAllProductsByFactory`, `whereCondition`).
- **Exported grouped objects** (controller/service namespaces): `PascalCase` + suffix, e.g. `ProductController`, `ProductService`, `ProductValidation`, exported as a plain object bundling the individual named functions:
  ```ts
  export const ProductService = { createProduct, updateProduct, ... };
  ```
- **Types/Interfaces**: `PascalCase`, prefixed with `I` (`IGenericResponse<T>`, `IGenericErrorResponse`, `IGenericErrorMessages`, `IApiResponse<T>`).
- **Zod schemas**: `camelCase` + `Schema` suffix (`createProductSchema`, `updateProductSchema`).
- **Enums (Prisma)**: `PascalCase` name, `SCREAMING_SNAKE_CASE` members (`UserRole.PROJECT_OWNER`, `Status.ACTIVE`).
- **Router export constants**: `PascalCase` + `Router` suffix (`ProductRouter`, `FactoryManagementRouter`, `UserManagementRouter`).
- **Environment/config keys**: `snake_case` in the internal `config` object (`jwt_secret`, `bulksms_api_key`) mapped from `SCREAMING_SNAKE_CASE` env vars.

---

## 4. Prisma / Database Conventions

- **Schema location**: `prisma/schema/schema.prisma` — explicitly configured via `package.json`:
  ```json
  "prisma": { "schema": "prisma/schema/schema.prisma", "engineType": "library" }
  ```
- **Datasource**: PostgreSQL, URL from `env("DATABASE_URL")`.
- **Generator**: `prisma-client-js` with `binaryTargets = ["native", "debian-openssl-3.0.x"]` (for Docker/Linux deployment compatibility).
- **Model naming**: `PascalCase`, singular (`User`, `Product`, `Customer`, `CustomerDue`, `SaleItem`). One lowercase exception exists (`purchaseItem`) — treat as inconsistency; **default to PascalCase singular** for new models.
- **Field naming**: `camelCase` (`firstName`, `factoryId`, `createdAt`).
- **Primary keys**: always `id String @id @default(uuid())`.
- **Timestamps**: every model ends with:
  ```prisma
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ```
- **Foreign keys**: `<relatedModel>Id` field + relation field named as the lowercase model name, e.g.:
  ```prisma
  factoryId String
  factory   Factory @relation(fields: [factoryId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  ```
- **Soft-delete pattern**: a `softDelete Boolean @default(false)` field on user-facing models, alongside a `status` enum field (`Status.ACTIVE` / `Status.DEACTIVATE`) rather than a hard delete.
- **Composite uniqueness**: scoped to tenant (`factoryId`) using `@@unique([factoryId, phone])` style — enforces per-factory uniqueness rather than global uniqueness (multi-tenant pattern).
- **Money fields**: `Float`, defaulting to `0` where applicable (`Float @default(0)`).
- **Long text fields**: annotated with `@db.Text` (`note String? @db.Text`).
- **Comment style in schema**: section banners using `// ====...====` and `// ---...---`, plus inline `//` comments documenting business meaning of enum-like string fields (e.g. `type String // PAY / TAKE / OPENING`).
- **Prisma Client instantiation** — a **singleton** created once and imported everywhere:
  ```ts
  // src/app/lib/db.ts
  import { PrismaClient } from '@prisma/client';
  const prisma = new PrismaClient();
  export default prisma;
  ```
  Every service file imports it via relative path: `import prisma from '../../../lib/db';` (or `'../lib/db'` from middlewares). **Never instantiate a new `PrismaClient` outside this file.**
- **Migration workflow**: standard Prisma Migrate, driven by npm scripts:
  ```json
  "prisma-generate": "prisma generate",
  "prisma-migrate": "prisma migrate dev",
  "prisma-studio": "prisma studio"
  ```
  Migrations accumulate under `prisma/schema/migrations/<timestamp>_<description>/migration.sql`, named in **snake_case, lowercase, descriptive** (`add_bank_relation_to_customer_due`, `category_table_update_two`).

---

## 5. Routing Pattern

Three-level route aggregation:

1. **Feature router** (`<feature>.route.ts`) — defines actual HTTP endpoints for one entity, applies `validateRequest(...)` and (optionally) `multer` middleware inline per route.
2. **Domain router** (`modules/<domain>/route.ts`) — imports every feature router in that domain and mounts them onto sub-paths via an array + `forEach`:
   ```ts
   const router = express.Router();
   const FactoryManagementRoutes = [
     { path: '/customer', router: CustomerRouter },
     { path: '/product', router: ProductRouter },
     // ...
   ];
   FactoryManagementRoutes.forEach((route) => router.use(route.path, route.router));
   export const FactoryManagementRouter = router;
   ```
3. **Top-level router** (`src/app/routes/route.ts`) — same array+forEach pattern, mounting each domain router:
   ```ts
   const modulesRoute = [
     { path: '/auth', router: UserManagementRouter },
     { path: '/dashboard', router: DashboardManagementRouter },
     { path: '/factory', router: FactoryManagementRouter },
   ];
   modulesRoute.forEach((route) => router.use(route.path, route.router));
   export default router;
   ```
   Mounted in `app.ts` under a global API prefix: `app.use('/api/v1/', router);`

### Middleware ordering convention (within a feature route file)
Order for a route definition, left to right:
```
router.<method>(
  '<path>',
  <file-upload middleware, if any>,   // e.g. upload.single('photo')
  <auth middleware, if any>,           // currently mostly commented out, see §9
  validateRequest(<Schema>),           // body validation, only on write routes
  <Controller>.<handlerFn>,
);
```
- `GET` routes typically have no validation middleware (query params are cast manually inside the controller).
- `POST`/`PATCH` routes validate `req.body` via `validateRequest`.
- Route file inline comments label each block (`// Create product`, `// Get all products`).

---

## 6. Controller Pattern

- Controllers are **named `const` arrow functions**, each wrapped in the shared `catchAsync` HOF (no manual `try/catch` inside controllers — `catchAsync` forwards thrown/rejected errors to Express's error pipeline):
  ```ts
  export const createProduct = catchAsync(async (req, res) => {
    // ...
  });
  ```
- All controller functions for a feature are declared individually with `export const`, then re-exported together as a namespaced object at the bottom of the file:
  ```ts
  export const ProductController = {
    createProduct,
    updateProduct,
    getAllProducts,
    getAllProductsByFactory,
    getSingleProduct,
    deleteProduct,
  };
  ```
- **Controllers own the "not found" / business-precondition checks** (e.g. checking a related entity exists) by calling a service lookup and short-circuiting with `sendResponse(...)` — they do **not** throw `ApiError` for these cases, they return a response directly:
  ```ts
  const factory = await ProductService.getSingleFactoryById(req.body.factoryId);
  if (!factory) {
    return sendResponse(res, {
      statuscode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Factory not found',
    });
  }
  ```
- Controllers **never call Prisma directly** — all DB access goes through the corresponding `*Service` object.
- Query params (`req.query`) are cast manually with `as string` / `Number(...)` and given inline defaults (`Number(page || 1)`).
- Every controller ends by calling `sendResponse(res, {...})` with `statuscode`, `success`, `message`, and (optionally) `data`/`pagination`.
- Use `httpStatus` (the `http-status` package) constants for status codes — never hardcode numeric codes in controllers.

---

## 7. Service Layer Pattern

- Services hold **all Prisma access and query-building logic** (pagination, search filters, `where` clause construction).
- Declared as individual `const` async functions (not wrapped in `catchAsync` — errors bubble up naturally to the controller's `catchAsync` wrapper), then bundled into a `PascalCase` + `Service` export object:
  ```ts
  const createProduct = async (body: any) => {
    return prisma.product.create({ data: body });
  };
  // ...
  export const ProductService = { createProduct, updateProduct, /* ... */ };
  ```
- Functions **return Prisma results directly** (no intermediate DTO mapping layer) for single-entity operations.
- List/pagination endpoints return a structured object:
  ```ts
  return {
    data,
    pagination: { currentPage: page, perPage: pageSize, totalItems, totalPages },
  };
  ```
- Pagination pattern used consistently:
  ```ts
  if (pageSize > 100) pageSize = 100;           // hard cap
  const skip = (page - 1) * pageSize;
  const totalItems = await prisma.<model>.count({ where: whereCondition });
  const data = await prisma.<model>.findMany({ where: whereCondition, skip, take: pageSize, orderBy: { createdAt: 'desc' } });
  const totalPages = Math.ceil(totalItems / pageSize);
  ```
- Search filters use Prisma's `OR` + `contains`/`insensitive` mode:
  ```ts
  whereCondition.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { category: { contains: search, mode: 'insensitive' } },
  ];
  ```
- A service also commonly exposes small **cross-entity lookup helpers** used by the controller for existence checks (e.g. `getSingleFactoryById`, `getSingleProductByNameWithFactoryId`) — these live in the *dependent* entity's service file, not duplicated in the controller.
- `body: any` is the standard (loosely-typed) parameter type for create/update payloads — the file starts with `/* eslint-disable @typescript-eslint/no-explicit-any */` to permit this.

---

## 8. Error Handling

### Custom error class
```ts
// src/errors/ApiErrors.ts
export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string | undefined, stack = '') {
    super(message);
    this.statusCode = statusCode;
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}
```
Thrown manually anywhere business logic needs to abort with a specific HTTP status (in addition to the controller's inline `sendResponse`-based "not found" pattern described in §6 — both styles co-exist; prefer `sendResponse` short-circuits for expected 404/400 cases in controllers, and `ApiError` for exceptional cases deeper in the call stack).

### Error translators
- `HandlePrismaError.ts` — a large `switch` over Prisma error codes (`P2000`–`P2033`) mapping each to an `errorCode`, human `message`, and appropriate `statusCode` (e.g. `P2002` → `409 CONFLICT`, `P2025`/`P2001` → `404 NOT_FOUND`).
- `HandleZodError.ts` — maps `ZodError.issues` into `{ path, message }[]`.

### Global error handler
Registered **last** in `app.ts` via `app.use(globalErrorHandler)`. It:
1. Logs the error via `errorLogger` (Winston).
2. Branches by error type, in this priority order:
   - Prisma error (duck-typed via `error.code && error.clientVersion`) → `handlePrismaError`
   - `instanceof ZodError` → `handleZodError`
   - `instanceof ApiError` → use `error.statusCode` / `error.message` directly
   - `instanceof Error` (generic) → `500`, `error.message`
3. Builds a uniform response body:
   ```ts
   { success: false, message, errorMessage: IGenericErrorMessages[] }
   ```
4. Includes `stack` in the response **only** when `config.env === 'development'`.
5. Defaults to `statusCode = 500`, `message = 'Something went wrong!'` if nothing matched.

### Async error propagation
All controllers are wrapped in `catchAsync` (see §6) — this is the **only** mechanism for forwarding async errors to `globalErrorHandler`. Do not add manual `try/catch` inside controllers.

### 404 handler
A final unmatched-route handler in `app.ts` (registered after `globalErrorHandler`) returns a consistent 404 payload:
```ts
app.use((req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessage: [{ path: req.originalUrl, message: 'API Not Found' }],
  });
  next();
});
```

---

## 9. Request Validation

- **Library**: Zod exclusively.
- **Location**: one `<feature>.validation.ts` file per feature, colocated with its route/controller/service.
- **Pattern**:
  ```ts
  import { z } from 'zod';

  export const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    quantity: z.string().min(1, 'Quantity is required'),
    buyPrice: z.number().min(0).default(0),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
    factoryId: z.string().uuid('Invalid factory ID'),
  }).strict();

  export const updateProductSchema = createProductSchema.partial();

  export const ProductValidation = { createProductSchema, updateProductSchema };
  ```
  - `create*Schema` uses `.strict()` to reject unknown keys.
  - `update*Schema` is derived via `.partial()` on the create schema — **do not** hand-write a separate update schema.
  - Every field carries a custom, human-readable error message as the second argument to the Zod validator.
  - Exported individually, then bundled into a `PascalCase` + `Validation` object, same pattern as controllers/services.

- **Middleware application**: a single generic `validateRequest(schema)` HOF applied inline in the route file, validating `req.body` only:
  ```ts
  // src/app/middlewares/validationRequest.ts
  export const validateRequest = (schema: ZodSchema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((err) => ({ field: err.path[0], message: err.message }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    next();
  };
  ```
  Note: this returns its own ad-hoc error shape (`{ message, errors }`) rather than going through `globalErrorHandler` — this is a **known inconsistency** with the rest of the error system (which uses `ApiError`/`ZodError` thrown and caught centrally). New code should prefer this project's existing `validateRequest` shape for consistency with what's already deployed, but be aware `errors[].field` here differs in name from `errorMessage[].path` used elsewhere.

---

## 10. Response Format

### Shared helper
```ts
// src/share/sendResponse.ts
type IApiResponse<T> = {
  statuscode: number;
  success: boolean;
  status?: string | null;
  message?: string | null;
  meta?: { page?: number; limit?: number; total?: number } | null;
  pagination?: { currentPage?: number; perPage?: number; totalItems?: number; totalPages?: number } | null;
  data?: T | null;
};

const sendResponse = <T>(res: Response, data: IApiResponse<T>) => {
  res.status(data.statuscode).json({
    statuscode: data.statuscode,
    status: data?.status,
    success: data.success,
    message: data.message || null,
    meta: data.meta || null,
    data: data.data || null,
    pagination: data.pagination,
  });
};
export default sendResponse;
```
- Note the field is spelled **`statuscode`** (all lowercase, not `statusCode`) throughout the codebase — this is intentional/consistent, not a typo, and must be replicated exactly for API compatibility.

### Standard success shape
```json
{
  "statuscode": 200,
  "status": null,
  "success": true,
  "message": "Product fetched successfully",
  "meta": null,
  "data": { /* ... */ },
  "pagination": null
}
```
List endpoints additionally populate `pagination` with `{ currentPage, perPage, totalItems, totalPages }`.

### Standard error shape (from `globalErrorHandler`)
```json
{
  "success": false,
  "message": "Record not found",
  "errorMessage": [{ "path": "id", "message": "Record not found" }],
  "stack": "... (development only)"
}
```

### Rule
- Controllers **always** call `sendResponse` for success paths and for controller-level short-circuits — never call `res.json(...)` directly in a controller.
- Never invent ad-hoc response shapes; every success response goes through `sendResponse`.

---

## 11. Authentication & Authorization

- **Scheme**: Bearer JWT in the `Authorization` header, verified with `jsonwebtoken`, secret from `config.jwt_secret`.
- **Pattern**: one middleware function **per role/actor type**, not a single generic `authenticate` + separate `authorize(role)` — e.g. `authenticateByProjectOwner`, `authenticateByCompanyOwner`. Each middleware:
  1. Extracts `Bearer <token>` from `req.headers.authorization`.
  2. Returns `401` if missing.
  3. `jwt.verify(token, config.jwt_secret)`.
  4. Looks up the corresponding Prisma model/row **filtered by role** (re-validates the user still exists and still holds that role — not just trusting the JWT payload):
     ```ts
     const exitingUser = await prisma.user.findUnique({ where: { id, role: 'PROJECT_OWNER' } });
     ```
  5. Attaches the resolved user to `req.user` (typed as `any` — see `src/types/express.d.ts` for the (currently unused/commented) proper augmentation approach).
  6. Calls `next()`, or returns a `{ status: 'failed', message }` JSON error (note: **this diverges from the `success`/`sendResponse` convention** — auth middleware errors use `status: 'failed'` instead of `success: false`. Treat as a known inconsistency; new role-based auth middleware should still follow this existing `status: 'failed'` shape to match deployed behavior unless explicitly asked to unify it).
- **Multi-role dispatch**: `authenticateByCompanyOwner` demonstrates a **role → Prisma model map** pattern for handling more than one possible role in a single middleware:
  ```ts
  const roleModelMap: Record<string, any> = {
    PROJECT_OWNER: prisma.user,
    COMPANY_OWNER: prisma.companyUser,
  };
  const model = roleModelMap[role];
  if (!model) throw new Error('Invalid role');
  const exitingUser = await model.findUnique({ where: { id, role } });
  ```
- **Role-based access**: enforced by the `UserRole` Prisma enum (`PROJECT_OWNER`, `COMPANY_OWNER`, `MANAGER`, `SALESMAN`, `EMPLOYEE`) plus the per-role middleware described above, rather than a generic `roles: string[]` guard.
- **Note on current state**: In many route files, auth middleware is present but **commented out** (`// authenticateByCompanyOwner,`) pending completion — new modules should still wire the appropriate auth middleware into the route chain rather than leaving it commented.

---

## 12. Environment & Config

- `.env` loaded via `dotenv.config()` in two places: once at the top of `app.ts`, and once (with an explicit path) in `src/app/config/index.ts`:
  ```ts
  dotenv.config({ path: path.join((process.cwd(), '.env')) });
  ```
- **Single config module** (`src/app/config/index.ts`) exports a plain object — this is the **only** place `process.env` should be read directly; everywhere else imports `config` from this module:
  ```ts
  export default {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3050,
    jwt_secret: process.env.JWT_SECRET,
    jwt_refreshPrivatekey: process.env.JWT_REFRESH_PRIVATEKEY,
    bulksms_api_key: process.env.BULKSMS_API_KEY,
    bulksms_sender_id: process.env.BULKSMS_SENDER_ID,
  };
  ```
  Keys not currently in use are left in as **commented-out placeholders** rather than deleted — follow this pattern when adding config that isn't wired up yet.
- Known env vars: `NODE_ENV`/`env`, `DATABASE_URL`, `PORT`, `JWT_SECRET`, `JWT_REFRESH_PRIVATEKEY`, `BULKSMS_API_KEY`, `BULKSMS_SENDER_ID`.
- `.env` is git-ignored; `.env.*` and `env` also ignored.

---

## 13. Code Style

- **Module syntax**: ES module `import`/`export` syntax throughout (compiled to CommonJS by `tsc`, `"module": "commonjs"` in `tsconfig.json`). Never use `require()` in new code (occasional `// const express = require("express");` comments are leftover scaffolding, not the active pattern).
- **Async style**: `async`/`await` exclusively — no raw `.then()/.catch()` chains.
- **Quotes**: single quotes (`'...'`) — enforced by Prettier (`"singleQuote": true`).
- **Semicolons**: always present — enforced by Prettier (`"semi": true`).
- **Indentation**: 2 spaces (Prettier default, confirmed by all source files).
- **Trailing commas**: present in multi-line object/array literals (Prettier default behavior for this config).
- **Comments**:
  - Section-banner comments in Prisma schema (`// ====...====`).
  - Inline `//` comments above logical blocks in routes/controllers (e.g. `// Create product`, `// public folder`).
  - Commented-out **but retained** old/alternate implementations are common (e.g. `authorization.ts` is entirely commented out; `globalErrorHandler.ts` keeps a `way-2` alternate implementation commented below the active one). This is an established project habit — prefer leaving superseded code commented with a brief label rather than deleting it outright, unless asked to clean up.
  - `// TODO` markers used to flag known-incomplete logic.
  - Files needing relaxed lint rules start with inline disable comments, e.g. `/* eslint-disable @typescript-eslint/no-explicit-any */`.
- **Typing looseness**: `any` is used pragmatically for controller `req: any` params in older auth middleware and for `body: any` in service create/update functions — the ESLint config demotes `@typescript-eslint/no-explicit-any` to a `warn`, not an `error`, and `noImplicitAny` is explicitly disabled (marked `// toDO` in `.eslintrc.json`). New code may follow this pragmatic-any style for request bodies, but should prefer real types (`Request`, `Response`, `NextFunction` from `express`) wherever the shape is already known.
- **ESLint config** (`.eslintrc.json`):
  ```json
  {
    "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
    "parser": "@typescript-eslint/parser",
    "rules": {
      "no-unused-vars": "error",
      "no-unused-expressions": "error",
      "prefer-const": "error",
      "no-console": "warn",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
  ```
- **Prettier config** (`.prettierrc.json`): `{ "semi": true, "singleQuote": true }` (all other options at Prettier defaults — 80-char print width, trailing commas per Prettier 3 default of `"all"`).
- **npm scripts** for style enforcement:
  ```json
  "lint": "eslint src --ignore-path .eslintignore --ext .ts",
  "lint:fix": "npx eslint src --fix",
  "prettier": "prettier --ignore-path .gitignore --write \"./src/**/*.+(js|ts|json)\"",
  "prettier:fix": "npx prettier --write src"
  ```

---

## 14. Global Naming Conventions Summary

| Concept                         | Convention                          | Example |
| -------------------------------- | ------------------------------------ | ------- |
| Prisma model                     | PascalCase, singular                 | `Product`, `CustomerDue` |
| Prisma field                     | camelCase                            | `factoryId`, `createdAt` |
| Database enum member             | SCREAMING_SNAKE_CASE                 | `PROJECT_OWNER`, `ACTIVE` |
| Route/feature folder             | lowercase or camelCase               | `product`, `customer` |
| Domain folder                    | lowercase or kebab-case              | `user-management` |
| File per layer                   | `<feature>.<layer>.ts`               | `product.controller.ts` |
| Controller/Service/Validation export bundle | PascalCase + role suffix   | `ProductController`, `ProductService`, `ProductValidation` |
| Router export constant           | PascalCase + `Router` suffix         | `ProductRouter`, `FactoryManagementRouter` |
| Zod schema                       | camelCase + `Schema` suffix          | `createProductSchema` |
| Interface/type                   | `I` + PascalCase                     | `IGenericErrorResponse` |
| Config key (internal)            | snake_case                           | `jwt_secret` |
| Response field                   | lowercase, no camel-boundary         | `statuscode` (not `statusCode`) |
| Middleware function               | camelCase, `authenticateBy<Role>`    | `authenticateByCompanyOwner` |

---

## 15. Reference Snippets (Verbatim Patterns to Replicate)

### 15.1 Route file
```ts
// <feature>.route.ts
import express from 'express';
import { validateRequest } from '../../../middlewares/validationRequest';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(ProductValidation.createProductSchema),
  ProductController.createProduct,
);

router.patch(
  '/:id',
  validateRequest(ProductValidation.updateProductSchema),
  ProductController.updateProduct,
);

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getSingleProduct);

export const ProductRouter = router;
```

### 15.2 Controller file (excerpt)
```ts
// <feature>.controller.ts
import httpStatus from 'http-status';
import catchAsync from '../../../../share/catchAsync';
import sendResponse from '../../../../share/sendResponse';
import { ProductService } from './product.services';

export const createProduct = catchAsync(async (req, res) => {
  const factory = await ProductService.getSingleFactoryById(req.body.factoryId);
  if (!factory) {
    return sendResponse(res, {
      statuscode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Factory not found',
    });
  }

  const data = await ProductService.createProduct(req.body);

  sendResponse(res, {
    statuscode: httpStatus.CREATED,
    success: true,
    message: 'Product created successfully',
    data,
  });
});

export const ProductController = { createProduct /*, ... */ };
```

### 15.3 Service file (excerpt)
```ts
// <feature>.services.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from '../../../lib/db';

const createProduct = async (body: any) => {
  return prisma.product.create({ data: body });
};

const getAllProducts = async (search: string, page: number, pageSize: number) => {
  if (pageSize > 100) pageSize = 100;
  const skip = (page - 1) * pageSize;

  const whereCondition: any = {};
  if (search) {
    whereCondition.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  const totalItems = await prisma.product.count({ where: whereCondition });
  const data = await prisma.product.findMany({
    where: whereCondition,
    skip,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });

  return {
    data,
    pagination: {
      currentPage: page,
      perPage: pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
  };
};

export const ProductService = { createProduct, getAllProducts };
```

### 15.4 Prisma model (excerpt)
```prisma
model Product {
  id           String   @id @default(uuid())

  name         String
  category     String?
  quantity     String
  quantityType String
  buyPrice     Float    @default(0)
  sellPrice    Float    @default(0)
  status       Status   @default(ACTIVE)
  note         String?  @db.Text

  factoryId    String
  factory      Factory  @relation(fields: [factoryId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 15.5 Global error handler
```ts
// src/app/middlewares/globalErrorHandler.ts
import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../../errors/ApiErrors';
import { handlePrismaError } from '../../errors/HandlePrismaError';
import handleZodError from '../../errors/HandleZodError';
import { errorLogger } from '../../share/logger';
import config from '../config';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  errorLogger.error('Global Error Handler~', error.message);

  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessage: { path: string | number; message: string }[] = [];

  if (error.code && error.clientVersion) {
    const e = handlePrismaError(error);
    statusCode = e.statusCode; message = e.message; errorMessage = e.errorMessage;
  } else if (error instanceof ZodError) {
    const e = handleZodError(error);
    statusCode = e.statusCode; message = e.message; errorMessage = e.errorMessage;
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessage = [{ path: '', message: error.message }];
  } else if (error instanceof Error) {
    message = error.message;
    errorMessage = [{ path: '', message: error.message }];
  }

  const responseBody: Record<string, unknown> = { success: false, message, errorMessage };
  if (config.env === 'development' && error?.stack) responseBody.stack = error.stack;

  res.status(statusCode).json(responseBody);
};
export default globalErrorHandler;
```

### 15.6 `catchAsync` helper
```ts
import { NextFunction, Request, RequestHandler, Response } from 'express';

const catchAsync =
  (fn: RequestHandler) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default catchAsync;
```

### 15.7 `sendResponse` helper
```ts
import { Response } from 'express';

type IApiResponse<T> = {
  statuscode: number;
  success: boolean;
  status?: string | null;
  message?: string | null;
  meta?: { page?: number; limit?: number; total?: number } | null;
  pagination?: { currentPage?: number; perPage?: number; totalItems?: number; totalPages?: number } | null;
  data?: T | null;
};

const sendResponse = <T>(res: Response, data: IApiResponse<T>) => {
  res.status(data.statuscode).json({
    statuscode: data.statuscode,
    status: data?.status,
    success: data.success,
    message: data.message || null,
    meta: data.meta || null,
    data: data.data || null,
    pagination: data.pagination,
  });
};
export default sendResponse;
```

---

## 16. Checklist for Scaffolding a New Feature

When an agent is asked to add a new entity/feature (e.g. `Invoice`) to a domain (e.g. `factory`), it must:

1. Add a `PascalCase` singular model to `schema.prisma`, following §4 (uuid `id`, `createdAt`/`updatedAt`, `factoryId` tenant scoping if applicable, `@@unique` scoped by tenant where relevant).
2. Run/describe the migration step (`prisma migrate dev`) — do not hand-edit `migration.sql` files.
3. Create `src/app/modules/<domain>/<feature>/` with exactly 4 files:
   - `<feature>.validation.ts` (Zod, `.strict()` create schema + `.partial()` update schema, bundled as `<Feature>Validation`)
   - `<feature>.services.ts` (Prisma calls via the `prisma` singleton, pagination pattern from §7, bundled as `<Feature>Service`)
   - `<feature>.controller.ts` (`catchAsync`-wrapped handlers, `sendResponse` for every response, bundled as `<Feature>Controller`)
   - `<feature>.route.ts` (Express Router, `validateRequest` on write routes, exported as `<Feature>Router`)
4. Register the new `<Feature>Router` in the parent domain's `route.ts` aggregator array.
5. If the domain's `route.ts` isn't yet mounted in `src/app/routes/route.ts`, mount it there too.
6. Reuse `httpStatus` constants, never hardcode numeric status codes.
7. Reuse existing `Interface/` types (`IGenericErrorResponse`, `IGenericErrorMessages`) rather than redefining them per-feature.
8. Match code style from §13 (Prettier config, 2-space indent, single quotes, semicolons, `async`/`await`).

---

## 17. Known Inconsistencies (Do Not Propagate)

These exist in the current codebase from organic growth but should **not** be copied into new code — the "correct" form is noted next to each:

- Mixed `.route.ts` / `.router.ts` / `.routes.ts` suffixes → **use `.route.ts`**.
- Mixed `.service.ts` / `.services.ts` suffixes → **use `.services.ts`**.
- Mixed `.validation.ts` / `.validations.ts` suffixes → **use `.validation.ts`**.
- `manager(admin)` folder name (parentheses, spaces-unsafe) → **use plain lowercase, e.g. `manager`**.
- `authorization.contorller.ts` (typo) → **spell `controller` correctly**.
- ` customer.service.ts` (leading space in filename under `factory/customer/`) → **no leading/trailing whitespace in filenames**.
- Auth middleware error responses use `{ status: 'failed', message }` instead of the app-wide `sendResponse`/`success` convention → new auth middleware should still match this existing shape for consistency with deployed clients, but flag to the user if asked to modernize it.
- `validateRequest` returns raw `res.status(400).json(...)` instead of routing through `ApiError`/`globalErrorHandler` → keep as-is for compatibility, but note the shape difference (`errors[].field` vs `errorMessage[].path`).
