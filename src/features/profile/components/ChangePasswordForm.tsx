'use client';

import { SubmitEvent, useState } from 'react';
import { ChevronDown, LockKeyhole } from 'lucide-react';

import PasswordField from '@/components/auth/PasswordField';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { createClient } from '@/lib/supabase/client';
import type { TProfileCopy } from '../profile-copy';
import type { TProfileLocale } from '../types';

type TChangePasswordFormProps = {
	copy: TProfileCopy;
	locale: TProfileLocale;
	initialOpen?: boolean;
};

export default function ChangePasswordForm({
	copy,
	locale,
	initialOpen = false,
}: TChangePasswordFormProps) {
	const [isOpen, setIsOpen] = useState<boolean>(initialOpen);
	const [newPassword, setNewPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isSuccess, setIsSuccess] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
		event.preventDefault();
		setMessage('');
		setIsSuccess(false);

		if (newPassword.length < 6) {
			setMessage(copy.passwordLength);
			return;
		}

		if (newPassword !== confirmPassword) {
			setMessage(copy.passwordMismatch);
			return;
		}

		setIsSaving(true);

		try {
			const supabase = createClient();
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			setNewPassword('');
			setConfirmPassword('');
			setIsSuccess(true);
			setMessage(copy.passwordChanged);
		} catch (error: unknown) {
			setMessage(
				getAuthErrorMessage(error, locale) || copy.passwordChangeError,
			);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<div className='w-full overflow-hidden rounded-xl border border-[#e5dcd3] bg-[#fcfaf7]'>
			<button
				type='button'
				aria-expanded={isOpen}
				onClick={() => setIsOpen(value => !value)}
				className='flex min-h-14 w-full cursor-pointer items-center gap-3 px-4 text-sm font-semibold transition hover:bg-white sm:px-5'
			>
				<LockKeyhole
					size={19}
					className='text-[var(--accent)]'
					strokeWidth={1.7}
				/>
				<span>{copy.changePassword}</span>
				<ChevronDown
					size={18}
					className={
						'ms-auto transition-transform duration-200 ' +
						(isOpen ? 'rotate-180' : '')
					}
				/>
			</button>

			{isOpen ? (
				<form
					onSubmit={handleSubmit}
					className='space-y-4 border-t border-[#e5dcd3] px-4 py-5 sm:px-5'
				>
					<p className='text-sm leading-5 text-[var(--muted)]'>
						{copy.changePasswordDescription}
					</p>
					<PasswordField
						id='profile-new-password'
						label={copy.newPassword}
						value={newPassword}
						onChange={event => setNewPassword(event.target.value)}
						autoComplete='new-password'
						showPasswordLabel={copy.showPassword}
						hidePasswordLabel={copy.hidePassword}
						required
					/>
					<PasswordField
						id='profile-confirm-password'
						label={copy.confirmNewPassword}
						value={confirmPassword}
						onChange={event => setConfirmPassword(event.target.value)}
						autoComplete='new-password'
						showPasswordLabel={copy.showPassword}
						hidePasswordLabel={copy.hidePassword}
						required
					/>

					{message ? (
						<p
							role='status'
							className={
								'rounded-xl px-3 py-2.5 text-center text-sm ' +
								(isSuccess
									? 'bg-emerald-50 text-emerald-700'
									: 'bg-red-50 text-red-600')
							}
						>
							{message}
						</p>
					) : null}

					<button
						type='submit'
						disabled={isSaving}
						className='min-h-12 w-full cursor-pointer rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60'
					>
						{isSaving ? copy.changingPassword : copy.savePassword}
					</button>
				</form>
			) : null}
		</div>
	);
}
