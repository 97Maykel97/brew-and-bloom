import { useEffect, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type TMenuProductInventory = { isActive: boolean; price: number; stockQuantity: number };
type TMenuProductRow = { product_key: string; price: number; stock_quantity: number; is_active: boolean };

export function useMenuProductInventory() {
	const [inventory, setInventory] = useState<Map<string, TMenuProductInventory>>(new Map());
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isActive = true;
		async function loadInventory() {
			const { data } = await supabase.from('menu_products').select('product_key, price, stock_quantity, is_active');
			if (!isActive) return;
			if (data) setInventory(new Map((data as TMenuProductRow[]).map(product => [product.product_key, { isActive: product.is_active, price: product.price, stockQuantity: product.stock_quantity }])));
			setIsLoading(false);
		}

		void loadInventory();
		const channelName = `public-menu-inventory-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const channel = supabase.channel(channelName).on('postgres_changes', { event: '*', schema: 'public', table: 'menu_products' }, () => void loadInventory()).subscribe();
		return () => { isActive = false; void supabase.removeChannel(channel); };
	}, []);

	return { inventory, isLoading };
}
