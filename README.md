# Cynex Storefront MVP

A full-stack storefront for browsing Cynex premium applications, selecting a Product → Package → Variant → Duration Option configuration, and contacting support to continue purchasing.

Start with the [documentation map](./docs/README.md) and [current project status](./PROJECT_STATUS.md), then read the [Product and UX specification](./docs/PRODUCT_UX_SPEC.md), [complete implementation plan](./docs/PROJECT_PLAN.md), [architecture](./docs/ARCHITECTURE.md), and [domain vocabulary](./CONTEXT.md). The documentation map links the Landing audit, infrastructure, staging migration, and release/cutover runbooks. Historical changes live in [CHANGELOG.md](./CHANGELOG.md). Agent workflow and boundaries are in [AGENTS.md](./AGENTS.md).

## Current delivery status

- Phase 1 foundation: complete and accepted.
- Phase 2 database/Auth: original schema complete and accepted on staging.
- Four-level Catalog requirement: accepted; forward staging amendment is Phase `3A`.
- Phase 3 Admin Catalog: next after the `3A` hierarchy amendment.
- Production database migration and customer-domain cutover: deferred.

## Getting Started

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Your application will be available at `http://localhost:5173`.

## Previewing the Production Build

Preview the production build locally:

```bash
pnpm preview
```

## Building for Production

Create a production build:

```bash
pnpm build
```

## Deployment

Deployment is done using the Wrangler CLI.

Deployments use explicit environments:

```sh
pnpm deploy:staging
pnpm deploy:production
```

The environment must be selected during the build, not only during deploy. For Cloudflare Workers Builds use `pnpm build:staging` for `develop` and `pnpm build:production` for `main`.

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Local services

Start and stop the isolated Supabase stack with:

```bash
pnpm exec supabase start
pnpm exec supabase stop
```

Reset, test, and regenerate types after changing migrations:

```bash
pnpm db:reset
pnpm db:test
pnpm db:types
```

The database test suite covers schema, catalog constraints, RLS authorization, and the public search RPC. `pnpm test:auth` runs against a local app server and local Supabase, creates disposable Admin/non-admin users, and removes them after the checks.

Copy `.dev.vars.example` to `.dev.vars` and fill local-only values. Never commit `.dev.vars` or credentials.
