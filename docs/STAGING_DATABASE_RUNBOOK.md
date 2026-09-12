# Staging database migration and acceptance runbook

Status: active for `cynex-mvp-staging` only
Production use: prohibited

## 1. Purpose

Use this runbook for every forward migration applied to the staging Supabase project. It covers local verification, remote dry-run, application, type generation, RLS/Auth acceptance, cleanup, evidence, and recovery boundaries.

The hosted database login role may not execute pgTAP in Supabase's shared extension schema. Full pgTAP stays in isolated local CI; hosted acceptance uses database lint, the publishable-key Data API/RPC, and the deployed application with real role boundaries.

## 2. Absolute prohibitions

- Never run `supabase db reset --linked`.
- Never link to or push production from this procedure.
- Never rewrite, rename, or delete a migration already applied remotely.
- Never pass a database/Admin password directly in a command argument or save it in shell history.
- Never use a Supabase secret/service-role key in the application or acceptance scripts.
- Never paste credentials into Git, docs, logs, screenshots, issues, Pull Requests, or chat.
- Never seed sensitive or real customer data into staging.

## 3. Preconditions

- Current branch is a feature branch created from updated `develop`.
- Required migration and tests are reviewed in the same diff.
- Local Docker-compatible runtime is healthy.
- Node `22.x` and pnpm `10.24.0` are active.
- Password manager contains the staging project reference/database password and they are distinguishable from production.
- A current local database backup/export exists when the migration transforms meaningful local fixtures.
- Staging fixtures to be transformed are understood and disposable or backed up.

Verify repository state:

```bash
cd /home/obi/Projects/cynex-mvp
source "$HOME/.nvm/nvm.sh"
nvm use 22
git status --short --branch
git fetch origin
```

Stop if unrelated working-tree changes overlap migrations, generated types, tests, or documentation.

## 4. Migration construction rules

- Add a new timestamped file under `supabase/migrations/`.
- Use forward-compatible SQL and explicit constraints/indexes/grants/RLS.
- Give functions a controlled `search_path`.
- Treat RLS and grants as part of the feature, not a later hardening step.
- Include data backfill before making a new relationship required.
- Make destructive column/constraint removal the final step after backfill validation.
- Preserve stable identifiers where practical.
- Add/update pgTAP for schema, constraints, RLS, and public RPC behavior.
- Regenerate types from local schema and review semantic changes.

For Phase `3A`, follow ADR 0004 and the exact migration order in `PROJECT_PLAN.md`: add `variants`, backfill Duration Options, require `variant_id`, update public traversal/search, then remove superseded Package relationship and duplicated Option name.

## 5. Local reset and acceptance

Start/reset the isolated local database:

```bash
pnpm exec supabase start
pnpm db:reset
pnpm db:test
pnpm db:types
```

Run application gates:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Use `pnpm test:auth` when the local application prerequisites are running. Inspect `git diff` after type generation; generated changes must correspond exactly to migration intent.

Local database acceptance for a Catalog migration includes:

- Anonymous sees active/published descendants only.
- Authenticated non-admin has Visitor-level reads and no mutation.
- Allowlisted Admin can execute intended CRUD through RLS.
- Inactive parent hides descendants.
- Draft/archived Product hides descendants.
- Price/stock derives only from a complete active hierarchy path.
- Invalid constraints fail with expected SQL state/behavior.
- Search remains case/diacritic insensitive and published-only.
- Migration succeeds from the preceding schema, not only from a freshly rewritten baseline.

## 6. Link staging safely

Check current link metadata without printing secrets. If the repo is not linked to staging or the link is uncertain:

```bash
pnpm exec supabase link --project-ref <staging-project-ref>
```

Enter the staging database password interactively when prompted. Confirm the displayed project identity is staging. If production identity appears, stop immediately without pushing.

The `.supabase/.temp` link metadata is ignored and local-only. Do not commit it.

## 7. Mandatory remote dry-run

Run:

```bash
pnpm exec supabase db push --dry-run
```

Review and record:

- Project is staging.
- Only intended new migration filenames appear.
- No unexpected baseline replay, reset, drop, or production operation appears.
- Forward data transformation order matches the plan.
- No migration history conflict is reported.

If output is unexpected, stop. Inspect local/remote migration history and resolve with a documented safe approach; do not mark history repaired or use destructive reset merely to make the CLI proceed.

## 8. Apply to staging

Only after local gates, review, and dry-run acceptance:

```bash
pnpm exec supabase db push
```

Do not interrupt a running migration unless the provider/session fails. Save sanitized output showing migration names and success without passwords/tokens.

Run hosted lint through the available Supabase dashboard/CLI workflow and investigate every security/performance warning relevant to changed objects.

## 9. Regenerate and compare remote types

Generate remote types to a temporary ignored location or inspect output without overwriting first. After verifying it represents the intended linked staging schema, regenerate the committed file:

```bash
pnpm exec supabase gen types typescript --linked > app/types/database.ts
pnpm typecheck
git diff -- app/types/database.ts
```

Confirm local and linked schema semantics match. A surprising type diff means the migration or link state needs investigation.

## 10. Allowlist and Auth

An existing staging Auth identity must be explicitly present in `app_admins`. Use the Supabase SQL Editor with the staging Admin UUID from the password manager/provider dashboard; never write that UUID together with credentials into project docs.

Example shape only:

```sql
insert into public.app_admins (user_id)
values ('<staging-admin-uuid>')
on conflict (user_id) do nothing;
```

Application acceptance must use a real staging login and verified cookie flow. Do not treat a direct database session or service-role query as proof of application authorization.

## 11. Hosted acceptance matrix

### Anonymous

- Reads only active Categories and published Product hierarchy.
- Cannot read `app_admins` beyond policy intent.
- Cannot see draft, archived, hidden-parent, or inactive-child data.
- Search returns only published/active hierarchy data.
- Mutation attempts return authorization failure.

### Authenticated non-admin

- Has the same Catalog visibility as anonymous.
- Cannot perform Admin mutations.
- Cannot enter protected Admin UI.

### Allowlisted Admin

- Login redirects to protected Admin.
- Intended migration-era CRUD succeeds under RLS.
- Constraint/invariant failures are preserved.
- Logout returns to login and old protected navigation no longer succeeds.

### Application and environment

- `staging.cynex.site` runs the expected `develop` commit.
- Responses remain noindex/noarchive and no GA4 request is sent.
- No secret appears in response HTML, built assets, browser logs, or error messages.
- Cloudinary operations, when in scope, remain under `cynex/staging`.

## 12. Fixtures and cleanup

- Prefix temporary records with a recognizable acceptance marker.
- Record IDs locally only for cleanup.
- Remove temporary children before parents unless cascade behavior is itself under test.
- Confirm no test Admin, Product, media, Package, Variant, or Duration Option remains unintentionally.
- Confirm cleanup does not remove owner-entered UAT content.
- For Cloudinary-backed fixtures, reconcile both database metadata and remote assets.

## 13. Evidence and documentation

Record in the feature Pull Request and project docs:

- Migration filenames.
- Local database/test counts.
- Dry-run showed only expected staging changes.
- Staging push and hosted lint result.
- Anonymous, non-admin, and Admin acceptance result.
- Generated type synchronization result.
- Fixture cleanup result.
- Explicit confirmation that production was unchanged.

Update `PROJECT_STATUS.md`, `CHANGELOG.md`, `ARCHITECTURE.md`, this runbook when procedure changes, and ADRs only for qualifying decisions.

## 14. Failure handling

If migration application fails:

1. Capture sanitized error and identify whether any statement committed.
2. Inspect actual staging schema/migration history before retrying.
3. Prefer a new corrective forward migration when remote state changed.
4. Re-run local reset from the complete ordered migration set.
5. Re-run dry-run and acceptance.
6. Never manually delete remote migration history or reset the linked database to hide the failure.

If acceptance fails after successful migration, stop downstream Phase work. Keep production untouched, diagnose the failing boundary, and repair through a reviewed feature branch.

## 15. Completion gate

A staging migration is complete only when:

- Local reset and all required gates pass on Node 22.
- Dry-run and applied migration names match.
- Hosted schema lint is acceptable.
- Generated local/remote types agree.
- Anonymous, non-admin, and Admin boundaries pass.
- Deployed staging application behavior passes.
- Fixtures/assets are reconciled.
- No secrets were exposed.
- Documentation/evidence are updated.
- Production remains unapplied and customer domain remains on Landing.
