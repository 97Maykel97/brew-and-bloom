import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '@/components/Header';
import { Colors, Spacing } from '@/constants/theme';
import { getLocale } from '@/i18n/locale';
import { translations } from '@/i18n/translations';
import {
	formatBirthDate,
	formatPhoneNumber,
	getString,
} from './lib/profile-formatters';
import ProfileContent from './ProfileContent';
import { profileTranslations } from './profileTranslations';
import type {
	TMobileProfileData,
	TProfileOrderStatus,
	TProfileTab,
} from './types';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);
	const appContent = translations[locale];
	const copy = profileTranslations[locale];
	const [profile, setProfile] = useState<TMobileProfileData | null>(null);
	const [activeTab, setActiveTab] = useState<TProfileTab>('profile');
	const [activeStatus, setActiveStatus] =
		useState<TProfileOrderStatus>('all');
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isAdmin, setIsAdmin] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	useFocusEffect(
		useCallback(() => {
			let isActive = true;

			async function loadProfile() {
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

				const { data: profileRecord } = await supabase
					.from('profiles')
					.select('first_name, last_name, phone, birth_date, role')
					.eq('id', user.id)
					.maybeSingle();
				const metadata = user.user_metadata ?? {};
				const firstName =
					getString(profileRecord?.first_name) ||
					getString(metadata.first_name);
				const lastName =
					getString(profileRecord?.last_name) ||
					getString(metadata.last_name);
				const displayName =
					[firstName, lastName].filter(Boolean).join(' ') ||
					getString(metadata.full_name) ||
					user.email ||
					'';
				const birthDate =
					getString(profileRecord?.birth_date) ||
					getString(metadata.birth_date);
				const bonusPoints =
					typeof metadata.bonus_points === 'number'
						? metadata.bonus_points
						: 0;

				setProfile({
					birthDate: formatBirthDate(birthDate, locale),
					birthDateValue: birthDate,
					bonusPoints,
					displayName,
					email: user.email || '',
					firstName,
					lastName,
					phone: formatPhoneNumber(
						getString(profileRecord?.phone) ||
							getString(metadata.phone),
					),
				});
				setIsAdmin(profileRecord?.role === 'admin');
				setIsLoading(false);
			}

			void loadProfile();

			return () => {
				isActive = false;
			};
		}, [locale]),
	);

	function changeLocale(nextLocale: typeof locale) {
		router.setParams({ locale: nextLocale });
	}

	function goHome() {
		router.navigate({
			pathname: '/',
			params: { locale },
		});
	}

	function goToAdmin() {
		router.navigate({
			pathname: '/admin',
			params: { locale },
		});
	}

	async function signOut() {
		await supabase.auth.signOut({ scope: 'local' });
		router.replace({
			pathname: '/auth/login',
			params: { locale },
		});
	}

	async function signOutAll() {
		const { error } = await supabase.auth.signOut({ scope: 'others' });

		if (error) {
			throw error;
		}
	}

	return (
		<SafeAreaView style={styles.screen}>
			<Header
				locale={locale}
				onLocaleChange={changeLocale}
				contextActionIcon={isAdmin ? 'shield' : undefined}
				contextActionLabel={isAdmin ? copy.adminPanel : undefined}
				contextActionText={isAdmin ? copy.adminPanelShort : undefined}
				onContextAction={isAdmin ? goToAdmin : undefined}
				homeLabel={copy.home}
				onHome={goHome}
				searchPlaceholder={appContent.searchPlaceholder}
				variant='profile'
			/>

			{isLoading || !profile ? (
				<View style={styles.loading}>
					<ActivityIndicator color={Colors.accent} />
					<Text style={styles.loadingText}>{copy.loading}</Text>
				</View>
			) : (
				<ProfileContent
					activeStatus={activeStatus}
					activeTab={activeTab}
					isEditing={isEditing}
					locale={locale}
					onEdit={() => {
						setActiveTab('profile');
						setIsEditing(true);
					}}
					onCancelEdit={() => setIsEditing(false)}
					onProfileSaved={updatedProfile => {
						setProfile(updatedProfile);
						setIsEditing(false);
					}}
					onLogout={signOut}
					onLogoutAll={signOutAll}
					onStatusChange={setActiveStatus}
					onTabChange={setActiveTab}
					profile={profile}
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
		fontSize: 14,
	},
});
