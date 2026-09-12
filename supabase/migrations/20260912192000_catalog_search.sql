create function public.catalog_search(
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
        min(option.price_vnd) filter (where option.is_active and option.is_in_stock) as min_price,
        coalesce(bool_or(option.is_active and option.is_in_stock), false) as in_stock,
        string_agg(concat_ws(' ', package.name, option.name), ' ') as searchable_options
      from public.packages package
      left join public.options option on option.package_id = package.id
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

revoke all on function public.catalog_search(text, text, boolean, text, integer, integer) from public;
grant execute on function public.catalog_search(text, text, boolean, text, integer, integer) to anon, authenticated;
