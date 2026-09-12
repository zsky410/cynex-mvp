# Keep landing and storefront deployments separate

The existing landing page remains an independently deployed fallback while the Storefront is built and accepted on staging. The Storefront uses separate staging and production Workers, and its production Worker must not claim `cynex.site` until cutover is approved; this makes rollback a domain-routing change instead of a code reconstruction.
