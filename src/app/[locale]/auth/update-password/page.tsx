'use client';

import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import AuthMessage from '@/components/auth/AuthMessage';
import AuthShell from '@/components/auth/AuthShell';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { createClient } from '@/lib/supabase/client';

export default function UpdatePasswordPage() {
	const { locale } = useParams<{ locale: string }>();
	const t = useTranslations('auth.updatePassword');
	const formT = useTranslations('auth.form');

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

			setPassword('');
			setConfirmPassword('');
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
		<AuthShell
			locale={locale}
			title={t('title')}
			description={t('description')}
		>
			{!isComplete && (
				<form onSubmit={handleSubmit} noValidate className='space-y-3.5 sm:space-y-4'>
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
			)}

			{message && <AuthMessage>{message}</AuthMessage>}

			<div className='mt-5 text-center text-sm text-[var(--muted)]'>
				<Link
					href={`/${locale}/auth/login`}
					className='underline-offset-4 transition hover:text-[var(--foreground)] hover:underline'
				>
					{t('backToLogin')}
				</Link>
			</div>
		</AuthShell>
	);
}
