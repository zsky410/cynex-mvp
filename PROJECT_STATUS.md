# Cynex MVP Project Status

Last updated: 2026-09-12

## Current state

- Current phase: Phase 3 — Admin catalog (ready to start).
- Repository: `zsky410/cynex-mvp` (public by owner decision).
- Protected branches: `main` and `develop` require Pull Requests and the `quality` check.
- Runtime: Node 22, pnpm 10.24.0.
- CI: `quality` passes on `main` and `develop`.
- Deployment: staging and production Workers Builds, isolated runtime variables, and automatic deployments are accepted end to end. Production has no custom route.
- Data: Phase 2's original three-level schema, constraints, RLS, search RPC, generated types, and Auth were accepted locally and on staging. The newly accepted Product → Package → Variant → Duration Option requirement now needs a forward staging migration before Product editor work. Production migrations remain intentionally unapplied.
- Production safety: the existing landing deployment remains untouched.
- Planning: `docs/PRODUCT_UX_SPEC.md` defines product direction, users, journeys, Discovery Onboarding, four-level Selection, screen states, content, measurement, and acceptance scenarios. `docs/PROJECT_PLAN.md` defines implementation and delivery through cutover.
- Operations: `docs/README.md` maps all sources of truth; dedicated runbooks cover infrastructure, staging migrations, stable Landing audit/port, and production cutover/rollback.

## Required manual security action

The separate Landing checkout contains an untracked plaintext credential inventory. Before Phase 3 performs further remote changes, rotate every credential contained there, update provider secret stores/password manager, securely remove the plaintext file, and run a secret scan. Do not commit or copy its contents into this repository or chat.

## Current work

Begin Phase 3 with the four-level Catalog hierarchy amendment, then implement the shared Admin shell and Category CRUD without expanding into public Storefront work.

## Next gate

Phase 3 is complete when an Admin can manage Categories, Products, Packages, Variants, Duration Options, rich text, media, and publish states on staging under the amended RLS policies.

## Documentation rule

Every accepted change updates this snapshot and `CHANGELOG.md` in the same Pull Request. Keep current truth here, canonical vocabulary in `CONTEXT.md`, product/interaction intent in `docs/PRODUCT_UX_SPEC.md`, implementation plan in `docs/PROJECT_PLAN.md`, decisions in `docs/adr/`, and procedures in runbooks.

## Handoff

- Work from `/home/obi/Projects/cynex-mvp`, not the landing checkout.
- Merge this documentation branch into `develop` before starting Phase 3.
- Start Phase 3 from updated `develop` on a new `feature/*` branch.
- Phase `3A` is the forward-only four-level hierarchy migration; after its local/staging acceptance, continue with `3B` Admin shell and `3C` Category CRUD.
- Phase 4A must follow `docs/LANDING_DESIGN_AUDIT_RUNBOOK.md`: audit a detached clean worktree at verified tag `landing-v1-stable`, create screenshot/report evidence, then port only approved assets/tokens/components.
- Keep production database migrations and the `cynex.site` Worker route deferred.
