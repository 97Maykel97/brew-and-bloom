import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { getLocale } from '@/i18n/locale';
import { type TLocale, translations } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';
import HomeBestsellers from './components/HomeBestsellers/HomeBestsellers';
import HomeEvents from './components/HomeEvents';
import HomeHighlights from './components/HomeHighlights';
import HomePromo from './components/HomePromo';
import { homeScreenStyles as styles } from './home-screen.styles';

export default function HomeScreen() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);
	const content = translations[locale];
	const isRtl = locale === 'he';

	function handleLocaleChange(nextLocale: TLocale) {
		router.setParams({ locale: nextLocale });
	}

	async function openBooking() {
		const { data } = await supabase.auth.getSession();
		if (data.session) {
			router.navigate({ pathname: '/profile', params: { locale, tab: 'bookings' } });
			return;
		}
		router.navigate({ pathname: '/auth/login', params: { locale, next: 'bookings' } });
	}

	return (
		<SafeAreaView style={styles.screen}>
			<Header
				locale={locale}
				navItems={content.nav}
				onLocaleChange={handleLocaleChange}
				searchPlaceholder={content.searchPlaceholder}
			/>

			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.hero}>
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
					<Pressable
						accessibilityRole='button'
						onPress={() => void openBooking()}
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
				</View>

				<HomeHighlights copy={content.highlights} isRtl={isRtl} />
				<HomeBestsellers
					copy={content.bestsellers}
					isRtl={isRtl}
					locale={locale}
				/>
				<HomePromo isRtl={isRtl} locale={locale} />
				<HomeEvents isRtl={isRtl} locale={locale} />
			</ScrollView>
		</SafeAreaView>
	);
}
