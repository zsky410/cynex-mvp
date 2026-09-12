begin;

select plan(9);

select has_table('public', 'app_admins', 'app_admins exists');
select has_table('public', 'categories', 'categories exists');
select has_table('public', 'products', 'products exists');
select has_table('public', 'product_media', 'product_media exists');
select has_table('public', 'packages', 'packages exists');
select has_table('public', 'options', 'options exists');
select has_table('public', 'homepage_featured_products', 'homepage_featured_products exists');
select has_table('public', 'homepage_category_sections', 'homepage_category_sections exists');
select has_table('public', 'site_settings', 'site_settings exists');

select * from finish();
rollback;
