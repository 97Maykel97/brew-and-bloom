import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useState } from 'react';

import AuthField from '@/components/auth/AuthField';
import AuthMessage from '@/components/auth/AuthMessage';
import AuthScreen from '@/components/auth/AuthScreen';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import AuthTextLink from '@/components/auth/AuthTextLink';
import { authTranslations } from '@/i18n/authTranslations';
import { getLocale } from '@/i18n/locale';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { supabase } from '@/lib/supabase';
import {
	isValidEmail,
	normalizeEmail,
} from '@/features/auth/lib/auth-validation';

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
		const normalizedEmail = normalizeEmail(email);

		if (!normalizedEmail) {
			setMessage(content.form.requiredFields);
			return;
		}

		if (!isValidEmail(normalizedEmail)) {
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

			setEmail('');
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

			{message ? <AuthMessage isRtl={isRtl}>{message}</AuthMessage> : null}

			<AuthTextLink
				isRtl={isRtl}
				label={content.forgotPassword.backToLogin}
				onPress={() =>
					router.replace({
						pathname: '/auth/login',
						params: { locale },
					})
				}
			/>
		</AuthScreen>
	);
}
