# Cynex MVP Project Status

Last updated: 2026-09-12

## Current state

- Current phase: Phase 3 — Admin catalog (ready to start).
- Repository: `zsky410/cynex-mvp` (public by owner decision).
- Protected branches: `main` and `develop` require Pull Requests and the `quality` check.
- Runtime: Node 22, pnpm 10.24.0.
- CI: `quality` passes on `main` and `develop`.
- Deployment: staging and production Workers Builds, isolated runtime variables, and automatic deployments are accepted end to end. Production has no custom route.
- Data: Phase 2 schema, constraints, RLS, search RPC, generated types, and Auth are accepted locally and on staging. Production migrations remain intentionally deferred.
- Production safety: the existing landing deployment remains untouched.

## Current work

Implement Admin category and product CRUD against the accepted Supabase schema without expanding into public Storefront work.

## Next gate

Phase 3 is complete when an Admin can manage categories, products, packages, options, rich text, media, and publish states on staging under the existing RLS policies.

## Documentation rule

Every accepted change updates this snapshot and `CHANGELOG.md` in the same Pull Request. Keep current truth here, canonical vocabulary in `CONTEXT.md`, implementation plan in `docs/PROJECT_PLAN.md`, decisions in `docs/adr/`, and procedures in runbooks.

## Handoff

- Work from `/home/obi/Projects/cynex-mvp`, not the landing checkout.
- Merge this documentation branch into `develop` before starting Phase 3.
- Start Phase 3 from updated `develop` on a new `feature/*` branch.
- The first Phase 3 slice is the shared Admin shell plus Category CRUD under real RLS.
- Keep production database migrations and the `cynex.site` Worker route deferred.
