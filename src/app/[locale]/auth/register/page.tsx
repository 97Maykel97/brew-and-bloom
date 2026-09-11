'use client';

import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import {
	getAuthErrorMessage,
	getAuthValidationMessage,
} from '@/lib/auth/getAuthErrorMessage';
import { normalizePhone } from '@/lib/auth/normalizePhone';
import { createClient } from '@/lib/supabase/client';

function isValidBirthDate(value: string): boolean {
	const [year, month, day] = value.split('-').map(Number);
	const birthDate = new Date(year, month - 1, day);
	const today = new Date();
	const oldestAllowedDate = new Date(
		today.getFullYear() - 120,
		today.getMonth(),
		today.getDate(),
	);

	return (
		Number.isInteger(year) &&
		Number.isInteger(month) &&
		Number.isInteger(day) &&
		birthDate.getFullYear() === year &&
		birthDate.getMonth() === month - 1 &&
		birthDate.getDate() === day &&
		birthDate <= today &&
		birthDate >= oldestAllowedDate
	);
}

export default function RegisterPage() {
	const { locale } = useParams<{ locale: string }>();
	const t = useTranslations('auth.register');

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

			if (!data.session) {
				setMessage(t('confirmEmail'));
				return;
			}

			setMessage(t('success'));
		} catch (error: unknown) {
			setMessage(getAuthErrorMessage(error, locale));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<main>
			<div className='flex justify-end p-4'>
				<LanguageSwitcher locale={locale} />
			</div>

			<h1>{t('title')}</h1>

			<form onSubmit={handleSubmit} noValidate>
				<label htmlFor='first-name'>{t('firstName')}</label>

				<input
					id='first-name'
					type='text'
					value={firstName}
					onChange={event => setFirstName(event.target.value)}
					autoComplete='given-name'
					required
				/>

				<label htmlFor='last-name'>{t('lastName')}</label>

				<input
					id='last-name'
					type='text'
					value={lastName}
					onChange={event => setLastName(event.target.value)}
					autoComplete='family-name'
					required
				/>

				<label htmlFor='birth-date'>{t('birthDate')}</label>

				<input
					id='birth-date'
					type='date'
					value={birthDate}
					onChange={event => setBirthDate(event.target.value)}
					autoComplete='bday'
					required
				/>

				<label htmlFor='phone'>{t('phone')}</label>

				<input
					id='phone'
					type='tel'
					value={phone}
					onChange={event => setPhone(event.target.value)}
					placeholder='+972 50 123 4567'
					autoComplete='tel'
					required
				/>

				<label htmlFor='email'>{t('email')}</label>

				<input
					id='email'
					type='email'
					value={email}
					onChange={event => setEmail(event.target.value)}
					autoComplete='email'
					required
				/>

				<label htmlFor='password'>{t('password')}</label>

				<input
					id='password'
					type='password'
					value={password}
					onChange={event => setPassword(event.target.value)}
					autoComplete='new-password'
					minLength={6}
					required
				/>

				<label htmlFor='confirm-password'>{t('confirmPassword')}</label>

				<input
					id='confirm-password'
					type='password'
					value={confirmPassword}
					onChange={event => setConfirmPassword(event.target.value)}
					autoComplete='new-password'
					minLength={6}
					required
				/>

				<button type='submit' disabled={isLoading}>
					{isLoading ? t('loading') : t('submit')}
				</button>
			</form>

			{message && <p>{message}</p>}

			<Link href={`/${locale}/auth/login`}>{t('link')}</Link>
		</main>
	);
}
