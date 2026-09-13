alter table public.profiles
	add column if not exists role text not null default 'customer';

alter table public.profiles
	drop constraint if exists profiles_role_check;

alter table public.profiles
	add constraint profiles_role_check
	check (role in ('customer', 'admin'));

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
	select profile.role
	from public.profiles as profile
	where profile.id = (select auth.uid());
$$;

revoke all on function public.current_profile_role() from public;
grant execute on function public.current_profile_role()
to authenticated, service_role;

drop policy if exists users_can_update_own_profile on public.profiles;
create policy users_can_update_own_profile
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check (
	(select auth.uid()) = id
	and role = public.current_profile_role()
);

drop policy if exists admins_can_read_profiles on public.profiles;
create policy admins_can_read_profiles
on public.profiles
for select
to authenticated
using (public.current_profile_role() = 'admin');
