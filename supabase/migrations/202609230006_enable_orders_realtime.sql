do $$
begin
	if not exists (
		select 1
		from pg_publication_tables
		where pubname = 'supabase_realtime'
			and schemaname = 'public'
			and tablename = 'customer_orders'
	) then
		alter publication supabase_realtime add table public.customer_orders;
	end if;
end;
$$;
