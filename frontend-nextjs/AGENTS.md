# AGENTS.md

## Commands

- `npm run dev` — dev server with Turbopack (port 3000)
- `npm run build` — production build with Turbopack
- `npm run lint` — ESLint (next/core-web-vitals + next/typescript)
- No typecheck or test scripts exist. To type-check: `npx tsc --noEmit`

## Architecture

- **Framework:** Next.js 15 App Router, React 19, Tailwind CSS v4
- **Styling:** shadcn/ui (radix-nova style), Tailwind v4 via `@tailwindcss/postcss` (no `tailwind.config.*` — config is in `globals.css` using `@theme inline`)
- **Data fetching:** TanStack React Query. Use `useFetchData` / `useInfiniteFetchData` / `useApiMutation` from `src/hook/TanstackQueries/` — these handle auth headers and error handling automatically.
- **State:** Auth in `src/store/authStore.tsx` (React Context, not Zustand). Portal mode in `src/store/portalModeStore.tsx`.
- **Auth flow:** Login → pre-auth token → OTP verification → JWT. Tokens stored in cookies via `src/lib/cookie.ts`. 401 responses auto-redirect to `/login`.

## Route Groups

Three role-protected portal groups under `src/app/`:

| Route group | Role | Path prefix |
|---|---|---|
| `(super-user-portal)` | `super_admin` | `/super-admin` |
| `(company-user--portal)` | `company_admin` | `/company-portal` |
| `(user-portal)` | `super_admin`, `company_admin`, `company_user` | `/user` |

Portal layouts use `RoleProtectedRoute` (`src/components/auth/RoleProtectedRoute.tsx`).

## Data Fetching — `useFetchData`

```tsx
import useFetchData from "@/hook/TanstackQueries/useFetchData";

// Basic GET
const { data, isLoading, error } = useFetchData({
  path: "companies",              // API endpoint (appended to NEXT_PUBLIC_API_URL)
  queryKey: "all-companies",      // Cache key for TanStack Query
});

// With filters (search, pagination, status, etc.)
const { data, isLoading } = useFetchData({
  path: "companies",
  queryKey: COMPANY_LIST_KEY,
  filterData: {
    status,
    limit,
    page: currentPage,
    search,
  },
});

// Conditional fetch (only run when dependency is truthy)
const { data } = useFetchData({
  path: `companies/${id}`,
  queryKey: "single-company",
  enabled: !!id,  // only fetch when id exists
});

// POST via useFetchData (rare — prefer useApiMutation for writes)
const { data } = useFetchData({
  path: "reports/generate",
  queryKey: "report",
  method: "POST",
  filterData: { dateRange, filters },
});
```

**Response shape:** `data?.data` = the main payload, `data?.meta` = pagination `{ page, total, totalPages, perPage }`.

## Data Posting — `useApiMutation`

```tsx
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// POST — create
const createMutation = useApiMutation({
  method: "POST",
  path: "companies",              // optional — can also pass path in mutate()
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [COMPANY_LIST_KEY] });
  },
});
// Usage: createMutation.mutate({ name: "Acme", email: "acme@co.com" })

// PATCH — update
const updateMutation = useApiMutation({
  method: "PATCH",
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [COMPANY_LIST_KEY] });
    queryClient.invalidateQueries({ queryKey: ["single-company"] });
  },
});
// Usage: updateMutation.mutate({ id: 1, name: "New Name" })

// DELETE
const deleteMutation = useApiMutation({
  method: "DELETE",
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [COMPANY_LIST_KEY] });
  },
});
// Usage: deleteMutation.mutate({ id: 1 })

// File upload (multipart/form-data)
const uploadMutation = useApiMutation({
  method: "POST",
  dataType: "multipart/form-data",
  path: "upload",
});
// Usage: uploadMutation.mutate(formData)

// With error handling override
const mutation = useApiMutation({
  method: "POST",
  path: "endpoint",
  isSuccessToast: false,  // disable default toast
  isErrorToast: false,    // disable default error toast
  onSuccess: (data) => { /* custom success */ },
  onError: (error) => { /* custom error handling */ },
});

// Pending state for UI
<Button disabled={mutation.isPending}>
  {mutation.isPending ? "Saving..." : "Save"}
</Button>
```

## CustomField Components

All from `@/components/common/fields/cusInputField`:

```tsx
import { CustomField } from "@/components/common/fields/cusInputField";
```

### With react-hook-form (form mode — pass `form` + `name`)

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MySchema } from "./schema";

const form = useForm({
  resolver: zodResolver(MySchema),
  defaultValues: { name: "", email: "", status: "active" },
});

<CustomField.Text
  form={form}
  name="name"
  labelName="Company Name"
  placeholder="Enter company name"
  required
  disabled={false}
  viewOnly={false}
/>

<CustomField.TextArea
  form={form}
  name="description"
  labelName="Description"
  placeholder="Enter description"
/>

<CustomField.Number
  form={form}
  name="price"
  labelName="Price"
  placeholder="0.00"
  numberType="float"    // "integer" (default) | "float"
  required
/>

<CustomField.SelectField
  form={form}
  name="status"
  labelName="Status"
  options={[
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
  ]}
  required
  type="single"         // "single" (default) | "multiple"
  showSearch={true}
/>

<CustomField.SingleCheckField
  form={form}
  name="isActive"
  labelName="Active"
/>

<CustomField.MultiCheckField
  form={form}
  name="roles"
  labelName="Roles"
  options={[
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
  ]}
/>

<CustomField.RadioField
  form={form}
  name="type"
  labelName="Type"
  options={[
    { label: "Type A", value: "a" },
    { label: "Type B", value: "b" },
  ]}
/>

<CustomField.Switch
  form={form}
  name="isEnabled"
  labelName="Enable Feature"
/>

<CustomField.Password
  form={form}
  name="password"
  labelName="Password"
  required
/>

<CustomField.DocumentUpload
  form={form}
  name="file"
  labelName="Upload Document"
/>
```

### Without form (controlled mode — pass `value` + `setValue`)

```tsx
<CustomField.Text
  value={searchText}
  setValue={setSearchText}
  placeholder="Enter value"
/>
```

### CommonSearch (standalone — no form needed)

```tsx
<CustomField.CommonSearch
  searchText={search}
  setSearchText={setSearch}
  placeholder="Search users..."
  width="w-full"        // optional
/>
```

### Available CustomField members

| Member | Purpose | Key props |
|---|---|---|
| `Text` | Text input | `form, name, labelName, required, disabled, viewOnly, leftIcon, rightIcon, isArray` |
| `TextArea` | Textarea | `form, name, labelName, required, disabled, viewOnly` |
| `Number` | Number input | `form, name, labelName, required, numberType ("integer"/"float"), disabled` |
| `StringNumber` | Alphanumeric input | `form, name, labelName` |
| `Password` | Password input | `form, name, labelName, required` |
| `OTP` | OTP verification | `form, name` |
| `SelectField` | Dropdown (single/multi) | `form, name, options, type ("single"/"multiple"), showSearch, required, onValueChange` |
| `SingleSelectField` | Simple single select | `form, name, options` |
| `CheckField` | Checkbox group | `form, name, options` |
| `SingleCheckField` | Single checkbox | `form, name, labelName` |
| `MultiCheckField` | Multi checkbox | `form, name, options, labelName` |
| `RadioField` | Radio group | `form, name, options, labelName` |
| `Switch` | Toggle switch | `form, name, labelName` |
| `CommonSearch` | Search with debounce | `searchText, setSearchText, placeholder` |
| `DocumentUpload` | File upload | `form, name, labelName` |
| `LimitField` | Pagination limit | `setLimit, totalItems, setCurrentPage` |

## Reusable UI Components

### DynamicTableWithPagination

```tsx
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";

<DynamicTableWithPagination
  data={response?.data || []}           // Array of row objects
  isLoading={isFetching}                // Boolean
  currentPage={currentPage}             // Number (1-based)
  setCurrentPage={setCurrentPage}       // (page: number) => void
  pagination={response?.meta}           // { page, total, totalPages }
  setPaginationLimit={setLimit}         // (limit: number) => void — optional
  config={{
    columns: [
      { key: "name", header: "Name" },
      { key: "email", header: "Email" },
      {
        key: "status",
        header: "Status",
        render: (row: any) => <Badge variant="default">{row.status}</Badge>,
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (row: any) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(row)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
  }}
  // Optional checkbox selection:
  isCheckBox
  selectedIds={selectedIds}
  setSelectedIds={setSelectedIds}
  setSelectObject={setSelectedObjects}
/>
```

### DialogWrapper

```tsx
import { DialogWrapper } from "@/components/pageComponent/Dialog/Dialog";

<DialogWrapper
  open={isOpen}
  setOpen={setIsOpen}
  title="Create Item"
  description="Fill in the details below"
  triggerContent={<Button>Add Item</Button>}  // optional — element that opens dialog
  closer={true}                                // show close X button (default: true)
  footer={<div className="flex justify-end gap-2">...</div>}  // optional footer
>
  {/* Scrollable body content */}
  <form>...</form>
</DialogWrapper>
```

### DataLoader / NoDataComponent

```tsx
import DataLoader from "@/components/layout/components/dataLoader";
import NoDataComponent from "@/components/layout/components/empty";

// Loading state
<div className="flex items-center justify-center min-h-[60vh]">
  <DataLoader />
</div>

// Empty state
<NoDataComponent className="h-[250px]!" />
```

### Toast Notifications

```tsx
import { ToastMessageShow } from "@/components/common/toastMessage/toastMessageShow";

ToastMessageShow("success", { message: "Saved successfully" });
ToastMessageShow("error", error);
```

### ReusableTabs

```tsx
import ReusableTabs from "@/components/pageComponent/Tabs/ReusableTabs";

<ReusableTabs
  tabs={[
    { value: "tab1", label: "Tab One", content: <div>Content 1</div> },
    { value: "tab2", label: "Tab Two", content: <div>Content 2</div> },
  ]}
/>
```

## Page Structure Pattern — MANDATORY

**Every page (static or dynamic) MUST follow this exact structure. No exceptions.**

### ⚠️ Idempotency rule (MANDATORY — read before creating anything)

**NEVER blindly recreate files or folders that already exist.** Before scaffolding, inspect the target directory first:

```bash
ls src/app/<route-group>/<page-name>/
```

- If `page.tsx`, `container.tsx`, `loading.tsx`, or `_assets/` **already exist**, **do NOT recreate them**.
- If `_assets/` already exists, **do NOT recreate `_assets/` or its subfolders** (`components/`, `schema/`, `services/`, `types/`, `utils/`). Only **add the specific missing file** inside the existing folder (e.g. add `services/foo.ts` to an existing `_assets/`).
- Only create the full folder skeleton when the page directory is **empty or missing** the required files.
- This prevents duplicate `_assets/_assets/` folders, duplicate `page.tsx`, and clobbered existing logic.

In short: **build incrementally — check first, create only what's missing, never overwrite existing work without being asked.**

### Folder layout

```
<page-name>/
├── page.tsx              # Server component ONLY — thin wrapper, zero logic
├── container.tsx         # "use client" — ALL state, hooks, logic, UI
├── loading.tsx           # Suspense fallback (DataLoader)
└── _assets/
    ├── components/       # Page-specific modals, forms, cards
    ├── schema/           # Zod validation schemas
    ├── services/         # TanStack Query hooks (useFetchData/useApiMutation wrappers)
    ├── types/            # TypeScript interfaces
    └── utils/            # Helpers (optional — only if needed)
```

### page.tsx — Server Component (ALWAYS server, NEVER `"use client"`)

**Static routes:**
```tsx
import MyPageContainer from "./container";

export default function MyPage() {
  return <MyPageContainer />;
}
```

**Dynamic routes with `[id]`:**
```tsx
import MyPageContainer from "./container";

export default async function MyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MyPageContainer entityId={id} />;
}
```

**Rules for page.tsx:**
- NO `"use client"` directive
- NO `useState`, `useEffect`, `useRouter`, `useAuthStore`
- NO data fetching hooks
- ONLY imports container and renders it
- For dynamic routes: extract params and pass as props

### container.tsx — Client Component (ALL logic lives here)

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DataLoader from "@/components/layout/components/dataLoader";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Import from _assets/
import { SomeModal } from "./_assets/components/SomeModal";
import { useMyData, useCreateMyData } from "./_assets/services/my.service";
import type { MyEntity } from "./_assets/types/my.types";

export default function MyPageContainer({ /* props */ }) {
  const router = useRouter();
  const { user } = useAuthStore();

  // ── Role guard ──
  useEffect(() => {
    if (user && user.role !== "super_admin") {
      router.replace("/user/my-dashboard");
    }
  }, [user, router]);

  // ── State ──
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);

  // ── Data fetching ──
  const { data, isLoading } = useMyData(currentPage, search, limit);

  // ── Guard ──
  if (!user || user.role !== "super_admin") return null;

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <DataLoader />
      </div>
    );
  }

  // ── Render ──
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="my-6 md:flex items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-[#173b86] dark:text-[#11a2ff]">
            My Page Title
          </h1>
          <p className="text-sm text-[#51658f] dark:text-blue-100/70">
            Page subtitle
          </p>
        </div>
      </div>
      {/* Content */}
    </div>
  );
}
```

### loading.tsx — Suspense Fallback

```tsx
import DataLoader from "@/components/layout/components/dataLoader";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <DataLoader />
    </div>
  );
}
```

### _assets/ folder structure

Each page's `_assets/` contains page-specific files only:

| Folder | Purpose | Contains |
|---|---|---|
| `components/` | Page-specific UI components | Modals, forms, cards, custom widgets |
| `schema/` | Zod validation schemas | `create-entity.schema.ts`, `update-entity.schema.ts` |
| `services/` | TanStack Query hooks | `useFetchData` / `useApiMutation` wrappers with query keys |
| `types/` | TypeScript interfaces | API response shapes, prop types |
| `utils/` | Helper functions | Formatters, calculators (only if needed) |

### Existing pages that need restructuring

These pages currently have all logic in `page.tsx` and MUST be split:

| Current file | Issue | Action |
|---|---|---|
| `super-admin/page.tsx` (114 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `super-admin/company-list/page.tsx` (335 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `super-admin/company-request-list/page.tsx` (252 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `company-portal/page.tsx` (236 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `user/my-dashboard/page.tsx` (229 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `user/my-declarations/page.tsx` (1475 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `user/my-maps/page.tsx` (121 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `user/my-reports/page.tsx` (126 lines) | Server component but no container | Add container.tsx |
| `user/my-reports/[id]/page.tsx` (51 lines) | Server component but no container | Add container.tsx |
| `(auth)/login/page.tsx` (123 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `(auth)/verify-otp/page.tsx` (114 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `profile/page.tsx` (874 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |
| `rdp-test/page.tsx` (34 lines) | `"use client"` in page.tsx | Move to container.tsx, page.tsx becomes server wrapper |

**Already correct:** `super-admin/company-list/[id]/page.tsx` (10 lines, server wrapper → container.tsx)

## Conventions

- Path alias: `@/*` → `./src/*`
- `NEXT_PUBLIC_API_URL` is the external backend base URL (not the Next.js app). Used by all API hooks.
- Only one Next.js API route exists: `src/app/api/globe/route.ts`
- `output: "standalone"` in `next.config.ts` (Docker deploys)
- Dark mode default: inline script in `layout.tsx` sets `dark` class from localStorage before paint
- Toast notifications: `react-hot-toast` via `ToastMessageShow` from `src/components/common/toastMessage/`
- Error handling: `src/utils/api-error-handaler/errorHandler.ts` — 401 clears auth + redirects, 403 redirects to `/forbidden`
- CSS classes: `glass-card` for card containers, `glass-table-container` for tables
- Page headers: `text-2xl font-bold text-[#173b86] dark:text-[#11a2ff]`
- Subtitle: `text-sm text-[#51658f] dark:text-blue-100/70`

## Gotchas

- `src/hook/` (singular) contains TanStack queries and auth hook. `src/hooks/` (plural) contains `useNotFound` only — don't confuse them.
- Tailwind CSS v4: no `tailwind.config.js`. All theme customization is in `src/app/globals.css` via `@theme inline`. PostCSS uses `@tailwindcss/postcss`.
- shadcn components: `npx shadcn add <component>`. Config in `components.json` at repo root.
- `eslint-disable @typescript-eslint/no-explicit-any` is used in several hook files — this is intentional.
- The `@locator/webpack-loader` in Turbopack config is dev-only (LocatorJS for clicking to source).
- `useFetchData` wraps `useQuery` — returns `{ data, isLoading, error }`. The `data` is the raw API response; use `data?.data` for the payload and `data?.meta` for pagination.
- `useApiMutation` wraps `useMutation` — returns `{ mutate, mutateAsync, isPending, error }`. Call `mutate(body)` not `mutate({ body })`.
- `SelectField` options format: `{ label: string, value: string }[]` or `string[]` (auto-converted).
- `CommonSearch` has built-in 800ms debounce — do NOT add additional debounce on top.
- Role guard: every protected page must have `useEffect` redirect + `return null` guard before render.
- `page.tsx` is ALWAYS a server component. If you see `"use client"` in page.tsx, it MUST be moved to container.tsx.
- Every page directory MUST have `page.tsx`, `container.tsx`, `loading.tsx`, and `_assets/` folder.
- **Check before creating:** Always run `ls` on the target page directory first. Never recreate `page.tsx`, `container.tsx`, `loading.tsx`, or `_assets/` if they already exist — only add the specific missing files. This avoids duplicate `_assets/_assets/` folders and overwrites.
