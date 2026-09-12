# Cynex MVP Project Status

Last updated: 2026-09-12

## Current state

- Current phase: Phase 2 — Database and authentication (local implementation complete).
- Repository: `zsky410/cynex-mvp` (public by owner decision).
- Protected branches: `main` and `develop` require Pull Requests and the `quality` check.
- Runtime: Node 22, pnpm 10.24.0.
- CI: `quality` passes on `main` and `develop`.
- Deployment: staging and production Workers Builds, isolated runtime variables, and automatic deployments are accepted end to end. Production has no custom route.
- Data: schema, constraints, RLS, search RPC, generated types, and Auth are implemented locally; all four migrations are applied to staging and anonymous remote acceptance passes. Admin allowlist and authenticated staging acceptance are pending.
- Production safety: the existing landing deployment remains untouched.

## Current work

Review and apply migrations to Supabase staging, allowlist the existing staging Admin UUID, then run authenticated staging acceptance.

## Next gate

Phase 2 is complete when migrations apply cleanly, generated types are current, database tests prove anonymous users cannot mutate catalog data or read drafts, and authenticated admin login/logout/session guards work on staging.

## Documentation rule

Every accepted change updates this file in the same Pull Request. Keep current truth in the sections above and append a concise entry below. Record hard-to-reverse architectural decisions separately in `docs/adr/`.

## Change log

### 2026-09-12

- Completed repository scaffold, Node/pnpm pinning, local Supabase setup, and quality tooling.
- Created and protected `main` and `develop`; verified both reject direct pushes.
- Confirmed CI passes lint, typecheck, test, and build on both protected branches.
- Added the project glossary and established this status/change-log convention.
- Added environment-aware crawler protection for staging; runtime smoke confirms its header, meta tag, blocking `robots.txt`, and lack of GA4 without adding `noindex` to production.
- Corrected environment deployment scripts so the Cloudflare Vite build selects its target environment before Wrangler deploys it.
- Deployed the staging and production skeleton Workers without assigning the production domain; removed an incorrectly named temporary Worker created during deployment diagnosis.
- Remotely verified both Workers return HTTP 200, staging is non-indexable, production is not marked `noindex`, and the existing `cynex.site` landing remains reachable.
- Declared `staging.cynex.site` as the staging custom domain and an empty production route list in version-controlled Wrangler configuration.
- Verified `staging.cynex.site` over HTTPS with its crawler protections, no GA4, and no secret markers; the staging `workers.dev` and Preview URLs are disabled.
- Configured Wrangler to preserve dashboard-managed runtime variables across deployments.
- Connected staging Workers Builds and configured its isolated runtime variables; started the first automatic deployment acceptance run.
- Accepted the first automatic staging deployment: GitHub `quality` passed, Cloudflare deployed the merge from `develop`, crawler protections remained active, the Cloudinary secret was preserved, and the landing stayed reachable.
- Connected production Workers Builds to `main` and started its first automatic deployment acceptance run.
- Accepted the first automatic production deployment and runtime bindings without attaching `cynex.site`; production remained non-index-blocked, no analytics or secret markers were emitted, and the existing landing remained reachable.
- Completed Phase 1 and opened Phase 2 for database and authentication implementation.
- Implemented the catalog schema, constraints, indexes, RLS, public search RPC, and generated database types.
- Added SSR cookie authentication, Admin allowlist authorization, login/logout, and an authenticated `/admin` guard without a service-role runtime key.
- Passed local database lint, 30 pgTAP assertions, and real HTTP Auth acceptance with disposable Admin and non-admin fixtures.
- Applied the four reviewed Phase 2 migrations to Supabase staging, confirmed migration history and remote schema lint, synchronized generated types with PostgREST 14.5, and passed anonymous Data API/RPC/mutation acceptance.
