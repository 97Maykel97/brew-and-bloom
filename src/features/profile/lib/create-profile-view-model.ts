import type { TProfileCopy } from '../profile-copy';
import type { TProfileLocale, TProfileViewModel } from '../types';
import { formatBirthDate, formatPhoneNumber } from './profile-formatters';

type TProfileRecord = {
	first_name?: unknown;
	last_name?: unknown;
	phone?: unknown;
	birth_date?: unknown;
} | null;

type TCreateProfileViewModelOptions = {
	locale: TProfileLocale;
	copy: TProfileCopy;
	profile: TProfileRecord;
	metadata: Record<string, unknown>;
	email?: string;
};

function getString(value: unknown): string {
	return typeof value === 'string' ? value : '';
}

export function createProfileViewModel({
	locale,
	copy,
	profile,
	metadata,
	email,
}: TCreateProfileViewModelOptions): TProfileViewModel {
	const firstName =
		getString(profile?.first_name) || getString(metadata.first_name);
	const lastName =
		getString(profile?.last_name) || getString(metadata.last_name);
	const fullName =
		[firstName, lastName].filter(Boolean).join(' ') ||
		getString(metadata.full_name);
	const phone =
		getString(profile?.phone) || getString(metadata.phone);
	const birthDate = getString(profile?.birth_date);

	return {
		fullName,
		displayName: fullName || copy.welcomeFallback,
		email: email || '—',
		phone: phone ? formatPhoneNumber(phone) : '—',
		birthDate: birthDate ? formatBirthDate(birthDate, locale) : '—',
		bonusPoints:
			typeof metadata.bonus_points === 'number'
				? metadata.bonus_points
				: 0,
	};
}
