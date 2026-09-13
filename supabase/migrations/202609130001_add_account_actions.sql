create or replace function public.delete_current_user()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
	if auth.uid() is null then
		raise exception using
			errcode = '42501',
			message = 'not_authenticated';
	end if;

	delete from auth.sessions
	where user_id = auth.uid();

	delete from auth.users
	where id = auth.uid();
end;
$$;

revoke all on function public.delete_current_user() from public, anon;
grant execute on function public.delete_current_user() to authenticated;
