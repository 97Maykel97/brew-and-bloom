import type { TLocale } from '@/i18n/translations';

export function getBirthDateBounds(): {
	minimumDate: Date;
	maximumDate: Date;
} {
	const maximumDate = new Date();
	const minimumDate = new Date(
		maximumDate.getFullYear() - 120,
		maximumDate.getMonth(),
		maximumDate.getDate(),
	);

	return { minimumDate, maximumDate };
}

export function isValidBirthDate(value: string): boolean {
	const [year, month, day] = value.split('-').map(Number);
	const birthDate = new Date(year, month - 1, day);
	const { minimumDate, maximumDate } = getBirthDateBounds();

	return (
		Number.isInteger(year) &&
		Number.isInteger(month) &&
		Number.isInteger(day) &&
		birthDate.getFullYear() === year &&
		birthDate.getMonth() === month - 1 &&
		birthDate.getDate() === day &&
		birthDate <= maximumDate &&
		birthDate >= minimumDate
	);
}

export function formatDateForSupabase(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return [year, month, day].join('-');
}

export function formatDateForDisplay(
	value: string,
	locale: TLocale,
): string {
	const [year, month, day] = value.split('-');

	if (!year || !month || !day) {
		return '';
	}

	return locale === 'en'
		? [month, day, year].join('/')
		: [day, month, year].join('.');
}
