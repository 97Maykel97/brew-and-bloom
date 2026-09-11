import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import AuthField from '@/components/auth/AuthField';
import AuthScreen from '@/components/auth/AuthScreen';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { authTranslations } from '@/i18n/authTranslations';
import { getLocale } from '@/i18n/locale';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const content = authTranslations[locale];
	const isRtl = locale === 'he';

	function handleLocaleChange(nextLocale: typeof locale) {
		router.setParams({ locale: nextLocale });
	}

	async function handleLogin() {
		setMessage('');
		const normalizedEmail = email.trim();

		if (!normalizedEmail || !password) {
			setMessage(content.form.requiredFields);
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
			setMessage(content.form.invalidEmail);
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email: normalizedEmail,
				password,
			});

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			router.replace({ pathname: '/', params: { locale } });
		} catch (error: unknown) {
			setMessage(getAuthErrorMessage(error, locale));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<AuthScreen
			locale={locale}
			onLocaleChange={handleLocaleChange}
			title={content.login.title}
		>
			<AuthField
				label={content.login.email}
				isRtl={isRtl}
				keyboardType='email-address'
				autoCapitalize='none'
				autoCorrect={false}
				autoComplete='email'
				value={email}
				onChangeText={setEmail}
			/>
			<PasswordField
				label={content.login.password}
				isRtl={isRtl}
				autoComplete='password'
				value={password}
				onChangeText={setPassword}
				showPasswordLabel={content.form.showPassword}
				hidePasswordLabel={content.form.hidePassword}
			/>
			<AuthSubmitButton
				label={content.login.submit}
				loadingLabel={content.login.loading}
				isLoading={isLoading}
				onPress={handleLogin}
			/>

			{message ? (
				<Text style={[styles.message, isRtl && styles.rtlText]}>
					{message}
				</Text>
			) : null}

			<Pressable
				onPress={() =>
					router.push({
						pathname: '/auth/forgot-password',
						params: { locale },
					})
				}
				style={styles.linkButton}
			>
				<Text style={[styles.link, isRtl && styles.rtlText]}>
					{content.login.forgotPassword}
				</Text>
			</Pressable>
			<Pressable
				onPress={() =>
					router.push({
						pathname: '/auth/register',
						params: { locale },
					})
				}
				style={styles.linkButton}
			>
				<Text style={[styles.mutedLink, isRtl && styles.rtlText]}>
					{content.login.registerLink}
				</Text>
			</Pressable>
		</AuthScreen>
	);
}

const styles = StyleSheet.create({
	message: {
		padding: Spacing.medium,
		borderRadius: 14,
		backgroundColor: '#EFE5DA',
		color: Colors.accent,
		fontFamily: Fonts.sans,
		fontSize: 13,
		lineHeight: 19,
		textAlign: 'center',
	},
	linkButton: {
		alignItems: 'center',
	},
	link: {
		color: Colors.accent,
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '600',
	},
	mutedLink: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 14,
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
