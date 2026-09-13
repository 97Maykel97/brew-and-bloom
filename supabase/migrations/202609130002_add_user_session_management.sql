create or replace function public.get_current_user_sessions()
returns table (
	session_id uuid,
	user_agent text,
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
		s.created_at,
		coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at) as last_active_at,
		s.id::text = (auth.jwt() ->> 'session_id') as is_current
	from auth.sessions as s
	where s.user_id = auth.uid()
	order by
		(s.id::text = (auth.jwt() ->> 'session_id')) desc,
		coalesce(s.refreshed_at::timestamptz, s.updated_at, s.created_at) desc;
$$;

revoke all on function public.get_current_user_sessions() from public, anon;
grant execute on function public.get_current_user_sessions() to authenticated;
