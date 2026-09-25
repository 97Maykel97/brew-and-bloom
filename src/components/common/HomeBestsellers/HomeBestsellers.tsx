'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Heart, Minus, Plus } from 'lucide-react';
import { type UIEvent, useRef, useState } from 'react';

import {
	HOME_PRODUCTS,
	type THomeProductKey,
} from '@/features/catalog/home-products';
import { useHomeProductActions } from '@/features/catalog/use-home-product-actions';
import { useMenuProductInventory } from '@/features/catalog/use-menu-product-inventory';
import Container from '../Container';
import styles from './HomeBestsellers.module.scss';

export type THomeBestsellersCopy = {
	title: string;
	viewAll: string;
	addToCart: string;
	products: Record<
		THomeProductKey,
		{ name: string; description: string }
	>;
};

type THomeBestsellersProps = {
	copy: THomeBestsellersCopy;
	isRtl?: boolean;
	locale: string;
};
export default function HomeBestsellers({
	copy,
	isRtl = false,
	locale,
}: THomeBestsellersProps) {
	const productsRef = useRef<HTMLUListElement>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const { inventory, isLoading: isInventoryLoading } = useMenuProductInventory();
	const {
		addToOrder,
		cartQuantities,
		favoriteKeys,
		isCartLoading,
		isFavoritesLoading,
		isPending,
		lastOrderedKey,
		setOrderQuantity,
		toggleFavorite,
	} = useHomeProductActions(locale);
	const ViewAllIcon = isRtl ? ArrowLeft : ArrowRight;
	const PreviousIcon = isRtl ? ArrowRight : ArrowLeft;
	const NextIcon = isRtl ? ArrowLeft : ArrowRight;
	const unavailableLabel = locale === 'ru' ? 'Нет в наличии' : locale === 'he' ? 'אזל מהמלאי' : 'Out of stock';
	const isCardsLoading = isInventoryLoading || isFavoritesLoading;

	function goToSlide(index: number) {
		const nextIndex = Math.max(0, Math.min(HOME_PRODUCTS.length - 1, index));
		const list = productsRef.current;
		const product = list?.children.item(nextIndex);

		if (list && product) {
			const listRect = list.getBoundingClientRect();
			const productRect = product.getBoundingClientRect();
			const left = isRtl
				? productRect.right - listRect.right
				: productRect.left - listRect.left;

			list.scrollBy({ behavior: 'smooth', left });
		}

		setActiveIndex(nextIndex);
	}

	function handleScroll(event: UIEvent<HTMLUListElement>) {
		const list = event.currentTarget;
		const listRect = list.getBoundingClientRect();
		let closestIndex = 0;
		let closestDistance = Number.POSITIVE_INFINITY;

		Array.from(list.children).forEach((child, index) => {
			const cardRect = child.getBoundingClientRect();
			const distance = isRtl
				? Math.abs(cardRect.right - listRect.right)
				: Math.abs(cardRect.left - listRect.left);

			if (distance < closestDistance) {
				closestDistance = distance;
				closestIndex = index;
			}
		});

		setActiveIndex(currentIndex =>
			currentIndex === closestIndex ? currentIndex : closestIndex,
		);
	}

	return (
		<section
			id='bestsellers'
			className={styles.section}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			<Container>
				<div className={styles.heading}>
					<h2 className={styles.title}>{copy.title}</h2>
					<Link className={styles.viewAll} href={`/${locale}/menu`}>
						{copy.viewAll}
						<ViewAllIcon aria-hidden='true' size={17} strokeWidth={1.7} />
					</Link>
				</div>

				<ul
					className={styles.products}
					onScroll={handleScroll}
					ref={productsRef}
				>
					{HOME_PRODUCTS.map(product => {
						if (isCardsLoading) return <li aria-hidden='true' className={`${styles.card} ${styles.skeletonCard}`} key={product.key}><div className={`${styles.imageWrapper} ${styles.skeletonBlock}`} /><div className={styles.content}><span className={`${styles.skeletonLine} ${styles.skeletonTitle}`} /><span className={`${styles.skeletonLine} ${styles.skeletonDescription}`} /><span className={`${styles.skeletonLine} ${styles.skeletonDescriptionShort}`} /><div className={styles.footer}><span className={`${styles.skeletonLine} ${styles.skeletonPrice}`} /><span className={`${styles.skeletonBlock} ${styles.skeletonButton}`} /></div></div></li>;
						const productCopy = copy.products[product.key];
						const isFavorite = favoriteKeys.has(product.key);
						const isAdding = isPending(product.key, 'order');
						const wasAdded = lastOrderedKey === product.key;
						const cartQuantity = cartQuantities.get(product.key) ?? 0;
						const productInventory = inventory.get(product.key);
						const isUnavailable = productInventory ? !productInventory.isActive || productInventory.stockQuantity === 0 : false;
						const isAtStockLimit = productInventory
							? (cartQuantities.get(product.key) ?? 0) >= productInventory.stockQuantity
							: false;
						const displayedPrice = productInventory?.price ?? product.price;

						return (
							<li className={styles.card} key={product.key}>
								<div className={styles.imageWrapper}>
									<button
										aria-label={`${isFavorite ? 'Remove from favorites' : 'Add to favorites'}: ${productCopy.name}`}
										aria-pressed={isFavorite}
										className={`${styles.favoriteButton} ${
											isFavorite ? styles.favoriteButtonActive : ''
										} ${isFavoritesLoading ? styles.favoriteButtonLoading : ''}`}
										disabled={isFavoritesLoading || isPending(product.key, 'favorite')}
										onClick={() => void toggleFavorite(product.key)}
										type='button'
									>
										<Heart
											aria-hidden='true'
											fill={isFavorite ? 'currentColor' : 'none'}
											size={19}
											strokeWidth={1.8}
										/>
									</button>
									<Image
										alt={productCopy.name}
										className={styles.image}
										fill
										sizes='(max-width: 767px) 82vw, (max-width: 1023px) 40vw, 25vw'
										src={product.image}
									/>
								</div>
								<div className={styles.content}>
									<h3 className={styles.productName}>{productCopy.name}</h3>
									<p className={styles.description}>
										{productCopy.description}
									</p>
									<div className={styles.footer}>
										{isInventoryLoading ? <span aria-hidden='true' className={styles.inventoryLoading}>•••</span> : isUnavailable ? <span className={styles.unavailable}>{unavailableLabel}</span> : <><span className={styles.price} dir='ltr'>
											{displayedPrice} ₪
										</span>
										{cartQuantity > 0 ? <div className={styles.quantityControl}>
											<button aria-label={`Decrease ${productCopy.name}`} className={styles.quantityButton} disabled={isAdding} onClick={() => void setOrderQuantity(product.key, cartQuantity - 1)} type='button'><Minus aria-hidden='true' size={14} /></button>
											<input aria-label={`${productCopy.name}: quantity`} className={styles.quantityInput} defaultValue={cartQuantity} inputMode='numeric' key={cartQuantity} max={productInventory?.stockQuantity} min='0' onBlur={event => { const requestedQuantity = Number.parseInt(event.currentTarget.value, 10); const nextQuantity = Number.isFinite(requestedQuantity) ? Math.min(Math.max(requestedQuantity, 0), productInventory?.stockQuantity ?? requestedQuantity) : cartQuantity; event.currentTarget.value = String(nextQuantity); if (nextQuantity !== cartQuantity) void setOrderQuantity(product.key, nextQuantity); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} type='number' />
											<button aria-label={`Increase ${productCopy.name}`} className={styles.quantityButton} disabled={isAdding || isAtStockLimit} onClick={() => void setOrderQuantity(product.key, cartQuantity + 1)} type='button'><Plus aria-hidden='true' size={14} /></button>
										</div> : <button
											aria-label={`${copy.addToCart}: ${productCopy.name}`}
										className={`${styles.addButton} ${
											wasAdded ? styles.addButtonSuccess : ''
										} ${isAtStockLimit ? styles.addButtonDisabled : ''}`}
											disabled={isAdding || isCartLoading || isAtStockLimit}
											onClick={() => void addToOrder(product.key)}
											type='button'
										>
											{wasAdded ? (
												<Check aria-hidden='true' size={18} strokeWidth={2} />
											) : (
												<Plus aria-hidden='true' size={18} strokeWidth={2} />
											)}
										</button>}
										</>}
									</div>
								</div>
							</li>
						);
					})}
				</ul>

				<div className={styles.sliderControls}>
					<button
						aria-label='Previous product'
						className={styles.sliderArrow}
						disabled={activeIndex === 0}
						onClick={() => goToSlide(activeIndex - 1)}
						type='button'
					>
						<PreviousIcon aria-hidden='true' size={17} strokeWidth={1.8} />
					</button>

					<div className={styles.dots}>
						{HOME_PRODUCTS.map((product, index) => (
							<button
								aria-label={`Product ${index + 1}`}
								className={`${styles.dot} ${
									index === activeIndex ? styles.activeDot : ''
								}`}
								key={product.key}
								onClick={() => goToSlide(index)}
								type='button'
							/>
						))}
					</div>

					<button
						aria-label='Next product'
						className={styles.sliderArrow}
						disabled={activeIndex === HOME_PRODUCTS.length - 1}
						onClick={() => goToSlide(activeIndex + 1)}
						type='button'
					>
						<NextIcon aria-hidden='true' size={17} strokeWidth={1.8} />
					</button>
				</div>
			</Container>
		</section>
	);
}
