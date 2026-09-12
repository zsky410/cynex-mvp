create extension if not exists unaccent with schema extensions;

create type public.product_status as enum ('draft', 'published', 'archived');
create type public.media_role as enum ('thumbnail', 'cover', 'gallery');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.app_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null default '',
  icon_key text not null check (btrim(icon_key) <> ''),
  image_public_id text,
  image_url text check (image_url is null or image_url ~ '^https://'),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null check (btrim(name) <> ''),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  short_description text not null check (btrim(short_description) <> ''),
  description_doc jsonb not null default '{}'::jsonb check (jsonb_typeof(description_doc) = 'object'),
  tags text[] not null default '{}',
  badge text,
  status public.product_status not null default 'draft',
  seo_title text not null default '',
  seo_description text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or published_at is not null)
);

create table public.product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  asset_id text not null unique check (btrim(asset_id) <> ''),
  public_id text not null unique check (btrim(public_id) <> ''),
  secure_url text not null check (secure_url ~ '^https://'),
  role public.media_role not null,
  format text not null check (btrim(format) <> ''),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  alt_text text not null check (btrim(alt_text) <> ''),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index product_media_single_thumbnail
  on public.product_media(product_id) where role = 'thumbnail';
create unique index product_media_single_cover
  on public.product_media(product_id) where role = 'cover';

create table public.packages (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  description text,
  badge text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.options (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.packages(id) on delete cascade,
  name text not null check (btrim(name) <> ''),
  duration_label text not null check (btrim(duration_label) <> ''),
  price_vnd bigint not null check (price_vnd >= 0),
  compare_at_price_vnd bigint check (compare_at_price_vnd is null or compare_at_price_vnd >= price_vnd),
  is_in_stock boolean not null default true,
  badge text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.homepage_featured_products (
  product_id uuid primary key references public.products(id) on delete cascade,
  position integer not null unique check (position > 0),
  created_at timestamptz not null default now()
);

create table public.homepage_category_sections (
  category_id uuid primary key references public.categories(id) on delete cascade,
  position integer not null unique check (position between 1 and 3),
  created_at timestamptz not null default now()
);

create table public.site_settings (
  singleton boolean primary key default true check (singleton),
  zalo_url text check (zalo_url is null or zalo_url ~ '^https://'),
  zalo_enabled boolean not null default false,
  facebook_url text check (facebook_url is null or facebook_url ~ '^https://'),
  facebook_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.site_settings default values;

create index categories_public_order on public.categories(sort_order, name) where is_active;
create index products_category_id on public.products(category_id);
create index products_public_order on public.products(published_at desc) where status = 'published';
create index product_media_product_order on public.product_media(product_id, sort_order);
create index packages_product_order on public.packages(product_id, sort_order);
create index options_package_order on public.options(package_id, sort_order);

create trigger categories_set_updated_at before update on public.categories
for each row execute function public.set_updated_at();
create trigger products_set_updated_at before update on public.products
for each row execute function public.set_updated_at();
create trigger product_media_set_updated_at before update on public.product_media
for each row execute function public.set_updated_at();
create trigger packages_set_updated_at before update on public.packages
for each row execute function public.set_updated_at();
create trigger options_set_updated_at before update on public.options
for each row execute function public.set_updated_at();
create trigger site_settings_set_updated_at before update on public.site_settings
for each row execute function public.set_updated_at();
