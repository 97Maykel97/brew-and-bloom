alter table public.profiles
	add column if not exists first_name text,
	add column if not exists last_name text,
	add column if not exists birth_date date;

update public.profiles as profile
set
	first_name = coalesce(
		profile.first_name,
		nullif(btrim(auth_user.raw_user_meta_data ->> 'first_name'), '')
	),
	last_name = coalesce(
		profile.last_name,
		nullif(btrim(auth_user.raw_user_meta_data ->> 'last_name'), '')
	),
	birth_date = coalesce(
		profile.birth_date,
		case
			when coalesce(
				auth_user.raw_user_meta_data ->> 'birth_date',
				''
			) ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
			then (auth_user.raw_user_meta_data ->> 'birth_date')::date
			else null
		end
	)
from auth.users as auth_user
where profile.id = auth_user.id;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
	normalized_phone text;
	profile_first_name text;
	profile_last_name text;
	profile_birth_date date;
begin
	normalized_phone := public.normalize_phone(
		new.raw_user_meta_data ->> 'phone'
	);
	profile_first_name := nullif(
		btrim(new.raw_user_meta_data ->> 'first_name'),
		''
	);
	profile_last_name := nullif(
		btrim(new.raw_user_meta_data ->> 'last_name'),
		''
	);
	profile_birth_date := (
		new.raw_user_meta_data ->> 'birth_date'
	)::date;

	if char_length(normalized_phone) not between 10 and 15 then
		raise exception using
			errcode = '22023',
			message = 'invalid_phone';
	end if;

	if profile_first_name is null or profile_last_name is null then
		raise exception using
			errcode = '22023',
			message = 'name_required';
	end if;

	if
		profile_birth_date is null
		or profile_birth_date > current_date
		or profile_birth_date < current_date - interval '120 years'
	then
		raise exception using
			errcode = '22023',
			message = 'invalid_birth_date';
	end if;

	insert into public.profiles (
		id,
		phone,
		first_name,
		last_name,
		birth_date
	)
	values (
		new.id,
		normalized_phone,
		profile_first_name,
		profile_last_name,
		profile_birth_date
	);

	return new;
exception
	when unique_violation then
		raise exception using
			errcode = '23505',
			message = 'phone_already_exists';
end;
$$;

create or replace view public.profiles_with_age
with (security_invoker = true)
as
select
	id,
	first_name,
	last_name,
	phone,
	birth_date,
	case
		when birth_date is null then null
		else extract(year from age(current_date, birth_date))::integer
	end as age,
	created_at
from public.profiles;

grant select on public.profiles_with_age to authenticated, service_role;
