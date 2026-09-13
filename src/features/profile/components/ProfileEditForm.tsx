'use client';

import { useState } from 'react';

import { isValidBirthDate } from '@/features/auth/lib/birth-date';
import { normalizePhone } from '@/features/auth/lib/normalize-phone';
import { createClient } from '@/lib/supabase/client';
import type { TProfileCopy } from '../profile-copy';
import { formatBirthDate, formatPhoneNumber } from '../lib/profile-formatters';
import type { TProfileLocale, TProfileViewModel } from '../types';

type TProfileEditFormProps = {
	copy: TProfileCopy;
	locale: TProfileLocale;
	profile: TProfileViewModel;
	onCancel: () => void;
	onSaved: (profile: TProfileViewModel) => void;
};

export default function ProfileEditForm({
	copy,
	locale,
	profile,
	onCancel,
	onSaved,
}: TProfileEditFormProps) {
	const [firstName, setFirstName] = useState(profile.firstName);
	const [lastName, setLastName] = useState(profile.lastName);
	const [phone, setPhone] = useState(profile.phone.replace(/\D/g, ''));
	const [birthDate, setBirthDate] = useState(profile.birthDateValue);
	const [message, setMessage] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const isRtl = locale === 'he';

	async function handleSubmit(event: { preventDefault: () => void }) {
		event.preventDefault();
		setMessage('');

		const normalizedFirstName = firstName.trim();
		const normalizedLastName = lastName.trim();
		const normalizedPhone = normalizePhone(phone);

		if (
			!normalizedFirstName ||
			!normalizedLastName ||
			!normalizedPhone ||
			!birthDate
		) {
			setMessage(copy.requiredProfileFields);
			return;
		}

		if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
			setMessage(copy.invalidPhone);
			return;
		}

		if (!isValidBirthDate(birthDate)) {
			setMessage(copy.profileUpdateError);
			return;
		}

		setIsSaving(true);

		try {
			const supabase = createClient();
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				setMessage(copy.profileUpdateError);
				return;
			}

			const displayName = `${normalizedFirstName} ${normalizedLastName}`;
			const { error: profileError } = await supabase
				.from('profiles')
				.update({
					first_name: normalizedFirstName,
					last_name: normalizedLastName,
					phone: normalizedPhone,
					birth_date: birthDate,
				})
				.eq('id', user.id);

			if (profileError) {
				setMessage(
					profileError.code === '23505'
						? copy.phoneAlreadyExists
						: copy.profileUpdateError,
				);
				return;
			}

			await supabase.auth.updateUser({
				data: {
					first_name: normalizedFirstName,
					last_name: normalizedLastName,
					full_name: displayName,
					display_name: displayName,
					phone: normalizedPhone,
					birth_date: birthDate,
				},
			});

			onSaved({
				...profile,
				birthDate: formatBirthDate(birthDate, locale),
				birthDateValue: birthDate,
				displayName,
				firstName: normalizedFirstName,
				fullName: displayName,
				lastName: normalizedLastName,
				phone: formatPhoneNumber(normalizedPhone),
			});
		} catch {
			setMessage(copy.profileUpdateError);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className='mt-6 space-y-4'>
			<h3 className='text-lg font-semibold'>{copy.editingProfile}</h3>

			<div className='grid gap-4 sm:grid-cols-2'>
				<label className='grid gap-2 text-sm font-semibold'>
					<span>{copy.firstName}</span>
					<input
						value={firstName}
						onChange={event => setFirstName(event.target.value)}
						className='h-12 rounded-xl border border-[#d8cec3] bg-white px-4 font-normal outline-none transition focus:border-[var(--accent)]'
						dir={isRtl ? 'rtl' : 'ltr'}
					/>
				</label>
				<label className='grid gap-2 text-sm font-semibold'>
					<span>{copy.lastName}</span>
					<input
						value={lastName}
						onChange={event => setLastName(event.target.value)}
						className='h-12 rounded-xl border border-[#d8cec3] bg-white px-4 font-normal outline-none transition focus:border-[var(--accent)]'
						dir={isRtl ? 'rtl' : 'ltr'}
					/>
				</label>
			</div>

			<label className='grid gap-2 text-sm font-semibold'>
				<span>{copy.phone}</span>
				<input
					type='tel'
					value={phone}
					onChange={event => setPhone(event.target.value)}
					className='h-12 rounded-xl border border-[#d8cec3] bg-white px-4 font-normal outline-none transition focus:border-[var(--accent)]'
					inputMode='tel'
				/>
			</label>

			<label className='grid gap-2 text-sm font-semibold'>
				<span>{copy.birthDate}</span>
				<input
					type='date'
					value={birthDate}
					onChange={event => setBirthDate(event.target.value)}
					className='h-12 rounded-xl border border-[#d8cec3] bg-white px-4 font-normal outline-none transition focus:border-[var(--accent)]'
				/>
			</label>

			{message ? (
				<p role='alert' className='text-sm text-red-500'>
					{message}
				</p>
			) : null}

			<div className='flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
				<button
					type='button'
					onClick={onCancel}
					className='min-h-11 rounded-full border border-[#d8cec3] px-5 text-sm font-semibold transition hover:bg-white disabled:opacity-60'
					disabled={isSaving}
				>
					{copy.cancel}
				</button>
				<button
					type='submit'
					disabled={isSaving}
					className='min-h-11 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60'
				>
					{isSaving ? copy.saving : copy.save}
				</button>
			</div>
		</form>
	);
}
