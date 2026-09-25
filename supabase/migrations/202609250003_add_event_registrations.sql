alter table public.events
	add column if not exists capacity integer not null default 20
		check (capacity between 1 and 500);

create table if not exists public.event_registrations (
	id uuid primary key default gen_random_uuid(),
	event_id uuid not null references public.events(id) on delete cascade,
	user_id uuid not null references public.profiles(id) on delete cascade,
	guest_count integer not null default 1 check (guest_count between 1 and 10),
	status text not null default 'pending'
		check (status in ('pending', 'confirmed', 'cancelled')),
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	unique (event_id, user_id)
);

create index if not exists event_registrations_event_status_idx
	on public.event_registrations (event_id, status);

create index if not exists event_registrations_user_idx
	on public.event_registrations (user_id, created_at desc);

alter table public.event_registrations enable row level security;

drop policy if exists users_read_own_event_registrations on public.event_registrations;
create policy users_read_own_event_registrations
on public.event_registrations for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists admins_read_all_event_registrations on public.event_registrations;
create policy admins_read_all_event_registrations
on public.event_registrations for select
to authenticated
using (public.current_profile_role() = 'admin');

grant select on public.event_registrations to authenticated;
grant all on public.event_registrations to service_role;

create or replace function public.get_public_events()
returns table (
	id uuid,
	slug text,
	event_type text,
	title_ru text,
	title_en text,
	title_he text,
	description_ru text,
	description_en text,
	description_he text,
	event_date date,
	start_time time,
	end_time time,
	capacity integer,
	reserved_guests integer,
	available_spots integer
)
language sql
stable
security definer
set search_path = ''
as $$
	select
		event.id,
		event.slug,
		event.event_type,
		event.title_ru,
		event.title_en,
		event.title_he,
		event.description_ru,
		event.description_en,
		event.description_he,
		event.event_date,
		event.start_time,
		event.end_time,
		event.capacity,
		coalesce(sum(registration.guest_count) filter (
			where registration.status in ('pending', 'confirmed')
		), 0)::integer as reserved_guests,
		greatest(
			event.capacity - coalesce(sum(registration.guest_count) filter (
				where registration.status in ('pending', 'confirmed')
			), 0)::integer,
			0
		) as available_spots
	from public.events as event
	left join public.event_registrations as registration
		on registration.event_id = event.id
	where event.is_published
		and (event.event_date + event.end_time) > (now() at time zone 'Asia/Jerusalem')
	group by event.id
	order by event.event_date, event.start_time;
$$;

create or replace function public.register_for_event(
	p_event_id uuid,
	p_guest_count integer default 1
)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user_id uuid := auth.uid();
	v_event public.events;
	v_reserved integer;
	v_registration public.event_registrations;
begin
	if v_user_id is null then
		raise exception 'Authentication required';
	end if;
	if p_guest_count not between 1 and 10 then
		raise exception 'Guest count must be between 1 and 10';
	end if;

	perform pg_advisory_xact_lock(hashtext(p_event_id::text));
	select * into v_event
	from public.events
	where id = p_event_id
	for update;

	if v_event.id is null or not v_event.is_published then
		raise exception 'Event is not available';
	end if;
	if (v_event.event_date + v_event.start_time) <= (now() at time zone 'Asia/Jerusalem') then
		raise exception 'Event registration is closed';
	end if;

	select coalesce(sum(guest_count), 0)::integer into v_reserved
	from public.event_registrations
	where event_id = p_event_id
		and user_id <> v_user_id
		and status in ('pending', 'confirmed');

	if v_reserved + p_guest_count > v_event.capacity then
		raise exception 'Not enough available spots';
	end if;

	insert into public.event_registrations (
		event_id, user_id, guest_count, status
	)
	values (p_event_id, v_user_id, p_guest_count, 'pending')
	on conflict (event_id, user_id) do update
	set guest_count = excluded.guest_count,
		status = 'pending',
		updated_at = now()
	returning * into v_registration;

	return v_registration;
end;
$$;

create or replace function public.cancel_event_registration(p_registration_id uuid)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_registration public.event_registrations;
begin
	update public.event_registrations
	set status = 'cancelled', updated_at = now()
	where id = p_registration_id
		and user_id = auth.uid()
		and status in ('pending', 'confirmed')
	returning * into v_registration;

	if v_registration.id is null then
		raise exception 'Registration can no longer be cancelled';
	end if;
	return v_registration;
end;
$$;

create or replace function public.get_my_event_registrations()
returns table (
	registration_id uuid,
	event_id uuid,
	guest_count integer,
	status text,
	title_ru text,
	title_en text,
	title_he text,
	description_ru text,
	description_en text,
	description_he text,
	event_type text,
	event_date date,
	start_time time,
	end_time time
)
language sql
stable
security definer
set search_path = ''
as $$
	select
		registration.id,
		registration.event_id,
		registration.guest_count,
		registration.status,
		event.title_ru,
		event.title_en,
		event.title_he,
		event.description_ru,
		event.description_en,
		event.description_he,
		event.event_type,
		event.event_date,
		event.start_time,
		event.end_time
	from public.event_registrations as registration
	join public.events as event on event.id = registration.event_id
	where registration.user_id = auth.uid()
	order by event.event_date desc, event.start_time desc;
$$;

create or replace function public.admin_set_event_registration_status(
	p_registration_id uuid,
	p_status text
)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_registration public.event_registrations;
	v_capacity integer;
	v_reserved integer;
begin
	if public.current_profile_role() <> 'admin' then
		raise exception 'Admin access required';
	end if;
	if p_status not in ('confirmed', 'cancelled') then
		raise exception 'Invalid registration status';
	end if;

	select * into v_registration
	from public.event_registrations
	where id = p_registration_id
	for update;

	if v_registration.id is null then
		raise exception 'Registration not found';
	end if;

	perform pg_advisory_xact_lock(hashtext(v_registration.event_id::text));
	if p_status = 'confirmed' and v_registration.status = 'cancelled' then
		select capacity into v_capacity from public.events where id = v_registration.event_id;
		select coalesce(sum(guest_count), 0)::integer into v_reserved
		from public.event_registrations
		where event_id = v_registration.event_id
			and id <> v_registration.id
			and status in ('pending', 'confirmed');
		if v_reserved + v_registration.guest_count > v_capacity then
			raise exception 'Not enough available spots';
		end if;
	end if;

	update public.event_registrations
	set status = p_status, updated_at = now()
	where id = p_registration_id
	returning * into v_registration;
	return v_registration;
end;
$$;

revoke all on function public.get_public_events() from public;
revoke all on function public.register_for_event(uuid, integer) from public;
revoke all on function public.cancel_event_registration(uuid) from public;
revoke all on function public.get_my_event_registrations() from public;
revoke all on function public.admin_set_event_registration_status(uuid, text) from public;

grant execute on function public.get_public_events() to anon, authenticated;
grant execute on function public.register_for_event(uuid, integer) to authenticated;
grant execute on function public.cancel_event_registration(uuid) to authenticated;
grant execute on function public.get_my_event_registrations() to authenticated;
grant execute on function public.admin_set_event_registration_status(uuid, text) to authenticated;

do $$
begin
	if not exists (
		select 1 from pg_publication_tables
		where pubname = 'supabase_realtime'
			and schemaname = 'public'
			and tablename = 'event_registrations'
	) then
		alter publication supabase_realtime add table public.event_registrations;
	end if;
end;
$$;
