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
			emailNotConfirmed: 'Подтвердите email перед входом.',
			accountAlreadyExists: 'Пользователь с таким email уже зарегистрирован.',
			phoneAlreadyExists: 'Пользователь с таким номером телефона уже существует.',
			emailRateLimit: 'Лимит отправки писем исчерпан. Попробуйте позже.',
			samePassword: 'Новый пароль должен отличаться от нового.',
			generic: 'Не удалось выполнить действие. Попробуйте ещё раз.',
		},
		en: {
			invalidCredentials: 'Invalid email or password.',
			emailNotConfirmed: 'Please confirm your email before signing in.',
			accountAlreadyExists: 'An account with this email already exists.',
			phoneAlreadyExists: 'An account with this phone number already exists.',
			emailRateLimit: 'The email sending limit has been reached. Please try again later.',
			samePassword: 'The new password must be different from the new one.',
			generic: 'Something went wrong. Please try again.',
		},
		he: {
			invalidCredentials: 'כתובת האימייל או הסיסמה שגויות.',
			emailNotConfirmed: 'יש לאמת את כתובת האימייל לפני ההתחברות.',
			accountAlreadyExists: 'כבר קיים חשבון עם כתובת האימייל הזו.',
			phoneAlreadyExists: 'כבר קיים חשבון עם מספר הטלפון הזה.',
			emailRateLimit: 'מכסת שליחת האימיילים מוצתה. יש לנסות שוב מאוחר יותר.',
			samePassword: 'הסיסמה החדשה חייבת להיות שונה מהסיסמה החדשה.',
			generic: 'לא ניתן להשלים את הפעולה. יש לנסות שוב.',
		},
	} as const;

	const localized = messages[locale];

	if (
		code === 'email_not_confirmed' ||
		message.includes('email not confirmed') ||
		message.includes('email not verified')
	) {
		return localized.emailNotConfirmed;
	}

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

	if (
		code === 'same_password' ||
		message.includes('same password') ||
		message.includes('different from the current password')
	) {
		return localized.samePassword;
	}

	return localized.generic;
}
