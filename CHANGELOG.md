# Changelog

All notable project changes are recorded here. Current operational truth remains in `PROJECT_STATUS.md`.

## 2026-09-12

### Phase 3B — Shared Admin application shell

- Added a responsive protected Admin layout with desktop sidebar, keyboard-safe mobile navigation, active-route states, environment badge, Admin identifier, and logout.
- Added reusable breadcrumbs, page heading/action area, loading, empty, error, notification, and confirmation-dialog primitives without implementing Category CRUD or public Storefront routes.
- Centralized verified Admin loader/action guards, same-origin mutation validation, allowlist/backend failure handling, session-expired and non-admin redirects, and private/no-store/noindex response headers.
- Added unit and disposable-user HTTP acceptance for Admin access, anonymous/non-admin denial, logout, expired sessions, Origin rejection, cache/robots behavior, and keyboard focus trapping/restoration.
- Accepted the shell locally at desktop/mobile widths using Node 22; staging deployment acceptance remains the post-merge gate and production remains unchanged.

### Phase 3A — Four-level Catalog hierarchy

- Added the forward-only `variants` table between Packages and Duration Options with ordering, active state, timestamps, grants, and allowlist-backed RLS.
- Deterministically grouped legacy Options by Package and trimmed Variant name, backfilled required `variant_id`, and removed the superseded Option-to-Package relationship and duplicated Option name.
- Updated `catalog_search` so active Package → Variant → Duration Option paths control nested text search, availability, and minimum price.
- Expanded local pgTAP coverage from 30 to 60 assertions across schema, constraints, four-level visibility, role mutations, and nested search; local database lint and all application gates passed.
- Dry-ran and applied only `20260912220000_add_variants.sql` to `cynex-mvp-staging`; hosted lint, migration history, remote type synchronization, and anonymous Data API/RPC/mutation checks passed. Production remained unlinked and unchanged.
- Added a credential-safe staging role-acceptance script that uses real Email/Password sessions with only the Supabase publishable client and cleans all prefixed Catalog fixtures in `finally`.
- Completed real staging role acceptance: authenticated non-admin Variant/Duration Option create, update, and delete were denied; the allowlisted Admin completed create, update, and delete for both entity types under RLS. All Catalog fixtures were cleaned and the temporary non-admin Auth identity was removed.
- Closed Phase 3A with production migrations and the customer domain unchanged.

### Phase 0 — Provisioning

- Created the standalone `zsky410/cynex-mvp` repository and separated it from the existing landing deployment.
- Pinned Node 22 and pnpm 10.24.0; created `main` and `develop`.
- Added active GitHub rulesets that require Pull Requests and `quality`, block deletion, and block force pushes.
- Provisioned isolated staging/production Supabase projects, Cloudinary prefixes, and GA4 production measurement configuration.
- Chose public non-indexed staging without Cloudflare Zero Trust for MVP.

### Phase 1 — Foundation

- Scaffolded React Router SSR for Cloudflare Workers with TypeScript, Tailwind, Vitest, Playwright, Wrangler, and local Supabase.
- Added GitHub quality CI and verified it on both protected branches.
- Created `cynex-mvp-staging` and `cynex-mvp-production`; fixed environment-specific Vite builds and preserved dashboard variables with `keep_vars`.
- Connected Workers Builds: `develop` to staging and `main` to production.
- Activated `staging.cynex.site`, disabled staging Workers.dev/preview URLs, and verified header/meta/robots crawler protection with no GA4 or secret markers.
- Kept the production Worker detached from `cynex.site`; verified the current landing remained available.

### Phase 2 — Database and Auth

- Added nine Catalog/Admin tables, indexes, constraints, timestamps, publish/homepage invariants, and HTTPS validation.
- Added RLS for Visitor, authenticated non-admin, and allowlisted Admin roles without runtime service-role access.
- Added diacritic-insensitive `catalog_search` with filters, sorting, pagination, stock, and minimum available price.
- Generated typed Supabase contracts and synchronized them with staging PostgREST 14.5.
- Added SSR cookie Auth, `/admin/login`, `/admin/logout`, guarded `/admin`, verified claims, allowlist authorization, and private/no-store Auth responses.
- Added local database CI with 30 pgTAP assertions and disposable-user HTTP Auth acceptance.
- Reviewed and applied four migrations to staging; remote lint and anonymous Data API/RPC/mutation checks passed.
- Allowlisted and accepted the real staging Admin login, guard, and logout flow.
- Left production database migrations intentionally unapplied.

### Documentation and Phase 3 handoff

- Consolidated current status, canonical vocabulary, architecture, runbook, decisions, and the full delivery plan inside the `cynex-mvp` repository.
- Expanded the plan into a route-by-route Storefront and Admin functional specification covering component contracts, query behavior, lifecycle rules, media flow, error states, accessibility, SEO, consent, performance, security, cutover, and rollback.
- Split Phases 3–5 into independently acceptable implementation slices with explicit staging gates, and detailed Phase 6 production-data and Phase 7 cutover procedures.
- Chose Vietnamese canonical public routes (`/san-pham`, `/danh-muc/:slug`, and `/tim-kiem`) while keeping Admin and staging surfaces non-indexed.
- Accepted Product → Package → Variant → Duration Option as the canonical commercial hierarchy, superseding the original schema that combined Variant and duration in one Option.
- Added the full Product/UX specification covering direction, product promise, user types/jobs, experience principles, Discovery Onboarding, detailed Visitor/Admin journeys, selector behavior, screen states, content/copy, analytics, accessibility, trust/safety, and acceptance scenarios.
- Added ADR 0004 and scheduled a forward-only staging schema/RLS/search/test amendment as Phase `3A`; production remains unchanged.
- Added a documentation map with canonical ownership and handoff-completeness checks.
- Added a stable Landing audit/port runbook pinned to verified tag `landing-v1-stable` and commit `d28ed1f`, using a detached clean worktree and screenshot-first evidence rather than the dirty checkout.
- Added a complete infrastructure/environment runbook and recorded the required manual rotation/removal of the plaintext credential inventory before further remote Phase 3 work.
- Expanded the staging database runbook from a short checklist into local/dry-run/push/types/RLS/Auth/cleanup/evidence/failure gates.
- Added a production readiness, cutover, monitoring, routing rollback, and roll-forward runbook while keeping execution deferred to approved Phases 6–7.
- Recorded the owner's explicit decision to retain the separate Landing checkout's untracked plaintext credential inventory without rotation; the accepted risk no longer blocks Phase 3, while the file remains prohibited from Git, builds, docs, logs, Pull Requests, and future chat.
