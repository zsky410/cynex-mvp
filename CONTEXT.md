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
The complete set of categories, products, packages, options, and their published presentation.
_Avoid_: Inventory, store

**Category**:
An ordered grouping used to organize Products for discovery.
_Avoid_: Collection, section

**Product**:
A digital offering Visitors can evaluate before selecting a Package and Option.
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
A named commercial grouping of purchase Options for one Product.
_Avoid_: Plan, tier

**Option**:
A purchasable duration and price within a Package.
_Avoid_: Package, variant

**Product Media**:
Cloudinary-backed visual assets assigned to a Product as thumbnail, cover, or gallery content.
_Avoid_: Upload, attachment

**Merchandising**:
The deliberate ordering of featured Products and homepage Category sections.
_Avoid_: Catalog, sorting

**Contact Channel**:
An enabled external destination through which a Visitor continues a purchase conversation.
_Avoid_: Checkout, payment

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
