# Cynex MVP Project Status

Last updated: 2026-09-12

## Current state

- Current phase: Phase 3 — Admin catalog (Phase 3A complete; Phase 3B next).
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

Implement the Phase 3B shared Admin shell, then Phase 3C Category CRUD, without expanding into public Storefront work.

## Next gate

Phase 3 is complete when an Admin can manage Categories, Products, Packages, Variants, Duration Options, rich text, media, and publish states on staging under the amended RLS policies.

## Documentation rule

Every accepted change updates this snapshot and `CHANGELOG.md` in the same Pull Request. Keep current truth here, canonical vocabulary in `CONTEXT.md`, product/interaction intent in `docs/PRODUCT_UX_SPEC.md`, implementation plan in `docs/PROJECT_PLAN.md`, decisions in `docs/adr/`, and procedures in runbooks.

## Handoff

- Work from `/home/obi/Projects/cynex-mvp`, not the landing checkout.
- Phase 3A work is on `feature/phase-3a-four-level-catalog`, created from updated `develop` after the credential-risk documentation merge.
- Phase `3A` is complete. Migration `20260912220000_add_variants.sql` is applied to staging. Local reset, 60 pgTAP assertions, database lint, application gates, forward-data backfill rehearsal, staging dry-run/push/lint, remote type synchronization, and anonymous Data API/RPC/mutation checks passed.
- Real staging role acceptance passed through the Supabase publishable client: authenticated non-admin Variant/Duration Option create, update, and delete were denied; the allowlisted Admin completed create, update, and delete for both entity types under RLS. All prefixed Catalog fixtures were cleaned and the temporary non-admin Auth identity was removed afterward.
- Continue with `3B` Admin shell and `3C` Category CRUD.
- Phase 4A must follow `docs/LANDING_DESIGN_AUDIT_RUNBOOK.md`: audit a detached clean worktree at verified tag `landing-v1-stable`, create screenshot/report evidence, then port only approved assets/tokens/components.
- Keep production database migrations and the `cynex.site` Worker route deferred.
