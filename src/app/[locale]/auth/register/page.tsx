'use client';

import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import AuthField from '@/components/auth/AuthField';
import AuthMessage from '@/components/auth/AuthMessage';
import AuthShell from '@/components/auth/AuthShell';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import {
	getAuthErrorMessage,
	getAuthValidationMessage,
} from '@/lib/auth/getAuthErrorMessage';
import { isValidBirthDate } from '@/lib/auth/birthDate';
import { normalizePhone } from '@/lib/auth/normalizePhone';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
	const { locale } = useParams<{ locale: string }>();
	const router = useRouter();
	const t = useTranslations('auth.register');
	const formT = useTranslations('auth.form');

	const [firstName, setFirstName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [birthDate, setBirthDate] = useState<string>('');
	const [phone, setPhone] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleSubmit(
		event: SubmitEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();
		setMessage('');

		if (
			!firstName.trim() ||
			!lastName.trim() ||
			!birthDate ||
			!phone.trim() ||
			!email.trim() ||
			!password ||
			!confirmPassword
		) {
			setMessage(getAuthValidationMessage('requiredFields', locale));
			return;
		}

		if (!isValidBirthDate(birthDate)) {
			setMessage(t('invalidBirthDate'));
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(email)) {
			setMessage(getAuthValidationMessage('invalidEmail', locale));
			return;
		}

		if (password.length < 6) {
			setMessage(t('passwordLength'));
			return;
		}

		if (password !== confirmPassword) {
			setMessage(t('passwordMismatch'));
			return;
		}

		setIsLoading(true);

		try {
			const supabase = createClient();
			const normalizedPhone = normalizePhone(phone);
			const displayName = `${firstName.trim()} ${lastName.trim()}`;

			const { data, error } = await supabase.auth.signUp({
				email: email.trim(),
				password,
				options: {
					data: {
						first_name: firstName.trim(),
						last_name: lastName.trim(),
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
				setMessage(
					getAuthValidationMessage('accountAlreadyExists', locale),
				);
				return;
			}

			setFirstName('');
			setLastName('');
			setBirthDate('');
			setPhone('');
			setEmail('');
			setPassword('');
			setConfirmPassword('');
			router.replace('/' + locale + '/auth/login');
		} catch (error: unknown) {
			setMessage(getAuthErrorMessage(error, locale));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<AuthShell
			locale={locale}
			title={t('title')}
			wide
		>
			<form onSubmit={handleSubmit} noValidate className='space-y-3.5 sm:space-y-4'>
				<div className='grid gap-3.5 sm:grid-cols-2 sm:gap-4'>
					<AuthField
						id='first-name'
						label={t('firstName')}
						type='text'
						value={firstName}
						onChange={event => setFirstName(event.target.value)}
						autoComplete='given-name'
						required
					/>

					<AuthField
						id='last-name'
						label={t('lastName')}
						type='text'
						value={lastName}
						onChange={event => setLastName(event.target.value)}
						autoComplete='family-name'
						required
					/>
				</div>

				<AuthField
					id='birth-date'
					label={t('birthDate')}
					type='date'
					value={birthDate}
					onChange={event => setBirthDate(event.target.value)}
					autoComplete='bday'
					required
				/>

				<AuthField
					id='phone'
					label={t('phone')}
					type='tel'
					value={phone}
					onChange={event => setPhone(event.target.value)}
					placeholder='+972 50 123 4567'
					autoComplete='tel'
					required
				/>

				<AuthField
					id='email'
					label={t('email')}
					type='email'
					value={email}
					onChange={event => setEmail(event.target.value)}
					autoComplete='email'
					required
				/>

				<PasswordField
					id='password'
					label={t('password')}
					value={password}
					onChange={event => setPassword(event.target.value)}
					autoComplete='new-password'
					minLength={6}
					required
					showPasswordLabel={formT('showPassword')}
					hidePasswordLabel={formT('hidePassword')}
				/>

				<PasswordField
					id='confirm-password'
					label={t('confirmPassword')}
					value={confirmPassword}
					onChange={event => setConfirmPassword(event.target.value)}
					autoComplete='new-password'
					minLength={6}
					required
					showPasswordLabel={formT('showPassword')}
					hidePasswordLabel={formT('hidePassword')}
				/>

				<AuthSubmitButton
					label={t('submit')}
					loadingLabel={t('loading')}
					isLoading={isLoading}
				/>
			</form>

			{message && <AuthMessage>{message}</AuthMessage>}

			<div className='mt-5 text-center text-sm text-[var(--muted)]'>
				<Link
					href={`/${locale}/auth/login`}
					className='underline-offset-4 transition hover:text-[var(--foreground)] hover:underline'
				>
					{t('link')}
				</Link>
			</div>
		</AuthShell>
	);
}
