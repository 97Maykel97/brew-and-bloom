import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	Pressable,
	Text,
	TextInput,
	View,
	useWindowDimensions,
} from 'react-native';

import { Colors } from '@/constants/theme';
import type {
	THomeBestsellersTranslations,
	TLocale,
} from '@/i18n/translations';
import { createLocalizedHref } from '@/lib/createLocalizedHref';
import { HOME_PRODUCTS } from '../../home-products';
import { useHomeProductActions } from '../../use-home-product-actions';
import { useMenuProductInventory } from '../../use-menu-product-inventory';
import { homeBestsellersStyles as styles } from './home-bestsellers.styles';

type THomeBestsellersProps = {
	copy: THomeBestsellersTranslations;
	isRtl: boolean;
	locale: TLocale;
};

export default function HomeBestsellers({
	copy,
	isRtl,
	locale,
}: THomeBestsellersProps) {
	const { width } = useWindowDimensions();
	const sliderRef = useRef<FlatList<(typeof HOME_PRODUCTS)[number]>>(null);
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
	const cardWidth = Math.min(Math.max(width * 0.82, 270), 320);
	const slideWidth = cardWidth + 14;
	const unavailableLabel = locale === 'ru' ? 'Нет в наличии' : locale === 'he' ? 'אזל מהמלאי' : 'Out of stock';
	const isCardsLoading = isInventoryLoading || isFavoritesLoading;

	function openMenu() {
		router.navigate(createLocalizedHref('/menu', locale));
	}

	function goToSlide(index: number) {
		const nextIndex = Math.max(0, Math.min(HOME_PRODUCTS.length - 1, index));

		sliderRef.current?.scrollToIndex({
			animated: true,
			index: nextIndex,
		});
		setActiveIndex(nextIndex);
	}

	function handleScroll(offsetX: number) {
		const nextIndex = Math.min(
			HOME_PRODUCTS.length - 1,
			Math.max(0, Math.round(Math.abs(offsetX) / slideWidth)),
		);

		setActiveIndex(currentIndex =>
			currentIndex === nextIndex ? currentIndex : nextIndex,
		);
	}

	return (
		<View style={styles.section}>
			<View style={[styles.heading, isRtl && styles.rtlRow]}>
				<Text style={[styles.title, isRtl && styles.rtlText]}>
					{copy.title}
				</Text>
				<Pressable
					accessibilityRole='link'
					onPress={openMenu}
					style={({ pressed }) => [
						styles.viewAll,
						isRtl && styles.rtlRow,
						pressed && styles.pressed,
					]}
				>
					<Text style={styles.viewAllText}>{copy.viewAll}</Text>
					<Feather
						name={isRtl ? 'arrow-left' : 'arrow-right'}
						size={16}
						color={Colors.foreground}
					/>
				</Pressable>
			</View>

			<FlatList
				contentContainerStyle={styles.sliderContent}
				data={HOME_PRODUCTS}
				decelerationRate='fast'
				getItemLayout={(_, index) => ({
					index,
					length: slideWidth,
					offset: slideWidth * index,
				})}
				horizontal
				inverted={isRtl}
				keyExtractor={product => product.key}
				onScroll={event => handleScroll(event.nativeEvent.contentOffset.x)}
				ref={sliderRef}
				renderItem={({ item: product }) => {
					if (isCardsLoading) return <View style={[styles.slide, { width: slideWidth }]}><View accessibilityElementsHidden importantForAccessibility='no-hide-descendants' pointerEvents='none' style={[styles.card, { width: cardWidth }]}><View style={[styles.imageWrapper, styles.skeletonBlock]}><ActivityIndicator color={Colors.muted} size='small' /></View><View style={styles.content}><View style={[styles.skeletonLine, styles.skeletonTitle]} /><View style={[styles.skeletonLine, styles.skeletonDescription]} /><View style={[styles.skeletonLine, styles.skeletonDescriptionShort]} /><View style={[styles.footer, isRtl && styles.rtlRow]}><View style={[styles.skeletonLine, styles.skeletonPrice]} /><View style={[styles.skeletonBlock, styles.skeletonButton]} /></View></View></View></View>;
					const productCopy = copy.products[product.key];
					const isFavorite = favoriteKeys.has(product.key);
					const wasAdded = lastOrderedKey === product.key;
					const cartQuantity = cartQuantities.get(product.key) ?? 0;
					const isOrderPending = isPending(product.key, 'order');
					const productInventory = inventory.get(product.key);
					const isUnavailable = productInventory ? !productInventory.isActive || productInventory.stockQuantity === 0 : false;
					const isAtStockLimit = productInventory
						? (cartQuantities.get(product.key) ?? 0) >= productInventory.stockQuantity
						: false;
					const displayedPrice = productInventory?.price ?? product.price;

					return (
						<View style={[styles.slide, { width: slideWidth }]}>
							<View style={[styles.card, { width: cardWidth }]}>
								<View style={styles.imageWrapper}>
									<Image
										accessibilityLabel={productCopy.name}
										contentFit='cover'
										contentPosition='center'
										source={product.image}
										style={styles.image}
									/>
									<Pressable
										accessibilityLabel={`${isFavorite ? 'Remove from favorites' : 'Add to favorites'}: ${productCopy.name}`}
										accessibilityRole='button'
										accessibilityState={{ selected: isFavorite }}
										disabled={isFavoritesLoading || isPending(product.key, 'favorite')}
										onPress={() => void toggleFavorite(product.key)}
										style={({ pressed }) => [
											styles.favoriteButton,
											isFavorite && styles.favoriteButtonActive,
											isFavoritesLoading && styles.favoriteButtonLoading,
											pressed && styles.pressed,
										]}
									>
										<Feather
											name='heart'
											size={19}
											color={isFavorite ? Colors.white : Colors.accent}
										/>
									</Pressable>
								</View>
								<View style={styles.content}>
									<Text
										numberOfLines={1}
										style={[styles.productName, isRtl && styles.rtlText]}
									>
										{productCopy.name}
									</Text>
									<Text
										numberOfLines={2}
										style={[styles.description, isRtl && styles.rtlText]}
									>
										{productCopy.description}
									</Text>
									<View style={[styles.footer, isRtl && styles.rtlRow]}>
										{isInventoryLoading ? <View style={styles.inventoryLoading}><Text style={styles.inventoryLoadingText}>•••</Text></View> : isUnavailable ? <View style={styles.unavailable}><Text style={styles.unavailableText}>{unavailableLabel}</Text></View> : <><Text style={styles.price}>{displayedPrice} ₪</Text>
										{cartQuantity > 0 ? <View style={styles.quantityControl}>
											<Pressable accessibilityLabel={`Decrease ${productCopy.name}`} disabled={isOrderPending} onPress={() => void setOrderQuantity(product.key, cartQuantity - 1)} style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}><Feather name='minus' size={14} color={Colors.foreground} /></Pressable>
											<TextInput accessibilityLabel={`${productCopy.name}: quantity`} defaultValue={String(cartQuantity)} inputMode='numeric' key={cartQuantity} keyboardType='number-pad' onEndEditing={event => { const requestedQuantity = Number.parseInt(event.nativeEvent.text, 10); const nextQuantity = Number.isFinite(requestedQuantity) ? Math.min(Math.max(requestedQuantity, 0), productInventory?.stockQuantity ?? requestedQuantity) : cartQuantity; if (nextQuantity !== cartQuantity) void setOrderQuantity(product.key, nextQuantity); }} selectTextOnFocus style={styles.quantityInput} />
											<Pressable accessibilityLabel={`Increase ${productCopy.name}`} disabled={isOrderPending || isAtStockLimit} onPress={() => void setOrderQuantity(product.key, cartQuantity + 1)} style={({ pressed }) => [styles.quantityButton, isAtStockLimit && styles.quantityButtonDisabled, pressed && styles.pressed]}><Feather name='plus' size={14} color={Colors.foreground} /></Pressable>
										</View> : <Pressable
											accessibilityLabel={`${copy.addToCart}: ${productCopy.name}`}
											accessibilityRole='button'
											disabled={isOrderPending || isCartLoading || isAtStockLimit}
											onPress={() => void addToOrder(product.key)}
											style={({ pressed }) => [
											styles.addButton,
											wasAdded && styles.addButtonSuccess,
											isAtStockLimit && styles.addButtonDisabled,
												pressed && styles.pressed,
											]}
										>
											<Feather
												name={wasAdded ? 'check' : 'plus'}
												size={18}
												color={Colors.white}
											/>
										</Pressable>}
										</>}
									</View>
								</View>
							</View>
						</View>
					);
				}}
				showsHorizontalScrollIndicator={false}
				snapToAlignment='start'
				snapToInterval={slideWidth}
				scrollEventThrottle={16}
				style={styles.slider}
			/>

			<View style={[styles.controls, isRtl && styles.rtlRow]}>
				<Pressable
					accessibilityLabel='Previous product'
					disabled={activeIndex === 0}
					onPress={() => goToSlide(activeIndex - 1)}
					style={({ pressed }) => [
						styles.sliderArrow,
						activeIndex === 0 && styles.disabledArrow,
						pressed && styles.pressed,
					]}
				>
					<Feather
						name={isRtl ? 'arrow-right' : 'arrow-left'}
						size={17}
						color={Colors.foreground}
					/>
				</Pressable>

				<View style={[styles.dots, isRtl && styles.rtlRow]}>
					{HOME_PRODUCTS.map((product, index) => (
						<Pressable
							accessibilityLabel={`Product ${index + 1}`}
							key={product.key}
							onPress={() => goToSlide(index)}
							style={[styles.dot, index === activeIndex && styles.activeDot]}
						/>
					))}
				</View>

				<Pressable
					accessibilityLabel='Next product'
					disabled={activeIndex === HOME_PRODUCTS.length - 1}
					onPress={() => goToSlide(activeIndex + 1)}
					style={({ pressed }) => [
						styles.sliderArrow,
						activeIndex === HOME_PRODUCTS.length - 1 && styles.disabledArrow,
						pressed && styles.pressed,
					]}
				>
					<Feather
						name={isRtl ? 'arrow-left' : 'arrow-right'}
						size={17}
						color={Colors.foreground}
					/>
				</Pressable>
			</View>
		</View>
	);
}
