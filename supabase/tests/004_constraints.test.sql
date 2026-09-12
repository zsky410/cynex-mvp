begin;

select plan(9);

insert into public.categories (id, name, slug, icon_key, is_active)
values
  ('12000000-0000-0000-0000-000000000001', 'Active', 'active-constraints', 'active', true),
  ('12000000-0000-0000-0000-000000000002', 'Inactive', 'inactive-constraints', 'inactive', false);

insert into public.products (id, category_id, name, slug, short_description, status, published_at)
values
  ('22000000-0000-0000-0000-000000000001', '12000000-0000-0000-0000-000000000001', 'Published', 'published-constraints', 'Published', 'published', now()),
  ('22000000-0000-0000-0000-000000000002', '12000000-0000-0000-0000-000000000001', 'Draft', 'draft-constraints', 'Draft', 'draft', null);

insert into public.packages (id, product_id, name)
values ('32000000-0000-0000-0000-000000000001', '22000000-0000-0000-0000-000000000001', 'Package');

insert into public.variants (id, package_id, name)
values ('42000000-0000-0000-0000-000000000001', '32000000-0000-0000-0000-000000000001', 'Variant');

select throws_ok(
  $$insert into public.variants (package_id, name) values ('32000000-0000-0000-0000-000000000001', ' ')$$,
  '23514',
  null,
  'variant name cannot be blank'
);
select throws_ok(
  $$insert into public.variants (package_id, name, sort_order) values ('32000000-0000-0000-0000-000000000001', 'Invalid', -1)$$,
  '23514',
  null,
  'variant sort order cannot be negative'
);

select throws_ok(
  $$insert into public.options (variant_id, duration_label, price_vnd) values ('42000000-0000-0000-0000-000000000001', '1 month', -1)$$,
  '23514',
  null,
  'price cannot be negative'
);
select throws_ok(
  $$insert into public.options (variant_id, duration_label, price_vnd, compare_at_price_vnd) values ('42000000-0000-0000-0000-000000000001', '1 month', 100, 99)$$,
  '23514',
  null,
  'compare-at price cannot be lower than sale price'
);
select throws_ok(
  $$insert into public.options (variant_id, duration_label, price_vnd) values ('42000000-0000-0000-0000-000000000001', ' ', 100)$$,
  '23514',
  null,
  'duration label cannot be blank'
);
select throws_ok(
  $$insert into public.options (duration_label, price_vnd) values ('1 month', 100)$$,
  '23502',
  null,
  'duration option requires a variant'
);
select throws_ok(
  $$update public.products set slug = 'changed-after-publish' where id = '22000000-0000-0000-0000-000000000001'$$,
  '23514',
  null,
  'slug is immutable after first publish'
);
select throws_ok(
  $$insert into public.homepage_featured_products (product_id, position) values ('22000000-0000-0000-0000-000000000002', 1)$$,
  '23514',
  null,
  'homepage cannot feature a draft product'
);
select throws_ok(
  $$insert into public.homepage_category_sections (category_id, position) values ('12000000-0000-0000-0000-000000000002', 1)$$,
  '23514',
  null,
  'homepage cannot feature an inactive category'
);

select * from finish();
rollback;
