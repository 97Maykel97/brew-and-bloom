create table if not exists public.product_favorites (
	user_id uuid not null references auth.users(id) on delete cascade,
	product_key text not null,
	created_at timestamptz not null default now(),
	primary key (user_id, product_key),
	constraint product_favorites_product_key_check check (
		product_key in (
			'classicRaf',
			'matchaLatte',
			'espressoTonic',
			'classicCroissant'
		)
	)
);

create table if not exists public.customer_orders (
	id bigint generated always as identity primary key,
	user_id uuid not null references auth.users(id) on delete cascade,
	product_key text not null,
	quantity integer not null default 1 check (quantity > 0),
	unit_price integer not null check (unit_price >= 0),
	status text not null default 'processing' check (
		status in ('processing', 'ready', 'completed')
	),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint customer_orders_product_key_check check (
		product_key in (
			'classicRaf',
			'matchaLatte',
			'espressoTonic',
			'classicCroissant'
		)
	)
);

create unique index if not exists customer_orders_processing_product_unique
	on public.customer_orders (user_id, product_key)
	where status = 'processing';

alter table public.product_favorites enable row level security;
alter table public.customer_orders enable row level security;

drop policy if exists users_manage_own_favorites on public.product_favorites;
create policy users_manage_own_favorites
on public.product_favorites
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists users_read_own_orders on public.customer_orders;
create policy users_read_own_orders
on public.customer_orders
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists admins_read_all_orders on public.customer_orders;
create policy admins_read_all_orders
on public.customer_orders
for select
to authenticated
using (public.current_profile_role() = 'admin');

drop policy if exists admins_update_orders on public.customer_orders;
create policy admins_update_orders
on public.customer_orders
for update
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

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
		'processing'
	)
	on conflict (user_id, product_key) where status = 'processing'
	do update set
		quantity = public.customer_orders.quantity + 1,
		updated_at = now()
	returning * into v_order;

	return v_order;
end;
$$;

revoke all on function public.add_home_product_order(text) from public;
grant execute on function public.add_home_product_order(text) to authenticated;

grant select, insert, update, delete on public.product_favorites to authenticated;
grant select on public.customer_orders to authenticated;
grant update on public.customer_orders to authenticated;
