# Production readiness, cutover, and rollback runbook

Status: planned; do not execute before Phase 6 approval  
Current customer site: independent Landing

## 1. Purpose

This runbook defines the controlled path from accepted staging Storefront to `cynex.site`, while retaining the existing Landing as an immediate routing fallback. It does not authorize production migrations, real-data entry, DNS/route changes, or external announcements before the owner explicitly approves the relevant phase.

## 2. Hard boundaries before approval

- `cynex-mvp-production` keeps no customer domain route.
- `cynex.site` remains on the Landing deployment.
- Production Supabase migrations remain unapplied.
- No staging UUID, test data, Cloudinary asset, or credential is copied into production.
- No route/project/deployment is deleted to prepare for launch.
- A successful production Worker build is not equivalent to a live release.

## 3. Roles and evidence

Before execution, name one release operator and one owner/approver, even if the same person currently performs both roles. Create a release evidence record containing:

- Approved release commit SHA and Pull Request.
- Local/CI/staging/production acceptance results.
- Production migration dry-run and application evidence.
- Backup/export location and timestamp without credentials.
- Production Admin acceptance.
- Production Catalog/content checklist.
- Cloudflare pre-route and post-route checks.
- Monitoring start/end timestamps and incidents.
- Rollback rehearsal/result.

Store sanitized evidence in an approved documentation/evidence location. Screenshots must not reveal tokens, passwords, account identifiers, or provider recovery information.

## 4. Phase 6 production readiness

### 4.1. Code and branch readiness

- `develop` contains every accepted Phase 3–5 change.
- All required Pull Requests and `quality` checks are green.
- Working tree is clean.
- Node/pnpm pins match CI and Cloudflare Builds.
- No unresolved high-severity defect remains.
- Secret scan covers Git diff, tracked files, generated client assets, HTML, and logs.
- Staging deployment maps to the expected `develop` SHA.

Required local gate:

```bash
source "$HOME/.nvm/nvm.sh"
nvm use 22
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm test:db
pnpm build:production
```

Run Auth, integration, and Playwright suites defined by the implemented phases.

### 4.2. Staging UAT readiness

- Four-level Catalog and Admin journeys pass under real RLS.
- Public homepage/search/Category/Product/Selection/contact journeys pass.
- Draft/archived/inactive/out-of-stock/error behavior passes.
- Required 360/768/1280/1440 screenshots are approved.
- Keyboard, focus, reduced-motion, contrast, and responsive checks pass.
- SSR/metadata/structured data/sitemap/404 behavior passes while staging remains noindex.
- Staging sends no GA4.
- Cloudinary staging assets remain in `cynex/staging`.
- Test fixtures and orphaned assets are reconciled.

### 4.3. Landing fallback readiness

Verify immediately before production work:

```bash
git -C /home/obi/Projects/landingpage_cynex rev-parse landing-v1-stable^{commit}
git -C /home/obi/Projects/landingpage_cynex ls-remote --tags origin landing-v1-stable 'landing-v1-stable^{}'
```

Expected commit: `d28ed1f588b8ef6cf775a02c4e40d4bba231c68d`.

Verify `landing.cynex.site` serves the independent stable Landing on desktop/mobile. Verify its Cloudflare Pages project remains enabled. Record current apex/`www` routing state so rollback has an exact target.

### 4.4. Production database backup and migration

Before the first production migration, create/verify the provider-supported backup/export appropriate to the Supabase plan. Record timestamp and recovery access in the password manager/release evidence, never in public docs.

Link only after confirming the production project reference from the password manager/provider dashboard. Then:

```bash
pnpm exec supabase link --project-ref <production-project-ref>
pnpm exec supabase db push --dry-run
```

Review that every migration is expected, ordered, and includes the accepted four-level schema. Production has intentionally skipped all prior pushes, so the dry-run may list the full migration chain. Do not apply merely because the list is long; compare every filename to the repository.

After explicit migration approval:

```bash
pnpm exec supabase db push
```

Never run a linked reset. Run production-safe schema lint and read-only/isolated acceptance without deleting real data.

### 4.5. Production Auth and authorization

- Confirm Email/Password Auth and disabled public signup.
- Confirm production Site URL and allowed redirects.
- Confirm production Admin identity is separately created/confirmed.
- Insert only the production Auth UUID into `app_admins`.
- Verify anonymous and authenticated non-admin mutation denial.
- Verify production Admin login/guard/logout through the production Worker pre-route endpoint.
- Do not copy the staging allowlist row or credentials.

### 4.6. Production configuration and data

- Verify Worker variables bind to production Supabase.
- Verify Cloudinary prefix is exactly `cynex/production`.
- Verify Cloudinary API secret is an encrypted Worker secret.
- Verify GA4 measurement ID is production-only and no request occurs before consent.
- Configure valid Contact Channels.
- Enter/verify real Categories, Products, Packages, Variants, Duration Options, prices, stock, media, alt text, rich content, SEO, and merchandising.
- Verify every published Product has one complete purchasable path and one valid contact path.

No automated staging-to-production data import exists in MVP. Enter/import only through an explicitly reviewed production process and verify each result.

## 5. Pre-route production smoke

The production Worker must be tested before receiving `cynex.site`. Use only the provider's safe preview/temporary endpoint explicitly enabled for release testing, then disable any unintended public preview endpoint afterward.

Verify:

- Deployed SHA equals approved release candidate.
- Homepage and representative public routes return correct status/SSR data.
- Search uses production Catalog.
- Selection revalidates current production price/stock.
- Zalo/Facebook destinations and generated message are correct.
- Admin login/guard/logout works with production identity.
- Staging data/URLs/prefixes do not appear.
- Consent decline sends no GA4; consent acceptance sends only approved events.
- Security/cache/robots headers match pre-cutover intent.
- No credential appears in browser/client/server output.

If no safe pre-route endpoint can be provided without weakening security, stop and design a bounded alternative; do not attach the customer domain just to test casually.

## 6. Release decision gate

Owner explicitly approves cutover only when:

- Phase 6 gate and release evidence are complete.
- Current production backup/export is confirmed.
- Landing fallback and `landing.cynex.site` are healthy.
- Production Worker/data/Auth/media/contact/consent smoke passes.
- Exact Cloudflare route changes and rollback owner are known.
- No high-severity security, authorization, data-integrity, discovery, or contact defect remains.

## 7. Cutover sequence

1. Announce internal release window and freeze Catalog/schema/config changes.
2. Record current Landing/apex/`www` routing and health.
3. Merge the approved `develop` release Pull Request into `main`.
4. Wait for required `quality` and `cynex-mvp-production` Workers Build success.
5. Confirm production Worker deployment commit matches merged `main` SHA.
6. Repeat pre-route critical smoke.
7. Create annotated tag `storefront-v1.0.0` on the accepted SHA and push it.
8. Confirm `landing.cynex.site` and the Pages project remain healthy.
9. In Cloudflare, attach the approved apex and `www` customer routes/custom domains to `cynex-mvp-production`, resolving route ownership deliberately rather than deleting the Landing project.
10. Wait for routing/TLS state to become active.
11. Run immediate public smoke in a fresh browser and from a second network/device where practical.
12. Start the 24-hour monitoring window and record exact start time.

Do not combine schema migration, bulk Catalog editing, code deploy, and domain cutover into one unobservable action. Complete/verify each boundary in order.

## 8. Immediate post-cutover smoke

### Public

- `https://cynex.site/` returns Storefront and correct canonical metadata.
- `www` behavior matches the chosen canonical redirect/serve policy.
- `/san-pham`, Category, Product, and search routes work.
- Published Product content exists in SSR HTML.
- Four-level Selection and price/stock revalidation work.
- Contact copy and each enabled external channel work.
- Privacy/consent control works; declined consent sends no GA4.
- Unknown/draft/archived/inactive routes return proper 404.
- Static media loads from production Cloudinary paths.

### Admin

- Production Admin login, protected navigation, mutation, and logout work.
- Anonymous/non-admin mutation remains denied.
- Auth/Admin routes remain noindex/no-store.
- Environment badge says production.

### Fallback

- `landing.cynex.site` still serves Landing.
- Landing Pages project remains present and deployable.

## 9. Monitoring window

Monitor for at least 24 hours:

- Cloudflare Worker exceptions, status rates, latency, deployment health, and route state.
- Supabase health, Auth failures, database errors, RLS denials, and resource usage.
- Cloudinary delivery/upload/delete errors and prefix correctness.
- Client runtime/hydration errors.
- Search no-result/error patterns.
- Product detail, Selection, and Contact Channel failures.
- GA4 requests only after consent and approved event payloads only.
- Reports of wrong price/stock/content.
- Landing fallback availability.

Do not log raw credentials, auth cookies, personal contact data, or full prefilled messages during monitoring.

## 10. Rollback triggers

Initiate rollback when one or more occur and a safe immediate repair is not clearly lower risk:

- Authorization bypass or sensitive data exposure.
- Widespread 5xx/blank page/hydration failure.
- Search/Product/Selection/contact journey broadly unusable.
- Production points to staging services or media prefix.
- Materially incorrect prices/availability across Catalog.
- Domain/TLS/routing failure.
- Severe performance degradation.
- Consent violation or unintended analytics collection.

The release operator may rollback immediately for security/data exposure without waiting for a cosmetic review.

## 11. Routing rollback

1. Freeze further production changes and record incident start/SHA.
2. Remove or disable only the customer routes/custom domains assigned to `cynex-mvp-production`.
3. Restore/confirm the previously recorded apex and `www` mapping to the Landing Pages deployment.
4. Do not delete the Storefront Worker, database, media, Pages project, or Git branch/tag.
5. Wait for route/TLS activation.
6. Verify apex, `www`, and `landing.cynex.site` serve the expected Landing on desktop/mobile.
7. Verify Storefront no longer owns customer traffic.
8. Preserve logs/evidence without secrets.
9. Communicate rollback state and begin root-cause diagnosis on a fix branch.

Routing rollback does not reverse database migrations or delete production data. If data recovery is necessary, create a separately reviewed recovery plan based on the actual incident and backup state.

## 12. Roll-forward after rollback

- Reproduce/diagnose the failure without altering the stable Landing.
- Implement and review the fix through feature → `develop` → staging acceptance.
- Update tests, status, changelog, runbooks, and ADR if the decision changes.
- Repeat production readiness and pre-route smoke.
- Obtain fresh owner approval before reattaching routes.

Do not reuse stale acceptance evidence after material code, data, configuration, or routing changes.

## 13. Completion gate

Cutover is complete only when:

- Approved tag/SHA serves customer traffic.
- Immediate and 24-hour monitoring gates pass or resolved incidents are documented.
- Production Auth/RLS/data/media/contact/consent behavior remains correct.
- Landing fallback stays healthy and independently deployable.
- Release evidence, `PROJECT_STATUS.md`, `CHANGELOG.md`, architecture, and runbooks reflect final truth.
- Rollback procedure remains executable without rebuilding the Landing.
