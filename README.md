# Cynex Storefront MVP

A full-stack storefront for browsing Cynex premium app products and contacting support to purchase a selected package option.

Start with [PROJECT_STATUS.md](./PROJECT_STATUS.md), then read the [complete Storefront MVP functional and delivery plan](./docs/PROJECT_PLAN.md), [architecture](./docs/ARCHITECTURE.md), and [domain vocabulary](./CONTEXT.md). The plan is the implementation source of truth for every public/Admin route, UX state, delivery slice, acceptance gate, cutover, and rollback. Historical changes live in [CHANGELOG.md](./CHANGELOG.md). Agent workflow and boundaries are in [AGENTS.md](./AGENTS.md).

## Current delivery status

- Phase 1 foundation: complete and accepted.
- Phase 2 database/Auth: complete and accepted on staging.
- Phase 3 Admin Catalog: next.
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
