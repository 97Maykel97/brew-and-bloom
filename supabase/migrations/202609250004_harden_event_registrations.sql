create or replace function public.protect_event_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_reserved integer;
begin
	if new.capacity = old.capacity then
		return new;
	end if;

	perform pg_advisory_xact_lock(hashtext(new.id::text));
	select coalesce(sum(guest_count), 0)::integer
	into v_reserved
	from public.event_registrations
	where event_id = new.id
		and status in ('pending', 'confirmed');

	if new.capacity < v_reserved then
		raise exception 'Capacity cannot be lower than reserved places';
	end if;

	return new;
end;
$$;

revoke all on function public.protect_event_capacity() from public;

drop trigger if exists protect_event_capacity_on_update on public.events;
create trigger protect_event_capacity_on_update
before update of capacity on public.events
for each row execute function public.protect_event_capacity();

create or replace function public.cancel_event_registration(p_registration_id uuid)
returns public.event_registrations
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_registration public.event_registrations;
begin
	update public.event_registrations as registration
	set status = 'cancelled', updated_at = now()
	where registration.id = p_registration_id
		and registration.user_id = auth.uid()
		and registration.status in ('pending', 'confirmed')
		and exists (
			select 1
			from public.events as event
			where event.id = registration.event_id
				and (event.event_date + event.start_time) >
					(now() at time zone 'Asia/Jerusalem')
		)
	returning * into v_registration;

	if v_registration.id is null then
		raise exception 'Registration can no longer be cancelled';
	end if;

	return v_registration;
end;
$$;

revoke all on function public.cancel_event_registration(uuid) from public;
grant execute on function public.cancel_event_registration(uuid) to authenticated;
