create table if not exists public.booking_settings (
	id boolean primary key default true check (id),
	max_tables_per_slot integer not null default 8 check (max_tables_per_slot > 0),
	opening_time time not null default '09:00',
	closing_time time not null default '21:00',
	updated_at timestamptz not null default now()
);

insert into public.booking_settings (id)
values (true)
on conflict (id) do nothing;

create table if not exists public.table_bookings (
	id uuid primary key default gen_random_uuid(),
	user_id uuid not null references public.profiles(id) on delete cascade,
	booking_date date not null,
	booking_time time not null,
	guest_count integer not null check (guest_count between 1 and 12),
	comment text check (comment is null or char_length(comment) <= 500),
	status text not null default 'new' check (status in ('new', 'confirmed', 'completed', 'cancelled')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists table_bookings_user_date_idx
	on public.table_bookings (user_id, booking_date desc, booking_time desc);

create index if not exists table_bookings_slot_idx
	on public.table_bookings (booking_date, booking_time, status);

create unique index if not exists table_bookings_active_user_slot_unique
	on public.table_bookings (user_id, booking_date, booking_time)
	where status in ('new', 'confirmed');

alter table public.booking_settings enable row level security;
alter table public.table_bookings enable row level security;

drop policy if exists booking_settings_are_readable on public.booking_settings;
create policy booking_settings_are_readable
on public.booking_settings for select
using (true);

drop policy if exists admins_update_booking_settings on public.booking_settings;
create policy admins_update_booking_settings
on public.booking_settings for update to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

drop policy if exists users_read_own_bookings on public.table_bookings;
create policy users_read_own_bookings
on public.table_bookings for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists admins_read_all_bookings on public.table_bookings;
create policy admins_read_all_bookings
on public.table_bookings for select to authenticated
using (public.current_profile_role() = 'admin');

grant select on public.booking_settings to anon, authenticated;
grant update on public.booking_settings to authenticated;
grant select on public.table_bookings to authenticated;
grant all on public.table_bookings to service_role;

create or replace function public.create_table_booking(
	p_booking_date date,
	p_booking_time time,
	p_guest_count integer,
	p_comment text default null
)
returns public.table_bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user_id uuid := auth.uid();
	v_settings public.booking_settings;
	v_active_count integer;
	v_booking public.table_bookings;
	v_local_now timestamp := now() at time zone 'Asia/Jerusalem';
begin
	if v_user_id is null then
		raise exception 'Authentication required';
	end if;
	if p_guest_count not between 1 and 12 then
		raise exception 'Guest count must be between 1 and 12';
	end if;
	if p_comment is not null and char_length(trim(p_comment)) > 500 then
		raise exception 'Comment is too long';
	end if;
	if extract(minute from p_booking_time)::integer not in (0, 30)
		or extract(second from p_booking_time) <> 0 then
		raise exception 'Bookings are available in 30-minute slots';
	end if;

	select * into v_settings from public.booking_settings where id = true;
	if p_booking_time < v_settings.opening_time or p_booking_time > v_settings.closing_time then
		raise exception 'Booking time is outside opening hours';
	end if;
	if (p_booking_date + p_booking_time) <= v_local_now then
		raise exception 'Booking time must be in the future';
	end if;

	perform pg_advisory_xact_lock(hashtext(p_booking_date::text || ':' || p_booking_time::text));
	select count(*)::integer into v_active_count
	from public.table_bookings
	where booking_date = p_booking_date
		and booking_time = p_booking_time
		and status in ('new', 'confirmed');

	if v_active_count >= v_settings.max_tables_per_slot then
		raise exception 'No tables are available for this time';
	end if;

	insert into public.table_bookings (user_id, booking_date, booking_time, guest_count, comment)
	values (v_user_id, p_booking_date, p_booking_time, p_guest_count, nullif(trim(p_comment), ''))
	returning * into v_booking;
	return v_booking;
end;
$$;

create or replace function public.cancel_table_booking(p_booking_id uuid)
returns public.table_bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_booking public.table_bookings;
begin
	update public.table_bookings
	set status = 'cancelled', updated_at = now()
	where id = p_booking_id
		and user_id = auth.uid()
		and status = 'new'
	returning * into v_booking;

	if v_booking.id is null then
		raise exception 'Booking can no longer be cancelled';
	end if;
	return v_booking;
end;
$$;

create or replace function public.admin_set_table_booking_status(
	p_booking_id uuid,
	p_status text
)
returns public.table_bookings
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_current_status text;
	v_booking public.table_bookings;
begin
	if public.current_profile_role() <> 'admin' then
		raise exception 'Admin access required';
	end if;
	if p_status not in ('confirmed', 'completed', 'cancelled') then
		raise exception 'Invalid booking status';
	end if;

	select status into v_current_status
	from public.table_bookings
	where id = p_booking_id
	for update;

	if v_current_status is null then
		raise exception 'Booking not found';
	end if;
	if not (
		(v_current_status = 'new' and p_status in ('confirmed', 'cancelled'))
		or (v_current_status = 'confirmed' and p_status in ('completed', 'cancelled'))
		or v_current_status = p_status
	) then
		raise exception 'Invalid booking status transition';
	end if;

	update public.table_bookings
	set status = p_status, updated_at = now()
	where id = p_booking_id
	returning * into v_booking;
	return v_booking;
end;
$$;

revoke all on function public.create_table_booking(date, time, integer, text) from public;
revoke all on function public.cancel_table_booking(uuid) from public;
revoke all on function public.admin_set_table_booking_status(uuid, text) from public;
grant execute on function public.create_table_booking(date, time, integer, text) to authenticated;
grant execute on function public.cancel_table_booking(uuid) to authenticated;
grant execute on function public.admin_set_table_booking_status(uuid, text) to authenticated;

do $$
begin
	if not exists (
		select 1 from pg_publication_tables
		where pubname = 'supabase_realtime'
			and schemaname = 'public'
			and tablename = 'table_bookings'
	) then
		alter publication supabase_realtime add table public.table_bookings;
	end if;
end;
$$;
