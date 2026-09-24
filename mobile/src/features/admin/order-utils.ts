import type { THomeBestsellerProductKey, TLocale } from '@/i18n/translations';

export type TOrderStatus = 'processing' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type TOrderFilter = 'all' | TOrderStatus;
export type TOrderRow = { id: number; order_id: string; product_key: THomeBestsellerProductKey; quantity: number; status: TOrderStatus; unit_price: number; updated_at: string; user_id: string };
export type TProfileRow = { id: string; first_name: string | null; last_name: string | null; phone: string | null };
export type TOrderGroup = { id: string; items: TOrderRow[]; status: TOrderStatus; updatedAt: string; userId: string };
export type TOrderDayGroup = { key: string; orders: TOrderGroup[] };

const TERMINAL_STATUSES: TOrderStatus[] = ['completed', 'cancelled'];

export function groupOrders(rows: TOrderRow[]) {
	const groups = new Map<string, TOrderGroup>();
	for (const row of rows) {
		const group = groups.get(row.order_id);
		if (group) {
			group.items.push(row);
			if (row.updated_at > group.updatedAt) group.updatedAt = row.updated_at;
		} else {
			groups.set(row.order_id, { id: row.order_id, items: [row], status: row.status, updatedAt: row.updated_at, userId: row.user_id });
		}
	}
	return [...groups.values()].sort(compareOrders);
}

export function filterOrdersByCustomer(orders: TOrderGroup[], profiles: Map<string, TProfileRow>, query: string) {
	const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
	if (terms.length === 0) return orders;
	return orders.filter(order => {
		const profile = profiles.get(order.userId);
		const customerName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.toLocaleLowerCase();
		return terms.every(term => customerName.includes(term));
	});
}

export function filterOrdersByDate(orders: TOrderGroup[], selectedDate: string) {
	return selectedDate ? orders.filter(order => getOrderDayKey(new Date(order.updatedAt)) === selectedDate) : orders;
}

export function getPickerDateKey(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function groupOrdersByDay(orders: TOrderGroup[]): TOrderDayGroup[] {
	const days = new Map<string, TOrderGroup[]>();
	for (const order of orders) {
		const key = getOrderDayKey(new Date(order.updatedAt));
		const dayOrders = days.get(key);
		if (dayOrders) dayOrders.push(order);
		else days.set(key, [order]);
	}
	return [...days.entries()].sort(([first], [second]) => second.localeCompare(first)).map(([key, dayOrders]) => ({ key, orders: dayOrders.sort(compareOrders) }));
}

export function getRecentOrderDays(orders: TOrderGroup[], numberOfDays: number) {
	const ordersByDay = new Map(groupOrdersByDay(orders).map(day => [day.key, day.orders]));
	const today = new Date(`${getOrderDayKey(new Date())}T12:00:00Z`);
	return Array.from({ length: numberOfDays }, (_, index) => {
		const date = new Date(today);
		date.setUTCDate(today.getUTCDate() - index);
		const key = date.toISOString().slice(0, 10);
		return { key, orders: ordersByDay.get(key) ?? [] };
	});
}

export function getOrderDayKey(date: Date) {
	const parts = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Jerusalem', year: 'numeric' }).formatToParts(date);
	const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '';
	return `${value('year')}-${value('month')}-${value('day')}`;
}

export function formatOrderDay(key: string, locale: TLocale, todayLabel: string, yesterdayLabel: string) {
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);
	const relativeLabel = key === getOrderDayKey(today) ? todayLabel : key === getOrderDayKey(yesterday) ? yesterdayLabel : '';
	const dateLabel = new Intl.DateTimeFormat(getDateLocale(locale), { day: 'numeric', month: 'long', timeZone: 'Asia/Jerusalem', year: 'numeric' }).format(new Date(`${key}T12:00:00Z`));
	return relativeLabel ? `${relativeLabel} · ${dateLabel}` : dateLabel;
}

export function formatOrderDateShort(key: string, locale: TLocale) {
	return new Intl.DateTimeFormat(getDateLocale(locale), { day: 'numeric', month: 'short', timeZone: 'Asia/Jerusalem', year: 'numeric' }).format(new Date(`${key}T12:00:00Z`));
}

export function formatOrderCount(count: number, locale: TLocale) {
	if (locale === 'ru') return `${count} ${getRussianOrderWord(count)}`;
	if (locale === 'he') return `${count} ${count === 1 ? 'הזמנה' : 'הזמנות'}`;
	return `${count} ${count === 1 ? 'order' : 'orders'}`;
}

export function countStatuses(orders: TOrderGroup[]) {
	return orders.reduce((counts, order) => ({ ...counts, [order.status]: counts[order.status] + 1 }), { processing: 0, preparing: 0, ready: 0, completed: 0, cancelled: 0 });
}

function compareOrders(first: TOrderGroup, second: TOrderGroup) {
	return Number(TERMINAL_STATUSES.includes(first.status)) - Number(TERMINAL_STATUSES.includes(second.status)) || second.updatedAt.localeCompare(first.updatedAt);
}

function getDateLocale(locale: TLocale) {
	return locale === 'he' ? 'he-IL' : locale === 'ru' ? 'ru-RU' : 'en-US';
}

function getRussianOrderWord(count: number) {
	const remainder100 = Math.abs(count) % 100;
	const remainder10 = remainder100 % 10;
	if (remainder10 === 1 && remainder100 !== 11) return 'заказ';
	if (remainder10 >= 2 && remainder10 <= 4 && (remainder100 < 12 || remainder100 > 14)) return 'заказа';
	return 'заказов';
}
