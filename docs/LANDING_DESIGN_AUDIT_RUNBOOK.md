# Landing design audit and selective port runbook

Status: required for Phase 4A  
Stable source verified: 2026-09-12

## 1. Purpose

Use this runbook to inherit the approved Cynex visual identity from the independent Landing repository without creating a runtime/build dependency between repositories. The result of Phase 4A must be a Storefront-owned design system and asset set that can deploy while the Landing remains untouched and independently recoverable.

## 2. Canonical source

| Item | Verified value |
|---|---|
| Landing repository | `/home/obi/Projects/landingpage_cynex` |
| Stable tag | `landing-v1-stable` |
| Tagged commit | `d28ed1f588b8ef6cf775a02c4e40d4bba231c68d` |
| Remote | `git@github.com:zsky410/landingpage_cynex.git` |
| Storefront destination | `/home/obi/Projects/cynex-mvp` |

The tag is annotated; its tag-object hash is not the source commit hash. Always verify the dereferenced `^{}` value or use `git rev-parse landing-v1-stable^{commit}`.

Source priority:

1. Rendered screenshots from a clean worktree at `landing-v1-stable`.
2. Source files from the same clean worktree.
3. `https://cynex.site` only as a deployed-behavior cross-check before cutover.
4. GitHub remote only to verify tag/commit availability.
5. The Landing's normal local working tree only after the owner explicitly approves a newer committed source.

The normal Landing working tree currently contains unrelated/uncommitted changes. Never use it as the automatic design source and never clean/reset it while performing this audit.

## 3. Preconditions

- Work from a feature branch in `cynex-mvp` created from updated `develop`.
- Confirm Phase 3 data/Admin gate is accepted so public components can use real contracts.
- Confirm the Landing tag exists locally and remotely.
- Confirm no existing temporary audit worktree will be overwritten.
- Confirm local Node/pnpm requirements for both repositories.
- Do not copy `.env`, `.dev.vars`, configuration credentials, build output, `.next`, `node_modules`, or Git metadata.

Verification commands:

```bash
git -C /home/obi/Projects/landingpage_cynex status --short --branch
git -C /home/obi/Projects/landingpage_cynex rev-parse landing-v1-stable^{commit}
git -C /home/obi/Projects/landingpage_cynex ls-remote --tags origin landing-v1-stable 'landing-v1-stable^{}'
git -C /home/obi/Projects/cynex-mvp status --short --branch
```

Expected source commit:

```text
d28ed1f588b8ef6cf775a02c4e40d4bba231c68d
```

Stop if the tag does not resolve to that commit. Investigate and update this runbook through a reviewed documentation change before porting.

## 4. Create an isolated reference worktree

Use a detached worktree so the stable tag can be installed and rendered without touching the dirty Landing checkout:

```bash
git -C /home/obi/Projects/landingpage_cynex worktree add --detach \
  /tmp/cynex-landing-v1-reference landing-v1-stable
```

Confirm isolation:

```bash
git -C /tmp/cynex-landing-v1-reference status --short --branch
git -C /tmp/cynex-landing-v1-reference rev-parse HEAD
```

Expected: detached HEAD at the verified commit and no working-tree changes.

If the path already exists, inspect `git worktree list` first. Do not delete a worktree whose ownership/purpose is unknown.

## 5. Install and verify the reference

The stable Landing uses pnpm `10.24.0` and Next.js. Install from its lockfile:

```bash
cd /tmp/cynex-landing-v1-reference
corepack enable
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm check:rebuild-parity
pnpm build
```

Start the reference only after checks pass:

```bash
pnpm dev
```

Record the actual local URL printed by Next.js. Do not assume a port if it is already occupied.

## 6. Audit inventory

### 6.1. Brand foundations

Inspect and record:

- `DESIGN_SYSTEM.md` and `tailwind.config.ts`.
- `src/app/globals.css` for CSS variables, typography, background, selection, motion, and responsive rules.
- `src/app/layout.tsx` for font loading, metadata, and document-level behavior.
- `logo_cynex.svg`, `public/logo_cynex.svg`, and favicon assets.
- Container widths, horizontal padding, spacing rhythm, radii, borders, shadows, and cyan/ink palette.

### 6.2. Shared components

Inspect:

- `src/components/layout/site-header.tsx`.
- `src/components/layout/site-footer.tsx`.
- `src/components/ui/button.tsx`.
- `src/components/ui/badge.tsx`.
- `src/components/ui/icon-button.tsx`.
- `src/components/ui/logo.tsx`.
- `src/components/ui/section-heading.tsx`.

For each component, classify:

- **KEEP** — identity/behavior can be ported with minimal adaptation.
- **REFINE** — preserve identity while adapting semantics/data/responsiveness.
- **REMOVE** — not relevant to Storefront.
- **RETHINK** — purpose remains but interaction must change materially for Storefront.

### 6.3. Marketing sections

Inspect hero, why-Cynex, services, how-it-works, testimonials, FAQ, CTA, and supporting feature modules. Specifically inspect:

- `src/components/sections/hero-section.tsx`.
- `src/features/marketing/ui/cynex-sphere.tsx`.
- `src/features/marketing/ui/floating-service-card.tsx`.
- `src/components/sections/how-it-works-section.tsx`.
- `src/components/sections/testimonials-section.tsx`.
- `src/components/sections/faq-section.tsx`.
- `src/components/sections/cta-section.tsx`.

The hero's two-column composition, cyan gradient, sphere language, whitespace, typography, and restrained motion are protected. Storefront search, Product/Category content, and purchase guidance replace marketing-only data where specified by `PRODUCT_UX_SPEC.md`.

### 6.4. Content and behavior sources

Inspect:

- `src/lib/navigation.ts`.
- `src/lib/site-copy.ts`.
- `src/lib/external-links.ts`.
- Feature-level model files for FAQ, purchase steps, value propositions, and current service names.
- Keyboard/focus states, mobile navigation, carousel behavior, reduced-motion handling, and external-link safety.

Do not assume source code alone matches the approved visual result. Render and compare.

## 7. Screenshot evidence

Capture the clean reference at:

- 360 px wide mobile.
- 768 px wide tablet.
- 1280 px wide laptop.
- 1440 px wide desktop.

Capture at minimum:

- Header closed and mobile menu open.
- Hero at initial viewport.
- Each full homepage section.
- Footer.
- Interactive states that materially affect identity: hover/focus, FAQ open, carousel state, and reduced motion where applicable.

Screenshots are the visual source of truth. Store them in a temporary audit directory or approved project evidence directory; do not commit large transient captures unless the repository later adopts visual-baseline storage intentionally.

Record viewport, browser, commit, date, and route with each evidence set.

## 8. Produce the audit report before porting

Create a reviewed Phase 4A audit report under `docs/audits/` containing:

1. Source tag/commit and verification evidence.
2. Screenshot inventory.
3. Tokens table with exact source locations.
4. Asset inventory with KEEP/REFINE/REMOVE/RETHINK classification.
5. Component/section inventory with the same classification.
6. Protected identity decisions.
7. Storefront adaptations required by Product/UX specification.
8. Accessibility/responsive gaps observed in the stable Landing.
9. Exact files proposed for selective port.
10. Explicit list of files/assets that must not be copied.

Do not start broad UI implementation until this report is reviewed as the Phase 4A visual brief.

## 9. Selective port rules

- Copy only approved first-party assets and adapted source needed by the Storefront.
- Storefront owns every copied asset/component after port; there is no runtime cross-repository import.
- Reimplement Next.js-specific behavior using React Router/Cloudflare patterns.
- Preserve semantic behavior rather than mechanically converting JSX.
- Move hard-coded Catalog/service data to Supabase-backed Storefront contracts.
- Keep source-controlled trust/FAQ/process copy only when Product/UX specification assigns it to source.
- Rename components by Storefront responsibility, such as `PublicHeader` or `StorefrontHero`.
- Preserve required third-party notices/licenses if any audited asset requires them.
- Add a concise source note in the audit report and commit message; do not scatter historical comments through every component.

Forbidden coupling:

- Import paths reaching `../landingpage_cynex`.
- Symlinks between repositories.
- Shared `node_modules` or build directories.
- Git submodule/subtree for the Landing.
- Fetching source/assets from GitHub at application runtime.
- Depending on the deployed Landing for Storefront CSS, JavaScript, fonts, or images.

## 10. Storefront implementation sequence

1. Port approved font loading, tokens, base styles, logo, and favicon.
2. Implement Storefront-owned public layout/container primitives.
3. Port/adapt header and mobile navigation.
4. Port/adapt footer.
5. Port/adapt hero visual system with real Storefront search and Category data.
6. Build new Catalog/Product primitives from the inherited tokens.
7. Integrate approved trust, process, FAQ, testimonial, and CTA content.
8. Verify every public route at required viewports and interaction states.

The Storefront must not wait for the Landing repository at build or runtime after this sequence.

## 11. Parity and refinement gate

For protected identity elements, compare reference and Storefront screenshots side by side. Review:

- Logo proportion and clear space.
- Font family/weights and type-scale character.
- Ink/cyan/background values.
- Container alignment and section spacing.
- Hero composition, sphere, floating elements, and motion restraint.
- Button shape, hierarchy, focus, and hover behavior.
- Header translucency and contrast over content.
- Mobile composition and navigation.
- Reduced-motion result.

Differences are acceptable when required by Storefront function, accessibility, or responsive robustness. Record the reason in the audit report. Unexplained brand drift fails the gate.

Phase 4A acceptance requires:

- Verified clean source at the stable tag.
- Completed audit report and screenshot inventory.
- No dependency on dirty Landing files or GitHub runtime fetching.
- Storefront-owned tokens/assets/public shell.
- Required checks pass in both the untouched reference and changed Storefront where applicable.
- Landing repository normal working tree and deployment remain unchanged.

## 12. Clean up the temporary worktree

Stop the reference dev server, then remove only the known audit worktree through Git:

```bash
git -C /home/obi/Projects/landingpage_cynex worktree remove \
  /tmp/cynex-landing-v1-reference
```

Verify:

```bash
git -C /home/obi/Projects/landingpage_cynex worktree list
git -C /home/obi/Projects/landingpage_cynex status --short --branch
```

The original dirty-state entries must still be present and untouched. Never run reset, clean, checkout restoration, or bulk add/commit in the Landing repository as part of Storefront work.

## 13. Fallback when cross-folder access is unavailable

If the `cynex-mvp` workspace cannot read `/home/obi/Projects/landingpage_cynex`:

1. Add the Landing repository as a second read-only workspace root, or reopen the parent `/home/obi/Projects` workspace.
2. Prefer local tag access after permission is granted.
3. If local access cannot be granted, clone the verified public repository/tag into a temporary directory and verify the commit hash before audit.
4. Do not copy files manually through chat or use the current production page as the only source.

GitHub is a recovery source, not the normal primary audit source.
