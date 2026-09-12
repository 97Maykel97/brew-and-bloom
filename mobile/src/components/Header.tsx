import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
	Keyboard,
	Pressable,
	StyleSheet,
	Text,
	View,
	useWindowDimensions,
} from 'react-native';
import brandLogo from '../../assets/images/brand-logo.png';
import HeaderLanguageMenu from '@/components/header/HeaderLanguageMenu';
import HeaderNavigationMenu from '@/components/header/HeaderNavigationMenu';
import HeaderSearchModal from '@/components/header/HeaderSearchModal';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/translations';
import { createLocalizedHref } from '@/lib/createLocalizedHref';
import { supabase } from '@/lib/supabase';

type THeaderProps = {
	locale: TLocale;
	navItems: string[];
	searchPlaceholder: string;
	onLocaleChange: (locale: TLocale) => void;
	homeLabel?: string;
	onHome?: () => void;
	variant?: 'default' | 'profile';
};

export default function Header({
	locale,
	navItems,
	searchPlaceholder,
	onLocaleChange,
	homeLabel,
	onHome,
	variant = 'default',
}: THeaderProps) {
	const { height } = useWindowDimensions();
	const isRtl = locale === 'he';
	const isProfileHeader = variant === 'profile';
	const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
	const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');

	function toggleMenu() {
		setIsMenuOpen(value => !value);
		setIsSearchOpen(false);
		setIsLanguageOpen(false);
	}

	function closeMenu() {
		setIsMenuOpen(false);
	}

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
		router.push(createLocalizedHref(pathname, locale));
	}

	return (
		<View style={styles.wrapper}>
			<View style={styles.header}>
				<Pressable
					accessibilityLabel={isMenuOpen ? 'Close menu' : 'Open menu'}
					accessibilityRole='button'
					accessibilityState={{ expanded: isMenuOpen }}
					onPress={toggleMenu}
					style={styles.menuButton}
				>
					<Feather
						name={isMenuOpen ? 'x' : 'menu'}
						size={24}
						color={Colors.foreground}
					/>
				</Pressable>

				<View style={styles.logoWrapper}>
					<Image
						source={brandLogo}
						contentFit='contain'
						style={styles.logo}
						alt='Brew & Bloom'
					/>
				</View>

				<View style={styles.actions}>
					{!isProfileHeader && (
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
								style={styles.iconButton}
							>
								<Feather
									name='heart'
									size={20}
									color={Colors.foreground}
								/>
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
			<HeaderSearchModal
				visible={isSearchOpen}
				isRtl={isRtl}
				query={query}
				placeholder={searchPlaceholder}
				onChangeQuery={setQuery}
				onClose={closeSearch}
				onAction={handleSearchAction}
			/>
			<HeaderNavigationMenu
				visible={isMenuOpen}
				height={Math.max(height - 72, 0)}
				isRtl={isRtl}
				items={navItems}
				onClose={closeMenu}
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
	logoWrapper: {
		flex: 1,
		minWidth: 0,
		alignItems: 'center',
	},
	logo: {
		width: 140,
		height: 48,
	},
	actions: {
		flexShrink: 1,
		flexDirection: 'row',
		alignItems: 'center',
	},
	iconButton: {
		width: 32,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
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
