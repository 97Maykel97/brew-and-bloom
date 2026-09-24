create table if not exists public.menu_products (
	id uuid primary key default gen_random_uuid(),
	product_key text not null unique,
	name text not null check (char_length(trim(name)) between 2 and 120),
	price integer not null check (price >= 0),
	stock_quantity integer not null default 0 check (stock_quantity >= 0),
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

insert into public.menu_products (product_key, name, price, stock_quantity)
values
	('classicRaf', 'Раф Классический', 320, 50),
	('matchaLatte', 'Матча Латте', 340, 50),
	('espressoTonic', 'Эспрессо-Тоник', 290, 50),
	('classicCroissant', 'Круассан', 220, 50)
on conflict (product_key) do nothing;

alter table public.customer_orders
	drop constraint if exists customer_orders_product_key_check;

alter table public.product_favorites
	drop constraint if exists product_favorites_product_key_check;

alter table public.customer_orders
	drop constraint if exists customer_orders_product_key_fkey;

alter table public.customer_orders
	add constraint customer_orders_product_key_fkey
	foreign key (product_key) references public.menu_products(product_key)
	on update cascade on delete restrict;

alter table public.product_favorites
	drop constraint if exists product_favorites_product_key_fkey;

alter table public.product_favorites
	add constraint product_favorites_product_key_fkey
	foreign key (product_key) references public.menu_products(product_key)
	on update cascade on delete cascade;

alter table public.menu_products enable row level security;

drop policy if exists menu_products_are_readable on public.menu_products;
create policy menu_products_are_readable
on public.menu_products
for select
using (true);

drop policy if exists admins_can_insert_menu_products on public.menu_products;
create policy admins_can_insert_menu_products
on public.menu_products
for insert
to authenticated
with check (public.current_profile_role() = 'admin');

drop policy if exists admins_can_update_menu_products on public.menu_products;
create policy admins_can_update_menu_products
on public.menu_products
for update
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

drop policy if exists admins_can_delete_menu_products on public.menu_products;
create policy admins_can_delete_menu_products
on public.menu_products
for delete
to authenticated
using (public.current_profile_role() = 'admin');

grant select on public.menu_products to anon, authenticated;
grant insert, update, delete on public.menu_products to authenticated;

create or replace function public.set_menu_product_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
	new.updated_at := now();
	return new;
end;
$$;

drop trigger if exists set_menu_product_updated_at on public.menu_products;
create trigger set_menu_product_updated_at
before update on public.menu_products
for each row execute function public.set_menu_product_updated_at();

create or replace function public.sync_menu_product_price_to_carts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
	if new.price is distinct from old.price then
		update public.customer_orders
		set unit_price = new.price, updated_at = now()
		where product_key = new.product_key and status = 'cart';
	end if;
	return new;
end;
$$;

drop trigger if exists sync_menu_product_price_to_carts on public.menu_products;
create trigger sync_menu_product_price_to_carts
after update of price on public.menu_products
for each row execute function public.sync_menu_product_price_to_carts();

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

create or replace function public.set_cart_product_quantity(p_product_key text, p_quantity integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user_id uuid := auth.uid();
	v_quantity integer := greatest(p_quantity, 0);
	v_stock integer;
begin
	if v_user_id is null then
		raise exception 'Authentication required';
	end if;

	if v_quantity = 0 then
		delete from public.customer_orders
		where user_id = v_user_id and product_key = p_product_key and status = 'cart';
		return 0;
	end if;

	select stock_quantity into v_stock
	from public.menu_products
	where product_key = p_product_key and is_active = true;

	if v_stock is null or v_quantity > v_stock then
		raise exception 'Insufficient stock';
	end if;

	update public.customer_orders
	set quantity = v_quantity, updated_at = now()
	where user_id = v_user_id and product_key = p_product_key and status = 'cart';

	if not found then
		raise exception 'Cart product not found';
	end if;

	return v_quantity;
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

	perform product.id
	from public.menu_products as product
	join public.customer_orders as item on item.product_key = product.product_key
	where item.user_id = v_user_id and item.status = 'cart'
	for update of product;

	if exists (
		select 1
		from public.customer_orders as item
		left join public.menu_products as product on product.product_key = item.product_key
		where item.user_id = v_user_id
			and item.status = 'cart'
			and (product.id is null or product.is_active = false or item.quantity > product.stock_quantity)
	) then
		raise exception 'One or more products are unavailable';
	end if;

	update public.menu_products as product
	set stock_quantity = product.stock_quantity - cart.quantity
	from (
		select product_key, sum(quantity)::integer as quantity
		from public.customer_orders
		where user_id = v_user_id and status = 'cart'
		group by product_key
	) as cart
	where product.product_key = cart.product_key;

	update public.customer_orders
	set status = 'processing', updated_at = now()
	where user_id = v_user_id and status = 'cart';

	get diagnostics v_updated_count = row_count;
	return v_updated_count;
end;
$$;

revoke all on function public.add_home_product_order(text) from public;
revoke all on function public.set_cart_product_quantity(text, integer) from public;
revoke all on function public.checkout_current_order() from public;
grant execute on function public.add_home_product_order(text) to authenticated;
grant execute on function public.set_cart_product_quantity(text, integer) to authenticated;
grant execute on function public.checkout_current_order() to authenticated;

do $$
begin
	if not exists (
		select 1
		from pg_publication_tables
		where pubname = 'supabase_realtime'
			and schemaname = 'public'
			and tablename = 'menu_products'
	) then
		alter publication supabase_realtime add table public.menu_products;
	end if;
end;
$$;
