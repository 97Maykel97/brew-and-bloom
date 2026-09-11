import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import AuthScreen from '@/components/auth/AuthScreen';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { authTranslations } from '@/i18n/authTranslations';
import { getLocale } from '@/i18n/locale';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { supabase } from '@/lib/supabase';

function getUrlParam(url: string, name: string): string | null {
	const match = new RegExp('(?:[?#&])' + name + '=([^&#]*)').exec(url);
	return match?.[1] ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

export default function UpdatePasswordScreen() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);
	const [password, setPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isReady, setIsReady] = useState<boolean>(false);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const content = authTranslations[locale];
	const isRtl = locale === 'he';

	function handleLocaleChange(nextLocale: typeof locale) {
		router.setParams({ locale: nextLocale });
	}

	useEffect(() => {
		let isMounted = true;

		async function processUrl(url: string | null) {
			if (!url) {
				if (isMounted) {
					setMessage(content.updatePassword.invalidLink);
				}
				return;
			}

			const code = getUrlParam(url, 'code');
			const accessToken = getUrlParam(url, 'access_token');
			const refreshToken = getUrlParam(url, 'refresh_token');

			if (code) {
				const { error } = await supabase.auth.exchangeCodeForSession(code);
				if (error && isMounted) {
					setMessage(getAuthErrorMessage(error, locale));
					return;
				}
			} else if (accessToken && refreshToken) {
				const { error } = await supabase.auth.setSession({
					access_token: accessToken,
					refresh_token: refreshToken,
				});
				if (error && isMounted) {
					setMessage(getAuthErrorMessage(error, locale));
					return;
				}
			} else {
				if (isMounted) {
					setMessage(content.updatePassword.invalidLink);
				}
				return;
			}

			if (isMounted) {
				setIsReady(true);
			}
		}

		const subscription = Linking.addEventListener('url', event => {
			void processUrl(event.url);
		});

		void Linking.getInitialURL().then(processUrl);

		return () => {
			isMounted = false;
			subscription.remove();
		};
	}, [content.updatePassword.invalidLink, locale]);

	async function handleUpdatePassword() {
		setMessage('');

		if (!isReady) {
			setMessage(content.updatePassword.invalidLink);
			return;
		}

		if (!password || !confirmPassword) {
			setMessage(content.form.requiredFields);
			return;
		}

		if (password.length < 6) {
			setMessage(content.updatePassword.passwordLength);
			return;
		}

		if (password !== confirmPassword) {
			setMessage(content.updatePassword.passwordMismatch);
			return;
		}

		setIsLoading(true);

		try {
			const { error } = await supabase.auth.updateUser({ password });

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			setMessage(content.updatePassword.success);
			setPassword('');
			setConfirmPassword('');
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
			title={content.updatePassword.title}
			description={content.updatePassword.description}
		>
			<PasswordField
				label={content.updatePassword.password}
				isRtl={isRtl}
				autoComplete='new-password'
				value={password}
				onChangeText={setPassword}
				showPasswordLabel={content.form.showPassword}
				hidePasswordLabel={content.form.hidePassword}
			/>
			<PasswordField
				label={content.updatePassword.confirmPassword}
				isRtl={isRtl}
				autoComplete='new-password'
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				showPasswordLabel={content.form.showPassword}
				hidePasswordLabel={content.form.hidePassword}
			/>
			<AuthSubmitButton
				label={content.updatePassword.submit}
				loadingLabel={content.updatePassword.loading}
				isLoading={isLoading}
				onPress={handleUpdatePassword}
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
					{content.updatePassword.backToLogin}
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
