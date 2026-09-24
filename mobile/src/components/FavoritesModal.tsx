import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import { getHomeProduct } from '@/features/home/home-products';
import type { TLocale } from '@/i18n/languages';
import {
	type THomeBestsellerProductKey,
	translations,
} from '@/i18n/translations';
import { supabase } from '@/lib/supabase';
import { notifyFavoriteChanged } from '@/lib/favorite-events';

type TFavoritesModalProps = {
	locale: TLocale;
	onClose: () => void;
	visible: boolean;
};

type TFavoriteRow = {
	created_at: string;
	product_key: THomeBestsellerProductKey;
};

const MODAL_COPY = {
	ru: {
		close: 'Закрыть',
		empty: 'В избранном пока пусто',
		emptyText: 'Нажмите на сердечко у товара, чтобы сохранить его здесь.',
		openProfile: 'Открыть всё избранное',
		remove: 'Удалить из избранного',
		title: 'Избранное',
	},
	en: {
		close: 'Close',
		empty: 'Your favorites are empty',
		emptyText: 'Tap the heart on a product to save it here.',
		openProfile: 'View all favorites',
		remove: 'Remove from favorites',
		title: 'Favorites',
	},
	he: {
		close: 'סגירה',
		empty: 'אין עדיין מועדפים',
		emptyText: 'לחצו על הלב ליד מוצר כדי לשמור אותו כאן.',
		openProfile: 'לכל המועדפים',
		remove: 'הסרה מהמועדפים',
		title: 'מועדפים',
	},
} as const;

export default function FavoritesModal({
	locale,
	onClose,
	visible,
}: TFavoritesModalProps) {
	const insets = useSafeAreaInsets();
	const copy = MODAL_COPY[locale];
	const productCopy = translations[locale].bestsellers.products;
	const isRtl = locale === 'he';
	const [favorites, setFavorites] = useState<TFavoriteRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!visible) return;

		let isActive = true;

		async function loadFavorites() {
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
	}, [visible]);

	async function removeFavorite(productKey: THomeBestsellerProductKey) {
		const previous = favorites;
		setFavorites(current =>
			current.filter(item => item.product_key !== productKey),
		);

		const { error } = await supabase
			.from('product_favorites')
			.delete()
			.eq('product_key', productKey);

		if (error) setFavorites(previous);
		else notifyFavoriteChanged(productKey, false);
	}

	function openProfileFavorites() {
		onClose();
		router.navigate({
			pathname: '/profile',
			params: { locale, tab: 'favorites' },
		});
	}

	return (
		<Modal
			animationType='slide'
			onRequestClose={onClose}
			statusBarTranslucent
			transparent
			visible={visible}
		>
			<Pressable accessibilityRole='button' onPress={onClose} style={styles.backdrop}>
				<Pressable
					onPress={event => event.stopPropagation()}
					style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
				>
					<View style={styles.handle} />
					<View style={[styles.header, isRtl && styles.rtlRow]}>
						<View style={[styles.titleGroup, isRtl && styles.rtlRow]}>
							<View style={styles.titleIcon}>
								<Feather name='heart' size={19} color='#A65345' />
							</View>
							<Text style={[styles.title, isRtl && styles.rtlText]}>
								{copy.title}
							</Text>
						</View>
						<Pressable
							accessibilityLabel={copy.close}
							onPress={onClose}
							style={({ pressed }) => [
								styles.closeButton,
								pressed && styles.pressed,
							]}
						>
							<Feather name='x' size={21} color={Colors.muted} />
						</Pressable>
					</View>

					{isLoading ? (
						<View style={styles.loading}>
							<ActivityIndicator color={Colors.accent} />
						</View>
					) : favorites.length === 0 ? (
						<View style={styles.empty}>
							<View style={styles.emptyIcon}>
								<Feather name='heart' size={24} color='#A65345' />
							</View>
							<Text style={[styles.emptyTitle, isRtl && styles.rtlText]}>
								{copy.empty}
							</Text>
							<Text style={[styles.emptyText, isRtl && styles.rtlText]}>
								{copy.emptyText}
							</Text>
						</View>
					) : (
						<>
							<ScrollView
								contentContainerStyle={styles.list}
								showsVerticalScrollIndicator={false}
							>
								{favorites.map(item => {
									const product = getHomeProduct(item.product_key);
									if (!product) return null;
									const itemCopy = productCopy[item.product_key];

									return (
										<View
											key={item.product_key}
											style={[styles.item, isRtl && styles.rtlRow]}
										>
											<Image
												contentFit='cover'
												source={product.image}
												style={styles.itemImage}
											/>
											<View style={styles.itemCopy}>
												<Text
													numberOfLines={1}
													style={[styles.itemName, isRtl && styles.rtlText]}
												>
													{itemCopy.name}
												</Text>
												<Text style={styles.itemPrice}>{product.price} ₪</Text>
											</View>
											<Pressable
												accessibilityLabel={`${copy.remove}: ${itemCopy.name}`}
												onPress={() => void removeFavorite(item.product_key)}
												style={({ pressed }) => [
													styles.removeButton,
													pressed && styles.pressed,
												]}
											>
												<Feather name='trash-2' size={17} color='#A65345' />
											</Pressable>
										</View>
									);
								})}
							</ScrollView>
							<Pressable
								onPress={openProfileFavorites}
								style={({ pressed }) => [
									styles.profileButton,
									pressed && styles.pressed,
								]}
							>
								<Text style={styles.profileButtonText}>{copy.openProfile}</Text>
							</Pressable>
						</>
					)}
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(33,22,15,0.48)',
	},
	sheet: {
		maxHeight: '84%',
		paddingHorizontal: Spacing.medium,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		backgroundColor: '#F8F3EC',
	},
	handle: {
		width: 42,
		height: 4,
		marginTop: 10,
		alignSelf: 'center',
		borderRadius: 2,
		backgroundColor: '#D7C9BC',
	},
	header: {
		paddingVertical: Spacing.medium,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#E4D8CC',
	},
	titleGroup: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	titleIcon: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
		backgroundColor: '#EFE1D5',
	},
	title: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 20,
		fontWeight: '700',
	},
	closeButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
		backgroundColor: 'rgba(74,50,36,0.05)',
	},
	loading: {
		minHeight: 230,
		alignItems: 'center',
		justifyContent: 'center',
	},
	empty: {
		minHeight: 250,
		paddingHorizontal: Spacing.large,
		alignItems: 'center',
		justifyContent: 'center',
	},
	emptyIcon: {
		width: 56,
		height: 56,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 28,
		backgroundColor: '#EFE1D5',
	},
	emptyTitle: {
		marginTop: Spacing.medium,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 17,
		fontWeight: '700',
		textAlign: 'center',
	},
	emptyText: {
		maxWidth: 300,
		marginTop: Spacing.small,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 13,
		lineHeight: 19,
		textAlign: 'center',
	},
	list: {
		paddingVertical: Spacing.medium,
		gap: Spacing.small,
	},
	item: {
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 11,
		borderWidth: 1,
		borderColor: '#E5DCD3',
		borderRadius: 16,
		backgroundColor: 'rgba(255,255,255,0.76)',
	},
	itemImage: {
		width: 88,
		height: 72,
		borderRadius: 11,
		backgroundColor: '#EFE4D7',
	},
	itemCopy: {
		minWidth: 0,
		flex: 1,
		gap: 5,
	},
	itemName: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '700',
	},
	itemPrice: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 13,
		fontWeight: '800',
		writingDirection: 'ltr',
	},
	removeButton: {
		width: 36,
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 18,
		backgroundColor: '#F3E4DC',
	},
	profileButton: {
		minHeight: 46,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 23,
		backgroundColor: Colors.accent,
	},
	profileButtonText: {
		color: Colors.white,
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '700',
	},
	rtlRow: {
		flexDirection: 'row-reverse',
	},
	rtlText: {
		textAlign: 'right',
		writingDirection: 'rtl',
	},
	pressed: {
		opacity: 0.65,
	},
});
