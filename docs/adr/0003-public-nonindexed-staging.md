# Keep MVP staging public and non-indexed

Staging remains publicly reachable for simple UAT without Cloudflare Access, while response headers, HTML metadata, and `robots.txt` block indexing; staging sends no analytics and contains no sensitive data. If confidential data enters staging, access control becomes a prerequisite rather than relying on `noindex` as security.
