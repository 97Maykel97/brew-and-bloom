'use client';

import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
	const { locale } = useParams<{ locale: string }>();
	const t = useTranslations('auth.updatePassword');

	const [password, setPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isComplete, setIsComplete] = useState<boolean>(false);

	async function handleSubmit(
		event: SubmitEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();
		setMessage('');

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
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				setMessage(t('invalidLink'));
				return;
			}

			const { error } = await supabase.auth.updateUser({ password });

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			await supabase.auth.signOut();
			setIsComplete(true);
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
			<p>{t('description')}</p>

			{!isComplete && (
				<form onSubmit={handleSubmit} noValidate>
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

					<label htmlFor='confirm-password'>
						{t('confirmPassword')}
					</label>

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
			)}

			{message && <p>{message}</p>}

			<Link href={`/${locale}/auth/login`}>{t('backToLogin')}</Link>
		</main>
	);
}
