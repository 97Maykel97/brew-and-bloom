'use client';

import { Check, Coffee, LoaderCircle, Minus, PackagePlus, Plus, Power, Search, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import type { TAdminLocale } from '../types';

type TMenuProduct = {
	id: string;
	product_key: string;
	name: string;
	price: number;
	stock_quantity: number;
	is_active: boolean;
};

const COPY = {
	ru: { active: 'В продаже', add: 'Добавить товар', addTitle: 'Новая позиция', cancel: 'Отмена', empty: 'В меню пока нет товаров', error: 'Не удалось обновить меню.', name: 'Название товара', out: 'Нет в наличии', price: 'Цена, ₪', save: 'Сохранить цену', search: 'Поиск товара', stock: 'В наличии', subtitle: 'Добавляйте позиции и контролируйте остатки в реальном времени', title: 'Управление меню' },
	en: { active: 'On sale', add: 'Add product', addTitle: 'New item', cancel: 'Cancel', empty: 'There are no menu items yet', error: 'Could not update the menu.', name: 'Product name', out: 'Out of stock', price: 'Price, ₪', save: 'Save price', search: 'Search products', stock: 'In stock', subtitle: 'Add products and control inventory in real time', title: 'Menu management' },
	he: { active: 'במכירה', add: 'הוספת מוצר', addTitle: 'פריט חדש', cancel: 'ביטול', empty: 'אין עדיין פריטים בתפריט', error: 'לא ניתן לעדכן את התפריט.', name: 'שם המוצר', out: 'אזל מהמלאי', price: 'מחיר, ₪', save: 'שמירת מחיר', search: 'חיפוש מוצר', stock: 'במלאי', subtitle: 'הוספת מוצרים וניהול מלאי בזמן אמת', title: 'ניהול תפריט' },
} as const;

export default function AdminMenu({ locale }: { locale: TAdminLocale }) {
	const copy = COPY[locale];
	const [products, setProducts] = useState<TMenuProduct[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [name, setName] = useState('');
	const [price, setPrice] = useState('');
	const [stock, setStock] = useState('0');
	const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
	const [error, setError] = useState('');
	const visibleProducts = products.filter(product => product.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));

	useEffect(() => {
		let isActive = true;
		const supabase = createClient();
		async function loadProducts() {
			const { data, error: loadError } = await supabase.from('menu_products').select('id, product_key, name, price, stock_quantity, is_active').order('created_at');
			if (!isActive) return;
			if (loadError) setError(copy.error);
			else setProducts((data as TMenuProduct[] | null) ?? []);
			setIsLoading(false);
		}
		void loadProducts();
		const channel = supabase.channel('admin-menu-products').on('postgres_changes', { event: '*', schema: 'public', table: 'menu_products' }, payload => {
			const changedProduct = payload.new as TMenuProduct;
			if (!changedProduct?.id) return;
			setProducts(current => mergeMenuProduct(current, changedProduct));
		}).subscribe();
		return () => { isActive = false; void supabase.removeChannel(channel); };
	}, [copy.error]);

	async function addProduct(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const normalizedName = name.trim();
		const normalizedPrice = Number(price);
		const normalizedStock = Number(stock);
		if (!normalizedName || !Number.isInteger(normalizedPrice) || normalizedPrice < 0 || !Number.isInteger(normalizedStock) || normalizedStock < 0) return;

		setIsSaving(true);
		setError('');
		const productKey = `custom-${crypto.randomUUID()}`;
		const { data, error: insertError } = await createClient().from('menu_products').insert({ product_key: productKey, name: normalizedName, price: normalizedPrice, stock_quantity: normalizedStock }).select('id, product_key, name, price, stock_quantity, is_active').single();
		if (insertError) setError(copy.error);
		else {
			setProducts(current => mergeMenuProduct(current, data as TMenuProduct));
			setName(''); setPrice(''); setStock('0'); setIsFormOpen(false);
		}
		setIsSaving(false);
	}

	async function updateProduct(product: TMenuProduct, values: Partial<Pick<TMenuProduct, 'is_active' | 'price' | 'stock_quantity'>>) {
		if (pendingId) return false;
		setPendingId(product.id);
		setError('');
		const { data, error: updateError } = await createClient().from('menu_products').update(values).eq('id', product.id).select('id, product_key, name, price, stock_quantity, is_active').single();
		if (updateError) {
			setError(copy.error);
		} else setProducts(current => mergeMenuProduct(current, data as TMenuProduct));
		setPendingId(null);
		return !updateError;
	}

	async function savePrice(product: TMenuProduct) {
		const nextPrice = Number(priceDrafts[product.id] ?? product.price);
		if (!Number.isInteger(nextPrice) || nextPrice < 0 || nextPrice === product.price) return;
		if (await updateProduct(product, { price: nextPrice })) {
			setPriceDrafts(current => {
				const next = { ...current };
				delete next[product.id];
				return next;
			});
		}
	}

	if (isLoading) {
		return <div className='flex min-h-80 items-center justify-center text-[var(--accent)]'><LoaderCircle className='animate-spin' size={28} /></div>;
	}

	return (
		<section>
			<div className='mb-5 rounded-3xl border border-[#dfd2c5] bg-white/70 p-5 shadow-[0_12px_35px_rgba(65,45,32,0.05)] sm:p-6'>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div className='flex items-center gap-3'>
						<span className='flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-white'><Coffee size={20} /></span>
						<div><h2 className='text-xl font-semibold'>{copy.title}</h2><p className='mt-1 text-sm text-[var(--muted)]'>{copy.subtitle}</p></div>
					</div>
					<button className='inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg' onClick={() => setIsFormOpen(current => !current)} type='button'>
						{isFormOpen ? <X size={17} /> : <PackagePlus size={17} />}{isFormOpen ? copy.cancel : copy.add}
					</button>
				</div>
				{isFormOpen ? <ProductForm copy={copy} isSaving={isSaving} name={name} onNameChange={setName} onPriceChange={setPrice} onStockChange={setStock} onSubmit={addProduct} price={price} stock={stock} /> : null}
			</div>

			<div className='relative mb-5'><Search className='pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-[var(--muted)]' size={18} /><input className='h-12 w-full rounded-2xl border border-[#dfd2c5] bg-white/80 px-12 text-sm outline-none focus:border-[var(--accent)]' onChange={event => setQuery(event.target.value)} placeholder={copy.search} type='search' value={query} /></div>
			{error ? <p className='mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p> : null}
			{visibleProducts.length === 0 ? (
				<div className='flex min-h-64 flex-col items-center justify-center rounded-3xl border border-[#e4d8cd] bg-white/75 text-center'><Coffee className='text-[var(--muted)]' size={28} /><p className='mt-3 font-semibold'>{copy.empty}</p></div>
			) : (
				<div className='grid gap-3 sm:grid-cols-2'>{visibleProducts.map(product => <ProductCard copy={copy} isPending={pendingId === product.id} key={product.id} onPriceChange={value => setPriceDrafts(current => ({ ...current, [product.id]: value }))} onSavePrice={() => void savePrice(product)} onUpdate={values => void updateProduct(product, values)} priceValue={priceDrafts[product.id] ?? String(product.price)} product={product} />)}</div>
			)}
		</section>
	);
}

type TMenuCopy = (typeof COPY)[TAdminLocale];
type TMenuProductUpdate = Partial<Pick<TMenuProduct, 'is_active' | 'price' | 'stock_quantity'>>;

function ProductForm({ copy, isSaving, name, onNameChange, onPriceChange, onStockChange, onSubmit, price, stock }: { copy: TMenuCopy; isSaving: boolean; name: string; onNameChange: (value: string) => void; onPriceChange: (value: string) => void; onStockChange: (value: string) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; price: string; stock: string }) {
	const inputClassName = 'h-11 rounded-xl border border-[#d8cabd] bg-white px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]';
	return (
		<form className='mt-5 grid gap-3 rounded-2xl bg-[#f2e7db] p-4 sm:grid-cols-[minmax(0,1fr)_140px_140px_auto]' onSubmit={onSubmit}>
			<label className='grid gap-1.5 text-xs font-medium text-[var(--muted)]'>{copy.name}<input autoFocus className={inputClassName} maxLength={120} onChange={event => onNameChange(event.target.value)} required value={name} /></label>
			<label className='grid gap-1.5 text-xs font-medium text-[var(--muted)]'>{copy.price}<input className={inputClassName} min='0' onChange={event => onPriceChange(event.target.value)} required type='number' value={price} /></label>
			<label className='grid gap-1.5 text-xs font-medium text-[var(--muted)]'>{copy.stock}<input className={inputClassName} min='0' onChange={event => onStockChange(event.target.value)} required type='number' value={stock} /></label>
			<button className='mt-auto inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#63805a] px-5 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60' disabled={isSaving} type='submit'>{isSaving ? <LoaderCircle className='animate-spin' size={16} /> : <Check size={16} />}{copy.add}</button>
		</form>
	);
}

function ProductCard({ copy, isPending, onPriceChange, onSavePrice, onUpdate, priceValue, product }: { copy: TMenuCopy; isPending: boolean; onPriceChange: (value: string) => void; onSavePrice: () => void; onUpdate: (values: TMenuProductUpdate) => void; priceValue: string; product: TMenuProduct }) {
	const isOut = product.stock_quantity === 0;
	const isPriceUnchanged = Number(priceValue) === product.price;
	const cardTone = product.is_active && !isOut ? 'border-[#dfd2c5] bg-white/80' : 'border-[#ddd7d1] bg-[#f1eeeb]/80';

	return (
		<article className={`rounded-2xl border p-4 transition-colors ${cardTone}`}>
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0 flex-1'>
					<h3 className='truncate font-semibold'>{product.name}</h3>
					<label className='mt-2 flex max-w-56 items-center gap-2 text-xs font-medium text-[var(--muted)]'>
						<span className='sr-only'>{copy.price}</span>
						<input aria-label={copy.price} className='h-9 min-w-0 flex-1 rounded-lg border border-[#d8cabd] bg-white px-3 text-sm font-bold text-[var(--foreground)] outline-none focus:border-[var(--accent)]' min='0' onChange={event => onPriceChange(event.target.value)} type='number' value={priceValue} />
						<span>₪</span>
						<button aria-label={copy.save} className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-[#63805a] text-white disabled:cursor-default disabled:opacity-35' disabled={isPending || isPriceUnchanged} onClick={onSavePrice} type='button'><Check size={15} /></button>
					</label>
				</div>
				<button aria-label={copy.active} className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition ${product.is_active ? 'bg-[#e7f0e2] text-[#526c48]' : 'bg-[#ece8e4] text-[#756c65]'}`} disabled={isPending} onClick={() => onUpdate({ is_active: !product.is_active })} type='button'><Power size={16} /></button>
			</div>
			<div className='mt-4 flex items-center justify-between rounded-xl bg-[#f5ede4] p-3'>
				<div><p className='text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted)]'>{copy.stock}</p><p className={`mt-1 text-sm font-semibold ${isOut ? 'text-red-600' : 'text-[#526c48]'}`}>{isOut ? copy.out : copy.active}</p></div>
				<div className='flex items-center gap-2'><button className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#d8cabd] bg-white disabled:cursor-not-allowed disabled:opacity-40' disabled={isPending || isOut} onClick={() => onUpdate({ stock_quantity: Math.max(0, product.stock_quantity - 1) })} type='button'><Minus size={15} /></button><input aria-label={copy.stock} className='h-9 w-14 appearance-none rounded-lg border border-[#d8cabd] bg-white px-1 text-center text-base font-bold tabular-nums outline-none focus:border-[var(--accent)] disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none' defaultValue={product.stock_quantity} disabled={isPending} inputMode='numeric' key={product.stock_quantity} min='0' onBlur={event => { const value = Number.parseInt(event.currentTarget.value, 10); const nextStock = Number.isFinite(value) ? Math.max(0, value) : product.stock_quantity; event.currentTarget.value = String(nextStock); if (nextStock !== product.stock_quantity) onUpdate({ stock_quantity: nextStock }); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} type='number' /><button className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[var(--accent)] text-white disabled:cursor-wait disabled:opacity-50' disabled={isPending} onClick={() => onUpdate({ stock_quantity: product.stock_quantity + 1 })} type='button'><Plus size={15} /></button></div>
			</div>
		</article>
	);
}

function mergeMenuProduct(products: TMenuProduct[], changedProduct: TMenuProduct) {
	const exists = products.some(product => product.id === changedProduct.id);
	if (!exists) return [...products, changedProduct];
	return products.map(product => product.id === changedProduct.id ? changedProduct : product);
}
