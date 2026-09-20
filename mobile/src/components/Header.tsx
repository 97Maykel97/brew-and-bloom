import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import {
	Keyboard,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import brandLogo from '../../assets/images/brand-logo.png';
import HeaderLanguageMenu from '@/components/header/HeaderLanguageMenu';
import HeaderSearchModal from '@/components/header/HeaderSearchModal';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/translations';
import { createLocalizedHref } from '@/lib/createLocalizedHref';
import { supabase } from '@/lib/supabase';

type THeaderProps = {
	locale: TLocale;
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
	const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
	const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');

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

	function openHome() {
		if (onHome) {
			onHome();
			return;
		}

		router.navigate(createLocalizedHref('/', locale));
	}

	return (
		<View style={styles.wrapper}>
			<View style={styles.header}>
				<Pressable
					accessibilityLabel='Brew & Bloom'
					accessibilityRole='link'
					onPress={openHome}
					style={({ pressed }) => [
						styles.logoWrapper,
						pressed && styles.pressed,
					]}
				>
					<Image
						source={brandLogo}
						contentFit='contain'
						style={styles.logo}
						alt='Brew & Bloom'
					/>
				</Pressable>

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
			<HeaderSearchModal
				visible={isSearchOpen}
				isRtl={isRtl}
				query={query}
				placeholder={searchPlaceholder}
				onChangeQuery={setQuery}
				onClose={closeSearch}
				onAction={handleSearchAction}
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
	logoWrapper: {
		flex: 1,
		minWidth: 0,
		alignItems: 'flex-start',
		paddingLeft: 4,
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
