create table if not exists public.user_session_devices (
	session_id uuid primary key,
	user_id uuid not null references auth.users(id) on delete cascade,
	device_name text not null,
	platform text not null default '',
	client_kind text not null check (client_kind in ('browser', 'mobile_app')),
	created_at timestamptz not null default now(),
	last_seen_at timestamptz not null default now()
);

create index if not exists user_session_devices_user_id_idx
	on public.user_session_devices (user_id);

alter table public.user_session_devices enable row level security;

revoke all on table public.user_session_devices from anon, authenticated;

create or replace function public.register_current_session_device(
	p_device_name text,
	p_platform text,
	p_client_kind text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user_id uuid := auth.uid();
	v_session_id uuid;
	v_device_name text;
	v_platform text;
	v_client_kind text;
begin
	v_session_id := nullif(auth.jwt() ->> 'session_id', '')::uuid;

	if v_user_id is null or v_session_id is null then
		raise exception using
			errcode = '42501',
			message = 'not_authenticated';
	end if;

	if not exists (
		select 1
		from auth.sessions as s
		where s.id = v_session_id
			and s.user_id = v_user_id
	) then
		raise exception using
			errcode = '42501',
			message = 'invalid_session';
	end if;

	v_device_name := coalesce(
		nullif(left(btrim(p_device_name), 120), ''),
		'Unknown device'
	);
	v_platform := coalesce(left(btrim(p_platform), 120), '');
	v_client_kind := case
		when p_client_kind = 'mobile_app' then 'mobile_app'
		else 'browser'
	end;

	delete from public.user_session_devices as d
	where d.user_id = v_user_id
		and not exists (
			select 1
			from auth.sessions as s
			where s.id = d.session_id
		);

	insert into public.user_session_devices (
		session_id,
		user_id,
		device_name,
		platform,
		client_kind,
		last_seen_at
	)
	values (
		v_session_id,
		v_user_id,
		v_device_name,
		v_platform,
		v_client_kind,
		now()
	)
	on conflict (session_id) do update
	set
		device_name = excluded.device_name,
		platform = excluded.platform,
		client_kind = excluded.client_kind,
		last_seen_at = now();
end;
$$;

revoke all on function public.register_current_session_device(text, text, text)
	from public, anon;
grant execute on function public.register_current_session_device(text, text, text)
	to authenticated;

create or replace function public.get_current_session_devices()
returns table (
	session_id uuid,
	user_agent text,
	device_name text,
	device_platform text,
	client_kind text,
	created_at timestamptz,
	last_active_at timestamptz,
	is_current boolean
)
language sql
stable
security definer
set search_path = ''
as $$
	select
		s.id as session_id,
		nullif(s.user_agent, '') as user_agent,
		d.device_name,
		d.platform as device_platform,
		d.client_kind,
		s.created_at,
		coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at) as last_active_at,
		s.id::text = (auth.jwt() ->> 'session_id') as is_current
	from auth.sessions as s
	left join public.user_session_devices as d
		on d.session_id = s.id
		and d.user_id = s.user_id
	where s.user_id = auth.uid()
	order by
		(s.id::text = (auth.jwt() ->> 'session_id')) desc,
		coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at) desc;
$$;

revoke all on function public.get_current_session_devices() from public, anon;
grant execute on function public.get_current_session_devices() to authenticated;
