alter table public.customer_orders
	add column if not exists order_id uuid;

-- Все позиции одной текущей корзины получают общий идентификатор заказа.
with cart_groups as (
	select users.user_id, gen_random_uuid() as order_id
	from (
		select distinct user_id
		from public.customer_orders
		where status = 'cart'
	) as users
)
update public.customer_orders as item
set order_id = cart_groups.order_id
from cart_groups
where item.user_id = cart_groups.user_id
	and item.status = 'cart'
	and item.order_id is null;

-- Старые оформленные строки невозможно достоверно сгруппировать задним числом,
-- поэтому каждая из них остаётся отдельным заказом.
update public.customer_orders
set order_id = gen_random_uuid()
where order_id is null;

alter table public.customer_orders
	alter column order_id set not null;

create index if not exists customer_orders_user_order_id_idx
	on public.customer_orders (user_id, order_id);

create or replace function public.add_home_product_order(p_product_key text)
returns public.customer_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user_id uuid := auth.uid();
	v_order_id uuid;
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

	select item.order_id
	into v_order_id
	from public.customer_orders as item
	where item.user_id = v_user_id
		and item.status = 'cart'
	limit 1;

	v_order_id := coalesce(v_order_id, gen_random_uuid());

	insert into public.customer_orders (
		order_id,
		user_id,
		product_key,
		quantity,
		unit_price,
		status
	)
	values (
		v_order_id,
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
