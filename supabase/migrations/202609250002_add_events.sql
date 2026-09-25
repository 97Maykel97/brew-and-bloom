create table if not exists public.events (
	id uuid primary key default gen_random_uuid(),
	slug text not null unique,
	event_type text not null default 'coffee'
		check (event_type in ('coffee', 'latte_art', 'music', 'community')),
	title_ru text not null check (char_length(title_ru) between 1 and 160),
	title_en text not null check (char_length(title_en) between 1 and 160),
	title_he text not null check (char_length(title_he) between 1 and 160),
	description_ru text not null default '' check (char_length(description_ru) <= 500),
	description_en text not null default '' check (char_length(description_en) <= 500),
	description_he text not null default '' check (char_length(description_he) <= 500),
	event_date date not null,
	start_time time not null,
	end_time time not null,
	is_published boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now(),
	constraint events_time_range_check check (end_time > start_time)
);

create index if not exists events_public_schedule_idx
	on public.events (is_published, event_date, start_time);

alter table public.events enable row level security;

drop policy if exists published_events_are_public on public.events;
create policy published_events_are_public
on public.events for select
to anon, authenticated
using (is_published);

drop policy if exists admins_read_all_events on public.events;
create policy admins_read_all_events
on public.events for select
to authenticated
using (public.current_profile_role() = 'admin');

drop policy if exists admins_create_events on public.events;
create policy admins_create_events
on public.events for insert
to authenticated
with check (public.current_profile_role() = 'admin');

drop policy if exists admins_update_events on public.events;
create policy admins_update_events
on public.events for update
to authenticated
using (public.current_profile_role() = 'admin')
with check (public.current_profile_role() = 'admin');

drop policy if exists admins_delete_events on public.events;
create policy admins_delete_events
on public.events for delete
to authenticated
using (public.current_profile_role() = 'admin');

grant select on public.events to anon, authenticated;
grant insert, update, delete on public.events to authenticated;
grant all on public.events to service_role;

insert into public.events (
	slug,
	event_type,
	title_ru,
	title_en,
	title_he,
	description_ru,
	description_en,
	description_he,
	event_date,
	start_time,
	end_time
)
values
	(
		'specialty-coffee-tasting-2026-10-12',
		'coffee',
		'Дегустация спешелти кофе',
		'Specialty coffee tasting',
		'טעימת קפה ספיישלטי',
		'Знакомимся с разными регионами, ароматами и способами заваривания вместе с нашим бариста.',
		'Explore different origins, aromas, and brewing methods together with our barista.',
		'מכירים אזורי גידול, ניחוחות ושיטות חליטה שונות יחד עם הבריסטה שלנו.',
		'2026-10-12',
		'19:00',
		'21:00'
	),
	(
		'latte-art-workshop-2026-10-20',
		'latte_art',
		'Мастер-класс по латте-арту',
		'Latte art workshop',
		'סדנת לאטה ארט',
		'Научимся создавать рисунки и приготовим свой идеальный капучино.',
		'Learn to create beautiful patterns and prepare your own perfect cappuccino.',
		'לומדים ליצור ציורים יפים ומכינים קפוצ׳ינו מושלם משלכם.',
		'2026-10-20',
		'16:00',
		'18:00'
	),
	(
		'acoustic-evening-2026-10-27',
		'music',
		'Акустический вечер',
		'Acoustic evening',
		'ערב אקוסטי',
		'Живая музыка, мягкий свет и спокойный вечер в хорошей компании.',
		'Live music, soft light, and a relaxed evening in good company.',
		'מוזיקה חיה, אור רך וערב רגוע בחברה טובה.',
		'2026-10-27',
		'19:00',
		'22:00'
	)
on conflict (slug) do nothing;

do $$
begin
	if not exists (
		select 1
		from pg_publication_tables
		where pubname = 'supabase_realtime'
			and schemaname = 'public'
			and tablename = 'events'
	) then
		alter publication supabase_realtime add table public.events;
	end if;
end;
$$;
