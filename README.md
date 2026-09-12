# Cynex Storefront MVP

A full-stack storefront for browsing Cynex premium app products and contacting support to purchase a selected package option.

Project vocabulary and current delivery state live in [CONTEXT.md](./CONTEXT.md) and [PROJECT_STATUS.md](./PROJECT_STATUS.md). Every accepted change must update `PROJECT_STATUS.md` in the same Pull Request.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

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

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Local services

Start and stop the isolated Supabase stack with:

```bash
pnpm exec supabase start
pnpm exec supabase stop
```

Copy `.dev.vars.example` to `.dev.vars` and fill local-only values. Never commit `.dev.vars` or credentials.
