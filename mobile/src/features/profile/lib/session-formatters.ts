import type { TLocale } from '@/i18n/languages';

export type TSessionDeviceKind = 'desktop' | 'mobile' | 'tablet' | 'unknown';

type TSessionDeviceLabels = {
	desktop: string;
	mobile: string;
	tablet: string;
	unknown: string;
	mobileApp: string;
};

export type TSessionDeviceInfo = {
	details: string;
	kind: TSessionDeviceKind;
	name: string;
};

export function getSessionDeviceInfo(
	userAgent: string | null,
	labels: TSessionDeviceLabels,
): TSessionDeviceInfo {
	if (!userAgent) {
		return {
			details: '',
			kind: 'unknown',
			name: labels.unknown,
		};
	}

	const isTablet = /iPad|Tablet/i.test(userAgent);
	const isMobile = /Android|iPhone|iPod|Mobile|okhttp|CFNetwork/i.test(
		userAgent,
	);
	const isNativeApp = /Expo|okhttp|CFNetwork|Darwin\//i.test(userAgent);
	const kind: TSessionDeviceKind = isTablet
		? 'tablet'
		: isMobile
			? 'mobile'
			: 'desktop';
	const operatingSystem = getOperatingSystem(userAgent);
	const browser = getBrowser(userAgent);

	return {
		details: [browser, operatingSystem].filter(Boolean).join(' · '),
		kind,
		name: isNativeApp ? labels.mobileApp : labels[kind],
	};
}

export function formatSessionDate(value: string, locale: TLocale): string {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return value;
	}

	const dateLocale =
		locale === 'ru' ? 'ru-RU' : locale === 'he' ? 'he-IL' : 'en-GB';

	return new Intl.DateTimeFormat(dateLocale, {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
}

function getOperatingSystem(userAgent: string): string {
	if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
	if (/Android/i.test(userAgent)) return 'Android';
	if (/Windows/i.test(userAgent)) return 'Windows';
	if (/Mac OS|Macintosh/i.test(userAgent)) return 'macOS';
	if (/Linux/i.test(userAgent)) return 'Linux';

	return '';
}

function getBrowser(userAgent: string): string {
	if (/Edg\//i.test(userAgent)) return 'Microsoft Edge';
	if (/OPR\/|Opera/i.test(userAgent)) return 'Opera';
	if (/Firefox\/|FxiOS\//i.test(userAgent)) return 'Firefox';
	if (/Chrome\/|CriOS\//i.test(userAgent)) return 'Chrome';
	if (/Safari\//i.test(userAgent)) return 'Safari';

	return '';
}
