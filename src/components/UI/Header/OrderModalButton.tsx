'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, LoaderCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { getHomeProductCopy } from '@/features/catalog/home-product-copy';
import { getHomeProduct, type THomeProductKey } from '@/features/catalog/home-products';
import { notifyOrderChanged, ORDER_CHANGED_EVENT } from '@/features/catalog/order-modal-events';
import { useMenuProductInventory } from '@/features/catalog/use-menu-product-inventory';
import type { TProfileLocale } from '@/features/profile/types';
import { createClient } from '@/lib/supabase/client';

type TOrderModalButtonProps = { isSignedIn: boolean; locale: string };
type TOrderRow = {
	id: number;
	product_key: THomeProductKey;
	quantity: number;
	unit_price: number;
	updated_at: string;
};

async function fetchCartOrders() {
	const { data } = await createClient()
		.from('customer_orders')
		.select('id, product_key, quantity, unit_price, updated_at')
		.eq('status', 'cart')
		.order('updated_at', { ascending: false });

	return (data as TOrderRow[] | null) ?? [];
}

const MODAL_COPY = {
	ru: {
		checkout: 'Оформить заказ', checkoutError: 'Не удалось оформить заказ. Попробуйте ещё раз.',
		decrease: 'Уменьшить количество', increase: 'Увеличить количество', remove: 'Удалить товар',
		close: 'Закрыть', empty: 'Корзина пуста', emptyText: 'Нажмите «+» у товара, чтобы добавить его в корзину.',
		login: 'Войти', loginText: 'Войдите в аккаунт, чтобы добавлять товары в корзину.', title: 'Текущий заказ', total: 'Итого',
		successTitle: 'Ваш заказ принят', successText: 'Мы уже передали его в обработку. Следить за статусом заказа можно в личном кабинете.', trackOrder: 'Отследить заказ', continueShopping: 'Продолжить покупки',
	},
	en: {
		checkout: 'Place order', checkoutError: 'Could not place the order. Please try again.',
		decrease: 'Decrease quantity', increase: 'Increase quantity', remove: 'Remove product',
		close: 'Close', empty: 'Your cart is empty', emptyText: 'Tap “+” on a product to add it to your cart.',
		login: 'Sign in', loginText: 'Sign in to add products to your cart.', title: 'Current order', total: 'Total',
		successTitle: 'Your order has been accepted', successText: 'It is now being processed. You can track its status in your account.', trackOrder: 'Track order', continueShopping: 'Continue shopping',
	},
	he: {
		checkout: 'ביצוע הזמנה', checkoutError: 'לא ניתן לבצע את ההזמנה. נסו שוב.',
		decrease: 'הפחתת כמות', increase: 'הגדלת כמות', remove: 'הסרת מוצר',
		close: 'סגירה', empty: 'הסל ריק', emptyText: 'לחצו על "+" ליד מוצר כדי להוסיף אותו לסל.',
		login: 'התחברות', loginText: 'התחברו לחשבון כדי להוסיף מוצרים לסל.', title: 'הזמנה נוכחית', total: 'סה״כ',
		successTitle: 'ההזמנה התקבלה', successText: 'ההזמנה הועברה לטיפול. ניתן לעקוב אחר הסטטוס באזור האישי.', trackOrder: 'מעקב אחר ההזמנה', continueShopping: 'המשך קנייה',
	},
} as const;

export default function OrderModalButton({ isSignedIn, locale }: TOrderModalButtonProps) {
	const router = useRouter();
	const currentLocale = isProfileLocale(locale) ? locale : 'en';
	const copy = MODAL_COPY[currentLocale];
	const productCopy = getHomeProductCopy(currentLocale);
	const { inventory } = useMenuProductInventory();
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
	const [checkoutError, setCheckoutError] = useState('');
	const [pendingProductKeys, setPendingProductKeys] = useState<Set<THomeProductKey>>(new Set());
	const quantityTimers = useRef<Map<THomeProductKey, ReturnType<typeof setTimeout>>>(new Map());
	const quantityRequests = useRef<Map<THomeProductKey, Promise<void>>>(new Map());
	const [orders, setOrders] = useState<TOrderRow[]>([]);
	const itemCount = orders.reduce((sum, order) => sum + order.quantity, 0);
	const total = orders.reduce((sum, order) => sum + order.unit_price * order.quantity, 0);

	useEffect(() => {
		if (!isSignedIn) return;
		let isActive = true;

		async function refreshCart() {
			const data = await fetchCartOrders();
			if (!isActive) return;
			setOrders(data);
			setIsLoading(false);
		}

		function handleOrderChange() { void refreshCart(); }
		void refreshCart();
		window.addEventListener(ORDER_CHANGED_EVENT, handleOrderChange);
		return () => {
			isActive = false;
			window.removeEventListener(ORDER_CHANGED_EVENT, handleOrderChange);
		};
	}, [isSignedIn]);

	useEffect(() => {
		const timers = quantityTimers.current;
		return () => timers.forEach(timer => clearTimeout(timer));
	}, []);

	useEffect(() => {
		if (!isOpen) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		function handleKeyDown(event: KeyboardEvent) { if (event.key === 'Escape') setIsOpen(false); }
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen]);

	async function checkout() {
		if (isCheckingOut || orders.length === 0) return;
		setIsCheckingOut(true);
		setCheckoutError('');
		const { error } = await createClient().rpc('checkout_current_order');
		if (error) {
			setCheckoutError(copy.checkoutError);
			setIsCheckingOut(false);
			return;
		}

		setOrders([]);
		setIsCheckingOut(false);
		setIsCheckoutComplete(true);
		notifyOrderChanged();
	}

	function openCart() {
		setCheckoutError('');
		setIsCheckoutComplete(false);
		setIsOpen(true);
	}

	function openOrders() {
		setIsOpen(false);
		router.push(`/${currentLocale}/profile?tab=orders&status=processing#orders`);
	}

	async function setQuantity(order: TOrderRow, nextQuantity: number) {
		const productInventory = inventory.get(order.product_key);
		if (nextQuantity > order.quantity && (
			!productInventory?.isActive || nextQuantity > productInventory.stockQuantity
		)) return;

		setPendingProductKeys(current => new Set(current).add(order.product_key));
		setOrders(current => nextQuantity <= 0
			? current.filter(item => item.id !== order.id)
			: current.map(item => item.id === order.id ? { ...item, quantity: nextQuantity } : item));

		const previousTimer = quantityTimers.current.get(order.product_key);
		if (previousTimer) clearTimeout(previousTimer);

		const timer = setTimeout(async () => {
			let hasError = false;
			const previousRequest = quantityRequests.current.get(order.product_key);
			const request = (previousRequest ?? Promise.resolve()).catch(() => undefined).then(async () => {
				const { error } = await createClient().rpc('set_cart_product_quantity', {
					p_product_key: order.product_key,
					p_quantity: nextQuantity,
				});
				hasError = Boolean(error);
			}).catch(() => { hasError = true; });
			quantityRequests.current.set(order.product_key, request);
			await request;
			if (quantityTimers.current.get(order.product_key) !== timer) return;
			if (hasError) setOrders(await fetchCartOrders());
			else notifyOrderChanged();
			quantityTimers.current.delete(order.product_key);
			quantityRequests.current.delete(order.product_key);
			setPendingProductKeys(current => {
				const next = new Set(current);
				next.delete(order.product_key);
				return next;
			});
		}, 220);
		quantityTimers.current.set(order.product_key, timer);
	}

	return (
		<>
			<button aria-label={copy.title} className='relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-[var(--foreground)] transition-transform duration-200 hover:scale-110 active:scale-95' onClick={openCart} type='button'>
				<ShoppingBag size={18} strokeWidth={1.8} />
				{itemCount > 0 ? <span className='absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[#a65345] px-1 text-[10px] font-bold leading-none text-white'>{itemCount > 99 ? '99+' : itemCount}</span> : null}
			</button>

			{isOpen && typeof document !== 'undefined' ? createPortal(
				<div aria-label={copy.title} aria-modal='true' className='fixed inset-0 z-[200] flex items-end justify-center bg-[#21160f]/45 backdrop-blur-sm sm:items-center sm:p-5' dir={currentLocale === 'he' ? 'rtl' : 'ltr'} onMouseDown={event => { if (event.target === event.currentTarget) setIsOpen(false); }} role='dialog'>
					<div className='flex max-h-[86svh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] border border-white/45 bg-[#f8f3ec] shadow-[0_28px_90px_rgba(35,23,16,0.32)] sm:rounded-[28px]'>
						<div className='flex items-center justify-between border-b border-[#e4d8cc] px-5 py-4 sm:px-6'>
							<div className='flex items-center gap-3'><span className='flex h-10 w-10 items-center justify-center rounded-full bg-[#efe1d5] text-[var(--accent)]'><ShoppingBag size={18} /></span><h2 className='text-xl font-semibold'>{copy.title}</h2></div>
							<button aria-label={copy.close} className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] hover:bg-black/5' onClick={() => setIsOpen(false)} type='button'><X size={20} /></button>
						</div>

						<div className='min-h-0 flex-1 overflow-y-auto p-5 sm:p-6'>
							{isCheckoutComplete ? (
								<OrderSuccess
									continueLabel={copy.continueShopping}
									description={copy.successText}
									onContinue={() => setIsOpen(false)}
									onTrack={openOrders}
									title={copy.successTitle}
									trackLabel={copy.trackOrder}
								/>
							) : !isSignedIn ? (
								<OrderEmpty title={copy.title} description={copy.loginText}><Link className='mt-5 inline-flex min-h-10 items-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white' href={`/${currentLocale}/auth/login`} onClick={() => setIsOpen(false)}>{copy.login}</Link></OrderEmpty>
							) : isLoading ? (
								<div className='flex min-h-52 items-center justify-center text-[var(--accent)]'><LoaderCircle className='animate-spin' size={28} /></div>
							) : orders.length === 0 ? (
								<OrderEmpty title={copy.empty} description={copy.emptyText} />
							) : (
								<div className='grid gap-3'>{orders.map(order => {
									const product = getHomeProduct(order.product_key);
									if (!product) return null;
									const itemCopy = productCopy[order.product_key];
									const productInventory = inventory.get(order.product_key);
									const isAtStockLimit = !productInventory?.isActive || order.quantity >= productInventory.stockQuantity;
									return <article className='flex items-center gap-3 rounded-2xl border border-[#e5dcd3] bg-white/70 p-3' key={order.id}>
										<div className='relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#efe4d7]'><Image alt={itemCopy.name} className='object-cover' fill sizes='96px' src={product.image} /></div>
										<div className='min-w-0 flex-1'>
											<div className='flex items-start justify-between gap-2'><h3 className='truncate text-sm font-semibold'>{itemCopy.name}</h3><p className='shrink-0 text-sm font-bold' dir='ltr'>{order.unit_price * order.quantity} ₪</p></div>
											<div className='mt-3 flex items-center justify-between gap-3'>
												<div className='flex items-center rounded-full border border-[#ddcfc2] bg-[#f8f3ec] p-0.5'>
													<button aria-label={copy.decrease} className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-white active:scale-90' onClick={() => void setQuantity(order, order.quantity - 1)} type='button'><Minus size={14} /></button>
											<CartQuantityInput
												label={`${itemCopy.name}: quantity`}
												maxQuantity={productInventory?.stockQuantity}
												onQuantityChange={nextQuantity => void setQuantity(order, nextQuantity)}
												quantity={order.quantity}
											/>
											<button aria-label={copy.increase} className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-full hover:bg-white active:scale-90 disabled:cursor-not-allowed disabled:opacity-30' disabled={isAtStockLimit} onClick={() => void setQuantity(order, order.quantity + 1)} type='button'><Plus size={14} /></button>
												</div>
												<button aria-label={`${copy.remove}: ${itemCopy.name}`} className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#f3e4dc] text-[#a65345] transition hover:bg-[#ecd6cb] active:scale-90' onClick={() => void setQuantity(order, 0)} type='button'><Trash2 size={15} /></button>
											</div>
										</div>
									</article>;
								})}</div>
							)}
						</div>

						{isSignedIn && orders.length > 0 ? <div className='border-t border-[#e4d8cc] p-4 sm:px-6'>
							<div className='mb-4 flex items-center justify-between text-base font-semibold'><span>{copy.total}</span><span dir='ltr'>{total} ₪</span></div>
							{checkoutError ? <p className='mb-3 text-center text-sm text-red-600'>{checkoutError}</p> : null}
							<button className='flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60' disabled={isCheckingOut || pendingProductKeys.size > 0} onClick={() => void checkout()} type='button'>{isCheckingOut ? <LoaderCircle className='animate-spin' size={18} /> : copy.checkout}</button>
						</div> : null}
					</div>
				</div>, document.body) : null}
		</>
	);
}

function OrderEmpty({ children, description, title }: { children?: ReactNode; description: string; title: string }) {
	return <div className='flex min-h-52 flex-col items-center justify-center px-4 text-center'>
		<span className='flex h-14 w-14 items-center justify-center rounded-full bg-[#efe1d5] text-[var(--accent)]'><ShoppingBag size={23} /></span>
		<h3 className='mt-4 text-base font-semibold'>{title}</h3><p className='mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]'>{description}</p>{children}
	</div>;
}

function OrderSuccess({ continueLabel, description, onContinue, onTrack, title, trackLabel }: { continueLabel: string; description: string; onContinue: () => void; onTrack: () => void; title: string; trackLabel: string }) {
	return <div className='flex min-h-72 flex-col items-center justify-center px-2 py-5 text-center'>
		<span className='relative flex h-20 w-20 items-center justify-center rounded-full bg-[#e4eee0] text-[#5f7755] shadow-[0_14px_34px_rgba(82,108,72,0.2)]'><span className='absolute inset-2 rounded-full border border-white/80' /><CheckCircle2 className='relative' size={38} strokeWidth={1.7} /></span>
		<h3 className='mt-6 text-2xl font-semibold text-[var(--foreground)]'>{title}</h3>
		<p className='mt-3 max-w-md text-sm leading-6 text-[var(--muted)]'>{description}</p>
		<div className='mt-7 grid w-full max-w-sm gap-2.5'>
			<button className='flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,50,36,0.2)] transition hover:-translate-y-0.5 hover:shadow-lg' onClick={onTrack} type='button'>{trackLabel}<ArrowRight className='rtl:rotate-180' size={17} /></button>
			<button className='min-h-11 cursor-pointer rounded-full px-5 text-sm font-medium text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--foreground)]' onClick={onContinue} type='button'>{continueLabel}</button>
		</div>
	</div>;
}

function CartQuantityInput({
	label,
	maxQuantity,
	onQuantityChange,
	quantity,
}: {
	label: string;
	maxQuantity?: number;
	onQuantityChange: (quantity: number) => void;
	quantity: number;
}) {
	const [draftValue, setDraftValue] = useState<string | null>(null);
	const value = draftValue ?? String(quantity);

	function changeValue(rawValue: string) {
		const digits = rawValue.replace(/\D/g, '');
		setDraftValue(digits);
		if (!digits) return;

		const requestedQuantity = Number.parseInt(digits, 10);
		const nextQuantity = Math.min(
			Math.max(requestedQuantity, 0),
			maxQuantity ?? requestedQuantity,
		);
		setDraftValue(String(nextQuantity));
		if (nextQuantity !== quantity) onQuantityChange(nextQuantity);
	}

	return (
		<input
			aria-label={label}
			className='w-9 appearance-none bg-transparent p-0 text-center text-sm font-semibold outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
			inputMode='numeric'
			onBlur={() => setDraftValue(null)}
			onChange={event => changeValue(event.currentTarget.value)}
			onFocus={event => event.currentTarget.select()}
			onKeyDown={event => {
				if (event.key === 'Enter') event.currentTarget.blur();
			}}
			pattern='[0-9]*'
			value={value}
		/>
	);
}

function isProfileLocale(locale: string): locale is TProfileLocale {
	return locale === 'ru' || locale === 'en' || locale === 'he';
}
