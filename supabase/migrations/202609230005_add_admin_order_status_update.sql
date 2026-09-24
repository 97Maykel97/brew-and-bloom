create or replace function public.admin_set_customer_order_status(
	p_order_id uuid,
	p_status text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_updated_count integer;
begin
	if public.current_profile_role() <> 'admin' then
		raise exception 'Admin access required';
	end if;

	if p_status not in ('processing', 'ready', 'completed') then
		raise exception 'Invalid order status';
	end if;

	update public.customer_orders
	set
		status = p_status,
		updated_at = now()
	where order_id = p_order_id
		and status <> 'cart';

	get diagnostics v_updated_count = row_count;
	return v_updated_count;
end;
$$;

revoke all on function public.admin_set_customer_order_status(uuid, text) from public;
grant execute on function public.admin_set_customer_order_status(uuid, text) to authenticated;
