'use client';

import Image from 'next/image';
import { ArrowRight, CalendarDays, CheckCircle2, ChevronDown, LoaderCircle, PackageCheck, RotateCcw, Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getHomeProductCopy } from '@/features/catalog/home-product-copy';
import { getHomeProduct, type THomeProductKey } from '@/features/catalog/home-products';
import { formatPhoneNumber } from '@/features/profile/lib/profile-formatters';
import { createClient } from '@/lib/supabase/client';
import type { TAdminLocale } from '../types';

type TOrderStatus = 'processing' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type TOrderFilter = 'all' | TOrderStatus;
type TOrderRow = {
	id: number;
	order_id: string;
	product_key: THomeProductKey;
	quantity: number;
	status: TOrderStatus;
	unit_price: number;
	updated_at: string;
	user_id: string;
};
type TProfileRow = { id: string; first_name: string | null; last_name: string | null; phone: string | null };
type TOrderGroup = { id: string; items: TOrderRow[]; status: TOrderStatus; updatedAt: string; userId: string };
type TOrderDayGroup = { key: string; orders: TOrderGroup[] };

const COPY = {
	ru: { action: { preparing: 'Начать готовить', ready: 'Готов к выдаче', completed: 'Завершить заказ', cancel: 'Отменить', cancelConfirm: 'Отменить этот заказ? Товары вернутся в остатки.', back: 'Вернуть назад' }, all: 'Всего', allDates: 'Все даты', customer: 'Клиент', dateOrders: 'Заказы за 7 дней', empty: 'Оформленных заказов пока нет', error: 'Не удалось обновить заказ.', items: 'товаров', noResults: 'Заказы по выбранным фильтрам не найдены', order: 'Заказ', phone: 'Телефон', search: 'Найти клиента по имени', status: { processing: 'В обработке', preparing: 'Готовится', ready: 'Готов к выдаче', completed: 'Завершён', cancelled: 'Отменён' }, title: 'Заказы', today: 'Сегодня', total: 'Итого', unknown: 'Пользователь', yesterday: 'Вчера' },
	en: { action: { preparing: 'Start preparing', ready: 'Ready for pickup', completed: 'Complete order', cancel: 'Cancel', cancelConfirm: 'Cancel this order? The products will be returned to stock.', back: 'Move back' }, all: 'Total', allDates: 'All dates', customer: 'Customer', dateOrders: 'Orders for 7 days', empty: 'There are no placed orders yet', error: 'Could not update the order.', items: 'items', noResults: 'No orders match the selected filters', order: 'Order', phone: 'Phone', search: 'Search customer by name', status: { processing: 'Processing', preparing: 'Preparing', ready: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled' }, title: 'Orders', today: 'Today', total: 'Total', unknown: 'Customer', yesterday: 'Yesterday' },
	he: { action: { preparing: 'התחלת הכנה', ready: 'מוכן לאיסוף', completed: 'השלמת הזמנה', cancel: 'ביטול', cancelConfirm: 'לבטל את ההזמנה? המוצרים יוחזרו למלאי.', back: 'החזרה אחורה' }, all: 'סה״כ', allDates: 'כל התאריכים', customer: 'לקוח', dateOrders: 'הזמנות ל-7 ימים', empty: 'אין עדיין הזמנות שבוצעו', error: 'לא ניתן לעדכן את ההזמנה.', items: 'פריטים', noResults: 'לא נמצאו הזמנות לפי המסננים שנבחרו', order: 'הזמנה', phone: 'טלפון', search: 'חיפוש לקוח לפי שם', status: { processing: 'בטיפול', preparing: 'בהכנה', ready: 'מוכן לאיסוף', completed: 'הושלם', cancelled: 'בוטל' }, title: 'הזמנות', today: 'היום', total: 'סה״כ', unknown: 'לקוח', yesterday: 'אתמול' },
} as const;

export default function AdminOrders({ locale }: { locale: TAdminLocale }) {
	const copy = COPY[locale];
	const productCopy = getHomeProductCopy(locale);
	const [orders, setOrders] = useState<TOrderRow[]>([]);
	const [profiles, setProfiles] = useState<Map<string, TProfileRow>>(new Map());
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
	const [activeFilter, setActiveFilter] = useState<TOrderFilter>('all');
	const [customerQuery, setCustomerQuery] = useState('');
	const [selectedDate, setSelectedDate] = useState('');
	const [isDateListOpen, setIsDateListOpen] = useState(false);
	const [orderDisclosure, setOrderDisclosure] = useState<Map<string, boolean>>(new Map());
	const groupedOrders = groupOrders(orders);
	const dateSummaries = getRecentOrderDays(groupedOrders, 7);
	const dateFilteredOrders = filterOrdersByDate(groupedOrders, selectedDate);
	const statusCounts = countStatuses(dateFilteredOrders);
	const statusFilteredOrders = activeFilter === 'all' ? dateFilteredOrders : dateFilteredOrders.filter(order => order.status === activeFilter);
	const visibleOrders = filterOrdersByCustomer(statusFilteredOrders, profiles, customerQuery);
	const orderDays = groupOrdersByDay(visibleOrders);

	useEffect(() => {
		let isActive = true;
		const supabase = createClient();
		async function loadOrders() {
			const { data, error: ordersError } = await supabase
				.from('customer_orders')
				.select('id, order_id, user_id, product_key, quantity, unit_price, status, updated_at')
				.neq('status', 'cart')
				.order('updated_at', { ascending: false });
			if (!isActive) return;
			if (ordersError) { setError(copy.error); setIsLoading(false); return; }

			const rows = (data as TOrderRow[] | null) ?? [];
			setOrders(rows);
			const userIds = [...new Set(rows.map(row => row.user_id))];
			if (userIds.length > 0) {
				const { data: profileData } = await supabase.from('profiles').select('id, first_name, last_name, phone').in('id', userIds);
				if (isActive) setProfiles(new Map(((profileData as TProfileRow[] | null) ?? []).map(profile => [profile.id, profile])));
			}
			if (isActive) setIsLoading(false);
		}
		void loadOrders();
		const channel = supabase
			.channel('admin-orders')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'customer_orders' }, () => void loadOrders())
			.subscribe();
		return () => { isActive = false; void supabase.removeChannel(channel); };
	}, [copy.error]);

	async function changeStatus(order: TOrderGroup, status: TOrderStatus) {
		if (pendingOrderId || order.status === status) return;
		const previous = orders;
		setPendingOrderId(order.id);
		setOrders(current => current.map(item => item.order_id === order.id ? { ...item, status } : item));
		const { error: updateError } = await createClient().rpc('admin_set_customer_order_status', { p_order_id: order.id, p_status: status });
		if (updateError) { setOrders(previous); setError(copy.error); }
		setPendingOrderId(null);
	}

	function toggleOrder(orderId: string, defaultOpen: boolean) {
		setOrderDisclosure(current => {
			const next = new Map(current);
			next.set(orderId, !(next.get(orderId) ?? defaultOpen));
			return next;
		});
	}

	if (isLoading) return <div className='flex min-h-80 items-center justify-center text-[var(--accent)]'><LoaderCircle className='animate-spin' size={28} /></div>;

	return <section>
		<div className='mb-5 flex flex-col gap-4 rounded-2xl border border-[#dfd2c5] bg-white/65 p-4 sm:flex-row sm:items-center sm:justify-between'>
			<button className='flex cursor-pointer items-center gap-3 rounded-xl p-1 text-start transition hover:opacity-80' onClick={() => setActiveFilter('all')} type='button'><span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[0_8px_20px_rgba(74,50,36,0.2)]'><ShoppingBag size={21} /></span><span className='text-2xl font-semibold'>{copy.title}</span></button>
			<div className='grid grid-cols-2 gap-2 text-center text-[11px] sm:min-w-[620px] sm:grid-cols-5'><StatusCounter active={activeFilter === 'processing'} className='bg-[#fff2d9] text-[#8a621b]' count={statusCounts.processing} label={copy.status.processing} onClick={() => setActiveFilter('processing')} /><StatusCounter active={activeFilter === 'preparing'} className='bg-[#f6e6d4] text-[#8a5528]' count={statusCounts.preparing} label={copy.status.preparing} onClick={() => setActiveFilter('preparing')} /><StatusCounter active={activeFilter === 'ready'} className='bg-[#e7f0e2] text-[#526c48]' count={statusCounts.ready} label={copy.status.ready} onClick={() => setActiveFilter('ready')} /><StatusCounter active={activeFilter === 'completed'} className='bg-[#ece8e4] text-[#675e58]' count={statusCounts.completed} label={copy.status.completed} onClick={() => setActiveFilter('completed')} /><StatusCounter active={activeFilter === 'cancelled'} className='bg-[#f7e3df] text-[#9a433d]' count={statusCounts.cancelled} label={copy.status.cancelled} onClick={() => setActiveFilter('cancelled')} /></div>
		</div>
		<div className='mb-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_230px]'>
			<div className='relative'>
				<Search aria-hidden='true' className='pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--muted)]' size={18} />
				<input aria-label={copy.search} className='h-12 w-full rounded-2xl border border-[#dfd2c5] bg-white/80 px-12 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10' dir={locale === 'he' ? 'rtl' : 'ltr'} onChange={event => setCustomerQuery(event.target.value)} placeholder={copy.search} type='search' value={customerQuery} />
				{customerQuery ? <button aria-label='Clear search' className='absolute end-3 top-1/2 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[#efe4d8] hover:text-[var(--foreground)]' onClick={() => setCustomerQuery('')} type='button'><X size={16} /></button> : null}
			</div>
			<div className='relative'>
				<CalendarDays aria-hidden='true' className='pointer-events-none absolute start-4 top-1/2 z-10 -translate-y-1/2 text-[var(--muted)]' size={18} />
				<input aria-label={copy.allDates} className='h-12 w-full cursor-pointer rounded-2xl border border-[#dfd2c5] bg-white/80 ps-12 pe-10 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10' max={getOrderDayKey(new Date())} onChange={event => setSelectedDate(event.target.value)} type='date' value={selectedDate} />
				{selectedDate ? <button aria-label={copy.allDates} className='absolute end-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-[var(--muted)] transition hover:bg-[#efe4d8] hover:text-[var(--foreground)]' onClick={() => setSelectedDate('')} type='button'><X size={15} /></button> : null}
			</div>
		</div>
		{dateSummaries.length > 0 ? <div className='relative mb-5 w-full sm:w-72'>
			<button aria-expanded={isDateListOpen} className='flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[#dfd2c5] bg-white/80 px-4 text-sm font-semibold transition hover:bg-[#f3e9df]' onClick={() => setIsDateListOpen(current => !current)} type='button'><span className='truncate'>{copy.dateOrders}</span><ChevronDown className={`shrink-0 transition-transform ${isDateListOpen ? 'rotate-180' : ''}`} size={17} /></button>
			{isDateListOpen ? <div className='absolute start-0 top-[calc(100%+8px)] z-40 max-h-72 w-full overflow-y-auto rounded-2xl border border-[#dfd2c5] bg-[#fffaf5] p-2 shadow-[0_18px_50px_rgba(55,39,28,0.2)]'>
				<button className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-start text-sm transition ${!selectedDate ? 'bg-[var(--accent)] text-white' : 'hover:bg-[#efe4d8]'}`} onClick={() => { setSelectedDate(''); setIsDateListOpen(false); }} type='button'><span className='font-semibold'>{copy.allDates}</span><span>{formatOrderCount(groupedOrders.length, locale)}</span></button>
				{dateSummaries.map(day => <button className={`mt-1 flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-start text-sm transition ${selectedDate === day.key ? 'bg-[var(--accent)] text-white' : 'hover:bg-[#efe4d8]'}`} key={day.key} onClick={() => { setSelectedDate(day.key); setIsDateListOpen(false); }} type='button'><span className='font-semibold'>{formatOrderDateShort(day.key, locale)}</span><span className={selectedDate === day.key ? 'text-white/80' : 'text-[var(--muted)]'}>{formatOrderCount(day.orders.length, locale)}</span></button>)}
			</div> : null}
		</div> : null}
		{error ? <p className='mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p> : null}
		{visibleOrders.length === 0 ? <div className='flex min-h-72 flex-col items-center justify-center rounded-3xl border border-[#e4d8cd] bg-white/75 px-5 text-center'><PackageCheck size={30} className='text-[var(--muted)]' /><p className='mt-4 font-semibold'>{customerQuery.trim() || selectedDate || activeFilter !== 'all' ? copy.noResults : copy.empty}</p></div> : <div className='grid gap-7'>
			{orderDays.map(day => <section className='grid gap-3' key={day.key}>
				<header className='flex items-center gap-3 px-1'><span className='h-px flex-1 bg-[#dfd2c5]' /><div className='flex items-center gap-2 rounded-full border border-[#dfd2c5] bg-[#f8f3ec] px-4 py-2'><span className='text-sm font-semibold capitalize'>{formatOrderDay(day.key, locale, copy.today, copy.yesterday)}</span><span className='rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white'>{formatOrderCount(day.orders.length, locale)}</span></div><span className='h-px flex-1 bg-[#dfd2c5]' /></header>
				<div className='grid gap-4'>{day.orders.map(order => {
				const profile = profiles.get(order.userId);
				const customerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || copy.unknown;
				const total = order.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
				const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
				const isTerminal = order.status === 'completed' || order.status === 'cancelled';
				const isOpen = orderDisclosure.get(order.id) ?? !isTerminal;
				const nextStatus = order.status === 'processing' ? 'preparing' : order.status === 'preparing' ? 'ready' : order.status === 'ready' ? 'completed' : null;
				const previousStatus = order.status === 'preparing' ? 'processing' : order.status === 'ready' ? 'preparing' : null;
				const canCancel = !isTerminal;
				const statusClass = order.status === 'processing' ? 'bg-[#fff2d9] text-[#8a621b]' : order.status === 'preparing' ? 'bg-[#f6e6d4] text-[#8a5528]' : order.status === 'ready' ? 'bg-[#e7f0e2] text-[#526c48]' : order.status === 'cancelled' ? 'bg-[#f7e3df] text-[#9a433d]' : 'bg-[#ece8e4] text-[#675e58]';
				return <details className={'group overflow-hidden rounded-2xl border shadow-[0_10px_30px_rgba(65,45,32,0.05)] transition ' + (isTerminal ? 'border-[#d8d2cc] bg-[#f4f1ee]/80' : 'border-[#dfd2c5] bg-white/80')} key={order.id} open={isOpen}>
					<summary aria-expanded={isOpen} className='flex cursor-pointer list-none flex-wrap items-center justify-between gap-4 bg-[#efe4d8] px-4 py-4 transition hover:bg-[#eadccc] sm:px-5 [&::-webkit-details-marker]:hidden' onClick={event => { event.preventDefault(); toggleOrder(order.id, !isTerminal); }}>
						<div><p className='flex items-center gap-2 font-bold'>{order.status === 'completed' ? <CheckCircle2 className='text-[#6f8068]' size={17} /> : null}{copy.order} #{order.id.slice(0, 8).toUpperCase()}</p><p className='mt-1 text-xs text-[var(--muted)]'>{new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : locale === 'ru' ? 'ru-RU' : 'en-US', { timeStyle: 'short' }).format(new Date(order.updatedAt))}</p></div>
						<div className='ms-auto text-sm sm:text-end'><p className='font-semibold'>{copy.customer}: {customerName}</p>{profile?.phone ? <p className='mt-1 text-xs text-[var(--muted)]'><span>{copy.phone}: </span><bdi dir='ltr'>{formatPhoneNumber(profile.phone)}</bdi></p> : null}</div>
						<div className='flex items-center gap-2'><span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}`}>{copy.status[order.status]}</span><span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/65 text-[var(--muted)]'><ChevronDown className='transition-transform duration-300 group-open:rotate-180' size={17} /></span></div>
					</summary>
					<div className='divide-y divide-[#eadfd5] px-4 sm:px-5'>{order.items.map(item => {
						const product = getHomeProduct(item.product_key); if (!product) return null;
						return <div className='flex items-center gap-3 py-3' key={item.id}><div className='relative h-14 w-16 shrink-0 overflow-hidden rounded-lg'><Image alt={productCopy[item.product_key].name} className='object-cover' fill sizes='64px' src={product.image} /></div><div className='min-w-0 flex-1'><p className='truncate text-sm font-semibold'>{productCopy[item.product_key].name}</p><p className='text-xs text-[var(--muted)]'>× {item.quantity}</p></div><p className='text-sm font-bold' dir='ltr'>{item.unit_price * item.quantity} ₪</p></div>;
					})}</div>
					<footer className='flex flex-col gap-3 border-t border-[#dfd2c5] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
						<div className='text-sm'><span className='text-[var(--muted)]'>{itemCount} {copy.items}</span><strong className='ms-4'>{copy.total}: <span dir='ltr'>{total} ₪</span></strong></div>
						<div className='flex flex-wrap gap-2'>
							{canCancel ? <button className='inline-flex min-h-10 cursor-pointer items-center rounded-full border border-[#e6bdb5] bg-[#fff5f2] px-4 text-xs font-semibold text-[#a64338] transition hover:bg-[#f7e3df] disabled:cursor-wait disabled:opacity-50' disabled={pendingOrderId === order.id} onClick={() => { if (window.confirm(copy.action.cancelConfirm)) void changeStatus(order, 'cancelled'); }} type='button'>{copy.action.cancel}</button> : null}
							{previousStatus ? <button className='inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-[#d8cabd] bg-white px-4 text-xs font-semibold transition hover:bg-[#f4ece4] disabled:cursor-wait disabled:opacity-50' disabled={pendingOrderId === order.id} onClick={() => void changeStatus(order, previousStatus)} type='button'><RotateCcw size={14} />{copy.action.back}</button> : null}
							{nextStatus ? <button className='inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(74,50,36,0.2)] transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-wait disabled:opacity-50' disabled={pendingOrderId === order.id} onClick={() => void changeStatus(order, nextStatus)} type='button'>{copy.action[nextStatus]}<ArrowRight className='rtl:rotate-180' size={15} /></button> : <span className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold ${order.status === 'cancelled' ? 'bg-[#f7e3df] text-[#9a433d]' : 'bg-[#e7f0e2] text-[#526c48]'}`}><CheckCircle2 size={15} />{copy.status[order.status]}</span>}
						</div>
					</footer>
				</details>;
				})}</div>
			</section>)}
		</div>}
	</section>;
}

function groupOrders(rows: TOrderRow[]) {
	const groups = new Map<string, TOrderGroup>();
	for (const row of rows) {
		const group = groups.get(row.order_id);
		if (group) { group.items.push(row); if (row.updated_at > group.updatedAt) group.updatedAt = row.updated_at; }
		else groups.set(row.order_id, { id: row.order_id, items: [row], status: row.status, updatedAt: row.updated_at, userId: row.user_id });
	}
	return [...groups.values()].sort((a, b) => Number(['completed', 'cancelled'].includes(a.status)) - Number(['completed', 'cancelled'].includes(b.status)) || b.updatedAt.localeCompare(a.updatedAt));
}

function filterOrdersByCustomer(orders: TOrderGroup[], profiles: Map<string, TProfileRow>, query: string) {
	const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
	if (terms.length === 0) return orders;

	return orders.filter(order => {
		const profile = profiles.get(order.userId);
		const customerName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.toLocaleLowerCase();
		return terms.every(term => customerName.includes(term));
	});
}

function filterOrdersByDate(orders: TOrderGroup[], selectedDate: string) {
	if (!selectedDate) return orders;
	return orders.filter(order => getOrderDayKey(new Date(order.updatedAt)) === selectedDate);
}

function groupOrdersByDay(orders: TOrderGroup[]): TOrderDayGroup[] {
	const days = new Map<string, TOrderGroup[]>();
	for (const order of orders) {
		const key = getOrderDayKey(new Date(order.updatedAt));
		const dayOrders = days.get(key);
		if (dayOrders) dayOrders.push(order);
		else days.set(key, [order]);
	}

	return [...days.entries()]
		.sort(([firstDay], [secondDay]) => secondDay.localeCompare(firstDay))
		.map(([key, dayOrders]) => ({
			key,
			orders: dayOrders.sort((a, b) => Number(['completed', 'cancelled'].includes(a.status)) - Number(['completed', 'cancelled'].includes(b.status)) || b.updatedAt.localeCompare(a.updatedAt)),
		}));
}

function getRecentOrderDays(orders: TOrderGroup[], numberOfDays: number) {
	const ordersByDay = new Map(groupOrdersByDay(orders).map(day => [day.key, day.orders]));
	const today = new Date(`${getOrderDayKey(new Date())}T12:00:00Z`);

	return Array.from({ length: numberOfDays }, (_, index) => {
		const date = new Date(today);
		date.setUTCDate(today.getUTCDate() - index);
		const key = date.toISOString().slice(0, 10);
		return { key, orders: ordersByDay.get(key) ?? [] };
	});
}

function getOrderDayKey(date: Date) {
	const parts = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Jerusalem', year: 'numeric' }).formatToParts(date);
	const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '';
	return `${value('year')}-${value('month')}-${value('day')}`;
}

function formatOrderDay(key: string, locale: TAdminLocale, todayLabel: string, yesterdayLabel: string) {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const relativeLabel = key === getOrderDayKey(today) ? todayLabel : key === getOrderDayKey(yesterday) ? yesterdayLabel : '';
	const dateLabel = new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : locale === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', timeZone: 'Asia/Jerusalem', year: 'numeric' }).format(new Date(`${key}T12:00:00Z`));
	return relativeLabel ? `${relativeLabel} · ${dateLabel}` : dateLabel;
}

function formatOrderDateShort(key: string, locale: TAdminLocale) {
	return new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : locale === 'ru' ? 'ru-RU' : 'en-US', {
		day: 'numeric',
		month: 'short',
		timeZone: 'Asia/Jerusalem',
		year: 'numeric',
	}).format(new Date(`${key}T12:00:00Z`));
}

function formatOrderCount(count: number, locale: TAdminLocale) {
	if (locale === 'ru') {
		const form = new Intl.PluralRules('ru-RU').select(count);
		return `${count} ${form === 'one' ? 'заказ' : form === 'few' ? 'заказа' : 'заказов'}`;
	}
	if (locale === 'he') return `${count} ${count === 1 ? 'הזמנה' : 'הזמנות'}`;
	return `${count} ${count === 1 ? 'order' : 'orders'}`;
}

function countStatuses(orders: TOrderGroup[]) {
	return orders.reduce((counts, order) => ({ ...counts, [order.status]: counts[order.status] + 1 }), { processing: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 });
}

function StatusCounter({ active, className, count, label, onClick }: { active: boolean; className: string; count: number; label: string; onClick: () => void }) {
	return <button aria-pressed={active} className={`cursor-pointer rounded-xl px-2 py-2.5 transition hover:-translate-y-0.5 hover:shadow-sm ${active ? 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[#f8f3ec]' : ''} ${className}`} onClick={onClick} type='button'><strong className='block text-base leading-none'>{count}</strong><span className='mt-1 block truncate'>{label}</span></button>;
}
