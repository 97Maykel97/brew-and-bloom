'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, LoaderCircle, Trash2, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { getHomeProductCopy } from '@/features/catalog/home-product-copy';
import {
	getHomeProduct,
	type THomeProductKey,
} from '@/features/catalog/home-products';
import type { TProfileLocale } from '@/features/profile/types';
import { createClient } from '@/lib/supabase/client';
import { notifyFavoriteChanged } from '@/features/catalog/favorite-events';

type TFavoritesModalButtonProps = {
	isSignedIn: boolean;
	locale: string;
};

type TFavoriteRow = {
	created_at: string;
	product_key: THomeProductKey;
};

const MODAL_COPY: Record<
	TProfileLocale,
	{
		close: string;
		empty: string;
		emptyText: string;
		login: string;
		loginText: string;
		openProfile: string;
		remove: string;
		title: string;
	}
> = {
	ru: {
		close: 'Закрыть',
		empty: 'В избранном пока пусто',
		emptyText: 'Нажмите на сердечко у товара, чтобы сохранить его здесь.',
		login: 'Войти',
		loginText: 'Войдите в аккаунт, чтобы сохранять любимые товары.',
		openProfile: 'Открыть всё избранное',
		remove: 'Удалить из избранного',
		title: 'Избранное',
	},
	en: {
		close: 'Close',
		empty: 'Your favorites are empty',
		emptyText: 'Tap the heart on a product to save it here.',
		login: 'Sign in',
		loginText: 'Sign in to save your favorite products.',
		openProfile: 'View all favorites',
		remove: 'Remove from favorites',
		title: 'Favorites',
	},
	he: {
		close: 'סגירה',
		empty: 'אין עדיין מועדפים',
		emptyText: 'לחצו על הלב ליד מוצר כדי לשמור אותו כאן.',
		login: 'התחברות',
		loginText: 'התחברו לחשבון כדי לשמור מוצרים מועדפים.',
		openProfile: 'לכל המועדפים',
		remove: 'הסרה מהמועדפים',
		title: 'מועדפים',
	},
};

export default function FavoritesModalButton({
	isSignedIn,
	locale,
}: TFavoritesModalButtonProps) {
	const currentLocale = isProfileLocale(locale) ? locale : 'en';
	const copy = MODAL_COPY[currentLocale];
	const productCopy = getHomeProductCopy(currentLocale);
	const [isOpen, setIsOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [favorites, setFavorites] = useState<TFavoriteRow[]>([]);

	useEffect(() => {
		if (!isOpen || !isSignedIn) return;

		let isActive = true;

		async function loadFavorites() {
			const supabase = createClient();
			const { data } = await supabase
				.from('product_favorites')
				.select('product_key, created_at')
				.order('created_at', { ascending: false });

			if (!isActive) return;
			setFavorites((data as TFavoriteRow[] | null) ?? []);
			setIsLoading(false);
		}

		void loadFavorites();
		return () => {
			isActive = false;
		};
	}, [isOpen, isSignedIn]);

	useEffect(() => {
		if (!isOpen) return;

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		function handleKeyDown(event: KeyboardEvent) {
			if (event.key === 'Escape') setIsOpen(false);
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen]);

	function openModal() {
		setIsOpen(true);
	}

	async function removeFavorite(productKey: THomeProductKey) {
		const previous = favorites;
		setFavorites(current =>
			current.filter(item => item.product_key !== productKey),
		);

		const supabase = createClient();
		const { error } = await supabase
			.from('product_favorites')
			.delete()
			.eq('product_key', productKey);

		if (error) setFavorites(previous);
		else notifyFavoriteChanged(productKey, false);
	}

	return (
		<>
			<button
				aria-label={copy.title}
				className='group flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-[var(--foreground)] transition-all duration-300 ease-out hover:scale-105 hover:text-[#a65345] active:scale-95'
				onClick={openModal}
				type='button'
			>
				<Heart
					className='transition-all duration-300 ease-out group-hover:fill-[#a65345] group-hover:stroke-[#a65345]'
					size={18}
					strokeWidth={1.8}
				/>
			</button>

			{isOpen && typeof document !== 'undefined'
				? createPortal(
						<div
							aria-label={copy.title}
							aria-modal='true'
							className='fixed inset-0 z-[200] flex items-end justify-center bg-[#21160f]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5'
							dir={currentLocale === 'he' ? 'rtl' : 'ltr'}
							onMouseDown={event => {
								if (event.target === event.currentTarget) setIsOpen(false);
							}}
							role='dialog'
						>
							<div className='flex max-h-[86svh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] border border-white/45 bg-[#f8f3ec] shadow-[0_28px_90px_rgba(35,23,16,0.32)] sm:rounded-[28px]'>
								<div className='flex items-center justify-between border-b border-[#e4d8cc] px-5 py-4 sm:px-6'>
									<div className='flex items-center gap-3'>
										<span className='flex h-10 w-10 items-center justify-center rounded-full bg-[#efe1d5] text-[#a65345]'>
											<Heart fill='currentColor' size={18} />
										</span>
										<h2 className='text-xl font-semibold'>{copy.title}</h2>
									</div>
									<button
										aria-label={copy.close}
										className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-black/5 hover:text-[var(--foreground)]'
										onClick={() => setIsOpen(false)}
										type='button'
									>
										<X size={20} />
									</button>
								</div>

								<div className='min-h-0 flex-1 overflow-y-auto p-5 sm:p-6'>
									{!isSignedIn ? (
										<ModalEmptyState
											description={copy.loginText}
											title={copy.title}
										>
											<Link
												className='mt-5 inline-flex min-h-10 items-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white'
												href={`/${currentLocale}/auth/login`}
												onClick={() => setIsOpen(false)}
											>
												{copy.login}
											</Link>
										</ModalEmptyState>
									) : isLoading ? (
										<div className='flex min-h-52 items-center justify-center text-[var(--accent)]'>
											<LoaderCircle className='animate-spin' size={28} />
										</div>
									) : favorites.length === 0 ? (
										<ModalEmptyState
											description={copy.emptyText}
											title={copy.empty}
										/>
									) : (
										<div className='grid gap-3'>
											{favorites.map(item => {
												const product = getHomeProduct(item.product_key);
												if (!product) return null;
												const itemCopy = productCopy[item.product_key];

												return (
													<article
														className='flex items-center gap-3 rounded-2xl border border-[#e5dcd3] bg-white/70 p-3'
														key={item.product_key}
													>
														<div className='relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-[#efe4d7]'>
															<Image alt={itemCopy.name} className='object-cover' fill sizes='96px' src={product.image} />
														</div>
														<div className='min-w-0 flex-1'>
															<h3 className='truncate text-sm font-semibold'>{itemCopy.name}</h3>
															<p className='mt-1 text-sm font-bold' dir='ltr'>{product.price} ₪</p>
														</div>
														<button
															aria-label={`${copy.remove}: ${itemCopy.name}`}
															className='flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#a65345] transition hover:bg-[#f3e4dc]'
															onClick={() => void removeFavorite(item.product_key)}
															type='button'
														>
															<Trash2 size={17} />
														</button>
													</article>
												);
											})}
										</div>
									)}
								</div>

								{isSignedIn && favorites.length > 0 ? (
									<div className='border-t border-[#e4d8cc] p-4 sm:px-6'>
										<Link
											className='flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:opacity-90'
											href={`/${currentLocale}/profile?tab=favorites#favorites`}
											onClick={() => setIsOpen(false)}
										>
											{copy.openProfile}
										</Link>
									</div>
								) : null}
							</div>
						</div>,
						document.body,
					)
				: null}
		</>
	);
}

function ModalEmptyState({
	children,
	description,
	title,
}: {
	children?: ReactNode;
	description: string;
	title: string;
}) {
	return (
		<div className='flex min-h-52 flex-col items-center justify-center px-4 text-center'>
			<span className='flex h-14 w-14 items-center justify-center rounded-full bg-[#efe1d5] text-[#a65345]'>
				<Heart size={23} strokeWidth={1.7} />
			</span>
			<h3 className='mt-4 text-base font-semibold'>{title}</h3>
			<p className='mt-2 max-w-sm text-sm leading-6 text-[var(--muted)]'>
				{description}
			</p>
			{children}
		</div>
	);
}

function isProfileLocale(locale: string): locale is TProfileLocale {
	return locale === 'ru' || locale === 'en' || locale === 'he';
}
