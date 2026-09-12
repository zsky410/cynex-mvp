# Use Supabase RLS and an environment-specific Admin allowlist

Catalog authorization is enforced in Postgres RLS using verified `auth.uid()` membership in `app_admins`; the Worker uses only the publishable key and confirms verified claims plus the allowlist. This rejects email/metadata authorization and runtime service-role bypass so the same boundary protects every loader, action, and future client.
