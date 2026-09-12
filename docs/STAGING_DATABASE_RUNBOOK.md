# Staging database runbook

Use this runbook only for the `cynex-mvp-staging` Supabase project. Never run `supabase db reset --linked`.

1. Link the repository with `pnpm exec supabase link --project-ref <staging-project-ref>` and enter the staging database password locally.
2. Review with `pnpm exec supabase db push --dry-run`.
3. Apply with `pnpm exec supabase db push` only when the dry run lists the expected Phase 2 migrations.
4. Regenerate remote types with `pnpm exec supabase gen types typescript --linked > app/types/database.ts` and confirm they match the committed local types.
5. In Supabase SQL Editor, allowlist the existing staging Auth user with `insert into public.app_admins (user_id) values ('<staging-admin-uuid>');`.
6. Verify anonymous RLS, Admin login/logout, non-admin denial, and cleanup all temporary fixtures.

Do not place database passwords, secret/service-role keys, or user passwords in Git, project documentation, terminal history, or chat.
