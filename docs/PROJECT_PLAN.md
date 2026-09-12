# Cynex Storefront MVP plan

Status: active source of truth  
Last updated: 2026-09-12

## 1. Goal

Replace the Google Sheet catalog with a Vietnamese storefront where Visitors can discover products, compare Packages and Options, see price/availability, and contact Cynex through Zalo or Facebook. The existing landing remains available as the rollback target.

Example hierarchy:

```text
Claude
└── Claude Team
    └── 1.5x Pro — 1 tháng
```

## 2. MVP scope

Included:

- Storefront homepage, catalog, category, search, and product detail.
- Package/Option pricing and availability.
- Contact modal with Zalo/Facebook handoff.
- One environment-specific Admin account.
- Admin CRUD for Category, Product, Package, Option, and media.
- Draft, publish, archive, featured products, and homepage categories.
- Product/category SEO, consent-gated GA4, staging and production.

Deferred beyond MVP:

- Customer accounts, cart, checkout, payment, and orders.
- Discounts, lead management, Google Sheet sync, full-page CMS.
- Multi-admin role management, audit log, and version history.

## 3. Architecture and deployment

```text
Cloudflare Pages: landingpage-cynex
├── cynex.site             current customer landing
└── landing.cynex.site     long-term fallback

Cloudflare Workers
├── cynex-mvp-staging      staging.cynex.site
└── cynex-mvp-production   no customer route before cutover

React Router SSR Worker
├── Supabase Postgres/Auth/RLS
├── Cloudinary
└── GA4 after production consent
```

Repository flow:

```text
feature/* → PR → develop → staging
develop   → PR → main    → production Worker
```

Both protected branches require PRs and the `quality` status check. Cloudflare Workers Builds deploys after merges; GitHub Actions performs quality verification only.

## 4. Environment contract

Runtime variables:

```text
APP_ENV
APP_ORIGIN
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_FOLDER_PREFIX
GA_MEASUREMENT_ID
```

Encrypted Worker secret:

```text
CLOUDINARY_API_SECRET
```

Database passwords and Supabase secret/service-role keys are provisioning credentials, never application runtime configuration.

Staging is public but non-indexable. It uses only staging data and `cynex/staging`, sends no GA4, and exposes no preview/Workers.dev URL. If staging later contains confidential data, enable an access control layer before adding that data.

## 5. Domain and database

### Tables

- `app_admins`: environment-specific Auth user allowlist.
- `categories`: name, slug, descriptions, media, order, active state.
- `products`: Category owner, content, tags, lifecycle, SEO, publish time.
- `product_media`: verified Cloudinary metadata and thumbnail/cover/gallery role.
- `packages`: commercial group within a Product.
- `options`: duration, VND prices, stock, active state.
- `homepage_featured_products`: ordered published Products.
- `homepage_category_sections`: up to three ordered active Categories.
- `site_settings`: singleton contact-channel configuration.

### Invariants

- Slugs use lowercase URL-safe segments and are unique.
- A Product slug becomes immutable after first publication.
- Prices are non-negative; compare-at price is not below sale price.
- Names and durations are non-empty.
- One thumbnail and one cover maximum per Product.
- Homepage references remain published/active.
- Contact URLs and stored media URLs use HTTPS.

### RLS

- Anonymous: active Categories; published Products and their public children; no allowlist; no mutation.
- Authenticated non-admin: same Catalog access as a Visitor; no mutation.
- Admin: CRUD through allowlist-backed RLS.
- Authorization depends on verified user ID, never email or client metadata.

### Search contract

```ts
type CatalogSort = "featured" | "newest" | "price_asc" | "price_desc";

type CatalogQuery = {
  q?: string;
  category?: string;
  inStock?: boolean;
  sort: CatalogSort;
  page: number;
  pageSize: 12;
};
```

Search ignores case and Vietnamese diacritics, searches Product/Package/Option text, excludes drafts, computes available minimum price, and ranks unavailable products after available ones for price sorting.

## 6. Storefront UX

Public routes:

```text
/
/catalog
/category/:slug
/product/:slug
```

Header includes logo, catalog navigation, search, and contact CTA. Homepage includes hero, search, featured Products, up to three Category sections, trust/process content, and contact CTA. Catalog state is represented in URL query parameters and provides filters, sort, pagination, loading, error, and empty states.

A Product card shows thumbnail, Category, name, short description, tags, badge, availability, and “Từ …” price derived from an available Option. Product detail exposes gallery, rich description, Packages/Options, price comparison, stock, and contact action.

Contact flow generates a message from Product, Package, and Option. It supports copy plus enabled Zalo/Facebook channels. If no channel is configured, the CTA is hidden and a configuration error is recorded.

## 7. Admin MVP

Routes begin at `/admin/login` and guarded `/admin`. Phase 3 adds:

- Dashboard summaries and navigation.
- Category list/create/edit/delete/reorder.
- Product list, filtering, create/edit, draft/publish/archive.
- Nested Package and Option editing.
- Structured rich text with no raw HTML.
- Cloudinary signed upload/delete constrained by MIME, size, timestamp, and environment prefix.
- Featured Product and homepage Category ordering.
- Contact settings management.

Publish validation requires a Category, descriptions, valid rich text, thumbnail, at least one active Package, and at least one active Option. Destructive actions require confirmation and server success before UI success feedback.

## 8. Design system

- Vietnamese UI.
- Primary ink `#0B132B`, cyan `#00AEEF`, cool white/blue surfaces.
- Preserve the approved Cynex landing identity; Phase 3 is functional Admin work, not a public redesign.
- Responsive targets: 360, 768, 1280, and 1440 px.
- Components must meet keyboard, focus, label, contrast, loading, empty, and error-state requirements.

## 9. Security and reliability

- RLS on all public-schema tables.
- Server validation independent from browser validation.
- Admin mutations verify Origin.
- Auth routes are private/no-store.
- Add CSP, HSTS, frame, referrer, and permissions headers before public launch.
- Never render raw HTML.
- Cloudinary cleanup follows upload-success/database-failure.
- Supabase failures have retry/error states; session expiry redirects to login.
- Concurrent editing is deferred because MVP has one Admin.

## 10. Delivery phases

### Phase 0 — Provisioning — complete

GitHub repository, branches/rulesets, Supabase projects, Cloudinary, GA4, credentials inventory, and rollback landing were provisioned.

### Phase 1 — Foundation — complete

React Router/Cloudflare scaffold, Node/pnpm pins, CI, isolated Workers Builds, environment variables, staging domain, crawler protection, and automatic deployment acceptance are complete.

### Phase 2 — Database and Auth — complete

Implemented and staging-accepted:

- Catalog migrations, generated types, RLS, search RPC, allowlisted Admin.
- SSR cookie login/logout, verified-claims session guard.
- Local database lint, 30 pgTAP assertions, remote anonymous acceptance, and staging Admin acceptance.

Production database migration remains deferred.

### Phase 3 — Admin Catalog — next

Order of work:

1. Shared Admin shell, navigation, error/empty/loading feedback.
2. Category CRUD and ordering.
3. Product CRUD and lifecycle.
4. Nested Package/Option editor and publish validation.
5. Structured rich-text editor.
6. Cloudinary signed media operations and cleanup.
7. Featured/category merchandising and contact settings.
8. Staging E2E acceptance.

Gate: Admin creates a Claude Product with two Packages and multiple Options, uploads media, publishes, changes price/stock, reorders merchandising, and archives it under real staging RLS.

### Phase 4 — Storefront

Homepage, catalog, category, search, product detail, contact flow, responsive and accessibility states.

Gate: Visitor finds Claude, selects the intended Option, verifies price/availability, and opens the correct contact channel.

### Phase 5 — Merchandising, SEO and Analytics

Metadata, structured data, sitemap/robots, consent UI, GA4 events, and final merchandising integration.

Gate: SSR/SEO is verified on staging; GA4 is verified on production only after consent.

### Phase 6 — QA and production data

Accessibility, visual regression, security review, performance, production migrations, Admin acceptance, catalog entry, temporary non-indexed preproduction smoke, backup, and rollback drill.

Gate: UAT passes with no high-severity blocker and rollback is proven.

### Phase 7 — Cutover

Merge release, tag `storefront-v1.0.0`, attach apex/www routes to the production Worker, monitor for 24 hours, and retain landing Pages indefinitely.

Rollback removes Worker routes and verifies apex/www return to landing; it does not delete the Worker, Supabase data, or landing project.

## 11. Verification plan

Required local/CI commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:db
pnpm build
```

Database acceptance covers anonymous published-only reads, draft isolation, non-admin denial, Admin CRUD, price/homepage constraints, and diacritic-insensitive search. Integration acceptance covers Auth lifecycle, loaders/actions, search, publish flow, Cloudinary failures, and session expiration.

Public E2E follows homepage → Claude search → product → Package → Option → price → copied contact message → Zalo/Facebook. Admin E2E follows login → Category → Product draft → media → Package/Options → publish → price/stock update → merchandising → archive → logout.

Quality targets before cutover:

- Accessibility ≥ 95.
- SEO ≥ 95.
- Performance ≥ 90.
- Best Practices ≥ 90.
- No hydration/runtime errors or client-bundle secrets.
- Published Product content is present in SSR HTML without JavaScript.

## 12. Completion criteria

The MVP is complete only when code and CI pass, staging and production acceptance are recorded, RLS and signed media operations are verified, production Catalog is populated, SEO/analytics and responsive screenshots are approved, cutover succeeds, and rollback has been rehearsed.
