# Cynex MVP infrastructure runbook

Status: current operational contract  
Last verified in project handoff: 2026-09-12

## 1. Purpose and safety

Use this runbook to inspect, repair, or reproduce the non-secret configuration supporting Cynex MVP. Provider dashboards can change labels over time; preserve the intended state below even if navigation names differ.

Never place database passwords, Supabase secret/service-role keys, Admin passwords, Cloudinary API secret, recovery codes, access tokens, or copied dashboard secret values in Git, documentation, terminal command arguments, screenshots, or chat.

Allowed public configuration includes repository URLs, Worker names, domains, Supabase project URLs/references, publishable keys, Cloudinary cloud name/API key, and GA4 measurement ID. Even for allowed values, prefer placeholders in durable runbooks unless the application configuration itself must expose them.

## 2. System inventory

| Concern | Staging | Production |
|---|---|---|
| Git branch | `develop` | `main` |
| Cloudflare Worker | `cynex-mvp-staging` | `cynex-mvp-production` |
| Customer-facing domain | `staging.cynex.site` | none before cutover |
| Supabase project | `cynex-mvp-staging` | `cynex-mvp-production` |
| Cloudinary folder prefix | `cynex/staging` | `cynex/production` |
| GA4 | disabled | configured but loaded only after consent |
| Data | non-sensitive test/UAT | real data only in Phase 6 |

Independent fallback:

| Concern | Value |
|---|---|
| Repository | `zsky410/landingpage_cynex` |
| Cloudflare project | `landingpage-cynex` |
| Stable source | tag `landing-v1-stable`, commit `d28ed1f588b8ef6cf775a02c4e40d4bba231c68d` |
| Current customer domain before cutover | `cynex.site` and applicable `www` configuration |
| Long-term fallback domain | `landing.cynex.site` |

## 3. Credential inventory and ownership

Store these separately for staging and production in a password manager:

| Value | Secret | Consumer |
|---|---:|---|
| GitHub repository URL | No | Git clients/Cloudflare connection |
| Supabase project reference and URL | No | CLI/Worker variable |
| Supabase publishable key | No | Worker variable |
| Supabase database password | Yes | Human/CLI migration only |
| Admin email | Personal identifier | Supabase Auth/human login |
| Admin password | Yes | Human login only |
| Admin Auth UUID | No, but environment-specific | `app_admins` allowlist |
| Cloudinary cloud name | No | Worker variable |
| Cloudinary API key | No | Worker variable |
| Cloudinary API secret | Yes | Worker encrypted secret only |
| GA4 Measurement ID | No | Production Worker variable |

Do not use one database/Admin password across environments. Never copy the staging Admin UUID into production because Auth identities are environment-specific.

Accepted owner decision as of 2026-09-12: the Landing checkout's untracked local plaintext credential inventory will remain in place and its credentials will not be rotated. This accepted risk does not block Phase 3. The file must remain untracked and outside all application/runtime/build inputs; never commit, copy, print, quote, upload, screenshot, or reproduce its values. Revisit rotation immediately if the file becomes tracked, shared, backed up to an untrusted location, or otherwise exposed beyond the owner's local machine.

## 4. Repository and branch controls

Repository: `zsky410/cynex-mvp`, public by owner decision.

Workflow:

```text
feature/fix/docs/test branch
→ Pull Request to develop
→ quality check
→ merge to develop
→ automatic staging deployment
→ acceptance
→ Pull Request from develop to main for approved release
→ quality check
→ merge to main
→ automatic production Worker deployment
```

Rulesets for both `main` and `develop`:

- Block force push.
- Block branch deletion.
- Require Pull Request.
- Require `quality` status check.
- Review approval count may remain zero for the current one-person team.

GitHub Actions performs quality checks only. Cloudflare Workers Builds deploys; no Cloudflare API token belongs in GitHub Actions for this workflow.

Verification:

```bash
git status --short --branch
git remote -v
git fetch origin
git rev-parse HEAD
git ls-remote origin refs/heads/develop refs/heads/main
```

Use GitHub's ruleset UI and a harmless test Pull Request when controls change. Never test protection with destructive force-push/delete commands.

## 5. Runtime versions and repository setup

- Node: `22.x`, pinned by `.nvmrc`, `.node-version`, and `package.json` engines.
- pnpm: `10.24.0`, pinned by `packageManager`.
- Package manager installation should use Corepack.
- Wrangler and Supabase CLI are project dev dependencies; use `pnpm exec`, not assumed global versions.
- Local Supabase requires a working Docker-compatible runtime.

Setup:

```bash
cd /home/obi/Projects/cynex-mvp
source "$HOME/.nvm/nvm.sh"
nvm use 22
corepack enable
pnpm install --frozen-lockfile
pnpm exec supabase start
pnpm db:reset
```

Quality gate:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:db
pnpm build
```

Use `pnpm test:auth` when the local app/Supabase prerequisites for HTTP Auth acceptance are running. Use `pnpm test:e2e` once relevant Playwright journeys exist.

## 6. Environment-variable contract

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

Forbidden runtime values:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_PASSWORD
ADMIN_PASSWORD
```

Local values live in ignored `.dev.vars`, initialized from `.dev.vars.example`. Dashboard-managed Worker values survive deploy through Wrangler `keep_vars`. Never add credential values to `wrangler.jsonc`.

Required behavior:

| Variable | Local | Staging | Production |
|---|---|---|---|
| `APP_ENV` | `local` | `staging` | `production` |
| `APP_ORIGIN` | local app origin | `https://staging.cynex.site` | `https://cynex.site` |
| Supabase URL/key | local stack | staging project | production project |
| Cloudinary prefix | `cynex/staging` | `cynex/staging` | `cynex/production` |
| GA4 ID | empty | empty | configured value |

Even when a production GA4 ID exists, runtime code must wait for explicit analytics consent before loading GA4.

## 7. Cloudflare Workers Builds

Expected build/deploy mapping:

| Worker | Connected branch | Build command | Deploy command | Root/path |
|---|---|---|---|---|
| `cynex-mvp-staging` | `develop` | `pnpm build:staging` | `pnpm exec wrangler deploy --env staging` | repository root `/` |
| `cynex-mvp-production` | `main` | `pnpm build:production` | `pnpm exec wrangler deploy --env production` | repository root `/` |

Both use `NODE_VERSION=22`. Non-production/preview branch builds remain disabled unless a later decision explicitly introduces ephemeral environments.

The committed `wrangler.jsonc` must keep:

- `keep_vars: true`.
- Staging custom-domain route only.
- Production `routes: []` before approved cutover.
- Distinct Worker names.

After dashboard changes, trigger deployment through a normal merged Pull Request and verify the deployment commit, build command, Worker name, and health response. Do not declare automatic deployment accepted based only on a dashboard connection state.

## 8. Staging domain and crawler controls

`staging.cynex.site` is intentionally public without Cloudflare Access. Required controls:

- HTTPS custom domain active.
- `X-Robots-Tag: noindex, nofollow, noarchive` on responses.
- HTML robots meta with the same intent.
- `/robots.txt` returns `User-agent: *` and `Disallow: /`.
- No GA4 requests or analytics events.
- No sensitive/production data.
- No unintended Workers.dev or Preview URL used for UAT.

`noindex` is not authentication. If sensitive data is ever required on staging, introduce access control before that data is added and record the architecture decision.

Acceptance checks:

```bash
curl -I https://staging.cynex.site
curl https://staging.cynex.site/robots.txt
curl https://staging.cynex.site
```

Inspect returned headers/HTML without printing environment secret values. Use browser Network tools to confirm no GA4 traffic.

## 9. Supabase environments

Both projects use Email/Password Auth with public signup disabled. Each has a separately created and confirmed Admin Auth user; application authorization additionally requires its environment-specific UUID in `app_admins`.

Auth URL intent:

| Environment | Site URL | Allowed local callback during development |
|---|---|---|
| Staging | `https://staging.cynex.site` | `http://localhost:5173/admin/auth/callback` |
| Production | `https://cynex.site` | local callback only when explicitly needed and reviewed |

No OAuth, custom SMTP, password recovery, or Admin account-management UI is required for MVP.

Use [`STAGING_DATABASE_RUNBOOK.md`](./STAGING_DATABASE_RUNBOOK.md) for migrations. Production migration is forbidden before the approved Phase 6 procedure in [`RELEASE_CUTOVER_RUNBOOK.md`](./RELEASE_CUTOVER_RUNBOOK.md).

Never run:

```text
supabase db reset --linked
```

## 10. Cloudinary

- One Cynex product environment may serve both app environments with strict folder separation.
- Backend signs operations with the environment's `CLOUDINARY_FOLDER_PREFIX`.
- No unsigned upload preset.
- API secret exists only in local ignored secrets and Cloudflare encrypted Worker secrets.
- Browser receives short-lived signed upload parameters, never the API secret.
- Worker verifies returned signature/folder before saving media metadata.
- Delete/destroy is rejected outside the active environment prefix.

Staging acceptance must prove all created assets remain under `cynex/staging`. Production media is not created during Phase 3 acceptance.

## 11. GA4

- Property and production web stream are provisioned for Cynex MVP with Vietnam timezone and VND currency.
- Local and staging have an empty `GA_MEASUREMENT_ID` and never send events.
- Production has the measurement ID configured but code loads GA4 only after opt-in.
- Approved events and prohibited personal data are defined in `PRODUCT_UX_SPEC.md`.

Before Phase 5 consent implementation, having the dashboard stream configured does not mean analytics is enabled in the application.

## 12. Environment acceptance matrix

| Check | Local | Staging | Production before Phase 6/7 |
|---|---:|---:|---:|
| Correct Node/pnpm | Required | Build log | Build log |
| Quality gate | Required | CI before merge | CI before merge |
| Correct Supabase | Local only | Staging only | Production configured, migrations deferred |
| Correct Cloudinary prefix | Staging-safe | `cynex/staging` | `cynex/production` configured |
| GA4 requests | None | None | None until consent feature/test |
| Admin Auth/RLS | Local acceptance | Real staging acceptance | Deferred until production-data phase |
| Public domain | localhost | staging custom domain | None |
| Search indexing | Not applicable | Blocked | Customer route absent |
| Landing availability | Independent | Independent | Remains current customer site |

## 13. Recovery and drift checks

When observed provider state conflicts with docs:

1. Do not immediately change infrastructure to match memory.
2. Verify current Git commit/branch and relevant provider project/Worker.
3. Compare against `wrangler.jsonc`, environment contract, and this inventory.
4. Determine whether the dashboard drift is intentional and accepted.
5. If not intentional, repair through the smallest reversible change and verify end to end.
6. If intentional, update status, architecture, plan/runbook, changelog, and ADR when warranted in the same Pull Request.

Never infer production readiness from staging success. Never infer customer-domain cutover from a successful production Worker build with no route.
