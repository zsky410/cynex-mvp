begin;

select plan(6);

insert into public.categories (id, name, slug, icon_key)
values ('11000000-0000-0000-0000-000000000001', 'AI', 'ai', 'sparkles');

insert into public.products (id, category_id, name, slug, short_description, tags, status, published_at)
values
  ('21000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000001', 'Claude Pro', 'claude-pro', 'Trợ lý AI', array['trí tuệ'], 'published', '2026-01-02'),
  ('21000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000001', 'Gemini Pro', 'gemini-pro', 'Mô hình AI', array['google'], 'published', '2026-01-01'),
  ('21000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000001', 'Secret Draft', 'secret-draft', 'Không công khai', array['secret'], 'draft', null);

insert into public.packages (id, product_id, name)
values
  ('31000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000001', 'Nâng cao'),
  ('31000000-0000-0000-0000-000000000002', '21000000-0000-0000-0000-000000000002', 'Cơ bản'),
  ('31000000-0000-0000-0000-000000000003', '21000000-0000-0000-0000-000000000003', 'Ẩn');

insert into public.options (package_id, name, duration_label, price_vnd, is_in_stock)
values
  ('31000000-0000-0000-0000-000000000001', 'Một tháng', '1 month', 100000, true),
  ('31000000-0000-0000-0000-000000000001', 'Hết hàng rẻ hơn', '1 month', 50000, false),
  ('31000000-0000-0000-0000-000000000002', 'Một tháng', '1 month', 80000, false),
  ('31000000-0000-0000-0000-000000000003', 'Draft', '1 month', 1000, true);

set local role anon;

select results_eq(
  $$select slug from public.catalog_search('tri tue')$$,
  array['claude-pro'],
  'search ignores Vietnamese diacritics'
);
select results_eq(
  $$select slug from public.catalog_search('nang cao')$$,
  array['claude-pro'],
  'search includes package names'
);
select results_eq(
  $$select slug from public.catalog_search('secret')$$,
  array[]::text[],
  'search never returns drafts'
);
select is(
  (select min_price from public.catalog_search('claude')),
  100000::bigint,
  'minimum price ignores out-of-stock options'
);
select results_eq(
  $$select slug from public.catalog_search(null, null, true)$$,
  array['claude-pro'],
  'in-stock filter returns purchasable products'
);
select results_eq(
  $$select slug from public.catalog_search(null, null, null, 'price_asc')$$,
  array['claude-pro', 'gemini-pro'],
  'price sort puts available products before unavailable products'
);

select * from finish();
rollback;
