import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import {
	Keyboard,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import brandLogo from '../../assets/images/brand-logo.png';
import HeaderLanguageMenu from '@/components/header/HeaderLanguageMenu';
import HeaderNavigationMenu from '@/components/header/HeaderNavigationMenu';
import HeaderSearchModal from '@/components/header/HeaderSearchModal';
import FavoritesModal from '@/components/FavoritesModal';
import OrderModal from '@/components/OrderModal';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/translations';
import { createLocalizedHref } from '@/lib/createLocalizedHref';
import { subscribeToOrderChanges } from '@/lib/order-modal-events';
import { supabase } from '@/lib/supabase';

type THeaderProps = {
	locale: TLocale;
	navItems: string[];
	searchPlaceholder: string;
	onLocaleChange: (locale: TLocale) => void;
	contextActionIcon?: ComponentProps<typeof Feather>['name'];
	contextActionLabel?: string;
	contextActionText?: string;
	onContextAction?: () => void;
	homeLabel?: string;
	onHome?: () => void;
	variant?: 'default' | 'profile' | 'admin';
};

export default function Header({
	locale,
	navItems,
	searchPlaceholder,
	onLocaleChange,
	contextActionIcon,
	contextActionLabel,
	contextActionText,
	onContextAction,
	homeLabel,
	onHome,
	variant = 'default',
}: THeaderProps) {
	const isRtl = locale === 'he';
	const isAccountHeader = variant === 'profile' || variant === 'admin';
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
	const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
	const [isFavoritesOpen, setIsFavoritesOpen] = useState<boolean>(false);
	const [isOrderOpen, setIsOrderOpen] = useState<boolean>(false);
	const [cartItemCount, setCartItemCount] = useState<number>(0);
	const [query, setQuery] = useState<string>('');

	useEffect(() => {
		let isActive = true;

		async function refreshCartCount() {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			if (!session || !isActive) {
				if (isActive) setCartItemCount(0);
				return;
			}

			const { data } = await supabase
				.from('customer_orders')
				.select('quantity')
				.eq('status', 'cart');
			if (isActive) {
				setCartItemCount(
					(data ?? []).reduce((sum, item) => sum + item.quantity, 0),
				);
			}
		}

		void refreshCartCount();
		const unsubscribe = subscribeToOrderChanges(() => {
			void refreshCartCount();
		});
		return () => {
			isActive = false;
			unsubscribe();
		};
	}, []);

	function closeSearch() {
		setIsSearchOpen(false);
		Keyboard.dismiss();
	}

	function toggleSearch() {
		if (isSearchOpen) {
			closeSearch();
			return;
		}

		setIsSearchOpen(true);
		setIsMenuOpen(false);
		setIsLanguageOpen(false);
	}

	function toggleMenu() {
		setIsMenuOpen(value => !value);
		setIsSearchOpen(false);
		setIsLanguageOpen(false);
	}

	function closeMenu() {
		setIsMenuOpen(false);
	}

	function handleSearchAction() {
		if (query.length > 0) {
			setQuery('');
			return;
		}

		closeSearch();
	}

	function closeLanguage() {
		setIsLanguageOpen(false);
	}

	function toggleLanguage() {
		setIsLanguageOpen(value => !value);
		setIsMenuOpen(false);
		setIsSearchOpen(false);
	}

	function selectLanguage(nextLocale: TLocale) {
		onLocaleChange(nextLocale);
		closeLanguage();
	}

	async function openProfile() {
		const {
			data: { session },
		} = await supabase.auth.getSession();

		const pathname = session ? '/profile' : '/auth/login';
		router.navigate(createLocalizedHref(pathname, locale));
	}

	async function openFavorites() {
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session) {
			router.navigate(createLocalizedHref('/auth/login', locale));
			return;
		}

		setIsMenuOpen(false);
		setIsSearchOpen(false);
		setIsLanguageOpen(false);
		setIsFavoritesOpen(true);
	}

	function openHome() {
		if (onHome) {
			onHome();
			return;
		}

		router.navigate(createLocalizedHref('/', locale));
	}

	async function openCart() {
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session) {
			router.navigate(createLocalizedHref('/auth/login', locale));
			return;
		}

		setIsMenuOpen(false);
		setIsSearchOpen(false);
		setIsLanguageOpen(false);
		setIsOrderOpen(true);
	}

	return (
		<View style={styles.wrapper}>
			<View style={styles.header}>
				{isAccountHeader ? (
					<Pressable
						accessibilityLabel='Brew & Bloom'
						accessibilityRole='link'
						onPress={openHome}
						style={({ pressed }) => [
							styles.logoButton,
							pressed && styles.pressed,
						]}
					>
						<Image
							alt='Brew & Bloom'
							contentFit='contain'
							source={brandLogo}
							style={styles.logo}
						/>
					</Pressable>
				) : (
					<Pressable
						accessibilityLabel={isMenuOpen ? 'Close menu' : 'Open menu'}
						accessibilityRole='button'
						accessibilityState={{ expanded: isMenuOpen }}
						onPress={toggleMenu}
						style={({ pressed }) => [
							styles.menuButton,
							pressed && styles.pressed,
						]}
					>
						<Feather
							name={isMenuOpen ? 'x' : 'menu'}
							size={24}
							color={Colors.foreground}
						/>
					</Pressable>
				)}

				<View style={styles.actions}>
					{!isAccountHeader && (
						<>
							<Pressable
								accessibilityLabel='Search'
								accessibilityRole='button'
								accessibilityState={{ expanded: isSearchOpen }}
								onPress={toggleSearch}
								style={styles.iconButton}
							>
								<Feather
									name='search'
									size={20}
									color={Colors.foreground}
								/>
							</Pressable>

							<Pressable
								accessibilityLabel='Favorites'
								accessibilityRole='button'
								onPress={openFavorites}
								style={({ pressed }) => [
									styles.iconButton,
									pressed && styles.pressed,
								]}
							>
								<Feather
									name='heart'
									size={20}
									color={Colors.foreground}
								/>
							</Pressable>

							<Pressable
								accessibilityLabel='Cart'
								accessibilityRole='button'
								onPress={() => void openCart()}
								style={({ pressed }) => [
									styles.iconButton,
									pressed && styles.pressed,
								]}
							>
								<Feather
									name='shopping-bag'
									size={20}
									color={Colors.foreground}
								/>
								{cartItemCount > 0 ? (
									<View style={styles.cartBadge}>
										<Text style={styles.cartBadgeText}>
											{cartItemCount > 99 ? '99+' : cartItemCount}
										</Text>
									</View>
								) : null}
							</Pressable>

							<Pressable
								accessibilityLabel='Profile'
								accessibilityRole='button'
								onPress={openProfile}
								style={styles.iconButton}
							>
								<Feather
									name='user'
									size={20}
									color={Colors.foreground}
								/>
							</Pressable>
						</>
					)}

					{onHome && homeLabel && (
						<Pressable
							accessibilityLabel={homeLabel}
							accessibilityRole='button'
							onPress={onHome}
							style={({ pressed }) => [
								styles.homeButton,
								pressed && styles.pressed,
							]}
						>
							<Feather
								name={isRtl ? 'arrow-left' : 'arrow-right'}
								size={15}
								color={Colors.muted}
							/>
							<Text style={styles.homeText}>{homeLabel}</Text>
						</Pressable>
					)}

					{onContextAction && contextActionLabel && contextActionIcon && (
						<Pressable
							accessibilityLabel={contextActionLabel}
							accessibilityRole='button'
							onPress={onContextAction}
							style={({ pressed }) => [
								contextActionText
									? styles.contextButton
									: styles.iconButton,
								pressed && styles.pressed,
							]}
						>
							<Feather
								name={contextActionIcon}
								size={20}
								color={Colors.foreground}
							/>
							{contextActionText ? (
								<Text style={styles.contextButtonText}>
									{contextActionText}
								</Text>
							) : null}
						</Pressable>
					)}

					<Pressable
						accessibilityLabel='Change language'
						accessibilityRole='button'
						accessibilityState={{ expanded: isLanguageOpen }}
						onPress={toggleLanguage}
						style={styles.languageButton}
					>
						<Text style={styles.language}>{locale.toUpperCase()}</Text>
					</Pressable>
				</View>
			</View>

			<HeaderLanguageMenu
				locale={locale}
				visible={isLanguageOpen}
				onClose={closeLanguage}
				onSelect={selectLanguage}
			/>
			{!isAccountHeader && (
				<HeaderNavigationMenu
					isRtl={isRtl}
					items={navItems}
					locale={locale}
					onClose={closeMenu}
					visible={isMenuOpen}
				/>
			)}
			<HeaderSearchModal
				visible={isSearchOpen}
				isRtl={isRtl}
				query={query}
				placeholder={searchPlaceholder}
				onChangeQuery={setQuery}
				onClose={closeSearch}
				onAction={handleSearchAction}
			/>
			<FavoritesModal
				locale={locale}
				onClose={() => setIsFavoritesOpen(false)}
				visible={isFavoritesOpen}
			/>
			<OrderModal
				locale={locale}
				onClose={() => setIsOrderOpen(false)}
				onCartChange={setCartItemCount}
				visible={isOrderOpen}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		position: 'relative',
		zIndex: 10,
	},
	header: {
		minHeight: 72,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: Colors.background,
	},
	menuButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoButton: {
		width: 132,
		height: 48,
		justifyContent: 'center',
	},
	logo: {
		width: 128,
		height: 44,
	},
	actions: {
		marginLeft: 'auto',
		flexShrink: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconButton: {
		position: 'relative',
		width: 32,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cartBadge: {
		position: 'absolute',
		top: 1,
		right: -1,
		minWidth: 16,
		height: 16,
		paddingHorizontal: 3,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		backgroundColor: '#A65345',
	},
	cartBadgeText: {
		color: Colors.white,
		fontFamily: Fonts.sans,
		fontSize: 9,
		fontWeight: '800',
		lineHeight: 11,
	},
	contextButton: {
		height: 36,
		paddingHorizontal: 9,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 5,
		borderWidth: 1,
		borderColor: '#D8CCC0',
		borderRadius: 999,
		backgroundColor: 'rgba(255,255,255,0.58)',
	},
	contextButtonText: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 11,
		fontWeight: '700',
	},
	homeButton: {
		height: 40,
		paddingHorizontal: 4,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 3,
	},
	homeText: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 12,
	},
	languageButton: {
		width: 36,
		height: 40,
		marginRight: Spacing.small,
		alignItems: 'flex-end',
		justifyContent: 'center',
	},
	language: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 13,
		textAlign: 'right',
	},
	pressed: {
		opacity: 0.65,
	},
});
