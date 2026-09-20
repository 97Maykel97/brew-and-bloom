import { Image } from 'expo-image';
import { router, useFocusEffect, usePathname } from 'expo-router';
import {
	useCallback,
	useEffect,
	type ReactNode,
} from 'react';
import {
	BackHandler,
	KeyboardAvoidingView,
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
import AuthTopBar from '@/components/auth/AuthTopBar';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/languages';

type TAuthScreenProps = {
	locale: TLocale;
	onLocaleChange: (locale: TLocale) => void;
	title: string;
	description?: string;
	children: ReactNode;
};

export default function AuthScreen({
	locale,
	onLocaleChange,
	title,
	description,
	children,
}: TAuthScreenProps) {
	const isRtl = locale === 'he';
	const pathname = usePathname();
	const isLoginScreen = pathname.endsWith('/auth/login');
	const imageSource = isRtl ? backgroundImageHe : backgroundImage;

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
					<AuthTopBar
						isLoginScreen={isLoginScreen}
						locale={locale}
						onGoHome={handleBack}
						onGoToLogin={handleAuthBack}
						onLocaleChange={onLocaleChange}
					/>

					<View style={styles.card}>
						<Pressable
							accessibilityLabel='Brew & Bloom'
							accessibilityRole='link'
							onPress={handleBack}
							style={({ pressed }) => [
								styles.logoButton,
								pressed && styles.logoPressed,
							]}
						>
							<Image
								source={brandLogo}
								contentFit='contain'
								style={styles.logo}
								alt='Brew & Bloom'
							/>
						</Pressable>
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
	},
	logoButton: {
		alignSelf: 'center',
	},
	logoPressed: {
		opacity: 0.65,
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
});
