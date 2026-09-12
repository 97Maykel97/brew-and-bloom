'use client';

import { SubmitEvent, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import AuthField from '@/components/auth/AuthField';
import AuthMessage from '@/components/auth/AuthMessage';
import AuthShell from '@/components/auth/AuthShell';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import {
	getAuthErrorMessage,
	getAuthValidationMessage,
} from '@/lib/auth/getAuthErrorMessage';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
	const { locale } = useParams<{ locale: string }>();
	const t = useTranslations('auth.forgotPassword');

	const [email, setEmail] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleSubmit(
		event: SubmitEvent<HTMLFormElement>,
	): Promise<void> {
		event.preventDefault();
		setMessage('');

		const normalizedEmail = email.trim();

		if (!normalizedEmail) {
			setMessage(getAuthValidationMessage('requiredFields', locale));
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
			setMessage(getAuthValidationMessage('invalidEmail', locale));
			return;
		}

		setIsLoading(true);

		try {
			const supabase = createClient();
			const redirectTo = `${window.location.origin}/${locale}/auth/update-password`;
			const { error } = await supabase.auth.resetPasswordForEmail(
				normalizedEmail,
				{ redirectTo },
			);

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			setEmail('');
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
					{t('backToLogin')}
				</Link>
			</div>
		</AuthShell>
	);
}
