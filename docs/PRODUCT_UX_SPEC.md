# Cynex Storefront MVP — Product and UX specification

Status: accepted direction for MVP implementation  
Last updated: 2026-09-12  
Owner: Cynex

## 1. Product direction

Cynex Storefront turns the existing marketing Landing and external Google Sheet catalog into one guided discovery experience. A Visitor should be able to understand what Cynex sells, find a suitable premium application, compare its commercial forms and durations, see the current price/availability, and continue the purchase conversation through Zalo or Facebook without creating an account.

The Storefront is not an ecommerce checkout in MVP. It is a trustworthy, searchable catalog and a high-quality handoff into Cynex's existing assisted-sales process. The product succeeds when it reduces confusion and repetitive pre-sale questions while preserving human consultation at the final step.

The existing Landing remains independently deployable and available as rollback. Storefront development must not make rollback depend on reconstructing the old site.

## 2. Product promise

Primary promise to Visitors:

> Tìm đúng ứng dụng, đúng gói, đúng hình thức và đúng thời hạn trước khi liên hệ Cynex.

Supporting promises:

- Prices and availability shown on the Storefront correspond to a specific selectable configuration.
- Visitors can browse without an account.
- The path to purchase is understandable before opening an external chat.
- Cynex remains available for consultation when a Visitor is uncertain.
- The interface feels like the current Cynex brand, not a disconnected template store.

## 3. Product boundaries

### 3.1. Included in MVP

- Brand-led storefront homepage.
- Browse-all Catalog and Category pages.
- Vietnamese-diacritic-insensitive search.
- Category/availability filters, sorting, and pagination.
- Product detail with media and structured explanatory content.
- Four-level commercial hierarchy: Product → Package → Variant → Duration Option.
- Accurate price, compare-at price, stock, and duration presentation.
- Guided Selection and Zalo/Facebook contact handoff.
- Discovery Onboarding without account creation.
- One allowlisted Admin per environment.
- Admin management of Catalog, media, merchandising, and Contact Channels.
- Draft, publish, archive, preview, and hidden/active states.
- SEO for public Category/Product content.
- Consent-gated production analytics.
- Independent staging/production and retained Landing rollback.

### 3.2. Explicitly excluded from MVP

- Visitor signup/login or customer profile.
- Cart, checkout, online payment, Order, invoice, or automated fulfillment.
- Coupon, promotion engine, or customer-specific pricing.
- Stock reservation or real-time entitlement provisioning.
- Lead inbox, CRM, chatbot, or stored conversation content.
- Reviews submitted by Visitors.
- Google Sheet synchronization.
- Multi-role Admin management, audit log, version history, or concurrent-edit resolution.
- Full-page CMS for header, trust copy, FAQ, policy, or footer.
- Personalized recommendations, wish list, recently viewed, or search history.

The UI must not display controls that imply excluded functionality. In particular, use `Liên hệ mua` or `Nhờ Cynex tư vấn`, never `Thanh toán`, `Đặt hàng`, or `Mua ngay` when those words would imply an Order is created.

## 4. Users and jobs

### 4.1. First-time Visitor

Context: arrives from search, social media, a shared link, or the current Cynex brand presence; may not understand Package/Variant terminology.

Jobs:

- Understand within seconds that Cynex provides premium applications.
- Learn that products can be searched directly instead of opening a spreadsheet.
- Discover how the four-level choice works.
- Build enough confidence to inspect a Product or ask for advice.

Success signal: reaches a relevant Product or opens a general Contact Channel without becoming lost.

### 4.2. Intent-driven Visitor

Context: already knows the application name, such as Claude, Canva, or ChatGPT.

Jobs:

- Search quickly by Product, Package, Variant, or Duration Option wording.
- Compare available configurations and prices.
- Select the intended duration and contact Cynex with complete context.

Success signal: completes a valid Selection and opens/copies the correct contact handoff.

### 4.3. Comparing Visitor

Context: knows the desired outcome but not the exact application or commercial form.

Jobs:

- Browse a Category.
- Compare Product purpose, starting price, stock, and badges.
- Understand differences between Packages and Variants.
- Return to result state after viewing a Product.

Success signal: narrows the choice without losing filters or receiving misleading prices.

### 4.4. Returning Visitor

Context: returns to check current price/stock or reopen a Product shared previously.

Jobs:

- Reach the canonical Product URL directly.
- Confirm current price and availability.
- Change duration or contact channel without repeating discovery.

Success signal: completes the task from a deep link with minimal navigation.

### 4.5. Admin

Context: one trusted operator manages staging or production Catalog content.

Jobs:

- Enter complex products without corrupting the four-level hierarchy.
- Save incomplete work safely as draft.
- Preview exactly what a Visitor will see.
- Publish only complete, purchasable content.
- Change price/stock quickly and understand downstream Storefront effects.
- Maintain media, homepage placement, and Contact Channels.

Success signal: publishes and maintains valid Catalog data under RLS without direct database editing.

## 5. Experience principles

1. **Discovery before decoration.** Brand visuals support orientation; they do not bury search, Catalog entry, price, or availability.
2. **One commercial meaning per level.** Product, Package, Variant, and Duration Option are visually and semantically distinct.
3. **Price always has context.** A specific price belongs to a Duration Option; a Product card price is clearly labeled as starting from the minimum available choice.
4. **Availability is honest.** Out-of-stock choices remain understandable but cannot enter a contact Selection.
5. **No account wall.** Discovery Onboarding is contextual guidance, not signup.
6. **Assisted purchase is explicit.** Contact handoff is the end of Storefront flow, not a fake checkout.
7. **URL is user state.** Search/filter/sort/page state can be shared and restored.
8. **Admin safety over speed theater.** Validation, confirmation, and server acknowledgement are preferred over optimistic success.
9. **Refinement, not redesign.** The approved Landing identity anchors the Storefront.
10. **Accessible by default.** Keyboard, focus, semantics, contrast, reduced motion, and mobile usability are acceptance requirements.

## 6. Commercial hierarchy

### 6.1. Canonical model

```text
Category
└── Product
    └── Package
        └── Variant
            └── Duration Option
```

Canonical example:

```text
AI Tools
└── Claude
    └── Claude Team
        └── 1.5x Pro
            ├── 1 tháng — 400.000đ
            ├── 3 tháng — 1.050.000đ
            └── 12 tháng — 3.600.000đ
```

### 6.2. Meaning of each level

| Level | Question answered | Example | Owns price/stock? |
|---|---|---|---|
| Category | What family is this in? | AI Tools | No |
| Product | Which application/service? | Claude | No; shows derived starting price |
| Package | Which commercial offering? | Claude Team | No |
| Variant | Which form/capacity/entitlement? | 1.5x Pro | No |
| Duration Option | For how long and at what current terms? | 3 months | Yes |

A Variant is not a duration. A Duration Option is not a duplicate Variant label. If two durations share the same `1.5x Pro` meaning, they belong under one Variant.

### 6.3. Additional valid examples

```text
Canva
└── Canva Pro
    ├── Nâng cấp chính chủ
    │   ├── 1 tháng — price A
    │   └── 12 tháng — price B
    └── Tài khoản cấp sẵn
        ├── 1 tháng — price C
        └── 6 tháng — price D
```

```text
ChatGPT
├── ChatGPT Plus
│   └── Tài khoản riêng
│       └── 1 tháng — price E
└── ChatGPT Team
    ├── 1 seat
    │   ├── 1 tháng — price F
    │   └── 3 tháng — price G
    └── 5 seats
        └── 1 tháng — price H
```

The labels are business-managed content. The four levels remain stable even when a Product has only one Package or one Variant.

### 6.4. Active and stock rules

- An inactive Category hides all descendant Products from Visitors.
- A draft or archived Product hides all descendants.
- An inactive Package hides its Variants and Duration Options.
- An inactive Variant hides its Duration Options.
- An inactive Duration Option is absent from public selection.
- An active but out-of-stock Duration Option remains visible as unavailable.
- A Product is purchasable only when one complete active path ends in an in-stock Duration Option.
- Starting price is the minimum price among purchasable Duration Options only.

### 6.5. Ordering rules

- Category order controls navigation and applicable lists.
- Package order controls the first selection level on Product detail.
- Variant order controls comparison within a Package.
- Duration Option order should normally follow increasing duration, but Admin retains explicit ordering for business needs.
- Identical positions are rejected or normalized transactionally; public rendering always has a deterministic fallback order.

## 7. Discovery Onboarding

### 7.1. Definition

Discovery Onboarding teaches first-time Visitors how to use the Storefront without blocking content or requesting account data. It appears at moments of uncertainty and disappears naturally once the Visitor acts.

### 7.2. Homepage onboarding

The hero states the value in plain Vietnamese and makes search the fastest path. Under or near the primary CTA, concise guidance establishes the three visitor actions:

1. Tìm sản phẩm.
2. Chọn gói, hình thức và thời hạn.
3. Liên hệ Cynex để được xác nhận và hỗ trợ.

The homepage purchase-process section expands these steps with one short explanation each. It must clarify that contacting Cynex is required to finish purchasing and that website availability is informative until Cynex confirms.

### 7.3. Catalog onboarding

- Search placeholder uses a recognizable example, such as `Tìm Claude, Canva, ChatGPT`.
- First visit may show one non-modal helper line explaining filters and starting prices.
- `Từ` includes accessible explanatory text: the lowest currently available Duration Option.
- Empty states teach the next action rather than blame the Visitor.

No forced tour, coach-mark overlay, or dismiss-state tracking is required in MVP.

### 7.4. Product-selection onboarding

The selector exposes progress:

```text
1. Chọn gói
2. Chọn hình thức
3. Chọn thời hạn
```

Product is already chosen by the page, so the visible selector has three steps while the underlying commercial model has four levels.

Rules:

- Step 2 is unavailable until a Package is selected.
- Step 3 is unavailable until a Variant is selected.
- The summary explains what remains missing.
- Choosing an earlier level resets later choices.
- A single available choice may be pre-expanded; automatic final selection is used only when unmistakably communicated.
- Disabled choices include a reason such as out of stock rather than relying on faded styling.
- The contact CTA names the next action and remains disabled until Selection is complete.

### 7.5. Returning Visitor behavior

MVP does not persist Selection across devices or accounts. Browser navigation within the same Product should preserve selection while the route remains mounted. Refresh may return to the initial selection state. Deep-linking a specific Variant/Duration Option is deferred unless later analytics proves the need.

### 7.6. Admin first-use onboarding

Admin onboarding is an empty-state workflow, not a tutorial overlay. After the first successful login, the dashboard indicates setup progress in dependency order:

1. Configure at least one Contact Channel.
2. Create the first active Category.
3. Create a Product draft.
4. Add content and required thumbnail.
5. Add Package, Variant, and Duration Options.
6. Preview and publish.
7. Add the Product/Category to homepage merchandising.

Each incomplete step links to its real management screen. Completed steps derive from database state rather than a separate onboarding flag. The checklist disappears from primary emphasis after a published purchasable Product and enabled Contact Channel exist, but the dashboard retains normal quick actions.

The environment badge and empty-state copy must remind the Admin whether work affects staging or production. Staging data is never offered as an automatic production import in MVP.

## 8. Primary Visitor journeys

### 8.1. Search-first journey

1. Visitor lands on homepage.
2. Hero communicates searchable premium-app catalog.
3. Visitor enters `Claude` and submits.
4. Search results show count, Product cards, starting price, and availability.
5. Visitor opens Claude.
6. Product page explains purpose and presents Packages.
7. Visitor selects Claude Team.
8. Visitor selects 1.5x Pro.
9. Visitor selects 3 months.
10. Summary shows Claude / Claude Team / 1.5x Pro / 3 months / current price.
11. Visitor opens contact dialog.
12. Visitor copies text or opens an enabled channel.

Successful outcome: the outbound context contains the exact server-verified Selection and canonical Product URL.

### 8.2. Browse-by-Category journey

1. Visitor opens a Category from homepage/header.
2. Category page explains the group and shows published Products.
3. Visitor filters for in-stock and sorts by price or newest.
4. Visitor compares Product cards.
5. Visitor opens a Product, inspects choices, and contacts Cynex.
6. Browser Back returns to the prior Category query state.

Successful outcome: discovery state is preserved and price comparisons remain contextual.

### 8.3. Direct-link journey

1. Visitor opens a shared canonical Product URL.
2. Header/breadcrumbs establish brand and Category context.
3. Product information and starting price render in SSR HTML.
4. Visitor completes the three-step visible selector.
5. Visitor contacts Cynex or navigates to related Products.

Successful outcome: no homepage prerequisite is required.

### 8.4. Consultation-first journey

1. Visitor does not know which Product/configuration fits.
2. Visitor reads purchase guidance or support content.
3. Visitor opens a general enabled Contact Channel without a Selection.
4. Message asks Cynex for advice and contains the current page URL, not invented product data.

Successful outcome: uncertain Visitors have a safe route without being forced to choose arbitrary options.

### 8.5. Out-of-stock journey

1. Visitor opens a Product whose some durations are unavailable.
2. Unavailable Duration Options remain visible and labeled.
3. Available alternatives remain selectable.
4. If all paths are unavailable, Product shows `Tạm hết hàng`, disables Selection contact, and offers general consultation or related Products.

Successful outcome: no unavailable configuration enters a purchase-intent message.

### 8.6. No-results and failure journey

1. Search returns no matching Product or service temporarily fails.
2. No-results shows the original phrase, clears filters, and offers Catalog/Category paths.
3. Service failure distinguishes itself from no results and provides retry.
4. Input/query state remains intact.

Successful outcome: Visitor can recover without retyping or misinterpreting an outage as empty Catalog.

## 9. Product-detail interaction specification

### 9.1. Page hierarchy

Above the fold prioritizes Product identity, concise benefit, starting price/availability, media, and the first selector step. Detailed content and related Products follow. On desktop, the selection summary remains visible without covering content. On mobile, the bottom action appears only after it can fit without obscuring system/consent controls.

### 9.2. Package control

Each Package presents name, optional badge, and concise description. It is a single-select group. Selecting a Package reveals only its active Variants and clears any previous Variant/Duration Option from another Package.

When there is one Package, it may be open by default but must still be labeled as the chosen Package. When none has a purchasable descendant, the Product is not purchasable.

### 9.3. Variant control

Each Variant presents the form/capacity/entitlement name and optional explanation. It is a single-select group scoped to the chosen Package. Selecting a Variant reveals its active Duration Options and clears a previous Duration Option from another Variant.

Variant descriptions should explain business differences, not repeat Product marketing copy. Comparison tables are deferred; concise descriptions and badges serve MVP.

### 9.4. Duration Option control

Each Duration Option presents:

- Duration label.
- Current VND price.
- Compare-at VND price when greater than current price.
- Derived saving amount or percentage only when mathematically valid.
- Optional badge.
- In-stock or out-of-stock state.

It is a single-select group scoped to the chosen Variant. Price is formatted for `vi-VN` with `đ`; the stored value remains integer VND. A zero price displays `Miễn phí` only if Cynex intentionally creates that data.

### 9.5. Selection summary

Before completion, the summary lists selected levels and gives one direct prompt for the next missing level. After completion, it shows:

```text
Sản phẩm: Claude
Gói: Claude Team
Hình thức: 1.5x Pro
Thời hạn: 3 tháng
Giá: 1.050.000đ
```

The CTA label is `Liên hệ mua gói này`. Changing any parent updates or clears the summary immediately. Server validation rechecks the complete Selection before producing Contact Intent, covering stale price, newly unavailable stock, inactive parent, or archived Product.

### 9.6. Contact message

Default structure:

```text
Xin chào Cynex, mình muốn được tư vấn mua sản phẩm sau:
- Sản phẩm: Claude
- Gói: Claude Team
- Hình thức: 1.5x Pro
- Thời hạn: 3 tháng
- Giá hiển thị: 1.050.000đ
- Link: canonical product URL

Nhờ Cynex kiểm tra tình trạng và hướng dẫn giúp mình.
```

The generated message is previewed before opening an external channel. It contains no Visitor personal data. Cynex confirms final availability and terms in the external conversation.

## 10. Screen inventory and required states

| Surface | Default | Empty | Loading | Error | Restricted/unavailable |
|---|---|---|---|---|---|
| Homepage | Hero and merchandised content | Missing shelf collapses | Stable section skeleton | Retry for data sections | Contact CTA hidden if unconfigured |
| Catalog | Results and URL controls | No Products or no results | Grid skeleton/transition | Retry with query retained | Inactive Products absent |
| Category | Category and Product grid | Active Category has no Products | Grid skeleton | Retry | Unknown/inactive is 404 |
| Product | Content and selector | No media uses fallback | Stable detail skeleton | Retry | Draft/archived/hidden is 404 |
| Contact dialog | Complete Selection | General inquiry where allowed | Channel opening feedback | Copy/popup fallback | Purchase flow disabled if invalid |
| Admin login | Credentials form | Not applicable | Submit pending | Invalid/auth service message | Existing Admin redirects to dashboard |
| Admin dashboard | Counts/attention list | Zero-state shortcuts | Summary skeleton | Independent retry | Anonymous/non-admin denied |
| Category Admin | Searchable list/form | Create-first guidance | List/form pending | Input retained | Constraint explanation |
| Product Admin | Filtered list/editor | Create-first guidance | List/editor pending | Input retained | Lifecycle/reference explanation |
| Media Admin | Existing assets/upload | Upload guidance | Progress per asset | Retry/cleanup status | Invalid role/type/prefix denied |
| Merchandising | Ordered selections | Add guidance | Save pending | Previous state retained | Invalid references denied |
| Contact settings | Enabled channel form | Disabled state | Save pending | Input retained | Cannot remove last purchase path |

## 11. Admin workflows

### 11.1. Create and publish a Product

1. Admin signs in and confirms environment badge.
2. Creates/selects an active Category.
3. Creates Product basic information as draft.
4. Adds structured description.
5. Uploads thumbnail with alt text and optional cover/gallery.
6. Adds Package `Claude Team`.
7. Adds Variant `1.5x Pro`.
8. Adds 1-, 3-, and 12-month Duration Options with prices/stock.
9. Adds another Package/Variant path when the offering requires it.
10. Opens authenticated preview.
11. Resolves publish validation.
12. Publishes and confirms public visibility on staging.

### 11.2. Update price or stock

1. Admin finds Product through search/filter.
2. Opens the relevant Package and Variant.
3. Updates one Duration Option price/compare-at/stock.
4. Saves after server validation.
5. Confirms derived minimum price and Product availability.
6. Confirms Storefront reflects the change within cache expectation.

### 11.3. Remove commercial data safely

- Prefer deactivation when an offering may return.
- Removing a Duration Option affects one leaf.
- Removing a Variant cascades to all its Duration Options.
- Removing a Package cascades to all its Variants and Duration Options.
- Confirmation names the entity and descendant counts.
- Published Product validation prevents leaving no purchasable path.

### 11.4. Archive and restore Product

1. Remove Product from featured merchandising if referenced.
2. Archive with explicit confirmation.
3. Verify public Product URL becomes HTTP 404 and disappears from discovery.
4. Restore to draft when needed.
5. Revalidate and republish; canonical slug remains locked after first publication.

## 12. Content requirements

### 12.1. Product content

- Name identifies the application/service.
- Short description explains primary value in one compact passage.
- Rich description covers use cases, what is included, requirements, delivery/support expectations, and important limitations.
- Tags aid scanning/search without duplicating every hierarchy label.
- Badge is sparse and factual, such as `Phổ biến` or `Mới`.
- Thumbnail remains recognizable at Product-card size.
- Alt text identifies meaningful visual content.

### 12.2. Commercial labels

- Package names use the provider/product's recognizable commercial grouping.
- Variant names identify form/capacity/entitlement consistently across durations.
- Duration labels use consistent Vietnamese units: `1 tháng`, `3 tháng`, `12 tháng`.
- Option badges must not contradict stock or price.
- Compare-at price is used only when it represents a real comparison and is not below current price.

### 12.3. Fixed MVP content

Source-controlled content includes brand navigation, hero base copy, purchase process, trust section, FAQ, privacy/consent explanation, footer, system errors, empty states, and onboarding guidance. These require code review and are not editable through Admin during MVP.

## 13. UX copy rules

- Use plain Vietnamese and short action labels.
- Use `Sản phẩm`, `Gói`, `Hình thức`, and `Thời hạn` consistently in visitor-facing UI.
- Use `Lưu nháp`, `Xuất bản`, `Lưu trữ`, `Ẩn`, and `Khôi phục` according to domain state.
- Distinguish `Không tìm thấy kết quả` from `Không thể tải dữ liệu`.
- Say `Đã sao chép nội dung`; never say `Đã gửi tin nhắn`.
- Say `Giá hiển thị` in contact text because Cynex still confirms final terms.
- State destructive consequences directly and name descendant counts.
- Never expose database, Cloudinary, stack trace, or authorization vocabulary to Visitors.

## 14. Analytics measurement plan

Analytics exists to improve discovery and contact conversion, not to profile Admins or collect conversation data.

| Event | Trigger | Required parameters |
|---|---|---|
| `search` | Submitted non-empty public search | normalized query, result count |
| `view_item_list` | Product list meaningfully displayed | list ID/name, Product IDs |
| `select_item` | Product selected from a list | Product/list IDs, position |
| `view_item` | Published Product detail displayed | Product ID/name, Category, starting price |
| `generate_lead` | Visitor deliberately copies/opens Contact Channel | Product, Package, Variant, Duration Option IDs; value; channel |

`generate_lead` indicates a handoff action, not a completed sale. Events run only in production after consent. No email, phone, raw message, credential, Admin action, or stable cross-site identifier is sent.

Primary funnel:

```text
Storefront visit
→ Catalog/search engagement
→ Product detail
→ complete Selection
→ contact handoff action
```

MVP health indicators:

- Product-detail reach from Catalog/search.
- Completed Selection rate on Product detail.
- Contact handoff rate after complete Selection.
- Searches with zero results.
- Products frequently viewed while fully out of stock.
- Client/server error rate on discovery and contact paths.

No numeric business target is invented before a baseline exists. The first production period establishes the baseline.

## 15. Accessibility and responsive behavior

- Semantic heading hierarchy communicates page and selection structure.
- Selection levels are named fieldsets/radio groups with programmatic status.
- Focus moves to validation summary or newly revealed next step when appropriate.
- Disabled Duration Options expose the reason to assistive technology.
- Price changes are announced without excessive live-region noise.
- Mobile tap targets are comfortably sized and sticky CTA never covers final content.
- Desktop selector and summary remain spatially related.
- All key journeys pass keyboard-only use.
- Reduced-motion preserves meaning with static assets and transitions.
- 200% text zoom and 360 px width retain access to every control.

Required visual acceptance widths: 360, 768, 1280, and 1440 pixels.

## 16. SEO and sharing behavior

- Homepage targets Cynex premium application discovery.
- Category metadata describes the group without keyword stuffing.
- Product title/description match published content and selected canonical slug.
- Starting price in structured data derives from purchasable Duration Options.
- Open Graph image uses appropriate Product media or brand fallback.
- Search/selection state does not create uncontrolled indexable URL combinations.
- Draft preview remains authenticated/noindex/no-store.
- Archived and hidden content returns real 404 to Visitors.

## 17. Trust, privacy, and safety

- Storefront explains that final purchase continues through an external Contact Channel.
- Price/availability are current catalog information and revalidated before handoff.
- External channels are visibly identified before navigation.
- Analytics choice is optional, revocable, and absent from staging/local.
- No Visitor personal data is required for browsing or Selection.
- No contact message is stored by the MVP.
- Admin credentials and infrastructure secrets never appear in project docs, logs, HTML, or bundles.
- Staging remains public but non-indexed and contains no sensitive real data.

## 18. Acceptance scenarios

### 18.1. Four-level happy path

Given Claude is published under an active Category, Claude Team and 1.5x Pro are active, and 3 months is in stock, when a Visitor selects each level and opens contact, then summary/message contain the exact four-level Selection and current price.

### 18.2. Parent change reset

Given a complete Selection, when the Visitor changes Package, then Variant and Duration Option clear, price summary becomes incomplete, and contact CTA disables until a new valid path is selected.

### 18.3. Stale stock/price

Given a page loaded with an available Duration Option, when Admin changes stock or price before contact generation, then the server rejects stale invalid Selection or returns refreshed authoritative terms before handoff.

### 18.4. Inactive parent

Given a Duration Option remains active but its Variant or Package is inactive, then Visitors cannot discover/select it and it does not contribute to starting price or availability.

### 18.5. Single-choice path

Given a Product has one active Package, one active Variant, and one purchasable Duration Option, then the UI may expand/select the path automatically only while clearly displaying every chosen label and allowing the Visitor to review before contact.

### 18.6. All out of stock

Given every active Duration Option is out of stock, then Product remains viewable, displays `Tạm hết hàng`, has no purchase Selection CTA, and offers general consultation or related Products.

### 18.7. Search by nested label

Given Product data includes `Claude Team`, `1.5x Pro`, and `12 tháng`, searching a meaningful nested label returns Claude while preserving published-only and active-parent rules.

### 18.8. Unauthorized Admin mutation

Given anonymous or authenticated non-admin identity, any Catalog mutation fails under RLS even when the request bypasses the UI.

### 18.9. Draft preview

Given an incomplete draft, Admin can preview its public presentation inside protected Admin, but its public slug returns 404 and it is absent from search/sitemap.

### 18.10. External handoff failure

Given clipboard permission or popup navigation fails, the dialog retains selectable message text and offers a retry without claiming success.

## 19. Definition of ready for implementation

A slice is ready when:

- Its domain terms match `CONTEXT.md`.
- Its data requirements match migrations/types or include an approved forward migration.
- Routes, states, validation, authorization, and acceptance cases are stated.
- Required content/assets and environmental dependencies are known.
- It does not silently expand an excluded MVP capability.

The four-level hierarchy amendment is the first implementation dependency. Product editor and public selector work must not build new UI against the superseded three-level schema.

## 20. Definition of done for the Storefront MVP

- Admin manages complete four-level Catalog data through real staging/production RLS.
- Visitor discovery and Selection journeys work across required responsive widths and keyboard use.
- Public prices, stock, search, and contact messages derive from authoritative active hierarchy data.
- Draft, archived, hidden, inactive, and out-of-stock behavior matches this specification.
- SSR/SEO, consent/analytics, performance, security, and error-state gates pass.
- Production data is entered and accepted without staging credentials/data crossing environments.
- `cynex.site` cutover is successful and monitored.
- Landing remains independently available and route rollback has been rehearsed.
