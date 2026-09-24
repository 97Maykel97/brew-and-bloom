create or replace function public.set_cart_product_quantity(
	p_product_key text,
	p_quantity integer
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
	v_user_id uuid := auth.uid();
	v_quantity integer := greatest(p_quantity, 0);
begin
	if v_user_id is null then
		raise exception 'Authentication required';
	end if;

	if v_quantity = 0 then
		delete from public.customer_orders
		where user_id = v_user_id
			and product_key = p_product_key
			and status = 'cart';
		return 0;
	end if;

	update public.customer_orders
	set
		quantity = v_quantity,
		updated_at = now()
	where user_id = v_user_id
		and product_key = p_product_key
		and status = 'cart';

	if not found then
		raise exception 'Cart product not found';
	end if;

	return v_quantity;
end;
$$;

revoke all on function public.set_cart_product_quantity(text, integer) from public;
grant execute on function public.set_cart_product_quantity(text, integer) to authenticated;
