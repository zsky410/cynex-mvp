# Cynex MVP Project Status

Last updated: 2026-09-12

## Current state

- Current phase: Phase 1 — Foundation.
- Repository: `zsky410/cynex-mvp` (public by owner decision).
- Protected branches: `main` and `develop` require Pull Requests and the `quality` check.
- Runtime: Node 22, pnpm 10.24.0.
- CI: `quality` passes on `main` and `develop`.
- Deployment: staging Workers Builds and isolated runtime variables are accepted end to end. Production Workers Builds is connected to `main`; its first automatic deployment and runtime variables are pending. Production has no custom route.
- Data: staging and production Supabase projects exist; schema implementation has not started.
- Production safety: the existing landing deployment remains untouched.

## Current work

Validate the first production deployment through GitHub CI and Cloudflare Workers Builds while keeping the production Worker detached from `cynex.site`.

## Next gate

Phase 1 is complete when the local gates and CI pass, the staging Worker deploys, `staging.cynex.site` serves over HTTPS, crawler protection is verified, and no analytics or secrets appear in staging.

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
