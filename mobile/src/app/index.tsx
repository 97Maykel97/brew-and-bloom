import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { type Locale, translations } from '@/i18n/translations';

export default function HomeScreen() {
	const [locale, setLocale] = useState<Locale>('ru');
	const content = translations[locale];

	function toggleLocale() {
		setLocale(value => (value === 'ru' ? 'en' : 'ru'));
	}

	return (
		<SafeAreaView style={styles.screen}>
			<Header
				locale={locale}
				navItems={content.nav}
				onLocaleChange={toggleLocale}
				searchPlaceholder={content.searchPlaceholder}
			/>

			<View style={styles.content}>
				<Text style={styles.eyebrow}>{content.hero.eyebrow}</Text>
				<Text style={styles.title}>{content.hero.title}</Text>
				<Text style={styles.subtitle}>{content.hero.subtitle}</Text>
				<Text style={styles.description}>{content.hero.description}</Text>
				<Text style={styles.note}>{content.hero.note}</Text>
				<Pressable
					accessibilityRole='button'
					style={({ pressed }) => [
						styles.button,
						pressed && styles.buttonPressed,
					]}
				>
					<Text style={styles.buttonText}>{content.hero.button}</Text>
					<Text style={styles.buttonArrow}>→</Text>
				</Pressable>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: Spacing.large,
	},
	eyebrow: {
		marginBottom: Spacing.medium,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 2,
		textTransform: 'uppercase',
	},
	title: {
		color: Colors.foreground,
		fontFamily: Fonts.serif,
		fontSize: 56,
		lineHeight: 58,
		textAlign: 'center',
	},
	subtitle: {
		marginTop: Spacing.large,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
	},
	description: {
		maxWidth: 340,
		marginTop: Spacing.small,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 15,
		lineHeight: 23,
		textAlign: 'center',
	},
	button: {
		minHeight: 52,
		marginTop: Spacing.xLarge,
		paddingHorizontal: Spacing.large,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: Spacing.small,
		borderRadius: 999,
		backgroundColor: Colors.accent,
	},
	buttonPressed: {
		opacity: 0.82,
		transform: [{ scale: 0.98 }],
	},
	buttonText: {
		color: Colors.white,
		fontFamily: Fonts.sans,
		fontSize: 15,
		fontWeight: '700',
	},
	buttonArrow: {
		color: Colors.white,
		fontSize: 19,
		lineHeight: 21,
	},
	note: {
		marginTop: Spacing.xLarge,
		color: Colors.muted,
		fontFamily: Fonts.serif,
		fontSize: 22,
		fontStyle: 'italic',
		lineHeight: 27,
		textAlign: 'center',
	},
});
