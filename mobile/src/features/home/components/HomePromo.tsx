import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import promoImage from '@/assets/images/second-coffee-promo.webp';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';

const COPY = {
	ru: { title: 'Твой второй кофе со скидкой 50%', description: 'Больше встреч. Больше удовольствия.', button: 'Узнать подробнее' },
	en: { title: 'Your second coffee is 50% off', description: 'More meetings. More moments to enjoy.', button: 'Learn more' },
	he: { title: 'הקפה השני שלך ב־50% הנחה', description: 'יותר מפגשים. יותר הנאה.', button: 'למידע נוסף' },
} as const;

export default function HomePromo({ isRtl, locale }: { isRtl: boolean; locale: TLocale }) {
	const copy = COPY[locale];

	async function openBonuses() {
		const { data } = await supabase.auth.getSession();
		if (data.session) {
			router.navigate({ pathname: '/profile', params: { locale, tab: 'bonuses' } });
			return;
		}
		router.navigate({ pathname: '/auth/login', params: { locale, next: 'bonuses' } });
	}

	return (
		<View style={styles.section}>
			<View style={styles.banner}>
				<Image
					accessibilityLabel={copy.title}
					contentFit='cover'
					contentPosition='right center'
					source={promoImage}
					style={styles.image}
				/>
				<View style={[styles.content, isRtl && styles.contentRtl]}>
					<Text style={[styles.title, isRtl && styles.rtlText]}>{copy.title}</Text>
					<Text style={[styles.description, isRtl && styles.rtlText]}>{copy.description}</Text>
					<Pressable onPress={() => void openBonuses()} style={({ pressed }) => [styles.button, isRtl && styles.rowRtl, pressed && styles.pressed]}>
						<Text style={styles.buttonText}>{copy.button}</Text>
						<Feather color={Colors.foreground} name={isRtl ? 'arrow-left' : 'arrow-right'} size={15} />
					</Pressable>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	section: { paddingHorizontal: Spacing.medium, paddingVertical: 32, backgroundColor: '#F8F3EC' },
	banner: { overflow: 'hidden', borderRadius: 24, backgroundColor: '#182016' },
	image: { width: '100%', height: 170, backgroundColor: '#182016' },
	content: { minHeight: 205, padding: 22, alignItems: 'flex-start', justifyContent: 'center' },
	contentRtl: { marginLeft: 'auto', alignItems: 'flex-end' },
	title: { color: Colors.white, fontFamily: Fonts.serif, fontSize: 29, lineHeight: 34 },
	description: { marginTop: 8, color: '#F4EDE6', fontFamily: Fonts.sans, fontSize: 13, lineHeight: 20 },
	button: { minHeight: 42, marginTop: 20, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 7, borderRadius: 999, backgroundColor: '#FFFAF3' },
	buttonText: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700' },
	rtlText: { textAlign: 'right', writingDirection: 'rtl' }, rowRtl: { flexDirection: 'row-reverse' }, pressed: { opacity: 0.8 },
});
