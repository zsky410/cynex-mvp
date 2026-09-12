create function public.enforce_product_invariants()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.published_at is not null and new.slug is distinct from old.slug then
    raise exception 'A published product slug cannot be changed' using errcode = '23514';
  end if;

  if new.status <> 'published' and exists (
    select 1 from public.homepage_featured_products where product_id = new.id
  ) then
    raise exception 'A featured product must remain published' using errcode = '23514';
  end if;

  return new;
end;
$$;

create function public.enforce_category_invariants()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not new.is_active and exists (
    select 1 from public.homepage_category_sections where category_id = new.id
  ) then
    raise exception 'A homepage category must remain active' using errcode = '23514';
  end if;

  return new;
end;
$$;

create function public.validate_featured_product()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.products where id = new.product_id and status = 'published'
  ) then
    raise exception 'Only published products can be featured' using errcode = '23514';
  end if;

  return new;
end;
$$;

create function public.validate_homepage_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.categories where id = new.category_id and is_active
  ) then
    raise exception 'Only active categories can appear on the homepage' using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger products_enforce_invariants before update on public.products
for each row execute function public.enforce_product_invariants();
create trigger categories_enforce_invariants before update on public.categories
for each row execute function public.enforce_category_invariants();
create trigger homepage_featured_products_validate before insert or update on public.homepage_featured_products
for each row execute function public.validate_featured_product();
create trigger homepage_category_sections_validate before insert or update on public.homepage_category_sections
for each row execute function public.validate_homepage_category();
