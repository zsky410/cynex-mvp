create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.app_admins where user_id = auth.uid()
  );
$$;

create function public.is_product_public(target_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.products p
    join public.categories c on c.id = p.category_id
    where p.id = target_product_id
      and p.status = 'published'
      and c.is_active
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_product_public(uuid) from public;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_product_public(uuid) to anon, authenticated;

alter table public.app_admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_media enable row level security;
alter table public.packages enable row level security;
alter table public.options enable row level security;
alter table public.homepage_featured_products enable row level security;
alter table public.homepage_category_sections enable row level security;
alter table public.site_settings enable row level security;

create policy app_admins_read_self on public.app_admins
for select to authenticated
using (user_id = auth.uid());

create policy categories_public_read on public.categories
for select to anon, authenticated
using (is_active);
create policy categories_admin_all on public.categories
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy products_public_read on public.products
for select to anon, authenticated
using (public.is_product_public(id));
create policy products_admin_all on public.products
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy product_media_public_read on public.product_media
for select to anon, authenticated
using (public.is_product_public(product_id));
create policy product_media_admin_all on public.product_media
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy packages_public_read on public.packages
for select to anon, authenticated
using (is_active and public.is_product_public(product_id));
create policy packages_admin_all on public.packages
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy options_public_read on public.options
for select to anon, authenticated
using (
  is_active and exists (
    select 1 from public.packages p
    where p.id = package_id
      and p.is_active
      and public.is_product_public(p.product_id)
  )
);
create policy options_admin_all on public.options
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy homepage_featured_products_public_read on public.homepage_featured_products
for select to anon, authenticated
using (public.is_product_public(product_id));
create policy homepage_featured_products_admin_all on public.homepage_featured_products
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy homepage_category_sections_public_read on public.homepage_category_sections
for select to anon, authenticated
using (exists (select 1 from public.categories c where c.id = category_id and c.is_active));
create policy homepage_category_sections_admin_all on public.homepage_category_sections
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy site_settings_public_read on public.site_settings
for select to anon, authenticated
using (singleton);
create policy site_settings_admin_all on public.site_settings
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

revoke all on all tables in schema public from anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.products to authenticated;
grant insert, update, delete on public.product_media to authenticated;
grant insert, update, delete on public.packages to authenticated;
grant insert, update, delete on public.options to authenticated;
grant insert, update, delete on public.homepage_featured_products to authenticated;
grant insert, update, delete on public.homepage_category_sections to authenticated;
grant insert, update, delete on public.site_settings to authenticated;
