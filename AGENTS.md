# Cynex MVP agent handoff

Read these files before changing the project:

1. `docs/README.md` — documentation map, ownership, and handoff checklist.
2. `PROJECT_STATUS.md` — current phase, verified state, next gate, and boundaries.
3. `CONTEXT.md` — canonical domain language.
4. `docs/PRODUCT_UX_SPEC.md` — product direction, users, journeys, onboarding, and interaction contract.
5. `docs/PROJECT_PLAN.md` — approved scope, architecture, phase plan, and acceptance criteria.
6. `docs/ARCHITECTURE.md` — current technical structure and security model.
7. Relevant runbook and ADR before changing database, infrastructure, design source, or deployment boundaries.

## Workflow

- Start work from current `develop` on a `feature/*`, `fix/*`, `docs/*`, or `test/*` branch.
- Merge feature branches into `develop`; merge `develop` into `main` only for a production release.
- Update `PROJECT_STATUS.md` and `CHANGELOG.md` in every accepted change.
- Keep `CONTEXT.md` as a glossary. Put implementation decisions in ADRs and operational procedures in runbooks.
- Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:db`, and `pnpm build` before handoff.
- Review every remote migration with `pnpm exec supabase db push --dry-run`. Use staging first. Keep production migrations deferred until the production-data phase.

## Hard boundaries

- The landing site is a separate repository and remains the production fallback.
- The production Worker has no route to `cynex.site` before approved cutover.
- Staging is public, non-indexable, contains no sensitive data, and sends no analytics.
- Runtime code uses only the Supabase publishable key. Database passwords and Supabase secret/service-role keys stay outside Git, application runtime, docs, and chat.
- Authorization uses verified Supabase claims plus `app_admins`; email and client metadata are not authorization sources.
- Cloudinary operations stay within the current environment folder prefix.
- Phase 4A audits the Landing only from the verified `landing-v1-stable` clean worktree described in `docs/LANDING_DESIGN_AUDIT_RUNBOOK.md`; never depend on the dirty Landing checkout at build/runtime.
