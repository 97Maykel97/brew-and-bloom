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
import BirthDateField from '@/components/auth/BirthDateField';
import PasswordField from '@/components/auth/PasswordField';
import { authTranslations } from '@/i18n/authTranslations';
import { getLocale } from '@/i18n/locale';
import { createLocalizedHref } from '@/lib/createLocalizedHref';
import { isValidBirthDate } from '@/lib/auth/birthDate';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { normalizePhone } from '@/lib/auth/normalizePhone';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);
	const content = authTranslations[locale];
	const isRtl = locale === 'he';
	const [firstName, setFirstName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [birthDate, setBirthDate] = useState<string>('');
	const [phone, setPhone] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	function handleLocaleChange(nextLocale: typeof locale) {
		router.setParams({ locale: nextLocale });
	}

	async function handleRegister() {
		setMessage('');
		const normalizedEmail = email.trim();
		const normalizedPhone = normalizePhone(phone);

		if (
			!firstName.trim() ||
			!lastName.trim() ||
			!birthDate ||
			!normalizedPhone ||
			!normalizedEmail ||
			!password ||
			!confirmPassword
		) {
			setMessage(content.form.requiredFields);
			return;
		}

		if (!isValidBirthDate(birthDate)) {
			setMessage(content.register.invalidBirthDate);
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
			setMessage(content.form.invalidEmail);
			return;
		}

		if (password.length < 6) {
			setMessage(content.register.passwordLength);
			return;
		}

		if (password !== confirmPassword) {
			setMessage(content.register.passwordMismatch);
			return;
		}

		setIsLoading(true);

		try {
			const normalizedFirstName = firstName.trim();
			const normalizedLastName = lastName.trim();
			const displayName = [
				normalizedFirstName,
				normalizedLastName,
			].join(' ');
			const { data, error } = await supabase.auth.signUp({
				email: normalizedEmail,
				password,
				options: {
					data: {
						first_name: normalizedFirstName,
						last_name: normalizedLastName,
						full_name: displayName,
						display_name: displayName,
						birth_date: birthDate,
						phone: normalizedPhone,
					},
				},
			});

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			if (data.user?.identities?.length === 0) {
				setMessage(content.form.accountAlreadyExists);
				return;
			}

			if (!data.session) {
				setMessage(content.register.confirmEmail);
				return;
			}

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
			title={content.register.title}
		>
			<AuthField
				label={content.register.firstName}
				isRtl={isRtl}
				autoComplete='given-name'
				value={firstName}
				onChangeText={setFirstName}
			/>
			<AuthField
				label={content.register.lastName}
				isRtl={isRtl}
				autoComplete='family-name'
				value={lastName}
				onChangeText={setLastName}
			/>
			<BirthDateField
				label={content.register.birthDate}
				locale={locale}
				value={birthDate}
				onChange={setBirthDate}
			/>
			<AuthField
				label={content.register.phone}
				isRtl={isRtl}
				keyboardType='phone-pad'
				placeholder='+972 50 123 4567'
				value={phone}
				onChangeText={setPhone}
			/>
			<AuthField
				label={content.register.email}
				isRtl={isRtl}
				keyboardType='email-address'
				autoCapitalize='none'
				autoCorrect={false}
				autoComplete='email'
				value={email}
				onChangeText={setEmail}
			/>
			<PasswordField
				label={content.register.password}
				isRtl={isRtl}
				autoComplete='new-password'
				value={password}
				onChangeText={setPassword}
				showPasswordLabel={content.form.showPassword}
				hidePasswordLabel={content.form.hidePassword}
			/>
			<PasswordField
				label={content.register.confirmPassword}
				isRtl={isRtl}
				autoComplete='new-password'
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				showPasswordLabel={content.form.showPassword}
				hidePasswordLabel={content.form.hidePassword}
			/>
			<AuthSubmitButton
				label={content.register.submit}
				loadingLabel={content.register.loading}
				isLoading={isLoading}
				onPress={handleRegister}
			/>

			{message ? <AuthMessage isRtl={isRtl}>{message}</AuthMessage> : null}

			<AuthTextLink
				isRtl={isRtl}
				label={content.register.loginLink}
				onPress={() =>
					router.replace({
						pathname: '/auth/login',
						params: { locale },
					})
				}
				tone='muted'
			/>
		</AuthScreen>
	);
}
