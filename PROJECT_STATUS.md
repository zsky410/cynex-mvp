# Cynex MVP Project Status

Last updated: 2026-09-12

## Current state

- Current phase: Phase 3 — Admin catalog (Phase 3B complete and accepted on staging; Phase 3C next).
- Repository: `zsky410/cynex-mvp` (public by owner decision).
- Protected branches: `main` and `develop` require Pull Requests and the `quality` check.
- Runtime: Node 22, pnpm 10.24.0.
- CI: `quality` passes on `main` and `develop`.
- Deployment: staging and production Workers Builds, isolated runtime variables, and automatic deployments are accepted end to end. Production has no custom route.
- Data: the forward-only Phase 3A migration now implements Product → Package → Variant → Duration Option locally and on staging, including deterministic Option backfill, four-level RLS/search traversal, and synchronized generated types. Production migrations remain intentionally unapplied.
- Production safety: the existing landing deployment remains untouched.
- Planning: `docs/PRODUCT_UX_SPEC.md` defines product direction, users, journeys, Discovery Onboarding, four-level Selection, screen states, content, measurement, and acceptance scenarios. `docs/PROJECT_PLAN.md` defines implementation and delivery through cutover.
- Operations: `docs/README.md` maps all sources of truth; dedicated runbooks cover infrastructure, staging migrations, stable Landing audit/port, and production cutover/rollback.

## Accepted credential-risk decision

On 2026-09-12, the owner explicitly chose not to rotate or remove the credentials currently retained in the separate Landing checkout's untracked plaintext inventory. This is an accepted owner risk and does not block Phase 3. The file remains untracked and must never be committed, copied into this repository, or reproduced in documentation, logs, issues, Pull Requests, or future chat.

## Current work

Merge the Phase 3B staging-acceptance record, then begin Phase 3C Category CRUD on a new feature branch. Public Storefront work remains deferred.

## Next gate

Phase 3 is complete when an Admin can manage Categories, Products, Packages, Variants, Duration Options, rich text, media, and publish states on staging under the amended RLS policies.

## Documentation rule

Every accepted change updates this snapshot and `CHANGELOG.md` in the same Pull Request. Keep current truth here, canonical vocabulary in `CONTEXT.md`, product/interaction intent in `docs/PRODUCT_UX_SPEC.md`, implementation plan in `docs/PROJECT_PLAN.md`, decisions in `docs/adr/`, and procedures in runbooks.

## Handoff

- Work from `/home/obi/Projects/cynex-mvp`, not the landing checkout.
- This documentation-only acceptance record is on `docs/record-phase-3b-staging-acceptance`, created from `develop` at Phase 3B merge commit `658c408`.
- Phase `3A` is complete. Migration `20260912220000_add_variants.sql` is applied to staging. Local reset, 60 pgTAP assertions, database lint, application gates, forward-data backfill rehearsal, staging dry-run/push/lint, remote type synchronization, and anonymous Data API/RPC/mutation checks passed.
- Real staging role acceptance passed through the Supabase publishable client: authenticated non-admin Variant/Duration Option create, update, and delete were denied; the allowlisted Admin completed create, update, and delete for both entity types under RLS. All prefixed Catalog fixtures were cleaned and the temporary non-admin Auth identity was removed afterward.
- Phase `3B` implements the protected responsive Admin layout, desktop/mobile navigation, environment identity, breadcrumbs/headings, logout, shared state/confirmation/notification primitives, centralized verified loader/action guards, same-origin mutation checks, private/no-store/noindex responses, and explicit unauthorized/session/backend-failure behavior.
- Phase `3B` local acceptance passed on Node 22: 13 Vitest assertions plus 10 disposable-user HTTP Auth checks cover Admin access, anonymous/non-admin denial, session expiry, logout, Origin rejection, cache/robots behavior, and keyboard focus management. Desktop/mobile render inspection and the Impeccable detector passed. No Category CRUD or public Storefront implementation is included.
- Phase `3B` staging acceptance passed from merge commit `658c408`: anonymous access redirects to login; the real allowlisted Admin can sign in, use desktop/mobile navigation, identify the `STAGING` environment, operate keyboard focus, log out, and cannot reuse the old session; an authenticated non-admin is denied and its temporary Auth identity was removed after acceptance.
- Phase `3B` is closed. Start `3C` Category CRUD only after this documentation branch merges into `develop`.
- Phase 4A must follow `docs/LANDING_DESIGN_AUDIT_RUNBOOK.md`: audit a detached clean worktree at verified tag `landing-v1-stable`, create screenshot/report evidence, then port only approved assets/tokens/components.
- Keep production database migrations and the `cynex.site` Worker route deferred.
