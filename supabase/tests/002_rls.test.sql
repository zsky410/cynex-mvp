begin;

select plan(10);

insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.test', now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user@example.test', now(), now());

insert into public.app_admins (user_id)
values ('00000000-0000-0000-0000-000000000001');

insert into public.categories (id, name, slug, icon_key, is_active)
values
  ('10000000-0000-0000-0000-000000000001', 'Active', 'active', 'active', true),
  ('10000000-0000-0000-0000-000000000002', 'Hidden', 'hidden', 'hidden', false);

insert into public.products (id, category_id, name, slug, short_description, status, published_at)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Published', 'published', 'Published product', 'published', now()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Draft', 'draft', 'Draft product', 'draft', null);

insert into public.product_media (product_id, asset_id, public_id, secure_url, role, format, width, height, alt_text)
values
  ('20000000-0000-0000-0000-000000000001', 'published-media', 'cynex/staging/published', 'https://example.test/published.webp', 'thumbnail', 'webp', 100, 100, 'Published'),
  ('20000000-0000-0000-0000-000000000002', 'draft-media', 'cynex/staging/draft', 'https://example.test/draft.webp', 'thumbnail', 'webp', 100, 100, 'Draft');

insert into public.packages (id, product_id, name)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Published package'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'Draft package');

insert into public.options (package_id, name, duration_label, price_vnd, is_in_stock)
values
  ('30000000-0000-0000-0000-000000000001', 'Available', '1 month', 100000, true),
  ('30000000-0000-0000-0000-000000000001', 'Out of stock', '1 month', 100000, false),
  ('30000000-0000-0000-0000-000000000002', 'Draft option', '1 month', 100000, true);

set local role anon;

select is((select count(*) from public.categories), 1::bigint, 'anonymous reads only active categories');
select is((select count(*) from public.products), 1::bigint, 'anonymous reads only published products');
select is((select count(*) from public.product_media), 1::bigint, 'anonymous cannot read draft media');
select is((select count(*) from public.packages), 1::bigint, 'anonymous cannot read draft packages');
select is((select count(*) from public.options), 2::bigint, 'out-of-stock options remain public');
select is((select count(*) from public.app_admins), 0::bigint, 'anonymous cannot read admin allowlist');
select throws_ok(
  $$insert into public.categories (name, slug, icon_key) values ('Forbidden', 'forbidden', 'forbidden')$$,
  '42501',
  null,
  'anonymous cannot mutate catalog'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

select throws_ok(
  $$insert into public.categories (name, slug, icon_key) values ('Forbidden', 'non-admin', 'forbidden')$$,
  '42501',
  null,
  'non-admin cannot mutate catalog'
);

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

select lives_ok(
  $$insert into public.categories (name, slug, icon_key) values ('Allowed', 'admin-created', 'allowed')$$,
  'allowlisted admin can mutate catalog'
);
select is((select count(*) from public.products), 2::bigint, 'admin can read draft products');

select * from finish();
rollback;
