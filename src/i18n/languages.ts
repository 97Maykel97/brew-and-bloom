export const locales = ['ru', 'en', 'he'] as const;

export type TLocale = (typeof locales)[number];

export type TLanguageOption = {
	code: TLocale;
	label: string;
	name: string;
};

export const languageOptions: TLanguageOption[] = [
	{ code: 'ru', label: 'RU', name: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
	{ code: 'en', label: 'EN', name: 'English' },
	{ code: 'he', label: 'HE', name: '\u05e2\u05d1\u05e8\u05d9\u05ea' },
];

export function isSupportedLocale(value: string): value is TLocale {
	return languageOptions.some(option => option.code === value);
}
