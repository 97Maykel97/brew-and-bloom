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
} from '@/features/auth/lib/auth-errors';
import {
	isValidEmail,
	normalizeEmail,
} from '@/features/auth/lib/auth-validation';
import { registerCurrentWebDevice } from '@/features/auth/lib/register-current-device';
import { createClient } from '@/lib/supabase/client';

export default function LoginScreen() {
	const { locale } = useParams<{ locale: string }>();
	const router = useRouter();
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
		const normalizedEmail = normalizeEmail(email);

		if (!normalizedEmail || !password) {
			setMessage(getAuthValidationMessage('requiredFields', locale));
			return;
		}

		if (!isValidEmail(normalizedEmail)) {
			setMessage(getAuthValidationMessage('invalidEmail', locale));
			return;
		}

		setIsLoading(true);

		try {
			const supabase = createClient();
			const { error } = await supabase.auth.signInWithPassword({
				email: normalizedEmail,
				password,
			});

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			await registerCurrentWebDevice();
			setEmail('');
			setPassword('');
			router.replace('/' + locale + '/profile');
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

			{message && <AuthMessage>{message}</AuthMessage>}

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
