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
		greatest(
			coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at),
			coalesce(d.last_seen_at, s.created_at)
		) as last_active_at,
		s.id::text = (auth.jwt() ->> 'session_id') as is_current
	from auth.sessions as s
	left join public.user_session_devices as d
		on d.session_id = s.id
		and d.user_id = s.user_id
	where s.user_id = auth.uid()
	order by
		(s.id::text = (auth.jwt() ->> 'session_id')) desc,
		greatest(
			coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at),
			coalesce(d.last_seen_at, s.created_at)
		) desc;
$$;

revoke all on function public.get_current_session_devices() from public, anon;
grant execute on function public.get_current_session_devices() to authenticated;
