import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { getLocale } from '@/i18n/locale';
import { type TLocale, translations } from '@/i18n/translations';
import HomeHighlights from './components/HomeHighlights';
import { homeScreenStyles as styles } from './home-screen.styles';

export default function HomeScreen() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);
	const content = translations[locale];
	const isRtl = locale === 'he';

	function handleLocaleChange(nextLocale: TLocale) {
		router.setParams({ locale: nextLocale });
	}

	return (
		<SafeAreaView style={styles.screen}>
			<Header
				locale={locale}
				onLocaleChange={handleLocaleChange}
				searchPlaceholder={content.searchPlaceholder}
			/>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.content}>
					<Text style={[styles.eyebrow, isRtl && styles.rtlText]}>
						{content.hero.eyebrow}
					</Text>
					<Text style={[styles.title, isRtl && styles.rtlText]}>
						{content.hero.title}
					</Text>
					<Text style={[styles.subtitle, isRtl && styles.rtlText]}>
						{content.hero.subtitle}
					</Text>
					<Text style={[styles.description, isRtl && styles.rtlText]}>
						{content.hero.description}
					</Text>
					<Text style={[styles.note, isRtl && styles.rtlText]}>
						{content.hero.note}
					</Text>
					<Pressable
						accessibilityRole='button'
						style={({ pressed }) => [
							styles.button,
							isRtl && styles.rtlButton,
							pressed && styles.buttonPressed,
						]}
					>
						<Text style={styles.buttonText}>{content.hero.button}</Text>
						<Text style={styles.buttonArrow}>{isRtl ? '←' : '→'}</Text>
					</Pressable>
				</View>

				<HomeHighlights copy={content.highlights} isRtl={isRtl} />
			</ScrollView>
		</SafeAreaView>
	);
}
