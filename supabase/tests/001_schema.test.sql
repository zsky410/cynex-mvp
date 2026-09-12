begin;

select plan(23);

select has_table('public', 'app_admins', 'app_admins exists');
select has_table('public', 'categories', 'categories exists');
select has_table('public', 'products', 'products exists');
select has_table('public', 'product_media', 'product_media exists');
select has_table('public', 'packages', 'packages exists');
select has_table('public', 'variants', 'variants exists');
select has_table('public', 'options', 'options exists');
select has_table('public', 'homepage_featured_products', 'homepage_featured_products exists');
select has_table('public', 'homepage_category_sections', 'homepage_category_sections exists');
select has_table('public', 'site_settings', 'site_settings exists');

select has_column('public', 'variants', 'package_id', 'variants belong to packages');
select has_column('public', 'variants', 'name', 'variants have names');
select has_column('public', 'variants', 'description', 'variants have descriptions');
select has_column('public', 'variants', 'badge', 'variants have badges');
select has_column('public', 'variants', 'sort_order', 'variants have ordering');
select has_column('public', 'variants', 'is_active', 'variants have active state');
select has_column('public', 'variants', 'created_at', 'variants have created timestamp');
select has_column('public', 'variants', 'updated_at', 'variants have updated timestamp');
select has_column('public', 'options', 'variant_id', 'duration options belong to variants');
select col_not_null('public', 'options', 'variant_id', 'variant_id is required');
select hasnt_column('public', 'options', 'package_id', 'old package relationship is removed');
select hasnt_column('public', 'options', 'name', 'duplicated option name is removed');
select has_index('public', 'options', 'options_variant_order', 'duration options have variant ordering index');

select * from finish();
rollback;
