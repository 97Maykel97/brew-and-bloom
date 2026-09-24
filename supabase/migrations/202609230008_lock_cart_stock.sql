create or replace function public.add_home_product_order(p_product_key text)
returns public.customer_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user_id uuid := auth.uid();
	v_order_id uuid;
	v_product public.menu_products;
	v_cart_quantity integer;
	v_order public.customer_orders;
begin
	if v_user_id is null then
		raise exception 'Authentication required';
	end if;

	select * into v_product
	from public.menu_products
	where product_key = p_product_key
		and is_active = true
	for update;

	if not found then
		raise exception 'Product is unavailable';
	end if;

	select coalesce(quantity, 0) into v_cart_quantity
	from public.customer_orders
	where user_id = v_user_id
		and product_key = p_product_key
		and status = 'cart';

	if coalesce(v_cart_quantity, 0) >= v_product.stock_quantity then
		raise exception 'Insufficient stock';
	end if;

	select item.order_id into v_order_id
	from public.customer_orders as item
	where item.user_id = v_user_id
		and item.status = 'cart'
	limit 1;

	v_order_id := coalesce(v_order_id, gen_random_uuid());

	insert into public.customer_orders (order_id, user_id, product_key, quantity, unit_price, status)
	values (v_order_id, v_user_id, p_product_key, 1, v_product.price, 'cart')
	on conflict (user_id, product_key) where status = 'cart'
	do update set
		quantity = public.customer_orders.quantity + 1,
		unit_price = excluded.unit_price,
		updated_at = now()
	returning * into v_order;

	return v_order;
end;
$$;

revoke all on function public.add_home_product_order(text) from public;
grant execute on function public.add_home_product_order(text) to authenticated;
