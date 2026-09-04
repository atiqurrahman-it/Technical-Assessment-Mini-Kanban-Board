---
name: page-scaffolding
description: Scaffold new pages with the project's standard folder structure (page.tsx, container.tsx, loading.tsx, _assets/ with components/schema/services/utils/types). Use when creating any new page, route, or feature module in the app.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Page Scaffolding Skill

Creates new pages following the project's established architecture patterns.

## When to Use This Skill

Activate when:
- Creating a new page or route
- Adding a new feature module
- User says "create page", "new page", "scaffold", "add route"
- Refactoring monolithic pages into proper structure

## Project Context

- **Framework:** Next.js 15 App Router, React 19, Tailwind CSS v4
- **Styling:** shadcn/ui components, `glass-card` class for cards, dark mode default
- **Data fetching:** TanStack React Query via `useFetchData` / `useApiMutation` from `src/hook/TanstackQueries/`
- **Auth:** `useAuthStore` from `src/store/authStore.tsx` — provides `user` with `role` field
- **Path alias:** `@/*` → `./src/*`
- **Roles:** `super_admin`, `company_admin`, `company_user`

## Folder Structure Template

Every page follows this structure:

```
<route-group>/<portal>/<page-name>/
├── page.tsx                    # Thin server wrapper or direct client page
├── container.tsx               # "use client" — all logic + UI lives here
├── loading.tsx                 # Loading skeleton/spinner for Suspense
└── _assets/
    ├── components/             # Page-specific child components (modals, forms, cards)
    │   └── <ComponentName>.tsx
    ├── schema/                 # Zod validation schemas
    │   └── <entity>.schema.ts
    ├── services/               # TanStack Query hooks (useFetchData/useApiMutation wrappers)
    │   └── <entity>.service.ts
    ├── types/                  # TypeScript interfaces/types
    │   └── <entity>.types.ts
    └── utils/                  # Page-specific helper functions (optional, only if needed)
        └── <helper>.ts
```

## File Templates

### 1. `page.tsx` — Server Component Wrapper

For **static routes** (no dynamic params), use a client page directly:

```tsx
import <PageName>Container from "./container";

export default function <PageName>Page() {
  return <<PageName>Container />;
}
```

For **dynamic routes** with `[id]` params (Next.js 15 async params):

```tsx
import <PageName>Container from "./container";

export default async function <PageName>Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <<PageName>Container entityId={id} />;
}
```

### 2. `container.tsx` — Client Component (Main Logic)

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// ── Imports ──
import DynamicTableWithPagination from "@/components/common/DynamicTable/DynamicTable";
import { CustomField } from "@/components/common/fields/cusInputField";
import DataLoader from "@/components/layout/components/dataLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Page-specific imports from _assets/
import { /* Modal components */ } from "./_assets/components/<ComponentName>";
import { /* Service hooks */ } from "./_assets/services/<entity>.service";
import { /* Types */ } from "./_assets/types/<entity>.types";

export default function <PageName>Container({ /* props */ }: { /* prop types */ }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // ── State ──
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);

  // ── Role guard ──
  useEffect(() => {
    if (user && user.role !== "<required_role>") {
      router.replace("/<fallback-route>");
    }
  }, [user, router]);

  // ── Data fetching ──
  const { data, isLoading } = useFetchDataHook(/* params */);

  // ── Guard: return null if wrong role ──
  if (!user || user.role !== "<required_role>") return null;

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <DataLoader />
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="my-6 md:flex items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-[#173b86] dark:text-[#11a2ff]">
            <Page Title>
          </h1>
          <p className="text-sm text-[#51658f] dark:text-blue-100/70">
            <Page subtitle>
          </p>
        </div>
        {/* Action buttons */}
      </div>

      {/* Filters */}
      <div className="glass-card mb-6 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <CustomField.CommonSearch
              searchText={search}
              setSearchText={setSearch}
              placeholder="Search..."
            />
          </div>
          {/* Additional filters */}
        </div>
      </div>

      {/* Table */}
      <DynamicTableWithPagination
        data={data?.data || []}
        isLoading={isLoading}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pagination={data?.meta}
        setPaginationLimit={setLimit}
        config={{
          columns: [
            // Column definitions
          ],
        }}
      />

      {/* Modals (rendered outside table) */}
    </div>
  );
}
```

### 3. `loading.tsx` — Loading State

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

### 4. `_assets/schema/<entity>.schema.ts` — Zod Schema

```tsx
import { z } from "zod";

export const Create<Entity>Schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  // Add fields as needed
});

export type Create<Entity>FormData = z.infer<typeof Create<Entity>Schema>;

export const Update<Entity>Schema = Create<Entity>Schema.partial();

export type Update<Entity>FormData = z.infer<typeof Update<Entity>Schema>;
```

### 5. `_assets/services/<entity>.service.ts` — Service Hooks

```tsx
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import useFetchData from "@/hook/TanstackQueries/useFetchData";
import { useQueryClient } from "@tanstack/react-query";

/** Query key for cache invalidation */
export const <ENTITY>_KEY = "<entity-list>";

/**
 * Fetches list of <entities> with pagination + search.
 */
export function use<Entity>s(
  currentPage: number = 1,
  search?: string,
  limit: number = 10,
) {
  return useFetchData({
    path: "<entities>",
    queryKey: <ENTITY>_KEY,
    filterData: {
      page: currentPage,
      search,
      limit,
    },
  });
}

/**
 * Creates a new <entity>.
 */
export function useCreate<Entity>() {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "POST",
    path: "<entities>",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [<ENTITY>_KEY] });
    },
  });
}

/**
 * Updates an existing <entity>.
 */
export function useUpdate<Entity>() {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "PATCH",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [<ENTITY>_KEY] });
    },
  });
}

/**
 * Deletes a <entity>.
 */
export function useDelete<Entity>() {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "DELETE",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [<ENTITY>_KEY] });
    },
  });
}
```

### 6. `_assets/types/<entity>.types.ts` — TypeScript Types

```tsx
/** Shape of <entity> record returned by the API */
export interface <Entity> {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  updatedAt?: string;
}

/** Badge variant map for status display */
export const STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
> = {
  active: "default",
  inactive: "destructive",
  pending: "secondary",
};
```

### 7. `_assets/components/<ComponentName>.tsx` — Page-Specific Component

```tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { DialogWrapper } from "@/components/pageComponent/Dialog/Dialog";
import { Button } from "@/components/ui/button";
import { /* form fields */ } from "@/components/common/fields/cusInputField";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { /* Schema */ } from "../schema/<entity>.schema";
import { useCreate<Entity> } from "../services/<entity>.service";

interface <ComponentName>Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  // Additional props (e.g., editData, id)
}

export function <ComponentName>({
  open,
  onOpenChange,
  onSuccess,
}: <ComponentName>Props) {
  const createMutation = useCreate<Entity>();

  const form = useForm({
    resolver: zodResolver(<Schema>),
    defaultValues: { /* ... */ },
  });

  const onSubmit = (data: any) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        form.reset();
        onSuccess?.();
      },
    });
  };

  return (
    <DialogWrapper
      open={open}
      setOpen={onOpenChange}
      title="<Component Title>"
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Form fields */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </DialogWrapper>
  );
}
```

### 8. `_assets/utils/<helper>.ts` — Utility Functions (Optional)

```tsx
/**
 * Format <entity> data for display.
 */
export function format<Entity>Data(data: <Entity>[]) {
  return data.map((item) => ({
    ...item,
    formattedDate: new Date(item.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }));
}
```

## Key Conventions to Follow

### Role Guard Pattern
Every protected page MUST include:
1. `useEffect` redirect for wrong role
2. Early `return null` guard before render
3. Correct role check matching the route group

```tsx
// (super-user-portal) → "super_admin"
// (company-user--portal) → "company_admin"
// (user-portal) → "super_admin" | "company_admin" | "company_user"
```

### Available Reusable Components

| Component | Import Path | Purpose |
|---|---|---|
| `DynamicTableWithPagination` | `@/components/common/DynamicTable/DynamicTable` | Table with pagination, checkbox selection |
| `CustomField.*` | `@/components/common/fields/cusInputField` | Text, SelectField, CommonSearch, Number, etc. |
| `DialogWrapper` | `@/components/pageComponent/Dialog/Dialog` | Modal dialog with footer, close button |
| `ReusableTabs` | `@/components/pageComponent/Tabs/ReusableTabs` | Tab component |
| `DataLoader` | `@/components/layout/components/dataLoader` | Loading spinner |
| `NoDataComponent` | `@/components/layout/components/empty` | Empty state |
| `toastMessageShow` | `@/components/common/toastMessage/toastMessageShow` | Toast notifications |
| `Badge` | `@/components/ui/badge` | Status badges |
| `Button` | `@/components/ui/button` | Buttons |
| `CusPagination` | `@/components/ui/custom/common/pagination/paginations` | Pagination controls |
| `PaginationLimit` | `@/components/common/fields/assets/cus_limitField` | Per-page limit selector |

### CustomField Available Types

```tsx
CustomField.Text           // Text input
CustomField.TextArea       // Textarea
CustomField.Number         // Number input
CustomField.SelectField    // Select (single/multi)
CustomField.CommonSearch   // Search input with debounce
CustomField.SingleCheckField  // Single checkbox
CustomField.MultiCheckField   // Multi checkbox group
CustomField.RadioField     // Radio group
CustomField.Switch         // Toggle switch
CustomField.DocumentUpload // File upload
CustomField.AndDesignDatePicker  // Date picker
CustomField.DateRangeCalendar    // Date range picker
```

### DynamicTableWithPagination Usage

```tsx
<DynamicTableWithPagination
  data={apiResponse?.data || []}         // Array of row objects
  isLoading={isFetching}                 // Boolean loading state
  currentPage={currentPage}              // Number (1-based)
  setCurrentPage={setCurrentPage}        // (page: number) => void
  pagination={apiResponse?.meta}         // { page, total, totalPages, perPage? }
  setPaginationLimit={setLimit}          // (limit: number) => void — optional
  config={{
    columns: [
      { key: "fieldName", header: "Column Header" },
      {
        key: "custom",
        header: "Custom Column",
        render: (row: any) => <Badge>{row.value}</Badge>,
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-right",
        render: (row: any) => (
          <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
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

### Service Hook Patterns

```tsx
// GET request with filters
useFetchData({
  path: "endpoint",
  queryKey: "cache-key",
  filterData: { page, search, limit, status },
  enabled: !!dependency,  // optional conditional fetch
});

// POST mutation
useApiMutation({
  method: "POST",
  path: "endpoint",       // optional — can pass in mutate()
  onSuccess: () => { /* invalidate queries */ },
  onError: (err) => { /* handle error */ },
  dataType: "multipart/form-data",  // optional — for file uploads
});

// PATCH/DELETE mutation (path from mutate call)
useApiMutation({
  method: "PATCH",
  onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["key"] }); },
});
// Usage: mutation.mutate({ id: 123, ...body })
```

### CSS Patterns

```tsx
// Page container
<div className="p-6 space-y-6">

// Page header
<div className="my-6 md:flex items-center justify-between">
  <h1 className="text-2xl font-bold text-[#173b86] dark:text-[#11a2ff]">
  <p className="text-sm text-[#51658f] dark:text-blue-100/70">

// Glass card (filters, info cards)
<div className="glass-card mb-6 p-4">

// Action button (gradient)
<Button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:from-blue-500 hover:to-cyan-400">

// Loading state
<div className="flex items-center justify-center min-h-[60vh]">
  <DataLoader />
</div>
```

## Complete Scaffolding Checklist

When creating a new page, follow these steps in order:

1. **Create folder structure** — All directories and empty files
2. **Write `types/<entity>.types.ts`** — Interfaces first (other files depend on these)
3. **Write `schema/<entity>.schema.ts`** — Zod schemas with type exports
4. **Write `services/<entity>.service.ts`** — TanStack Query hooks
5. **Write `utils/<helper>.ts`** — Only if page-specific helpers are needed
6. **Write `_assets/components/*.tsx`** — Page-specific modals, forms, cards
7. **Write `container.tsx`** — Main client component with all logic
8. **Write `page.tsx`** — Thin server wrapper
9. **Write `loading.tsx`** — Loading skeleton
10. **Verify imports** — Ensure all `@/` aliases resolve correctly

## Example: Creating a "Products" Page under `(super-user-portal)`

Target path: `src/app/(super-user-portal)/super-admin/product-list/`

### Step 1: Create folder structure
```bash
mkdir -p src/app/\(super-user-portal\)/super-admin/product-list/_assets/{components,schema,services,types,utils}
```

### Step 2-6: Write _assets files
Write `product.types.ts`, `product.schema.ts`, `product.service.ts`, then any components.

### Step 7: Write container.tsx
Follow the container.tsx template above with:
- Role guard: `user.role !== "super_admin"` → redirect to `/user/my-dashboard`
- Service hook: `useProducts(currentPage, search, limit)`
- Table: `DynamicTableWithPagination` with product columns
- Modals: Create/Edit/Delete product modals from `_assets/components/`

### Step 8: Write page.tsx
```tsx
import ProductListContainer from "./container";
export default function ProductListPage() {
  return <ProductListContainer />;
}
```

### Step 9: Write loading.tsx
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
