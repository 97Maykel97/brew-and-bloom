'use client';

import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import AuthField from '@/components/auth/AuthField';
import AuthShell from '@/components/auth/AuthShell';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import {
	getAuthErrorMessage,
	getAuthValidationMessage,
} from '@/lib/auth/getAuthErrorMessage';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
	const { locale } = useParams<{ locale: string }>();
	const t = useTranslations('auth.login');
	const formT = useTranslations('auth.form');

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
		<AuthShell
			locale={locale}
			title={t('title')}
		>
			<form onSubmit={handleSubmit} noValidate className='space-y-3.5 sm:space-y-4'>
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
					autoComplete='current-password'
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

			{message && (
				<p
					role='status'
					className='mt-4 rounded-2xl bg-[var(--background)] px-4 py-3 text-center text-sm leading-5 text-[var(--accent)]'
				>
					{message}
				</p>
			)}

			<div className='mt-5 flex flex-col items-center gap-3 text-sm'>
				<Link
					href={`/${locale}/auth/forgot-password`}
					className='font-medium text-[var(--accent)] underline-offset-4 transition hover:underline'
				>
				{t('forgotPassword')}
				</Link>

				<Link
					href={`/${locale}/auth/register`}
					className='text-[var(--muted)] underline-offset-4 transition hover:text-[var(--foreground)] hover:underline'
				>
					{t('link')}
				</Link>
			</div>
		</AuthShell>
	);
}
