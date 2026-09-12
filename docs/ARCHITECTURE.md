# Cynex MVP architecture

## System boundary

```text
Visitor/Admin
    │
    ▼
Cloudflare Worker — React Router SSR
    ├── Supabase Postgres, Auth and RLS
    ├── Cloudinary media delivery and signed operations
    └── GA4 after analytics consent in production only
```

The current landing remains deployed independently. `staging.cynex.site` points to `cynex-mvp-staging`; `cynex-mvp-production` has no customer domain until cutover.

## Environments

| Concern | Local | Staging | Production |
|---|---|---|---|
| Git branch | feature branch | `develop` | `main` |
| Worker | local Vite/Workerd | `cynex-mvp-staging` | `cynex-mvp-production` |
| Domain | `localhost:5173` | `staging.cynex.site` | no storefront domain yet |
| Supabase | Docker | isolated staging project | isolated production project |
| Cloudinary prefix | `cynex/staging` | `cynex/staging` | `cynex/production` |
| GA4 | disabled | disabled | configured; loading awaits consent flow |

Cloudflare Workers Builds maps `develop` to the staging build/deploy scripts and `main` to production. Dashboard-managed runtime values survive deploys through Wrangler `keep_vars`.

## Application

- React Router 8 framework mode with SSR.
- Cloudflare Vite plugin and Worker entry at `workers/app.ts`.
- Worker bindings enter loaders/actions through `runtimeEnvContext`.
- Supabase SSR owns HttpOnly Auth cookies and response cookie updates.
- Auth responses use `Cache-Control: private, no-store`.
- Staging responses receive `X-Robots-Tag`, robots meta, and blocking `robots.txt`.

## Data model

```text
Category
└── Product
    ├── ProductMedia
    └── Package
        └── Option

HomepageFeaturedProduct → published Product
HomepageCategorySection → active Category
SiteSettings            → singleton contact configuration
AppAdmin                → Supabase Auth user allowlist
```

The initial schema is defined by four ordered migrations: catalog tables, RLS, search RPC, and catalog invariants. Generated TypeScript types live in `app/types/database.ts`.

## Authorization

- Anonymous and authenticated non-admin accounts see only active/published Catalog data.
- Out-of-stock Options remain readable but are not purchasable.
- Catalog mutations require `auth.uid()` to exist in `app_admins`.
- Server guards call `getClaims()` and confirm the allowlist row through RLS.
- Runtime does not use a Supabase secret/service-role key.

## Search

`catalog_search` is the public query boundary. It supports category, stock, sort, pagination, case-insensitive and Vietnamese diacritic-insensitive matching. It returns only published products and derives minimum price from active, in-stock Options.

## Verification

- Vitest covers application utilities.
- pgTAP covers schema, RLS, search, and constraints against local Supabase.
- CI starts isolated Supabase and runs the database suite.
- Hosted anonymous acceptance uses the publishable-key Data API because the hosted CLI login role cannot execute pgTAP in its shared extension schema.
- Auth acceptance uses real HTTP cookies and disposable users locally; staging Admin login/logout was manually accepted with the environment-specific allowlisted account.
