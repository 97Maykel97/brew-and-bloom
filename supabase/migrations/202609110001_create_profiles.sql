create or replace function public.normalize_phone(phone_value text)
returns text
language sql
immutable
set search_path = ''
as $$
	with cleaned as (
		select regexp_replace(
			coalesce(phone_value, ''),
			'[^0-9]',
			'',
			'g'
		) as digits
	)
	select case
		when digits like '9720%' then '972' || substring(digits from 5)
		when digits like '0%' then '972' || substring(digits from 2)
		else digits
	end
	from cleaned;
$$;

revoke all on function public.normalize_phone(text) from public;

create table if not exists public.profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	phone text not null unique,
	created_at timestamptz not null default now(),
	constraint profiles_phone_format_check check (
		phone = public.normalize_phone(phone)
		and char_length(phone) between 10 and 15
	)
);

alter table public.profiles enable row level security;

grant select, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

drop policy if exists users_can_read_own_profile on public.profiles;
create policy users_can_read_own_profile
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists users_can_update_own_profile on public.profiles;
create policy users_can_update_own_profile
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

insert into public.profiles (id, phone)
select
	id,
	public.normalize_phone(raw_user_meta_data ->> 'phone')
from auth.users
where
	public.normalize_phone(raw_user_meta_data ->> 'phone') <> ''
on conflict (id) do update
set phone = excluded.phone;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
	normalized_phone text;
begin
	normalized_phone := public.normalize_phone(
		new.raw_user_meta_data ->> 'phone'
	);

	if char_length(normalized_phone) not between 10 and 15 then
		raise exception using
			errcode = '22023',
			message = 'invalid_phone';
	end if;

	insert into public.profiles (id, phone)
	values (new.id, normalized_phone);

	return new;
exception
	when unique_violation then
		raise exception using
			errcode = '23505',
			message = 'phone_already_exists';
end;
$$;

drop trigger if exists on_auth_user_profile_created on auth.users;
create trigger on_auth_user_profile_created
	after insert on auth.users
	for each row execute procedure public.handle_new_user_profile();

create or replace function public.hook_prevent_duplicate_phone(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
	normalized_phone text;
begin
	normalized_phone := public.normalize_phone(
		event -> 'user' -> 'user_metadata' ->> 'phone'
	);

	if exists (
		select 1
		from public.profiles
		where phone = normalized_phone
	) then
		return jsonb_build_object(
			'error',
			jsonb_build_object(
				'http_code',
				409,
				'message',
				'phone_already_exists'
			)
		);
	end if;

	return '{}'::jsonb;
end;
$$;

revoke all on function public.hook_prevent_duplicate_phone(jsonb)
from public, anon, authenticated;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_prevent_duplicate_phone(jsonb)
to supabase_auth_admin;
