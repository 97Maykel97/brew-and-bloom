drop index if exists public.customer_orders_processing_product_unique;

alter table public.customer_orders
	drop constraint if exists customer_orders_status_check;

alter table public.customer_orders
	add constraint customer_orders_status_check
	check (status in ('cart', 'processing', 'ready', 'completed'));

-- До появления оформления все записи со статусом processing были корзиной.
update public.customer_orders
set status = 'cart'
where status = 'processing';

create unique index if not exists customer_orders_cart_product_unique
	on public.customer_orders (user_id, product_key)
	where status = 'cart';

create or replace function public.add_home_product_order(p_product_key text)
returns public.customer_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user_id uuid := auth.uid();
	v_unit_price integer;
	v_order public.customer_orders;
begin
	if v_user_id is null then
		raise exception 'Authentication required';
	end if;

	v_unit_price := case p_product_key
		when 'classicRaf' then 320
		when 'matchaLatte' then 340
		when 'espressoTonic' then 290
		when 'classicCroissant' then 220
		else null
	end;

	if v_unit_price is null then
		raise exception 'Unknown product';
	end if;

	insert into public.customer_orders (
		user_id,
		product_key,
		quantity,
		unit_price,
		status
	)
	values (
		v_user_id,
		p_product_key,
		1,
		v_unit_price,
		'cart'
	)
	on conflict (user_id, product_key) where status = 'cart'
	do update set
		quantity = public.customer_orders.quantity + 1,
		updated_at = now()
	returning * into v_order;

	return v_order;
end;
$$;

create or replace function public.checkout_current_order()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user_id uuid := auth.uid();
	v_updated_count integer;
begin
	if v_user_id is null then
		raise exception 'Authentication required';
	end if;

	update public.customer_orders
	set
		status = 'processing',
		updated_at = now()
	where user_id = v_user_id
		and status = 'cart';

	get diagnostics v_updated_count = row_count;
	return v_updated_count;
end;
$$;

revoke all on function public.checkout_current_order() from public;
grant execute on function public.checkout_current_order() to authenticated;
