# Cynex MVP documentation map

This directory is the durable handoff for Cynex Storefront. Decisions and verified status must live here or in the linked root documents; chat history is not a source of truth.

## Read first

1. [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) — current verified state, active phase, next gate, and blockers.
2. [`../CONTEXT.md`](../CONTEXT.md) — canonical domain vocabulary only.
3. [`PRODUCT_UX_SPEC.md`](./PRODUCT_UX_SPEC.md) — product direction, users, onboarding, journeys, interaction rules, and acceptance scenarios.
4. [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) — architecture contract, implementation slices, gates, QA, and release sequence.
5. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — deployed system, environments, data shape, authorization, and verification model.
6. [`../AGENTS.md`](../AGENTS.md) — repository workflow and hard safety boundaries.

## Operational runbooks

| Runbook | Use it when | Do not use it for |
|---|---|---|
| [`LANDING_DESIGN_AUDIT_RUNBOOK.md`](./LANDING_DESIGN_AUDIT_RUNBOOK.md) | Auditing and selectively porting the stable Landing identity during Phase 4A | Reading the dirty Landing working tree as approved design |
| [`INFRASTRUCTURE_RUNBOOK.md`](./INFRASTRUCTURE_RUNBOOK.md) | Checking/reconstructing GitHub, Cloudflare, Supabase, Cloudinary, GA4, and environment configuration | Storing credential values |
| [`STAGING_DATABASE_RUNBOOK.md`](./STAGING_DATABASE_RUNBOOK.md) | Reviewing, applying, and accepting a migration on staging | Production migration or linked reset |
| [`RELEASE_CUTOVER_RUNBOOK.md`](./RELEASE_CUTOVER_RUNBOOK.md) | Phase 6 production readiness, Phase 7 cutover, monitoring, and rollback | Early attachment of `cynex.site` |

Latest documentation audit: [`audits/2026-09-12-documentation-completeness.md`](./audits/2026-09-12-documentation-completeness.md).

## Architecture decisions

| ADR | Decision |
|---|---|
| [`adr/0001-separate-landing-and-storefront-deployments.md`](./adr/0001-separate-landing-and-storefront-deployments.md) | Landing remains an independent fallback deployment |
| [`adr/0002-supabase-rls-allowlist-authorization.md`](./adr/0002-supabase-rls-allowlist-authorization.md) | RLS plus environment-specific Admin allowlist is the authorization boundary |
| [`adr/0003-public-nonindexed-staging.md`](./adr/0003-public-nonindexed-staging.md) | Staging is public, non-indexed, analytics-free, and non-sensitive |
| [`adr/0004-four-level-commercial-hierarchy.md`](./adr/0004-four-level-commercial-hierarchy.md) | Product → Package → Variant → Duration Option is canonical |

## Ownership rules

| Information | Canonical location |
|---|---|
| Current truth and next action | `PROJECT_STATUS.md` |
| Domain meaning and preferred terms | `CONTEXT.md` |
| Product intent and UX behavior | `docs/PRODUCT_UX_SPEC.md` |
| Technical implementation order | `docs/PROJECT_PLAN.md` |
| Current system shape | `docs/ARCHITECTURE.md` |
| Hard-to-reverse decisions and trade-offs | `docs/adr/` |
| Repeatable manual procedures | Runbooks in `docs/` |
| Accepted historical changes | `CHANGELOG.md` |
| Credentials | Password manager and provider secret stores only |

Do not duplicate current status across multiple files. Historical statements remain in `CHANGELOG.md`; if they are superseded, `PROJECT_STATUS.md` and the active specification must say so explicitly.

## Documentation update checklist

Every accepted implementation Pull Request must answer:

- Did the current phase, verified evidence, next action, or blocker change? Update `PROJECT_STATUS.md`.
- Did behavior, scope, user flow, or acceptance criteria change? Update `PRODUCT_UX_SPEC.md` and/or `PROJECT_PLAN.md`.
- Did a domain term change? Update `CONTEXT.md` without implementation detail.
- Did system structure or environment behavior change? Update `ARCHITECTURE.md`.
- Is the decision hard to reverse, surprising, and the result of a real trade-off? Add or supersede an ADR.
- Did a manual procedure change? Update its runbook.
- Did an accepted change occur? Append it to `CHANGELOG.md`.
- Did any secret enter a diff, build output, screenshot, fixture, or log? Stop, remove it, rotate it, and record only the sanitized incident/action.

## Handoff completeness gate

Before moving work to another agent/chat/workspace:

1. Working directory and branch are stated.
2. Local commit, remote branch, and clean/dirty state are verified.
3. Completed work and unimplemented planned work are distinguished.
4. Local, staging, production, and customer-domain state are distinguished.
5. Test commands and exact results are recorded.
6. Manual acceptance and remaining human-only steps are recorded.
7. Production migrations/domain attachment remain explicitly deferred unless approved.
8. No credential value is copied into the handoff.
9. The next slice and its acceptance gate are unambiguous.
