alter table public.profiles
	add column if not exists bonus_points integer not null default 0
	check (bonus_points >= 0);

update public.profiles as profile
set bonus_points = case
	when coalesce(auth_user.raw_user_meta_data ->> 'bonus_points', '') ~ '^[0-9]+$'
		then greatest((auth_user.raw_user_meta_data ->> 'bonus_points')::integer, 0)
	else 0
end
from auth.users as auth_user
where profile.id = auth_user.id
	and profile.bonus_points = 0;

revoke update on public.profiles from authenticated;
grant update (phone, first_name, last_name, birth_date) on public.profiles to authenticated;

create table if not exists public.order_bonus_awards (
	order_id uuid primary key,
	user_id uuid not null references public.profiles(id) on delete cascade,
	order_total integer not null check (order_total >= 0),
	bonus_points integer not null check (bonus_points >= 0),
	awarded_at timestamptz not null default now()
);

alter table public.order_bonus_awards enable row level security;

drop policy if exists users_read_own_bonus_awards on public.order_bonus_awards;
create policy users_read_own_bonus_awards
on public.order_bonus_awards
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists admins_read_all_bonus_awards on public.order_bonus_awards;
create policy admins_read_all_bonus_awards
on public.order_bonus_awards
for select
to authenticated
using (public.current_profile_role() = 'admin');

grant select on public.order_bonus_awards to authenticated;
grant all on public.order_bonus_awards to service_role;

with inserted_awards as (
	insert into public.order_bonus_awards (
		order_id,
		user_id,
		order_total,
		bonus_points
	)
	select
		item.order_id,
		item.user_id,
		sum(item.unit_price * item.quantity)::integer,
		floor(sum(item.unit_price * item.quantity) * 0.10)::integer
	from public.customer_orders as item
	where item.status = 'completed'
	group by item.order_id, item.user_id
	on conflict (order_id) do nothing
	returning user_id, bonus_points
), awarded_by_user as (
	select user_id, sum(bonus_points)::integer as bonus_points
	from inserted_awards
	group by user_id
)
update public.profiles as profile
set bonus_points = profile.bonus_points + award.bonus_points
from awarded_by_user as award
where profile.id = award.user_id;

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
	v_updated_count integer;
	v_user_id uuid;
	v_order_total integer;
	v_bonus_points integer;
	v_awarded_points integer;
begin
	if public.current_profile_role() <> 'admin' then
		raise exception 'Admin access required';
	end if;

	if p_status not in ('processing', 'ready', 'completed') then
		raise exception 'Invalid order status';
	end if;

	select item.user_id, sum(item.unit_price * item.quantity)::integer
	into v_user_id, v_order_total
	from public.customer_orders as item
	where item.order_id = p_order_id
		and item.status <> 'cart'
	group by item.user_id;

	if v_user_id is null then
		raise exception 'Order not found';
	end if;

	update public.customer_orders
	set
		status = p_status,
		updated_at = now()
	where order_id = p_order_id
		and status <> 'cart';

	get diagnostics v_updated_count = row_count;

	if p_status = 'completed' then
		v_bonus_points := floor(v_order_total * 0.10)::integer;

		insert into public.order_bonus_awards (
			order_id,
			user_id,
			order_total,
			bonus_points
		)
		values (
			p_order_id,
			v_user_id,
			v_order_total,
			v_bonus_points
		)
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

revoke all on function public.admin_set_customer_order_status(uuid, text) from public;
grant execute on function public.admin_set_customer_order_status(uuid, text) to authenticated;

do $$
begin
	if not exists (
		select 1
		from pg_publication_tables
		where pubname = 'supabase_realtime'
			and schemaname = 'public'
			and tablename = 'profiles'
	) then
		alter publication supabase_realtime add table public.profiles;
	end if;
end;
$$;
