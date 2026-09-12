# Cynex Storefront MVP plan

Status: active source of truth  
Last updated: 2026-09-12

## 1. Goal

Replace the Google Sheet catalog with a Vietnamese storefront where Visitors can discover products, compare Packages and Options, see price/availability, and contact Cynex through Zalo or Facebook. The existing landing remains available as the rollback target.

Example hierarchy:

```text
Claude
└── Claude Team
    └── 1.5x Pro — 1 tháng
```

## 2. MVP scope

Included:

- Storefront homepage, catalog, category, search, and product detail.
- Package/Option pricing and availability.
- Contact modal with Zalo/Facebook handoff.
- One environment-specific Admin account.
- Admin CRUD for Category, Product, Package, Option, and media.
- Draft, publish, archive, featured products, and homepage categories.
- Product/category SEO, consent-gated GA4, staging and production.

Deferred beyond MVP:

- Customer accounts, cart, checkout, payment, and orders.
- Discounts, lead management, Google Sheet sync, full-page CMS.
- Multi-admin role management, audit log, and version history.

## 3. Architecture and deployment

```text
Cloudflare Pages: landingpage-cynex
├── cynex.site             current customer landing
└── landing.cynex.site     long-term fallback

Cloudflare Workers
├── cynex-mvp-staging      staging.cynex.site
└── cynex-mvp-production   no customer route before cutover

React Router SSR Worker
├── Supabase Postgres/Auth/RLS
├── Cloudinary
└── GA4 after production consent
```

Repository flow:

```text
feature/* → PR → develop → staging
develop   → PR → main    → production Worker
```

Both protected branches require PRs and the `quality` status check. Cloudflare Workers Builds deploys after merges; GitHub Actions performs quality verification only.

## 4. Environment contract

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

Database passwords and Supabase secret/service-role keys are provisioning credentials, never application runtime configuration.

Staging is public but non-indexable. It uses only staging data and `cynex/staging`, sends no GA4, and exposes no preview/Workers.dev URL. If staging later contains confidential data, enable an access control layer before adding that data.

## 5. Domain and database

### Tables

- `app_admins`: environment-specific Auth user allowlist.
- `categories`: name, slug, descriptions, media, order, active state.
- `products`: Category owner, content, tags, lifecycle, SEO, publish time.
- `product_media`: verified Cloudinary metadata and thumbnail/cover/gallery role.
- `packages`: commercial group within a Product.
- `options`: duration, VND prices, stock, active state.
- `homepage_featured_products`: ordered published Products.
- `homepage_category_sections`: up to three ordered active Categories.
- `site_settings`: singleton contact-channel configuration.

### Invariants

- Slugs use lowercase URL-safe segments and are unique.
- A Product slug becomes immutable after first publication.
- Prices are non-negative; compare-at price is not below sale price.
- Names and durations are non-empty.
- One thumbnail and one cover maximum per Product.
- Homepage references remain published/active.
- Contact URLs and stored media URLs use HTTPS.

### RLS

- Anonymous: active Categories; published Products and their public children; no allowlist; no mutation.
- Authenticated non-admin: same Catalog access as a Visitor; no mutation.
- Admin: CRUD through allowlist-backed RLS.
- Authorization depends on verified user ID, never email or client metadata.

### Search contract

```ts
type CatalogSort = "featured" | "newest" | "price_asc" | "price_desc";

type CatalogQuery = {
  q?: string;
  category?: string;
  inStock?: boolean;
  sort: CatalogSort;
  page: number;
  pageSize: 12;
};
```

Search ignores case and Vietnamese diacritics, searches Product/Package/Option text, excludes drafts, computes available minimum price, and ranks unavailable products after available ones for price sorting.

## 6. Storefront functional specification

### 6.1. Information architecture and routes

Vietnamese slugs are the canonical public URLs. The English route names from the early scaffold are not part of the Storefront contract.

| Route | Purpose | Indexing and cache |
|---|---|---|
| `/` | Storefront homepage | index; CDN cache up to 60 seconds |
| `/san-pham` | Complete Catalog | index; URL-driven query; CDN cache up to 60 seconds |
| `/danh-muc/:slug` | One Category and its Products | index when active; otherwise 404 |
| `/san-pham/:slug` | Product detail and Option selection | index when published; otherwise 404 |
| `/tim-kiem?q=` | Dedicated search results | noindex; no-store |
| `/chinh-sach-bao-mat` | Privacy and analytics-consent information | index |
| `*` | Branded not-found page | noindex; HTTP 404 |

Admin URLs are isolated under `/admin`, never appear in public navigation or sitemap, and always send `noindex` and `no-store`.

### 6.2. Global header, navigation, and footer

The desktop header contains the Cynex logo, Trang chủ, Sản phẩm, Danh mục, Cách mua, Hỗ trợ, a search trigger, and a primary contact CTA. Category navigation lists only active Categories and must remain usable when there are more items than fit horizontally.

The mobile header uses a menu button with an accessible label. Its drawer contains the same destinations, active Categories, search, and contact CTA. Opening the drawer traps focus; Escape and the close control dismiss it; route navigation closes it.

The header preserves the translucent fixed treatment of the Landing but must maintain readable contrast over every Storefront section. Hash links such as Cách mua and Hỗ trợ target sections on `/` and still work when followed from another route.

The footer contains brand summary, public navigation, enabled Contact Channels, privacy link, and copyright. It must not expose Admin login as a promotional link.

### 6.3. Homepage

The homepage is a discovery path, not a generic marketing page. Its canonical order is:

1. Hero and primary search.
2. Active Category shortcuts.
3. Featured Products.
4. Up to three merchandised Category shelves.
5. Three-step purchase process.
6. Existing trust/social-proof content selected from the approved Landing.
7. FAQ focused on purchasing, delivery, warranty, and support.
8. Final contact CTA and footer.

The hero preserves the approved Landing identity: two-column composition, cyan gradient, Cynex sphere, restrained floating elements, Manrope typography, and generous spacing. Its copy changes to explain that Visitors can search premium applications directly. It provides:

- A search field that submits to `/tim-kiem?q=...`.
- Primary CTA `Khám phá sản phẩm` to `/san-pham`.
- Secondary CTA `Cách mua` to the purchase-process section.
- Up to five active Category labels in the visual composition.
- A static equivalent when `prefers-reduced-motion` is enabled.

Featured Products come only from `homepage_featured_products` and preserve their configured order. Each Category shelf comes only from `homepage_category_sections`, shows its title/description and a bounded selection of published Products, and links to the complete Category page. Empty merchandising slots collapse cleanly; they do not render placeholder content.

The purchase process is fixed MVP content: choose a Product, select a Package/Option, then continue the conversation through an enabled Contact Channel. Trust and FAQ copy remain source-controlled in MVP; a full page CMS is explicitly deferred.

### 6.4. Product card contract

Every Product card displays:

- Thumbnail or a deliberate brand fallback.
- Category name.
- Product name and short description.
- Optional Product badge and a bounded tag list.
- Availability derived from active Options.
- `Từ <min_price>` derived only from active, in-stock Options.
- `Xem chi tiết` link to the canonical Product URL.

If no active Option is in stock, the card displays `Tạm hết hàng`, omits a misleading minimum price, remains navigable, and never opens the contact flow directly. Cards have a stable image ratio and comparable height so mixed content does not break the grid.

### 6.5. Catalog and search behavior

`/san-pham` renders 12 Products per page. Its controls are:

- Text search, case-insensitive and Vietnamese-diacritic-insensitive.
- One active Category filter.
- Availability filter: all or in stock.
- Sort: featured, newest, price ascending, or price descending.
- Pagination with previous/next and an accessible current-page indication.

Canonical query parameters are `q`, `category`, `inStock`, `sort`, and `page`. Default values are omitted from the URL. Changing a filter resets `page` to 1. Search input waits 300 ms after typing but Enter submits immediately. Browser back/forward restores the exact query state.

The desktop layout exposes filters beside the Product grid. Mobile uses an explicit filter drawer and shows the number of active filters. The results header states the count and current query. Invalid query values fall back to safe defaults instead of causing an error.

Required states:

- Initial loading skeleton with stable layout.
- Loading feedback during query transitions without clearing usable prior content.
- Empty Catalog state when no Product has been published.
- No-results state showing the query and a `Xóa bộ lọc` action.
- Recoverable service-error state with `Thử lại`.

`/tim-kiem` reuses the same search contract and Product cards, but focuses on the entered phrase and remains `noindex`. Search suggestions, fuzzy typo correction, and search history are deferred.

### 6.6. Category page

`/danh-muc/:slug` shows Category name, description, optional image/icon, breadcrumbs, result count, availability filter, sort, and paginated Product grid. It does not repeat the Category filter because the route already fixes the Category.

An inactive or unknown Category returns HTTP 404 and is absent from navigation, sitemap, and homepage merchandising. An active Category with no published Products displays a branded empty state and a route back to the full Catalog.

### 6.7. Product detail and selection

`/san-pham/:slug` contains:

- Breadcrumbs.
- Thumbnail/cover/gallery with descriptive alt text.
- Category, Product name, optional badge, short description, and tags.
- Starting price and aggregate availability.
- Allowlisted rich-description renderer.
- Ordered Package selector and ordered Options within each Package.
- Price, compare-at price, duration, Option badge, and stock state.
- Sticky purchase summary on desktop and sticky bottom action on mobile.
- Related published Products from the same Category.

The first active Package containing an in-stock active Option opens by default. Within it, the first available Option is selected. Visitors may inspect out-of-stock Options, but cannot use them to initiate contact. Changing Package clears any incompatible Option selection.

The purchase action remains disabled until an in-stock Option is selected. Its summary always reflects the currently selected Product, Package, Option, duration, and price. The application never implies online checkout, payment, reservation, or guaranteed inventory.

An unknown, draft, archived, or Category-hidden Product returns HTTP 404 to a Visitor. Admin preview of a draft is rendered only inside the authenticated Admin area; it never creates a public draft URL.

### 6.8. Contact handoff

The Contact Intent is generated from server-authoritative Catalog data, not from arbitrary client-provided labels or prices:

```ts
type ContactIntent = {
  productId: string;
  productName: string;
  productSlug: string;
  packageId: string;
  packageName: string;
  optionId: string;
  optionName: string;
  durationLabel: string;
  priceVnd: number;
  canonicalUrl: string;
};
```

The contact dialog displays the selected Product, Package, Option, duration, formatted VND price, and canonical Product link. Actions include `Sao chép nội dung`, `Mở Zalo`, and `Mở Facebook` only when each channel is enabled.

The prefilled Vietnamese message states that the Visitor wants advice for the selected Option. Copy success means only that text reached the clipboard. Opening an external channel means only that navigation was attempted; the Storefront never claims the message was sent, creates an Order, or stores a Lead.

If every Contact Channel is disabled, purchase CTAs are hidden and a server-side configuration error is logged without leaking configuration to the Visitor. Popup blocking or clipboard denial produces a clear fallback with selectable text.

## 7. Admin functional specification

### 7.1. Admin shell and authorization

`/admin/login` uses Supabase Email/Password Auth. There is no signup, password-reset, OAuth, or account-management UI in MVP. Every protected loader/action refreshes verified claims and verifies membership in `app_admins`; an authenticated non-admin remains unauthorized.

The shared Admin shell contains:

- Cynex mark and `Quản trị danh mục` title.
- Navigation: Tổng quan, Danh mục, Sản phẩm, Trang chủ, Liên hệ.
- Environment badge so staging cannot be mistaken for production.
- Current Admin identifier and Đăng xuất.
- Mobile navigation with the same destinations.

The shell supplies consistent breadcrumbs, page title, primary action area, loading indicator, inline error summary, empty state, confirmation dialog, and success/error notification. Auth and Admin responses are private, `no-store`, and `noindex`.

### 7.2. Dashboard

`/admin` displays counts for published, draft, and archived Products; active Categories; and out-of-stock active Options. It includes shortcuts to create a Category or Product and a compact list of Products needing attention, such as drafts and Products with no in-stock Option.

MVP does not include charts, revenue, orders, visitor analytics, or audit history. Dashboard failure must not log the Admin out; it shows a retryable data error.

### 7.3. Category management

Routes:

```text
/admin/categories
/admin/categories/new
/admin/categories/:id
```

The list shows order, icon/image, name, slug, active state, Product count, updated time, and actions. Admin can search by name/slug and filter active/inactive.

The form manages name, generated-but-editable slug, description, `icon_key`, optional image, order, and active state. Validation mirrors database constraints. Duplicate or malformed slug errors appear at the slug field.

Ordering uses explicit move-up/move-down controls in MVP; drag-and-drop is deferred. Each reorder is persisted atomically from the user's perspective and the list is refreshed after success.

`is_active=false` is called `Ẩn danh mục`, not Archive. It removes the Category and its Products from the public Storefront. The UI blocks hiding a homepage Category until it is removed from merchandising, and warns when published Products would become hidden. Hard delete is allowed only when database references permit it and always requires confirmation.

Category acceptance cases include create, edit, duplicate slug, reorder first/middle/last, hide, restore, referenced-delete failure, server failure with retained input, and unauthorized mutation denial.

### 7.4. Product list and lifecycle

Routes:

```text
/admin/products
/admin/products/new
/admin/products/:id
/admin/products/:id/preview
```

The list shows thumbnail, name, Category, lifecycle status, minimum available price, stock summary, updated time, and actions. Filters cover text, Category, draft/published/archived, and stock state. Admin can create, edit, preview, publish, archive, and restore to draft.

Lifecycle semantics:

- `draft`: editable and visible only to Admin.
- `published`: public when its Category is active; first publication sets `published_at` and locks the slug permanently.
- `archived`: retained for Admin reference and removed from public discovery.

Archiving a featured Product is blocked until it is removed from featured merchandising. Restoring an archived Product returns it to draft, requiring publish validation again. Hard Product deletion is excluded from the normal UI to prevent accidental cascade deletion of Packages, Options, and media.

### 7.5. Product editor

The Product editor is one route divided into four clearly navigable sections:

1. Basic information: Category, name, slug, short description, tags, and badge.
2. Content and media: structured description, thumbnail, cover, and gallery.
3. Commercial structure: ordered Packages and nested Options.
4. SEO and lifecycle: SEO title/description, preview, save draft, publish, and archive.

The editor tracks unsaved changes and warns before internal navigation or browser exit. Failed submission preserves user input and moves focus to the error summary. Success feedback appears only after the server mutation succeeds.

Draft saves allow incomplete commercial data but still enforce safe field types, slug format, valid URLs, and non-negative prices. Publishing requires:

- An active Category.
- Valid name and immutable-safe slug.
- Non-empty short description and valid structured description.
- Thumbnail with alt text.
- At least one active Package.
- At least one active Option under an active Package.
- At least one active, in-stock Option with a valid price.
- Valid SEO fields within agreed UI limits.
- At least one globally enabled Contact Channel.

Admin preview renders the draft using the public Product-detail components inside an authenticated, no-store route. Preview does not mutate status, set `published_at`, enter sitemap data, or become accessible to Visitors.

### 7.6. Package and Option editor

Each Package manages name, optional description, optional badge, active state, and order. Each nested Option manages name, duration label, VND sale price, optional compare-at price, stock state, active state, optional badge, and order.

Admin can add, edit, remove, activate/deactivate, and reorder Packages and Options. MVP uses buttons and collapsible sections rather than drag-and-drop. Currency input accepts digits, displays VND formatting without changing the stored integer, and rejects negative, fractional, overflow, or compare-at-below-sale values.

Removing a persisted Package also removes its Options through the database relationship, so the UI must state the impact and require confirmation. Deactivating preserves history and is the preferred choice. A published Product cannot be saved into a state that violates publish rules; the Admin must return it to draft or keep at least one purchasable Option.

### 7.7. Structured rich text

The editor stores a versioned JSON document. The allowed feature set is paragraph, headings at controlled levels, bold, italic, bulleted list, numbered list, and HTTPS links. Raw HTML, scripts, iframes, inline styles, arbitrary embeds, and base64 media are rejected in both editor validation and public rendering.

Paste handling strips unsupported formatting. Links require visible text, validate protocol, and open external destinations safely. Empty visual content is treated as empty even if the JSON document contains structural nodes. Public rendering uses a strict node/mark allowlist and never injects raw HTML.

### 7.8. Cloudinary media management

Accepted formats are JPEG, PNG, WebP, and AVIF. The exact maximum file size and dimensions must be implemented as shared constants used by client validation, Worker validation, and tests; the initial MVP target is 5 MB per file and a maximum of 12 gallery images per Product.

Signed upload flow:

1. Admin selects a valid file and role.
2. Client performs early MIME/size checks.
3. Worker verifies session, Admin allowlist, Origin, requested role, Product ownership, and environment prefix.
4. Worker creates a short-lived SHA-256 signature for the current environment folder.
5. Browser uploads directly to Cloudinary.
6. Worker verifies the returned signature and expected folder before accepting metadata.
7. Worker stores `asset_id`, `public_id`, secure URL, dimensions, format, role, alt text, and order.

Only one thumbnail and one cover may exist per Product. Gallery ordering uses move controls. Alt text is mandatory. Image replacement does not delete the old asset until the new record is accepted.

Delete flow removes the database association and requests Cloudinary destroy with cache invalidation. Upload-success/database-failure triggers immediate cleanup. Cleanup failure is logged with enough non-secret identifiers for retry and never reports the Product save as wholly successful. Every upload/delete is constrained to `cynex/staging` or `cynex/production` according to runtime environment.

### 7.9. Homepage merchandising

`/admin/homepage` provides two ordered lists:

- Featured Products: published Products only, with unique positive positions.
- Homepage Categories: active Categories only, maximum three, with positions 1–3.

Admin can add, remove, and reorder entries with explicit controls and a compact preview. A Product/Category cannot be unpublished/hidden while referenced. Storefront updates should become visible within 60 seconds; the Admin success message must not promise instant cache invalidation.

### 7.10. Contact settings

`/admin/settings/contact` manages Zalo and Facebook enabled states and HTTPS destination URLs. Saving an enabled channel requires a valid URL. Disabling every channel is permitted only when no Product is currently published; otherwise validation blocks the change because it would remove the purchase path.

The settings screen includes a preview of the generated contact message using sample labels, without storing or sending that sample. Secrets, customer contact details, and analytics settings do not belong here.

### 7.11. Admin destructive, error, and session behavior

Destructive operations name the affected entity and consequence, require an explicit confirmation action, and disable duplicate submission while pending. Database constraint errors are translated into Vietnamese user-facing messages; raw SQL, stack traces, identifiers, and credentials are never exposed.

On network/server failure, forms retain inputs and provide retry. On session expiration, safe reads redirect to login; mutation attempts fail without applying changes and redirect only after presenting the need to authenticate again. The MVP assumes one Admin and deliberately defers optimistic locking and conflict resolution.

## 8. Design-system and content specification

### 8.1. Visual source of truth

The Storefront is a refinement and extension of the approved Landing, not a new brand redesign. Reuse Manrope, ink `#0B132B`, primary cyan `#00AEEF`, cool white/blue surfaces, cyan hero gradient, rounded pills/cards, restrained blue shadows, soft floating motion, and a `max-w-7xl` content rhythm.

The hero's composition, sphere language, whitespace, and motion character are protected. Copy and discovery controls may change to support Storefront intent. Admin inherits colors, typography, form language, and brand mark but reduces decoration and animation to prioritize scanning and data entry.

### 8.2. Required UI primitives

Public primitives: header, mobile drawer, search field, Category chip/list, Product card, image fallback, price block, stock badge, tag/badge, filter controls, mobile filter drawer, sort select, pagination, breadcrumbs, gallery, Package accordion, Option radio card, purchase summary, contact dialog, rich-text renderer, FAQ, consent banner, skeleton, empty state, error state, and not-found state.

Admin primitives: shell/sidebar, mobile navigation, environment badge, breadcrumb, data table/list, status badge, field components, slug field, currency input, rich-text editor, media picker, ordered-list controls, confirmation dialog, notification, error summary, empty state, loading state, and unauthorized/session-expired state.

### 8.3. Responsive and accessibility contract

Required review widths are 360, 768, 1280, and 1440 pixels. Mobile must not rely on horizontal table scrolling for primary tasks; Admin lists may switch to summary rows/cards. Sticky actions must not obscure content or consent UI.

All functionality is keyboard accessible with visible focus. Forms have persistent labels, associated errors, instructions where format is constrained, and focus management after validation. Dialogs trap and restore focus. Package/Option selection uses native-equivalent radio semantics. Status is not communicated by color alone. Text and controls meet WCAG AA contrast. Images have purposeful alt text; decorative imagery uses empty alt. Motion respects system reduced-motion preference.

### 8.4. Content ownership

Catalog, merchandising, and Contact Channels are managed in Admin. Header labels, purchase-process copy, trust content, FAQ, privacy text, and general footer content remain source-controlled for MVP. Updating them through Admin is a later CMS capability and must not expand Phase 3.

## 9. SEO, analytics, performance, security, and reliability

### 9.1. SEO

- Public Product content is present in SSR HTML before JavaScript.
- Home, Category, and Product pages have unique title, description, canonical URL, and Open Graph data.
- Product pages emit valid `Product` and `AggregateOffer` structured data based on active Options.
- Category/Product pages emit `BreadcrumbList` where applicable.
- Sitemap includes only canonical active Category and published Product URLs.
- Search, Admin, staging, and error pages are `noindex`.
- Unknown, hidden, draft, and archived resources return the correct HTTP 404 rather than a soft 404.
- Published Product slugs remain immutable so indexed URLs do not silently break.

### 9.2. Analytics and consent

Production supports GA4 events `search`, `view_item_list`, `select_item`, `view_item`, and `generate_lead`. Parameters are limited to Catalog identifiers, display names, value, currency, list position, and Contact Channel. Email, phone, message content, credentials, and Admin activity are prohibited.

Staging and local never load GA4. Production loads GA4 only after explicit analytics consent. Consent choice is stored locally, can be changed later through a privacy control, and lack of consent must not reduce Storefront functionality.

### 9.3. Performance and caching

- Cloudinary delivery uses responsive widths, `f_auto`, `q_auto`, and width/height to prevent layout shift.
- Below-fold images lazy-load; selected hero assets alone may preload.
- Admin/editor/upload code is excluded from initial public route bundles.
- Home, active Category, and published Product responses may cache at the CDN for at most 60 seconds.
- Search, Admin, Auth, preview, and personalized responses use `no-store`.
- No global client state library is added while React and React Router cover the need.
- Public interactions remain usable during client hydration and avoid hydration-dependent content changes.

### 9.4. Security and failure handling

- RLS remains enabled on every public-schema table and is the final authorization boundary.
- All Admin mutations validate input and Origin on the server independently from browser checks.
- Supabase publishable key is public configuration; database passwords, secret/service-role keys, and Cloudinary secret never enter Git, docs, logs, HTML, or client bundles.
- Auth uses secure HttpOnly cookies and verified claims plus `app_admins`, never email or client metadata.
- Cloudinary operations restrict timestamp, MIME, size, folder prefix, role, and accepted response signature.
- Rich text never renders raw HTML.
- CSP, HSTS, frame protection, Referrer Policy, Permissions Policy, and safe external-link attributes are required before public launch.
- Public Supabase failures render retryable UI; Admin mutation failures retain input and never show premature success.
- Product unavailability remains viewable but cannot produce a purchase contact action.
- Missing Contact Channels hide contact actions and log a non-secret configuration error.

## 10. Delivery phases

### Phase 0 — Provisioning — complete

GitHub repository, branches/rulesets, Supabase projects, Cloudinary, GA4, credentials inventory, and rollback landing were provisioned.

### Phase 1 — Foundation — complete

React Router/Cloudflare scaffold, Node/pnpm pins, CI, isolated Workers Builds, environment variables, staging domain, crawler protection, and automatic deployment acceptance are complete.

### Phase 2 — Database and Auth — complete

Implemented and staging-accepted:

- Catalog migrations, generated types, RLS, search RPC, allowlisted Admin.
- SSR cookie login/logout, verified-claims session guard.
- Local database lint, 30 pgTAP assertions, remote anonymous acceptance, and staging Admin acceptance.

Production database migration remains deferred.

### Phase 3 — Admin Catalog — next

Phase 3 is divided into independently reviewable slices. Each slice uses real Supabase data and existing RLS; an in-memory or UI-only implementation does not satisfy the slice.

#### 3A — Shared Admin application shell

- Implement desktop/mobile navigation, environment badge, breadcrumbs, headings, and logout.
- Add reusable Admin field, error summary, notification, loading, empty, and confirmation components.
- Centralize verified Admin loader/action helpers and Origin checks.
- Add unauthorized, expired-session, and backend-failure behavior.
- Test keyboard navigation, private cache headers, non-admin denial, and logout.

Acceptance: the allowlisted staging Admin can navigate the protected shell on desktop/mobile; anonymous and non-admin sessions cannot access it; session/logout behavior remains correct.

#### 3B — Category CRUD and ordering

- Implement list, search/filter, create, edit, hide/restore, guarded delete, and move controls.
- Add shared slug normalization and mirrored client/server validation.
- Surface duplicate-slug, homepage-reference, and Product-reference constraints in Vietnamese.
- Verify all mutations execute as the signed-in Admin under RLS.

Acceptance: staging Admin creates three Categories, edits and reorders them, hides/restores one, receives an actionable referenced-delete error, and sees the public read model expose only active rows.

#### 3C — Product list, basic editor, and lifecycle

- Implement list filters, stock/minimum-price summaries, create, basic fields, draft save, preview, publish, archive, and restore-to-draft.
- Enforce first-publication timestamp and immutable published slug.
- Add unsaved-change protection and server-preserved form errors.
- Add lifecycle-specific confirmation and merchandising-reference errors.

Acceptance: Admin creates an incomplete draft, edits it, previews it privately, cannot publish until requirements pass, publishes it, cannot change its slug, archives it, and confirms Visitors never see draft/archived data.

#### 3D — Package and Option editor

- Implement nested add/edit/deactivate/remove and move controls.
- Implement integer VND parsing/formatting and compare-at validation.
- Calculate preview minimum price and stock from active Options.
- Make Package removal impact explicit and prevent invalid published states.

Acceptance: one Product contains at least two Packages and multiple duration/price Options; ordering persists; invalid prices are rejected; an out-of-stock Option remains visible but is not purchasable.

#### 3E — Structured content

- Add the allowlisted editor schema and versioned JSON serialization.
- Sanitize paste, validate links, define visual-empty detection, and build the shared public renderer.
- Test every supported node/mark and rejection of HTML/script/iframe/unsafe URLs.

Acceptance: Admin authors formatted content, reloads without loss, previews the exact public rendering, and unsupported/unsafe content cannot be stored or rendered.

#### 3F — Cloudinary media

- Add shared MIME, 5 MB, role, gallery-count, and environment-prefix constraints.
- Implement signed upload ticket, direct browser upload, signed response verification, and media persistence.
- Implement thumbnail/cover replacement, gallery ordering, alt text, destroy, and compensation cleanup.
- Test expired/tampered signatures, wrong prefixes, invalid files, duplicate roles, DB failure after upload, and Cloudinary destroy failure.

Acceptance: staging Admin uploads/replaces/deletes real assets only under `cynex/staging`; database metadata and Cloudinary state stay consistent across success and tested failure paths.

#### 3G — Merchandising and Contact Channels

- Implement featured Product and homepage Category selection/order with invariant feedback.
- Implement Zalo/Facebook enablement, HTTPS URL validation, and message preview.
- Enforce the publish/contact availability rule in application validation.

Acceptance: Admin configures at least one Contact Channel, reorders featured Products and three homepage Categories, and cannot invalidate a referenced or purchase-critical configuration.

#### 3H — Phase 3 staging acceptance

- Run lint, typecheck, unit, database, integration, and production build gates.
- Run complete Admin E2E with the real staging Admin and RLS.
- Verify no secret is present in source, Worker responses, built assets, or logs.
- Record screenshots at 360, 768, 1280, and 1440 widths.
- Update `PROJECT_STATUS.md`, `CHANGELOG.md`, applicable runbooks, and any genuinely new ADR.

Phase 3 gate: Admin creates a Claude Product with two Packages and multiple Options, authors rich content, uploads media, publishes, changes price/stock, reorders merchandising, previews contact text, archives the Product, and logs out. Anonymous/non-admin authorization checks pass throughout and no test fixture is left unintentionally in staging.

### Phase 4 — Storefront

#### 4A — Public shell and foundation

- Port only the approved Landing brand assets/tokens needed by Storefront.
- Implement public header, mobile navigation, footer, route-level error boundary, 404, and global responsive primitives.
- Implement server Catalog query adapters and mapping types without exposing Admin-only fields.

#### 4B — Reusable discovery components

- Implement Category navigation, Product card, price/stock presentation, grid, skeleton, empty/error state, filter controls, mobile drawer, sort, and pagination.
- Verify minimum price and availability exactly match database search results.

#### 4C — Catalog, search, and Category routes

- Implement `/san-pham`, `/tim-kiem`, and `/danh-muc/:slug` with URL-driven state.
- Add debounce/Enter behavior, safe query normalization, browser-history restoration, and retry behavior.
- Verify no inactive Category or non-published Product leaks through route loaders or HTML.

#### 4D — Product detail and selection

- Implement breadcrumbs, responsive gallery, rich content renderer, Package/Option selection, related Products, sticky summary, and mobile CTA.
- Cover no-media, no-price, partial-stock, all-out-of-stock, and Product-hidden states.

#### 4E — Contact handoff

- Build server-authoritative Contact Intent, dialog, copy fallback, and enabled-channel external navigation.
- Add analytics-neutral hooks that Phase 5 can connect after consent.
- Verify no Order/Lead is created and success copy never claims a message was sent.

#### 4F — Homepage and responsive acceptance

- Implement hero search, active Category shortcuts, featured Products, up to three shelves, purchase process, selected Landing trust content, FAQ, final CTA, and footer.
- Validate reduced motion, keyboard flows, responsive screenshots, slow/error states, and navigation from homepage through purchase handoff.

Phase 4 gate: on staging, a Visitor can start at the homepage, search for Claude with or without Vietnamese diacritics where relevant, filter/sort results, open the Product, select the intended Package and in-stock Option, verify duration/price, copy the accurate contact message, and open each configured channel on mobile and desktop.

### Phase 5 — Merchandising, SEO and Analytics

#### 5A — Merchandising integration

- Verify homepage positions, empty slots, hidden/archived transitions, and the 60-second cache expectation end to end.
- Polish Admin merchandising preview against actual Storefront components.

#### 5B — Technical SEO

- Implement metadata, canonical/Open Graph data, `Product`, `AggregateOffer`, `BreadcrumbList`, sitemap, robots behavior, and real HTTP 404s.
- Verify staging remains noindex even though metadata exists for UAT.
- Verify published content is complete in the initial SSR HTML with JavaScript disabled.

#### 5C — Privacy and analytics consent

- Implement privacy page, first-visit consent UI, analytics opt-in/out persistence, and a way to change the choice.
- Wire the five approved GA4 events with the restricted parameter contract.
- Prove local/staging and declined-consent production sessions make no GA4 requests.

#### 5D — Performance and launch headers

- Add image transformations, lazy/preload policy, public bundle splitting, cache rules, and security headers.
- Run representative home, Catalog, Category, and Product audits at desktop and mobile sizes.

Phase 5 gate: SSR, metadata, structured data, canonical/404/sitemap behavior and crawler restrictions pass on staging. GA4 is tested only in production after explicit consent, while decline/revoke and every staging path remain silent.

### Phase 6 — QA and production data

1. Complete keyboard, screen-reader semantics, contrast, responsive, reduced-motion, and cross-browser acceptance.
2. Complete security review for RLS, Origin, session, headers, rich text, Cloudinary signatures/prefixes, logging, and built-asset secret scanning.
3. Meet Lighthouse targets on representative public routes and resolve hydration/runtime errors.
4. Review production migration with `supabase db push --dry-run`; apply only after explicit approval and backup readiness.
5. Add the environment-specific production Admin allowlist row without copying staging UUIDs.
6. Enter/verify real Catalog, media, merchandising, Contact Channels, SEO fields, and consent configuration in production.
7. Temporarily smoke-test the production Worker through its safe pre-cutover endpoint while keeping it non-indexed and detached from `cynex.site`.
8. Document data backup/export, route rollback, DNS/route ownership, responsible operator, and evidence checklist.
9. Rehearse rollback without deleting the Landing, Worker, or Supabase data.

Phase 6 gate: UAT has no open high-severity blocker; production data and authorization are verified; backups exist; the exact cutover and rollback procedures have been rehearsed and recorded.

### Phase 7 — Cutover

1. Freeze Catalog-changing work and confirm current production backup.
2. Merge the accepted release from `develop` to `main` and confirm the production Worker build/deploy.
3. Run the pre-route production smoke and record deployed commit SHA.
4. Create annotated tag `storefront-v1.0.0` for the accepted commit.
5. Confirm `landing.cynex.site` serves the stable Landing independently.
6. Attach the approved apex and `www` routes to `cynex-mvp-production` without deleting the Pages project.
7. Run public smoke for home, search, Product SSR, contact handoff, privacy/consent, analytics choice, and 404.
8. Monitor Worker errors, Supabase health, Cloudinary delivery, GA4 consent behavior, and user-critical paths for 24 hours.

Rollback trigger includes widespread 5xx, broken discovery/contact flow, authorization/data exposure, incorrect production data, or unacceptable performance not safely repairable in place. Rollback removes only the production Worker customer routes, verifies apex/`www` return to the Landing, records the incident, and preserves the Worker, database, uploaded media, and Landing project for investigation.

## 11. Verification plan

Required local/CI commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:db
pnpm build
```

Database acceptance covers anonymous published-only reads, draft isolation, non-admin denial, Admin CRUD, price/homepage constraints, and diacritic-insensitive search. Integration acceptance covers Auth lifecycle, loaders/actions, search, publish flow, Cloudinary failures, and session expiration.

Public E2E follows homepage → Claude search → product → Package → Option → price → copied contact message → Zalo/Facebook. Admin E2E follows login → Category → Product draft → media → Package/Options → publish → price/stock update → merchandising → archive → logout.

Quality targets before cutover:

- Accessibility ≥ 95.
- SEO ≥ 95.
- Performance ≥ 90.
- Best Practices ≥ 90.
- No hydration/runtime errors or client-bundle secrets.
- Published Product content is present in SSR HTML without JavaScript.

## 12. Completion criteria

The MVP is complete only when code and CI pass, staging and production acceptance are recorded, RLS and signed media operations are verified, production Catalog is populated, SEO/analytics and responsive screenshots are approved, cutover succeeds, and rollback has been rehearsed.
