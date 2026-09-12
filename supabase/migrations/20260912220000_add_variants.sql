create table public.variants (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  description text,
  badge text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index variants_package_order
  on public.variants(package_id, sort_order);

create trigger variants_set_updated_at before update on public.variants
for each row execute function public.set_updated_at();

alter table public.variants enable row level security;

create policy variants_public_read on public.variants
for select to anon, authenticated
using (
  is_active and exists (
    select 1
    from public.packages package
    where package.id = package_id
      and package.is_active
      and public.is_product_public(package.product_id)
  )
);

create policy variants_admin_all on public.variants
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

grant select on public.variants to anon, authenticated;
grant insert, update, delete on public.variants to authenticated;

alter table public.options
  add column variant_id uuid references public.variants(id) on delete cascade;

with grouped_options as (
  select
    option.package_id,
    btrim(option.name) as name,
    min(option.sort_order) as first_sort_order,
    min(option.id::text) as first_id
  from public.options option
  group by option.package_id, btrim(option.name)
), ordered_variants as (
  select
    package_id,
    name,
    row_number() over (
      partition by package_id
      order by first_sort_order, name, first_id
    ) - 1 as sort_order
  from grouped_options
)
insert into public.variants (id, package_id, name, sort_order)
select
  md5(package_id::text || ':' || name)::uuid,
  package_id,
  name,
  sort_order
from ordered_variants;

update public.options option
set variant_id = variant.id
from public.variants variant
where variant.package_id = option.package_id
  and variant.name = btrim(option.name);

do $$
begin
  if exists (select 1 from public.options where variant_id is null) then
    raise exception 'Cannot require options.variant_id while unassigned options remain';
  end if;
end;
$$;

alter table public.options
  alter column variant_id set not null;

drop policy options_public_read on public.options;

create policy options_public_read on public.options
for select to anon, authenticated
using (
  is_active and exists (
    select 1
    from public.variants variant
    join public.packages package on package.id = variant.package_id
    where variant.id = variant_id
      and variant.is_active
      and package.is_active
      and public.is_product_public(package.product_id)
  )
);

create or replace function public.catalog_search(
  search_query text default null,
  category_slug text default null,
  stock_filter boolean default null,
  sort_by text default 'featured',
  page_number integer default 1,
  page_size integer default 12
)
returns table (
  id uuid,
  category text,
  name text,
  slug text,
  short_description text,
  tags text[],
  badge text,
  published_at timestamptz,
  min_price bigint,
  in_stock boolean,
  total_count bigint
)
language sql
stable
set search_path = ''
as $$
  with candidates as (
    select
      product.id,
      product_category.slug as category,
      product.name,
      product.slug,
      product.short_description,
      product.tags,
      product.badge,
      product.published_at,
      pricing.min_price,
      pricing.in_stock,
      featured.position
    from public.products product
    join public.categories product_category on product_category.id = product.category_id
    left join public.homepage_featured_products featured on featured.product_id = product.id
    left join lateral (
      select
        min(option.price_vnd) filter (
          where variant.is_active and option.is_active and option.is_in_stock
        ) as min_price,
        coalesce(bool_or(
          variant.is_active and option.is_active and option.is_in_stock
        ), false) as in_stock,
        string_agg(
          concat_ws(' ', package.name, variant.name, option.duration_label, option.badge),
          ' '
        ) filter (where variant.is_active and option.is_active) as searchable_options
      from public.packages package
      left join public.variants variant on variant.package_id = package.id
      left join public.options option on option.variant_id = variant.id
      where package.product_id = product.id and package.is_active
    ) pricing on true
    where (category_slug is null or product_category.slug = category_slug)
      and (stock_filter is null or pricing.in_stock = stock_filter)
      and (
        nullif(btrim(search_query), '') is null
        or regexp_replace(
          extensions.unaccent(lower(concat_ws(
            ' ',
            product.name,
            product.short_description,
            array_to_string(product.tags, ' '),
            pricing.searchable_options
          ))),
          '[^a-z0-9]+', ' ', 'g'
        ) like '%' || regexp_replace(
          extensions.unaccent(lower(btrim(search_query))),
          '[^a-z0-9]+', ' ', 'g'
        ) || '%'
      )
  ),
  counted as (
    select candidates.*, count(*) over () as total_count
    from candidates
  )
  select
    counted.id,
    counted.category,
    counted.name,
    counted.slug,
    counted.short_description,
    counted.tags,
    counted.badge,
    counted.published_at,
    counted.min_price,
    counted.in_stock,
    counted.total_count
  from counted
  where sort_by in ('featured', 'newest', 'price_asc', 'price_desc')
  order by
    case when sort_by = 'featured' then counted.position end asc nulls last,
    case when sort_by = 'newest' then counted.published_at end desc nulls last,
    case when sort_by in ('price_asc', 'price_desc') then not counted.in_stock end asc,
    case when sort_by = 'price_asc' then counted.min_price end asc nulls last,
    case when sort_by = 'price_desc' then counted.min_price end desc nulls last,
    counted.published_at desc,
    counted.id
  limit least(greatest(page_size, 1), 100)
  offset (greatest(page_number, 1) - 1) * least(greatest(page_size, 1), 100);
$$;

drop index public.options_package_order;

alter table public.options
  drop column package_id,
  drop column name;

create index options_variant_order
  on public.options(variant_id, sort_order);
