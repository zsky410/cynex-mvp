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
        └── Variant
            └── DurationOption

HomepageFeaturedProduct → published Product
HomepageCategorySection → active Category
SiteSettings            → singleton contact configuration
AppAdmin                → Supabase Auth user allowlist
```

The accepted Phase 2 schema is defined by four ordered migrations: catalog tables, RLS, search RPC, and catalog invariants. It currently stores Variant name and duration together in `options`; the accepted four-level requirement supersedes that shape. The first Phase 3 migration must add `variants`, make Duration Options belong to a Variant, update RLS/search/tests, and regenerate `app/types/database.ts` before Product editor work.

## Authorization

- Anonymous and authenticated non-admin accounts see only active/published Catalog data.
- Out-of-stock Duration Options remain readable but are not selectable for contact handoff.
- Catalog mutations require `auth.uid()` to exist in `app_admins`.
- Server guards call `getClaims()` and confirm the allowlist row through RLS.
- Runtime does not use a Supabase secret/service-role key.

## Search

`catalog_search` is the public query boundary. It supports category, stock, sort, pagination, case-insensitive and Vietnamese diacritic-insensitive matching. After the hierarchy migration it searches Product, Package, Variant, and Duration Option labels, returns only published Products, and derives minimum price from active, in-stock Duration Options.

## Verification

- Vitest covers application utilities.
- pgTAP covers schema, RLS, search, and constraints against local Supabase.
- CI starts isolated Supabase and runs the database suite.
- Hosted anonymous acceptance uses the publishable-key Data API because the hosted CLI login role cannot execute pgTAP in its shared extension schema.
- Auth acceptance uses real HTTP cookies and disposable users locally; staging Admin login/logout was manually accepted with the environment-specific allowlisted account.
