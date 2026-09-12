import { useState } from 'react';
import {
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import {
	languageOptions,
	type TLocale,
} from '@/i18n/languages';

type TAuthTopBarProps = {
	isLoginScreen: boolean;
	locale: TLocale;
	onGoHome: () => void;
	onGoToLogin: () => void;
	onLocaleChange: (locale: TLocale) => void;
};

const navigationLabels = {
	ru: { auth: 'К авторизации', home: 'На главную' },
	en: { auth: 'Back to sign in', home: 'Back to home' },
	he: { auth: 'חזרה להתחברות', home: 'חזרה לדף הבית' },
};

export default function AuthTopBar({
	isLoginScreen,
	locale,
	onGoHome,
	onGoToLogin,
	onLocaleChange,
}: TAuthTopBarProps) {
	const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
	const isRtl = locale === 'he';
	const labels = navigationLabels[locale];

	function selectLanguage(nextLocale: TLocale) {
		onLocaleChange(nextLocale);
		setIsLanguageOpen(false);
	}

	return (
		<>
			<View style={[styles.topBar, isRtl && styles.topBarRtl]}>
				<View style={styles.navigationActions}>
					{!isLoginScreen && (
						<NavigationButton
							isRtl={isRtl}
							label={labels.auth}
							onPress={onGoToLogin}
						/>
					)}
					<NavigationButton
						isRtl={isRtl}
						label={labels.home}
						onPress={onGoHome}
					/>
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
									onPress={() => selectLanguage(option.locale)}
									style={({ pressed }) => [
										styles.languageOption,
										pressed && styles.pressed,
									]}
								>
									<Text style={styles.languageOptionText}>
										{option.label} · {option.name}
									</Text>
								</Pressable>
							))}
					</Pressable>
				</Pressable>
			</Modal>
		</>
	);
}

type TNavigationButtonProps = {
	isRtl: boolean;
	label: string;
	onPress: () => void;
};

function NavigationButton({
	isRtl,
	label,
	onPress,
}: TNavigationButtonProps) {
	return (
		<Pressable
			accessibilityRole='button'
			accessibilityLabel={label}
			onPress={onPress}
			style={({ pressed }) => [
				styles.backButton,
				pressed && styles.pressed,
			]}
		>
			<Text style={styles.backArrow}>{isRtl ? '›' : '‹'}</Text>
			<Text style={[styles.backText, isRtl && styles.rtlText]}>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
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
