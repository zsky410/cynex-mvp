# Cynex Storefront

Cynex Storefront is the public catalog and the private catalog-management surface for Cynex digital products. It replaces the current landing page only after production acceptance.

## Language

**Landing**:
The existing informational website that remains the production fallback during MVP development.
_Avoid_: MVP, storefront

**Storefront**:
The new customer-facing catalog where visitors discover products and initiate contact to buy.
_Avoid_: Landing, shop

**Catalog**:
The complete set of Categories, Products, Packages, Variants, Duration Options, and their published presentation.
_Avoid_: Inventory, store

**Category**:
An ordered grouping used to organize Products for discovery.
_Avoid_: Collection, section

**Product**:
A digital offering Visitors can evaluate before selecting a Package, Variant, and Duration Option.
_Avoid_: Service, item

**Visitor**:
An unauthenticated person browsing the published Storefront.
_Avoid_: User, customer

**Admin**:
An authenticated operator authorized to manage the Catalog and Storefront settings.
_Avoid_: User, staff

**Authenticated non-admin**:
An authenticated account that is not allowlisted as an Admin and therefore has Visitor-level Catalog access only.
_Avoid_: Admin, staff

**Package**:
A named commercial grouping of Variants for one Product, such as Claude Team.
_Avoid_: Plan, tier

**Variant**:
A form, capacity, entitlement, or service level available within a Package, such as 1.5x Pro.
_Avoid_: Duration, option, package

**Duration Option**:
A purchasable duration, price, and availability choice for one Variant, such as 3 months at 1,050,000 VND.
_Avoid_: Variant, package, plan

**Selection**:
The Visitor's complete choice of one Product, Package, Variant, and in-stock Duration Option before contact handoff.
_Avoid_: Cart, order, checkout

**Product Media**:
Cloudinary-backed visual assets assigned to a Product as thumbnail, cover, or gallery content.
_Avoid_: Upload, attachment

**Merchandising**:
The deliberate ordering of featured Products and homepage Category sections.
_Avoid_: Catalog, sorting

**Contact Channel**:
An enabled external destination through which a Visitor continues a purchase conversation.
_Avoid_: Checkout, payment

**Discovery Onboarding**:
The contextual guidance that helps a first-time Visitor understand how to find, compare, select, and contact Cynex without creating an account.
_Avoid_: Account onboarding, signup flow

**Draft**:
Catalog content visible to Admins but not Visitors.

**Published**:
Catalog content eligible to appear to Visitors.

**Archived**:
Catalog content retained for Admin reference but excluded from the Storefront.

**Staging**:
The public, non-indexable acceptance environment backed only by non-production data.
_Avoid_: Development, preview

**Production**:
The customer-facing environment backed by real data and eventually served from `cynex.site`.
_Avoid_: Live staging
