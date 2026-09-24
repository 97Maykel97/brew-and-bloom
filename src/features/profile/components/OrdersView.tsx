'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, ChevronDown, LoaderCircle, ShoppingBag, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getHomeProductCopy } from '@/features/catalog/home-product-copy';
import {
	getHomeProduct,
	type THomeProductKey,
} from '@/features/catalog/home-products';
import { createClient } from '@/lib/supabase/client';
import type { TProfileCopy } from '../profile-copy';
import type { TOrderStatus, TProfileLocale } from '../types';
import EmptyState from './EmptyState';

type TOrdersViewProps = {
	locale: TProfileLocale;
	activeStatus: TOrderStatus;
	copy: TProfileCopy;
	onStatusChange: (status: TOrderStatus) => void;
};

type TOrderRow = {
	id: number;
	order_id: string;
	product_key: THomeProductKey;
	quantity: number;
	status: Exclude<TOrderStatus, 'all'>;
	unit_price: number;
	updated_at: string;
};

type TOrderGroup = {
	id: string;
	items: TOrderRow[];
	status: Exclude<TOrderStatus, 'all'>;
	updatedAt: string;
};

const ORDER_COPY = {
	ru: { order: 'Заказ', products: 'товаров', total: 'Итого' },
	en: { order: 'Order', products: 'items', total: 'Total' },
	he: { order: 'הזמנה', products: 'פריטים', total: 'סה״כ' },
} as const;

export default function OrdersView({
	locale,
	activeStatus,
	copy,
	onStatusChange,
}: TOrdersViewProps) {
	const [orders, setOrders] = useState<TOrderRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const productCopy = getHomeProductCopy(locale);
	const statusItems = [
		{ value: 'all', label: copy.allOrders },
		{ value: 'processing', label: copy.processingOrders },
		{ value: 'preparing', label: copy.preparingOrders },
		{ value: 'ready', label: copy.readyOrders },
		{ value: 'completed', label: copy.completedOrders },
		{ value: 'cancelled', label: copy.cancelledOrders },
	] as const;
	const groupedOrders = groupOrders(orders);
	const visibleOrders =
		activeStatus === 'all'
			? groupedOrders
			: groupedOrders.filter(order => order.status === activeStatus);
	const statusLabels = {
		processing: copy.processingOrders,
		preparing: copy.preparingOrders,
		ready: copy.readyOrders,
		completed: copy.completedOrders,
		cancelled: copy.cancelledOrders,
	};

	useEffect(() => {
		let isActive = true;
		const supabase = createClient();

		async function loadOrders() {
			const { data } = await supabase
				.from('customer_orders')
				.select('id, order_id, product_key, quantity, status, unit_price, updated_at')
				.neq('status', 'cart')
				.order('updated_at', { ascending: false });

			if (!isActive) return;
			setOrders((data as TOrderRow[] | null) ?? []);
			setIsLoading(false);
		}

		void loadOrders();
		const channel = supabase
			.channel('profile-orders')
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'customer_orders' },
				() => void loadOrders(),
			)
			.subscribe();
		return () => {
			isActive = false;
			void supabase.removeChannel(channel);
		};
	}, []);

	return (
		<>
			<div className='mt-5 flex gap-2 overflow-x-auto rounded-xl bg-[#efe4d8] p-1'>
				{statusItems.map(item => (
					<button
						key={item.value}
						type='button'
						onClick={() => onStatusChange(item.value)}
						aria-current={activeStatus === item.value ? 'page' : undefined}
						className={
							'inline-flex min-h-9 shrink-0 cursor-pointer items-center justify-center rounded-lg px-4 text-xs font-medium transition ' +
							(activeStatus === item.value
								? 'bg-[#f8f3ec] text-[var(--foreground)] shadow-sm'
								: 'text-[var(--muted)] hover:text-[var(--foreground)]')
						}
					>
						{item.label}
					</button>
				))}
			</div>

			{isLoading ? (
				<div className='mt-5 h-44 animate-pulse rounded-2xl bg-white/55' />
			) : visibleOrders.length === 0 ? (
				<EmptyState
					icon={<ShoppingBag size={24} strokeWidth={1.6} />}
					title={copy.emptyOrders}
					description={copy.emptyOrdersText}
					actionLabel={copy.explore}
					actionHref={'/' + locale + '/menu'}
				/>
			) : (
				<div className='mt-5 grid gap-3'>
					{visibleOrders.map(order => (
						<OrderCard
							copy={copy}
							key={order.id}
							locale={locale}
							order={order}
							productCopy={productCopy}
							statusLabels={statusLabels}
						/>
					))}
				</div>
			)}

			<div className='relative mt-6 min-h-[190px] overflow-hidden rounded-2xl bg-[#4a3224] text-white'>
				<Image
					src='/cafe-hero-background.png'
					alt=''
					fill
					sizes='(max-width: 640px) 100vw, 920px'
					className='object-cover object-center opacity-45'
				/>
				<div className='absolute inset-0 bg-gradient-to-r from-[#2f211a]/90 via-[#4a3224]/55 to-transparent' />
				<div className='relative max-w-[470px] px-6 py-7 sm:px-8'>
					<p className='text-xl leading-tight [font-family:var(--font-heading)] sm:text-2xl'>
						{copy.promoTitle}
					</p>
					<p className='mt-2 text-sm leading-5 text-white/72'>
						{copy.promoText}
					</p>
					<Link
						href={'/' + locale + '/menu'}
						className='mt-5 inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-[var(--accent)] transition hover:bg-[#f5eee6]'
					>
						<span>{copy.promoButton}</span>
						<ArrowRight className='rtl:rotate-180' size={14} />
					</Link>
				</div>
			</div>
		</>
	);
}

function groupOrders(rows: TOrderRow[]) {
	const groups = new Map<string, TOrderGroup>();
	for (const row of rows) {
		const group = groups.get(row.order_id);
		if (group) {
			group.items.push(row);
			if (row.updated_at > group.updatedAt) group.updatedAt = row.updated_at;
		} else {
			groups.set(row.order_id, {
				id: row.order_id,
				items: [row],
				status: row.status,
				updatedAt: row.updated_at,
			});
		}
	}
	return [...groups.values()].sort((a, b) => Number(['completed', 'cancelled'].includes(a.status)) - Number(['completed', 'cancelled'].includes(b.status)) || b.updatedAt.localeCompare(a.updatedAt));
}

function OrderCard({
	copy,
	locale,
	order,
	productCopy,
	statusLabels,
}: {
	copy: TProfileCopy;
	locale: TProfileLocale;
	order: TOrderGroup;
	productCopy: ReturnType<typeof getHomeProductCopy>;
	statusLabels: Record<Exclude<TOrderStatus, 'all'>, string>;
}) {
	const [isOpen, setIsOpen] = useState(order.status !== 'completed' && order.status !== 'cancelled');
	const [isCancelling, setIsCancelling] = useState(false);
	const [cancelError, setCancelError] = useState('');
	const labels = ORDER_COPY[locale];
	const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
	const total = order.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
	const dateLocale = locale === 'he' ? 'he-IL' : locale === 'ru' ? 'ru-RU' : 'en-US';
	const statuses = ['processing', 'preparing', 'ready', 'completed'] as const;
	const activeStep = statuses.indexOf(order.status as (typeof statuses)[number]);
	const isCompleted = order.status === 'completed';
	const isCancelled = order.status === 'cancelled';
	const statusTone = order.status === 'processing'
		? 'bg-[#fff2d9] text-[#8a621b]'
		: order.status === 'preparing'
			? 'bg-[#f6e6d4] text-[#8a5528]'
		: order.status === 'ready'
			? 'bg-[#e7f0e2] text-[#526c48]'
			: isCancelled
				? 'bg-[#f7e3df] text-[#9a433d]'
			: 'bg-[#ece8e4] text-[#675e58]';

	async function cancelOrder() {
		if (isCancelling || order.status !== 'processing' || !window.confirm(copy.cancelOrderConfirm)) return;
		setIsCancelling(true);
		setCancelError('');
		const { error } = await createClient().rpc('cancel_customer_order', { p_order_id: order.id });
		if (error) setCancelError(copy.cancelOrderError);
		setIsCancelling(false);
	}

	return (
		<article className={'overflow-hidden rounded-2xl border shadow-[0_12px_32px_rgba(63,43,31,0.06)] transition ' + (isCompleted || isCancelled ? 'border-[#ddd6d0] bg-[#f5f2ef]/80' : 'border-[#dfcfbf] bg-white/80')}>
			<button
				aria-expanded={isOpen}
				className='flex w-full cursor-pointer flex-wrap items-center justify-between gap-3 bg-[#efe4d8] px-4 py-3 text-start transition hover:bg-[#eadccc]'
				onClick={() => setIsOpen(current => !current)}
				type='button'
			>
				<div>
					<p className='text-sm font-bold'>{labels.order} #{order.id.slice(0, 8).toUpperCase()}</p>
					<p className='mt-0.5 text-[11px] text-[var(--muted)]'>{new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.updatedAt))}</p>
				</div>
				<span className='flex items-center gap-2'>
					<span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusTone}`}>{statusLabels[order.status]}</span>
					<span className='flex h-8 w-8 items-center justify-center rounded-full bg-white/65 text-[var(--muted)]'>
						<ChevronDown className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={17} />
					</span>
				</span>
			</button>

			<div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
				<div className='min-h-0 overflow-hidden'>
			{!isCancelled ? <div className='border-b border-[#eadfd5] bg-white/45 px-4 py-4'>
				<div className='grid grid-cols-4'>
					{statuses.map((status, index) => {
						const isReached = index <= activeStep;
						return <div className='relative flex flex-col items-center text-center' key={status}>
							{index > 0 ? <span className={'absolute end-1/2 top-3 h-0.5 w-full ' + (index <= activeStep ? 'bg-[#7b8f70]' : 'bg-[#ddd3ca]')} /> : null}
							<span className={'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ' + (isReached ? 'border-[#6d825f] bg-[#6d825f] text-white' : 'border-[#d8ccc1] bg-[#f8f3ec] text-[var(--muted)]')}>{index < activeStep || isCompleted ? <Check size={12} strokeWidth={2.5} /> : index + 1}</span>
							<span className={'mt-2 text-[10px] sm:text-[11px] ' + (isReached ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--muted)]')}>{statusLabels[status]}</span>
						</div>;
					})}
				</div>
			</div> : null}

			<div className='divide-y divide-[#eadfd5] px-4'>
				{order.items.map(item => {
					const product = getHomeProduct(item.product_key);
					if (!product) return null;
					return <div className='flex items-center gap-3 py-3' key={item.id}>
						<div className='relative h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-[#efe4d7]'><Image alt={productCopy[item.product_key].name} className='object-cover' fill sizes='64px' src={product.image} /></div>
						<div className='min-w-0 flex-1'><p className='truncate text-sm font-semibold'>{productCopy[item.product_key].name}</p><p className='mt-1 text-xs text-[var(--muted)]'>× {item.quantity}</p></div>
						<p className='text-sm font-bold' dir='ltr'>{item.unit_price * item.quantity} ₪</p>
					</div>;
				})}
			</div>

			<footer className='flex flex-wrap items-center justify-between gap-3 border-t border-[#e1d4c8] px-4 py-3 text-sm'>
				<div><span className='text-[var(--muted)]'>{itemCount} {labels.products}</span><strong className='ms-4'>{labels.total}: <span dir='ltr'>{total} ₪</span></strong></div>
				{order.status === 'processing' ? <button className='inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-[#e6bdb5] bg-[#fff5f2] px-4 text-xs font-semibold text-[#a64338] transition hover:bg-[#f7e3df] disabled:cursor-wait disabled:opacity-60' disabled={isCancelling} onClick={() => void cancelOrder()} type='button'>{isCancelling ? <LoaderCircle className='animate-spin' size={14} /> : <XCircle size={14} />}{isCancelling ? copy.cancellingOrder : copy.cancelOrder}</button> : null}
				{cancelError ? <p className='w-full text-xs text-red-600'>{cancelError}</p> : null}
			</footer>
				</div>
			</div>
		</article>
	);
}
