import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { getLocale } from '@/i18n/locale';
import { translations } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';
import { adminTranslations } from './adminTranslations';
import AdminContent from './components/AdminContent';
import type { TAdminSection } from './types';

export default function AdminScreen() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);
	const copy = adminTranslations[locale];
	const appContent = translations[locale];
	const [activeSection, setActiveSection] =
		useState<TAdminSection>('overview');
	const [displayName, setDisplayName] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useFocusEffect(
		useCallback(() => {
			let isActive = true;

			async function loadAdmin() {
				setIsLoading(true);
				const {
					data: { user },
				} = await supabase.auth.getUser();

				if (!isActive) return;

				if (!user) {
					router.replace({
						pathname: '/auth/login',
						params: { locale },
					});
					return;
				}

				const { data: profile } = await supabase
					.from('profiles')
					.select('first_name, last_name, role')
					.eq('id', user.id)
					.maybeSingle();

				if (!isActive) return;

				if (profile?.role !== 'admin') {
					router.replace({
						pathname: '/auth/login',
						params: { locale },
					});
					return;
				}

				const name = [profile.first_name, profile.last_name]
					.filter(Boolean)
					.join(' ');

				setDisplayName(name || user.email || copy.administrator);
				setIsLoading(false);
			}

			void loadAdmin();

			return () => {
				isActive = false;
			};
		}, [copy.administrator, locale]),
	);

	function changeLocale(nextLocale: typeof locale) {
		router.setParams({ locale: nextLocale });
	}

	function goHome() {
		router.navigate({ pathname: '/', params: { locale } });
	}

	function goToProfile() {
		router.navigate({ pathname: '/profile', params: { locale } });
	}

	async function signOut() {
		await supabase.auth.signOut({ scope: 'local' });
		router.replace({
			pathname: '/auth/login',
			params: { locale },
		});
	}

	return (
		<SafeAreaView style={styles.screen}>
			<Header
				locale={locale}
				navItems={appContent.nav}
				onLocaleChange={changeLocale}
				contextActionIcon='user'
				contextActionLabel={copy.profile}
				onContextAction={goToProfile}
				homeLabel={copy.home}
				onHome={goHome}
				searchPlaceholder={appContent.searchPlaceholder}
				variant='admin'
			/>

			{isLoading ? (
				<View style={styles.loading}>
					<ActivityIndicator color={Colors.accent} />
					<Text style={styles.loadingText}>{copy.loading}</Text>
				</View>
			) : (
				<AdminContent
					activeSection={activeSection}
					copy={copy}
					displayName={displayName}
					isRtl={locale === 'he'}
					onLogout={() => void signOut()}
					onSectionChange={setActiveSection}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	loading: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: Spacing.small,
	},
	loadingText: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 14,
	},
});
