import type { TLocale } from '@/i18n/translations';

export function getAuthErrorMessage(
	error: unknown,
	locale: TLocale,
): string {
	const message =
		typeof error === 'object' && error !== null && 'message' in error
			? String(error.message).toLowerCase()
			: '';
	const code =
		typeof error === 'object' && error !== null && 'code' in error
			? String(error.code).toLowerCase()
			: '';

	const messages = {
		ru: {
			invalidCredentials: 'Неверный email или пароль.',
			accountAlreadyExists: 'Пользователь с таким email уже зарегистрирован.',
			phoneAlreadyExists: 'Пользователь с таким номером телефона уже существует.',
			emailRateLimit: 'Лимит отправки писем исчерпан. Попробуйте позже.',
			generic: 'Не удалось выполнить действие. Попробуйте ещё раз.',
		},
		en: {
			invalidCredentials: 'Invalid email or password.',
			accountAlreadyExists: 'An account with this email already exists.',
			phoneAlreadyExists: 'An account with this phone number already exists.',
			emailRateLimit: 'The email sending limit has been reached. Please try again later.',
			generic: 'Something went wrong. Please try again.',
		},
		he: {
			invalidCredentials: 'כתובת האימייל או הסיסמה שגויות.',
			accountAlreadyExists: 'כבר קיים חשבון עם כתובת האימייל הזו.',
			phoneAlreadyExists: 'כבר קיים חשבון עם מספר הטלפון הזה.',
			emailRateLimit: 'מכסת שליחת האימיילים מוצתה. יש לנסות שוב מאוחר יותר.',
			generic: 'לא ניתן להשלים את הפעולה. יש לנסות שוב.',
		},
	} as const;

	const localized = messages[locale];

	if (
		code === 'invalid_credentials' ||
		message.includes('invalid login credentials')
	) {
		return localized.invalidCredentials;
	}

	if (
		code === 'email_exists' ||
		code === 'user_already_exists' ||
		code === 'identity_already_exists' ||
		message.includes('already registered') ||
		message.includes('already exists')
	) {
		return localized.accountAlreadyExists;
	}

	if (code === 'phone_exists' || message.includes('phone_already_exists')) {
		return localized.phoneAlreadyExists;
	}

	if (
		code === 'over_email_send_rate_limit' ||
		message.includes('email rate limit exceeded')
	) {
		return localized.emailRateLimit;
	}

	return localized.generic;
}
