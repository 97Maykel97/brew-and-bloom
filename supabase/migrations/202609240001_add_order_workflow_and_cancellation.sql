alter table public.customer_orders
	drop constraint if exists customer_orders_status_check;

alter table public.customer_orders
	add constraint customer_orders_status_check
	check (status in ('cart', 'processing', 'preparing', 'ready', 'completed', 'cancelled'));

create or replace function public.admin_set_customer_order_status(
	p_order_id uuid,
	p_status text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_current_status text;
	v_status_count integer;
	v_updated_count integer;
	v_user_id uuid;
	v_order_total integer;
	v_bonus_points integer;
	v_awarded_points integer;
begin
	if public.current_profile_role() <> 'admin' then
		raise exception 'Admin access required';
	end if;

	if p_status not in ('processing', 'preparing', 'ready', 'completed', 'cancelled') then
		raise exception 'Invalid order status';
	end if;

	perform 1
	from public.customer_orders
	where order_id = p_order_id and status <> 'cart'
	for update;

	select min(item.status), count(distinct item.status)::integer, item.user_id, sum(item.unit_price * item.quantity)::integer
	into v_current_status, v_status_count, v_user_id, v_order_total
	from public.customer_orders as item
	where item.order_id = p_order_id and item.status <> 'cart'
	group by item.user_id;

	if v_user_id is null then
		raise exception 'Order not found';
	end if;

	if v_status_count <> 1 then
		raise exception 'Order items have inconsistent statuses';
	end if;

	if p_status = v_current_status then
		select count(*)::integer into v_updated_count
		from public.customer_orders
		where order_id = p_order_id and status <> 'cart';
		return v_updated_count;
	end if;

	if not (
		(v_current_status = 'processing' and p_status in ('preparing', 'cancelled'))
		or (v_current_status = 'preparing' and p_status in ('processing', 'ready', 'cancelled'))
		or (v_current_status = 'ready' and p_status in ('preparing', 'completed', 'cancelled'))
	) then
		raise exception 'Invalid order status transition';
	end if;

	if p_status = 'cancelled' then
		perform product.id
		from public.menu_products as product
		join public.customer_orders as item on item.product_key = product.product_key
		where item.order_id = p_order_id
		for update of product;

		update public.menu_products as product
		set stock_quantity = product.stock_quantity + order_items.quantity
		from (
			select product_key, sum(quantity)::integer as quantity
			from public.customer_orders
			where order_id = p_order_id
			group by product_key
		) as order_items
		where product.product_key = order_items.product_key;
	end if;

	update public.customer_orders
	set status = p_status, updated_at = now()
	where order_id = p_order_id and status <> 'cart';

	get diagnostics v_updated_count = row_count;

	if p_status = 'completed' then
		v_bonus_points := floor(v_order_total * 0.10)::integer;
		insert into public.order_bonus_awards (order_id, user_id, order_total, bonus_points)
		values (p_order_id, v_user_id, v_order_total, v_bonus_points)
		on conflict (order_id) do nothing
		returning bonus_points into v_awarded_points;

		if v_awarded_points is not null then
			update public.profiles
			set bonus_points = bonus_points + v_awarded_points
			where id = v_user_id;
		end if;
	end if;

	return v_updated_count;
end;
$$;

create or replace function public.cancel_customer_order(p_order_id uuid)
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

	perform 1
	from public.customer_orders
	where order_id = p_order_id and user_id = v_user_id
	for update;

	if not found then
		raise exception 'Order not found';
	end if;

	if exists (
		select 1
		from public.customer_orders
		where order_id = p_order_id
			and user_id = v_user_id
			and status <> 'processing'
	) then
		raise exception 'Order can no longer be cancelled';
	end if;

	perform product.id
	from public.menu_products as product
	join public.customer_orders as item on item.product_key = product.product_key
	where item.order_id = p_order_id and item.user_id = v_user_id
	for update of product;

	update public.menu_products as product
	set stock_quantity = product.stock_quantity + order_items.quantity
	from (
		select product_key, sum(quantity)::integer as quantity
		from public.customer_orders
		where order_id = p_order_id and user_id = v_user_id
		group by product_key
	) as order_items
	where product.product_key = order_items.product_key;

	update public.customer_orders
	set status = 'cancelled', updated_at = now()
	where order_id = p_order_id and user_id = v_user_id and status = 'processing';

	get diagnostics v_updated_count = row_count;
	return v_updated_count;
end;
$$;

revoke all on function public.admin_set_customer_order_status(uuid, text) from public;
grant execute on function public.admin_set_customer_order_status(uuid, text) to authenticated;
revoke all on function public.cancel_customer_order(uuid) from public;
grant execute on function public.cancel_customer_order(uuid) to authenticated;
