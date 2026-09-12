import { Image } from 'expo-image';
import { router, useFocusEffect, usePathname } from 'expo-router';
import {
	useCallback,
	useEffect,
	useState,
	type ReactNode,
} from 'react';
import {
	BackHandler,
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import brandLogo from '@/assets/images/brand-logo.png';
import backgroundImage from '@/assets/images/home-hero-background.png';
import backgroundImageHe from '@/assets/images/home-hero-background-he.png';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Locale } from '@/i18n/translations';

type AuthScreenProps = {
	locale: Locale;
	onLocaleChange: (locale: Locale) => void;
	title: string;
	description?: string;
	children: ReactNode;
};

const languageOptions: { locale: Locale; name: string }[] = [
	{ locale: 'ru', name: 'Русский' },
	{ locale: 'en', name: 'English' },
	{ locale: 'he', name: 'עברית' },
];

export default function AuthScreen({
	locale,
	onLocaleChange,
	title,
	description,
	children,
}: AuthScreenProps) {
	const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
	const isRtl = locale === 'he';
	const pathname = usePathname();
	const isLoginScreen = pathname.endsWith('/auth/login');
	const imageSource = isRtl ? backgroundImageHe : backgroundImage;
	const navigationLabels =
		locale === 'he'
			? { auth: 'חזרה להתחברות', home: 'חזרה לדף הבית' }
			: locale === 'en'
				? { auth: 'Back to sign in', home: 'Back to home' }
				: { auth: 'К авторизации', home: 'На главную' };

	const handleBack = useCallback(() => {
		router.replace({
			pathname: '/',
			params: { locale },
		});
	}, [locale]);

	const handleAuthBack = useCallback(() => {
		router.replace({
			pathname: '/auth/login',
			params: { locale },
		});
	}, [locale]);

	useFocusEffect(
		useCallback(() => {
			const subscription = BackHandler.addEventListener(
				'hardwareBackPress',
				() => {
					handleBack();
					return true;
				},
			);

			return () => subscription.remove();
		}, [handleBack]),
	);

	useEffect(() => {
		if (Platform.OS !== 'web') return;

		function handleBrowserBack() {
			handleBack();
		}

		window.addEventListener('popstate', handleBrowserBack);
		return () => window.removeEventListener('popstate', handleBrowserBack);
	}, [handleBack]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<Image
				source={imageSource}
				contentFit='cover'
				style={StyleSheet.absoluteFill}
			/>
			<View style={styles.imageOverlay} />

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				style={styles.keyboard}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}
				>
					<View style={[styles.topBar, isRtl && styles.topBarRtl]}>
						<View style={styles.navigationActions}>
							{!isLoginScreen && (
								<Pressable
									accessibilityRole='button'
									accessibilityLabel={navigationLabels.auth}
									onPress={handleAuthBack}
									style={({ pressed }) => [
										styles.backButton,
										pressed && styles.pressed,
									]}
								>
									<Text style={styles.backArrow}>{isRtl ? '›' : '‹'}</Text>
									<Text style={[styles.backText, isRtl && styles.rtlText]}>
										{navigationLabels.auth}
									</Text>
								</Pressable>
							)}
							<Pressable
								accessibilityRole='button'
								accessibilityLabel={navigationLabels.home}
								onPress={handleBack}
								style={({ pressed }) => [
									styles.backButton,
									pressed && styles.pressed,
								]}
							>
								<Text style={styles.backArrow}>{isRtl ? '›' : '‹'}</Text>
								<Text style={[styles.backText, isRtl && styles.rtlText]}>
									{navigationLabels.home}
								</Text>
							</Pressable>
						</View>
						<Pressable
							accessibilityRole='button'
							accessibilityLabel='Change language'
							onPress={() => setIsLanguageOpen(true)}
							style={({ pressed }) => [
								styles.languageButton,
								pressed && styles.pressed,
							]}
						>
							<Text style={styles.language}>{locale.toUpperCase()}</Text>
							<Text style={styles.chevron}>⌄</Text>
						</Pressable>
					</View>

					<View style={styles.card}>
						<Image
							source={brandLogo}
							contentFit='contain'
							style={styles.logo}
							alt='Brew & Bloom'
						/>
						<View style={styles.divider} />
						<Text style={[styles.title, isRtl && styles.rtlText]}>
							{title}
						</Text>
						{description ? (
							<Text style={[styles.description, isRtl && styles.rtlText]}>
								{description}
							</Text>
						) : null}
						<View style={styles.form}>{children}</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>

			<Modal
				animationType='fade'
				transparent
				visible={isLanguageOpen}
				onRequestClose={() => setIsLanguageOpen(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setIsLanguageOpen(false)}
				>
					<Pressable
						style={styles.languageMenu}
						onPress={event => event.stopPropagation()}
					>
						{languageOptions
							.filter(option => option.locale !== locale)
							.map(option => (
								<Pressable
									key={option.locale}
									accessibilityRole='button'
									onPress={() => {
										onLocaleChange(option.locale);
										setIsLanguageOpen(false);
									}}
									style={({ pressed }) => [
										styles.languageOption,
										pressed && styles.pressed,
									]}
								>
									<Text style={styles.languageOptionText}>
										{option.locale.toUpperCase()} · {option.name}
									</Text>
								</Pressable>
							))}
					</Pressable>
				</Pressable>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	imageOverlay: {
		...StyleSheet.absoluteFill,
		backgroundColor: 'rgba(252, 248, 242, 0.62)',
	},
	keyboard: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		paddingBottom: Spacing.large,
	},
	topBar: {
		alignItems: 'flex-end',
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: Spacing.medium,
		paddingTop: Spacing.small,
	},
	topBarRtl: {
		flexDirection: 'row-reverse',
	},
	navigationActions: {
		flexShrink: 1,
		flexDirection: 'row',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 2,
	},
	backButton: {
		minHeight: 40,
		maxWidth: 180,
		paddingHorizontal: 6,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	backArrow: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 25,
		lineHeight: 25,
	},
	backText: {
		flexShrink: 1,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 12,
		fontWeight: '600',
	},
	languageButton: {
		minHeight: 40,
		paddingHorizontal: Spacing.small,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 4,
	},
	language: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 13,
		fontWeight: '600',
	},
	chevron: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 16,
		lineHeight: 16,
	},
	card: {
		width: '92%',
		maxWidth: 480,
		alignSelf: 'center',
		marginTop: Spacing.medium,
		padding: Spacing.large,
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.82)',
		borderRadius: 28,
		backgroundColor: 'rgba(252, 248, 242, 0.94)',
		shadowColor: Colors.foreground,
		shadowOffset: { width: 0, height: 12 },
		shadowOpacity: 0.18,
		shadowRadius: 24,
		elevation: 8,
	},
	logo: {
		width: 150,
		height: 50,
		alignSelf: 'center',
	},
	divider: {
		width: 56,
		height: StyleSheet.hairlineWidth,
		marginTop: Spacing.medium,
		alignSelf: 'center',
		backgroundColor: '#D8CEC3',
	},
	title: {
		marginTop: Spacing.medium,
		color: Colors.foreground,
		fontFamily: Fonts.serif,
		fontSize: 36,
		lineHeight: 42,
		textAlign: 'center',
	},
	description: {
		marginTop: Spacing.small,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 14,
		lineHeight: 21,
		textAlign: 'center',
	},
	form: {
		marginTop: Spacing.large,
		gap: Spacing.medium,
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
	modalOverlay: {
		flex: 1,
		alignItems: 'flex-end',
		paddingTop: 70,
		paddingRight: Spacing.medium,
		backgroundColor: 'rgba(43, 33, 27, 0.12)',
	},
	languageMenu: {
		minWidth: 180,
		padding: Spacing.small,
		borderRadius: 16,
		backgroundColor: Colors.background,
		shadowColor: Colors.foreground,
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.18,
		shadowRadius: 14,
		elevation: 8,
	},
	languageOption: {
		minHeight: 44,
		paddingHorizontal: Spacing.small,
		justifyContent: 'center',
		borderRadius: 10,
	},
	languageOptionText: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 14,
	},
	pressed: {
		opacity: 0.55,
	},
});
