'use client';

import { CalendarDays, ChevronRight, Clock3, Inbox, LoaderCircle, ShoppingBag, UtensilsCrossed, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import type { TAdminCopy, TAdminLocale, TAdminSection } from '../types';

type TAdminOverviewProps = { copy: TAdminCopy; locale: TAdminLocale; onSectionChange: (section: TAdminSection) => void };
type TOrderStatus = 'processing' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type TOrderRow = { order_id: string; quantity: number; status: TOrderStatus; updated_at: string; user_id: string };
type TActivityOrder = { id: string; itemCount: number; customerName: string; status: TOrderStatus; updatedAt: string };

const STATUS_COPY: Record<TAdminLocale, Record<TOrderStatus, string>> = {
	ru: { processing: 'В обработке', preparing: 'Готовится', ready: 'Готов к выдаче', completed: 'Завершён', cancelled: 'Отменён' },
	en: { processing: 'Processing', preparing: 'Preparing', ready: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled' },
	he: { processing: 'בטיפול', preparing: 'בהכנה', ready: 'מוכן לאיסוף', completed: 'הושלם', cancelled: 'בוטל' },
};

const ACTIVITY_COPY = {
	ru: { customer: 'Клиент', items: 'товаров', order: 'Заказ' },
	en: { customer: 'Customer', items: 'items', order: 'Order' },
	he: { customer: 'לקוח', items: 'פריטים', order: 'הזמנה' },
} as const;

export default function AdminOverview({ copy, locale, onSectionChange }: TAdminOverviewProps) {
	const [orders, setOrders] = useState<TActivityOrder[]>([]);
	const [counts, setCounts] = useState({ orders: 0, bookings: 0, users: 0, menuItems: 0 });
	const [isLoading, setIsLoading] = useState(true);
	const labels = ACTIVITY_COPY[locale];

	const loadOverview = useCallback(async () => {
		const supabase = createClient();
		const [ordersResult, profilesResult, menuResult] = await Promise.all([
			supabase.from('customer_orders').select('order_id, user_id, quantity, status, updated_at').neq('status', 'cart').order('updated_at', { ascending: false }),
			supabase.from('profiles').select('id, first_name, last_name'),
			supabase.from('menu_products').select('id', { count: 'exact', head: true }),
		]);

		const rows = (ordersResult.data as TOrderRow[] | null) ?? [];
		const profiles = new Map((profilesResult.data ?? []).map(profile => [profile.id, [profile.first_name, profile.last_name].filter(Boolean).join(' ')]));
		const grouped = groupOrders(rows, profiles, copy.administrator);
		setOrders(grouped.slice(0, 6));
		setCounts({
			orders: grouped.filter(order => ['processing', 'preparing', 'ready'].includes(order.status)).length,
			bookings: 0,
			users: profilesResult.data?.length ?? 0,
			menuItems: menuResult.count ?? 0,
		});
		setIsLoading(false);
	}, [copy.administrator]);

	useEffect(() => {
		const initialLoadTimer = window.setTimeout(() => void loadOverview(), 0);
		const supabase = createClient();
		const channel = supabase
			.channel(`admin-overview-${crypto.randomUUID()}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'customer_orders' }, () => void loadOverview())
			.on('postgres_changes', { event: '*', schema: 'public', table: 'menu_products' }, () => void loadOverview())
			.on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => void loadOverview())
			.subscribe();
		return () => {
			window.clearTimeout(initialLoadTimer);
			void supabase.removeChannel(channel);
		};
	}, [loadOverview]);

	const statistics = [
		{ key: 'orders' as const, label: copy.overview.orders, icon: ShoppingBag, section: 'orders' as const },
		{ key: 'bookings' as const, label: copy.overview.bookings, icon: CalendarDays, section: 'bookings' as const },
		{ key: 'users' as const, label: copy.overview.users, icon: UsersRound, section: 'users' as const },
		{ key: 'menuItems' as const, label: copy.overview.menuItems, icon: UtensilsCrossed, section: 'menu' as const },
	];

	return (
		<div className='space-y-5 sm:space-y-6'>
			<div className='grid grid-cols-2 gap-3 xl:grid-cols-4'>
				{statistics.map(item => {
					const Icon = item.icon;
					return <button className='min-w-0 cursor-pointer rounded-2xl border border-[#e4d8cd] bg-white/75 p-3.5 text-start shadow-[0_10px_30px_rgba(61,43,31,0.04)] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:p-5' key={item.key} onClick={() => onSectionChange(item.section)} type='button'>
						<div className='mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#f1e5d8] text-[var(--accent)]'><Icon size={19} strokeWidth={1.7} /></div>
						<strong className='block min-h-8 text-2xl font-semibold tabular-nums'>{isLoading ? <LoaderCircle className='animate-spin' size={20} /> : counts[item.key]}</strong>
						<span className='mt-1 block text-xs leading-5 text-[var(--muted)] sm:text-sm'>{item.label}</span>
					</button>;
				})}
			</div>

			<section className='rounded-3xl border border-[#e4d8cd] bg-white/75 p-5 sm:p-7'>
				<div className='flex items-center justify-between gap-3'>
					<h2 className='text-lg font-semibold sm:text-xl'>{copy.overview.recentActivity}</h2>
					{orders.length > 0 ? <button className='flex cursor-pointer items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline' onClick={() => onSectionChange('orders')} type='button'>{copy.navigation.orders}<ChevronRight className='rtl:rotate-180' size={15} /></button> : null}
				</div>
				{isLoading ? <ActivitySkeleton /> : orders.length === 0 ? <EmptyActivity copy={copy} /> : <div className='mt-5 grid gap-2'>
					{orders.map(order => <button className='group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-[#e9dfd5] bg-[#fbf8f4] p-3 text-start transition hover:border-[#d5c3b2] hover:bg-white sm:p-4' key={order.id} onClick={() => onSectionChange('orders')} type='button'>
						<span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efe2d5] text-[var(--accent)]'><ShoppingBag size={17} /></span>
						<span className='min-w-0 flex-1'><span className='block truncate text-sm font-semibold'>{labels.order} #{order.id.slice(0, 8).toUpperCase()}</span><span className='mt-1 block truncate text-xs text-[var(--muted)]'>{labels.customer}: {order.customerName} · {order.itemCount} {labels.items}</span></span>
						<span className='shrink-0 text-end'><span className={`block rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusTone(order.status)}`}>{STATUS_COPY[locale][order.status]}</span><span className='mt-1.5 flex items-center justify-end gap-1 text-[10px] text-[var(--muted)]'><Clock3 size={11} />{formatActivityDate(order.updatedAt, locale)}</span></span>
					</button>)}
				</div>}
			</section>
		</div>
	);
}

function ActivitySkeleton() {
	return <div className='mt-5 grid gap-2'>{Array.from({ length: 3 }, (_, index) => <div className='h-20 animate-pulse rounded-2xl bg-[#f2e9df]' key={index} />)}</div>;
}

function EmptyActivity({ copy }: { copy: TAdminCopy }) {
	return <div className='mt-5 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dccfc2] bg-[#fbf8f4] px-5 text-center'><div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#f1e5d8] text-[var(--accent)]'><Inbox size={21} strokeWidth={1.7} /></div><p className='mt-4 max-w-md text-sm text-[var(--muted)]'>{copy.overview.emptyActivity}</p></div>;
}

function groupOrders(rows: TOrderRow[], profiles: Map<string, string>, fallbackName: string): TActivityOrder[] {
	const groups = new Map<string, TActivityOrder>();
	for (const row of rows) {
		const current = groups.get(row.order_id);
		if (current) current.itemCount += row.quantity;
		else groups.set(row.order_id, { id: row.order_id, itemCount: row.quantity, customerName: profiles.get(row.user_id) || fallbackName, status: row.status, updatedAt: row.updated_at });
	}
	return [...groups.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function formatActivityDate(value: string, locale: TAdminLocale) {
	return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : locale === 'he' ? 'he-IL' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function getStatusTone(status: TOrderStatus) {
	if (status === 'processing') return 'bg-[#fff2d9] text-[#8a621b]';
	if (status === 'preparing') return 'bg-[#f6e6d4] text-[#8a5528]';
	if (status === 'ready') return 'bg-[#e7f0e2] text-[#526c48]';
	if (status === 'cancelled') return 'bg-[#f7e3df] text-[#9a433d]';
	return 'bg-[#ece8e4] text-[#675e58]';
}
