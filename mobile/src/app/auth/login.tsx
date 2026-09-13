import {
	router,
	useLocalSearchParams,
} from 'expo-router';
import { useState } from 'react';

import AuthField from '@/components/auth/AuthField';
import AuthMessage from '@/components/auth/AuthMessage';
import AuthScreen from '@/components/auth/AuthScreen';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import AuthTextLink from '@/components/auth/AuthTextLink';
import PasswordField from '@/components/auth/PasswordField';
import { authTranslations } from '@/i18n/authTranslations';
import { getLocale } from '@/i18n/locale';
import { createLocalizedHref } from '@/lib/createLocalizedHref';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { registerCurrentMobileDevice } from '@/lib/auth/registerCurrentDevice';
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

			await registerCurrentMobileDevice();
			setEmail('');
			setPassword('');
			router.replace(createLocalizedHref('/profile', locale));
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

			{message ? <AuthMessage isRtl={isRtl}>{message}</AuthMessage> : null}

			<AuthTextLink
				isRtl={isRtl}
				label={content.login.forgotPassword}
				onPress={() =>
					router.push({
						pathname: '/auth/forgot-password',
						params: { locale },
					})
				}
			/>
			<AuthTextLink
				isRtl={isRtl}
				label={content.login.registerLink}
				onPress={() =>
					router.push({
						pathname: '/auth/register',
						params: { locale },
					})
				}
				tone='muted'
			/>
		</AuthScreen>
	);
}
