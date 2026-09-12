create function public.admin_move_category(target_id uuid, move_direction text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  target_order integer;
  adjacent_id uuid;
  adjacent_order integer;
begin
  if move_direction not in ('up', 'down') then
    raise exception 'Invalid category move direction' using errcode = '22023';
  end if;

  select sort_order into target_order
  from public.categories
  where id = target_id
  for update;

  if not found then
    raise exception 'Category not found' using errcode = 'P0002';
  end if;

  select id, sort_order into adjacent_id, adjacent_order
  from public.categories
  where case
    when move_direction = 'up' then (sort_order, id) < (target_order, target_id)
    else (sort_order, id) > (target_order, target_id)
  end
  order by
    case when move_direction = 'up' then sort_order end desc,
    case when move_direction = 'up' then id end desc,
    case when move_direction = 'down' then sort_order end asc,
    case when move_direction = 'down' then id end asc
  limit 1
  for update;

  if adjacent_id is null then return; end if;

  update public.categories set sort_order = adjacent_order where id = target_id;
  update public.categories set sort_order = target_order where id = adjacent_id;
end;
$$;

revoke all on function public.admin_move_category(uuid, text) from public;
grant execute on function public.admin_move_category(uuid, text) to authenticated;
