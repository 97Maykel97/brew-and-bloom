import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import AuthField from '@/components/auth/AuthField';
import AuthScreen from '@/components/auth/AuthScreen';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { authTranslations } from '@/i18n/authTranslations';
import { getLocale } from '@/i18n/locale';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);
	const [email, setEmail] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const content = authTranslations[locale];
	const isRtl = locale === 'he';

	function handleLocaleChange(nextLocale: typeof locale) {
		router.setParams({ locale: nextLocale });
	}

	async function handleForgotPassword() {
		setMessage('');
		const normalizedEmail = email.trim();

		if (!normalizedEmail) {
			setMessage(content.form.requiredFields);
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
			setMessage(content.form.invalidEmail);
			return;
		}

		setIsLoading(true);

		try {
			const redirectTo = Linking.createURL('auth/update-password');
			const { error } = await supabase.auth.resetPasswordForEmail(
				normalizedEmail,
				{ redirectTo },
			);

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			setMessage(content.forgotPassword.success);
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
			title={content.forgotPassword.title}
			description={content.forgotPassword.description}
		>
			<AuthField
				label={content.forgotPassword.email}
				isRtl={isRtl}
				keyboardType='email-address'
				autoCapitalize='none'
				autoCorrect={false}
				autoComplete='email'
				value={email}
				onChangeText={setEmail}
			/>
			<AuthSubmitButton
				label={content.forgotPassword.submit}
				loadingLabel={content.forgotPassword.loading}
				isLoading={isLoading}
				onPress={handleForgotPassword}
			/>

			{message ? (
				<Text style={[styles.message, isRtl && styles.rtlText]}>
					{message}
				</Text>
			) : null}

			<Pressable
				onPress={() =>
					router.replace({
						pathname: '/auth/login',
						params: { locale },
					})
				}
				style={styles.linkButton}
			>
				<Text style={[styles.link, isRtl && styles.rtlText]}>
					{content.forgotPassword.backToLogin}
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
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
