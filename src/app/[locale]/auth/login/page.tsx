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
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
	const { locale } = useParams<{ locale: string }>();
	const t = useTranslations('auth.login');

	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleSubmit(
		event: SubmitEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();
		setMessage('');

		if (!email.trim() || !password) {
			setMessage(getAuthValidationMessage('requiredFields', locale));
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(email)) {
			setMessage(getAuthValidationMessage('invalidEmail', locale));
			return;
		}

		setIsLoading(true);

		try {
			const supabase = createClient();
			const { error } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password,
			});

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
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
					autoComplete='current-password'
					required
				/>

				<button type='submit' disabled={isLoading}>
					{isLoading ? t('loading') : t('submit')}
				</button>
			</form>

			{message && <p>{message}</p>}

			<Link href={`/${locale}/auth/forgot-password`}>
				{t('forgotPassword')}
			</Link>

			<Link href={`/${locale}/auth/register`}>{t('link')}</Link>
		</main>
	);
}
