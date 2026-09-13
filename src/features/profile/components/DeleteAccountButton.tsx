'use client';

import { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import type { TProfileCopy } from '../profile-copy';
import type { TProfileLocale } from '../types';

type TDeleteAccountButtonProps = {
	copy: TProfileCopy;
	locale: TProfileLocale;
};

type TDeleteStep = 'password' | 'code';

export default function DeleteAccountButton({
	copy,
	locale,
}: TDeleteAccountButtonProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<TDeleteStep>('password');
	const [password, setPassword] = useState('');
	const [code, setCode] = useState('');
	const [message, setMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	function openConfirmation() {
		setIsOpen(true);
		setStep('password');
		setPassword('');
		setCode('');
		setMessage('');
	}

	function closeConfirmation() {
		if (isLoading) return;
		setIsOpen(false);
		setMessage('');
	}

	async function sendCode(event: { preventDefault: () => void }) {
		event.preventDefault();
		if (!password || isLoading) return;

		setIsLoading(true);
		setMessage('');

		try {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user?.email) {
				setMessage(copy.deleteError);
				return;
			}

			const { error: passwordError } =
				await supabase.auth.signInWithPassword({
					email: user.email,
					password,
				});

			if (passwordError) {
				setMessage(copy.invalidPassword);
				return;
			}

			const { error: codeError } = await supabase.auth.signInWithOtp({
				email: user.email,
				options: { shouldCreateUser: false },
			});

			if (codeError) {
				setMessage(copy.deleteError);
				return;
			}

			setStep('code');
			setMessage(copy.codeSent);
		} catch {
			setMessage(copy.deleteError);
		} finally {
			setIsLoading(false);
		}
	}

	async function confirmDeletion(event: { preventDefault: () => void }) {
		event.preventDefault();
		if (!code || isLoading) return;

		setIsLoading(true);
		setMessage('');

		try {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user?.email) {
				setMessage(copy.deleteError);
				return;
			}

			const { error: verificationError } = await supabase.auth.verifyOtp({
				email: user.email,
				token: code.trim(),
				type: 'email',
			});

			if (verificationError) {
				setMessage(copy.invalidCode);
				return;
			}

			const { error: deleteError } = await supabase.rpc(
				'delete_current_user',
			);

			if (deleteError) {
				setMessage(copy.deleteError);
				return;
			}

			await supabase.auth.signOut();
			router.replace('/' + locale + '/auth/login');
		} catch {
			setMessage(copy.deleteError);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div>
			<button
				type='button'
				disabled={isLoading}
				onClick={openConfirmation}
				className='flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-red-100 bg-red-50/45 px-4 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 sm:px-5'
			>
				<Trash2 size={19} strokeWidth={1.7} />
				<span>{copy.deleteAccount}</span>
			</button>

			{isOpen ? (
				<div className='mt-3 rounded-xl border border-red-100 bg-red-50/45 p-4 sm:p-5'>
					<div className='flex items-start justify-between gap-3'>
						<div>
							<h3 className='text-sm font-semibold text-red-600'>
								{copy.deleteAccount}
							</h3>
							<p className='mt-1 text-sm leading-6 text-[var(--muted)]'>
								{copy.deleteConfirm}
							</p>
						</div>
						<button
							type='button'
							onClick={closeConfirmation}
							aria-label={copy.cancel}
							className='cursor-pointer rounded-full p-1 text-[var(--muted)] transition hover:bg-white hover:text-[var(--foreground)] disabled:cursor-wait'
							disabled={isLoading}
						>
							<X size={18} />
						</button>
					</div>

					{step === 'password' ? (
						<form onSubmit={sendCode} className='mt-4 space-y-3'>
							<label className='grid gap-2 text-sm font-semibold'>
								<span>{copy.currentPassword}</span>
								<input
									type='password'
									value={password}
									onChange={event => setPassword(event.target.value)}
									autoComplete='current-password'
									className='h-12 rounded-xl border border-[#d8cec3] bg-white px-4 outline-none transition focus:border-[var(--accent)]'
								/>
							</label>
							<button
								type='submit'
								disabled={isLoading || !password}
								className='min-h-11 w-full cursor-pointer rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60'
							>
								{isLoading ? copy.verifying : copy.sendCode}
							</button>
						</form>
					) : (
						<form onSubmit={confirmDeletion} className='mt-4 space-y-3'>
							<label className='grid gap-2 text-sm font-semibold'>
								<span>{copy.verificationCode}</span>
								<input
									inputMode='numeric'
									value={code}
									onChange={event => setCode(event.target.value)}
									autoComplete='one-time-code'
									className='h-12 rounded-xl border border-[#d8cec3] bg-white px-4 tracking-[0.25em] outline-none transition focus:border-[var(--accent)]'
								/>
							</label>
							<button
								type='submit'
								disabled={isLoading || !code.trim()}
								className='min-h-11 w-full cursor-pointer rounded-full bg-red-500 px-5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-60'
							>
								{isLoading ? copy.verifying : copy.deleteAccount}
							</button>
						</form>
					)}

					{message ? (
						<p role='alert' className='mt-3 text-sm text-red-600'>
							{message}
						</p>
					) : null}
				</div>
			) : null}
		</div>
	);
}
