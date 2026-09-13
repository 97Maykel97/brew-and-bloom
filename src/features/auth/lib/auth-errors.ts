import { isSupportedLocale, type TLocale } from '@/i18n/languages';

type TAuthError = {
	code?: string;
	message?: string;
	name?: string;
};

function normalizeAuthError(error: unknown): TAuthError {
	if (typeof error !== 'object' || error === null) {
		return {};
	}

	const candidate = error as TAuthError;

	return {
		code: typeof candidate.code === 'string' ? candidate.code : undefined,
		message:
			typeof candidate.message === 'string'
				? candidate.message
				: undefined,
		name: typeof candidate.name === 'string' ? candidate.name : undefined,
	};
}

type TAuthErrorMessageKey =
	| 'requiredFields'
	| 'invalidCredentials'
	| 'emailNotConfirmed'
	| 'accountAlreadyExists'
	| 'invalidEmail'
	| 'weakPassword'
	| 'signupDisabled'
	| 'emailProviderDisabled'
	| 'emailNotAuthorized'
	| 'emailRateLimit'
	| 'requestRateLimit'
	| 'smsRateLimit'
	| 'phoneAlreadyExists'
	| 'phoneNotConfirmed'
	| 'phoneProviderDisabled'
	| 'verificationExpired'
	| 'sessionExpired'
	| 'userNotFound'
	| 'userBanned'
	| 'captchaFailed'
	| 'requestTimeout'
	| 'samePassword'
	| 'providerDisabled'
	| 'reauthenticationNeeded'
	| 'invalidVerificationCode'
	| 'invalidData'
	| 'accessDenied'
	| 'conflict'
	| 'serverUnavailable'
	| 'network'
	| 'generic';

const errorMessages: Record<
	TLocale,
	Record<TAuthErrorMessageKey, string>
> = {
	ru: {
		requiredFields: 'Заполните все поля.',
		invalidCredentials: 'Неверный email или пароль.',
		emailNotConfirmed: 'Подтвердите email перед входом.',
		accountAlreadyExists:
			'Пользователь с таким email или телефоном уже зарегистрирован.',
		invalidEmail: 'Введите корректный email.',
		weakPassword: 'Пароль слишком простой. Используйте более надёжный пароль.',
		signupDisabled: 'Регистрация временно недоступна.',
		emailProviderDisabled: 'Регистрация по email временно недоступна.',
		emailNotAuthorized:
			'На этот email пока нельзя отправить письмо. Обратитесь к администратору.',
		emailRateLimit: 'Лимит отправки писем исчерпан. Попробуйте позже.',
		requestRateLimit:
			'Слишком много запросов. Попробуйте через несколько минут.',
		smsRateLimit:
			'Слишком много SMS отправлено на этот номер. Попробуйте позже.',
		phoneAlreadyExists: 'Пользователь с таким номером телефона уже существует.',
		phoneNotConfirmed: 'Подтвердите номер телефона перед входом.',
		phoneProviderDisabled: 'Регистрация по номеру телефона временно недоступна.',
		verificationExpired:
			'Ссылка или код подтверждения устарели. Запросите новые.',
		sessionExpired: 'Сессия истекла. Войдите снова.',
		userNotFound: 'Пользователь не найден.',
		userBanned: 'Доступ к аккаунту временно ограничен.',
		captchaFailed: 'Не удалось пройти проверку безопасности. Попробуйте ещё раз.',
		requestTimeout: 'Сервер не успел ответить. Попробуйте ещё раз.',
		samePassword: 'Новый пароль должен отличаться от нового.',
		providerDisabled: 'Этот способ входа временно недоступен.',
		reauthenticationNeeded: 'Для продолжения войдите в аккаунт ещё раз.',
		invalidVerificationCode: 'Неверный код подтверждения. Запросите новый код.',
		invalidData: 'Проверьте введённые данные.',
		accessDenied: 'У вас нет доступа для выполнения этого действия.',
		conflict: 'Запрос уже обрабатывается. Попробуйте ещё раз.',
		serverUnavailable: 'Сервис авторизации временно недоступен. Попробуйте позже.',
		network: 'Не удалось подключиться к серверу. Проверьте интернет-соединение.',
		generic: 'Не удалось выполнить действие. Попробуйте ещё раз.',
	},
	en: {
		requiredFields: 'Fill in all fields.',
		invalidCredentials: 'Invalid email or password.',
		emailNotConfirmed: 'Confirm your email before signing in.',
		accountAlreadyExists:
			'An account with this email or phone number already exists.',
		invalidEmail: 'Enter a valid email address.',
		weakPassword: 'The password is too weak. Choose a stronger password.',
		signupDisabled: 'Registration is temporarily unavailable.',
		emailProviderDisabled: 'Email registration is temporarily unavailable.',
		emailNotAuthorized:
			'Emails cannot currently be sent to this address. Contact the administrator.',
		emailRateLimit:
			'The email sending limit has been reached. Please try again later.',
		requestRateLimit:
			'Too many requests. Please try again in a few minutes.',
		smsRateLimit:
			'Too many text messages have been sent to this number. Please try again later.',
		phoneAlreadyExists: 'An account with this phone number already exists.',
		phoneNotConfirmed: 'Confirm your phone number before signing in.',
		phoneProviderDisabled: 'Phone registration is temporarily unavailable.',
		verificationExpired:
			'The confirmation link or code has expired. Request a new one.',
		sessionExpired: 'Your session has expired. Please sign in again.',
		userNotFound: 'User not found.',
		userBanned: 'Access to this account is temporarily restricted.',
		captchaFailed: 'The security check failed. Please try again.',
		requestTimeout: 'The server did not respond in time. Please try again.',
		samePassword: 'The new password must be different from the new one.',
		providerDisabled: 'This sign-in method is temporarily unavailable.',
		reauthenticationNeeded: 'Please sign in again to continue.',
		invalidVerificationCode:
			'The confirmation code is invalid. Request a new code.',
		invalidData: 'Check the information you entered.',
		accessDenied: 'You do not have permission to perform this action.',
		conflict: 'The request is already being processed. Please try again.',
		serverUnavailable:
			'The authentication service is temporarily unavailable. Please try again later.',
		network: 'Unable to connect to the server. Check your internet connection.',
		generic: 'Something went wrong. Please try again.',
	},
	he: {
		requiredFields: 'יש למלא את כל השדות.',
		invalidCredentials: 'כתובת האימייל או הסיסמה שגויות.',
		emailNotConfirmed: 'יש לאמת את כתובת האימייל לפני ההתחברות.',
		accountAlreadyExists: 'כבר קיים חשבון עם כתובת האימייל או מספר הטלפון האלה.',
		invalidEmail: 'יש להזין כתובת אימייל תקינה.',
		weakPassword: 'הסיסמה חלשה מדי. יש לבחור סיסמה חזקה יותר.',
		signupDisabled: 'ההרשמה אינה זמינה כרגע.',
		emailProviderDisabled: 'ההרשמה באמצעות אימייל אינה זמינה כרגע.',
		emailNotAuthorized:
			'לא ניתן לשלוח כרגע הודעה לכתובת הזו. יש לפנות למנהל המערכת.',
		emailRateLimit: 'מכסת שליחת האימיילים מוצתה. יש לנסות שוב מאוחר יותר.',
		requestRateLimit: 'נשלחו יותר מדי בקשות. נסה שוב בעוד כמה דקות.',
		smsRateLimit: 'נשלחו יותר מדי הודעות SMS למספר הזה. נסה שוב מאוחר יותר.',
		phoneAlreadyExists: 'כבר קיים חשבון עם מספר הטלפון הזה.',
		phoneNotConfirmed: 'יש לאמת את מספר הטלפון לפני ההתחברות.',
		phoneProviderDisabled: 'ההרשמה באמצעות מספר טלפון אינה זמינה כרגע.',
		verificationExpired: 'תוקף הקישור או הקוד פג. יש לבקש קוד חדש.',
		sessionExpired: 'תוקף ההתחברות פג. יש להתחבר מחדש.',
		userNotFound: 'המשתמש לא נמצא.',
		userBanned: 'הגישה לחשבון הזה הוגבלה באופן זמני.',
		captchaFailed: 'אימות האבטחה נכשל. יש לנסות שוב.',
		requestTimeout: 'השרת לא הגיב בזמן. יש לנסות שוב.',
		samePassword: 'הסיסמה החדשה חייבת להיות שונה מהסיסמה החדשה.',
		providerDisabled: 'שיטת ההתחברות הזו אינה זמינה כרגע.',
		reauthenticationNeeded: 'כדי להמשיך יש להתחבר מחדש.',
		invalidVerificationCode: 'קוד האימות שגוי. יש לבקש קוד חדש.',
		invalidData: 'יש לבדוק את הפרטים שהוזנו.',
		accessDenied: 'אין לך הרשאה לבצע את הפעולה הזו.',
		conflict: 'הבקשה כבר נמצאת בטיפול. יש לנסות שוב.',
		serverUnavailable: 'שירות ההתחברות אינו זמין כרגע. יש לנסות שוב מאוחר יותר.',
		network: 'לא ניתן להתחבר לשרת. יש לבדוק את החיבור לאינטרנט.',
		generic: 'לא ניתן להשלים את הפעולה. יש לנסות שוב.',
	},
};

const errorCodeToMessageKey: Partial<
	Record<string, TAuthErrorMessageKey>
> = {
	invalid_credentials: 'invalidCredentials',
	email_not_confirmed: 'emailNotConfirmed',
	email_exists: 'accountAlreadyExists',
	phone_exists: 'phoneAlreadyExists',
	user_already_exists: 'accountAlreadyExists',
	identity_already_exists: 'accountAlreadyExists',
	email_address_invalid: 'invalidEmail',
	weak_password: 'weakPassword',
	signup_disabled: 'signupDisabled',
	email_provider_disabled: 'emailProviderDisabled',
	email_address_not_authorized: 'emailNotAuthorized',
	over_email_send_rate_limit: 'emailRateLimit',
	over_request_rate_limit: 'requestRateLimit',
	over_sms_send_rate_limit: 'smsRateLimit',
	phone_not_confirmed: 'phoneNotConfirmed',
	phone_provider_disabled: 'phoneProviderDisabled',
	otp_expired: 'verificationExpired',
	invite_not_found: 'verificationExpired',
	flow_state_expired: 'verificationExpired',
	session_expired: 'sessionExpired',
	session_not_found: 'sessionExpired',
	refresh_token_not_found: 'sessionExpired',
	refresh_token_already_used: 'sessionExpired',
	flow_state_not_found: 'sessionExpired',
	user_not_found: 'userNotFound',
	user_banned: 'userBanned',
	captcha_failed: 'captchaFailed',
	request_timeout: 'requestTimeout',
	same_password: 'samePassword',
	provider_disabled: 'providerDisabled',
	oauth_provider_not_supported: 'providerDisabled',
	reauthentication_needed: 'reauthenticationNeeded',
	reauthentication_not_valid: 'invalidVerificationCode',
	mfa_verification_failed: 'invalidVerificationCode',
	validation_failed: 'invalidData',
	bad_json: 'invalidData',
	no_authorization: 'accessDenied',
	not_admin: 'accessDenied',
	insufficient_aal: 'accessDenied',
	conflict: 'conflict',
	unexpected_failure: 'serverUnavailable',
};

function getLocale(locale: string): TLocale {
	return isSupportedLocale(locale) ? locale : 'ru';
}

export function getAuthValidationMessage(
	key:
		| 'requiredFields'
		| 'invalidEmail'
		| 'accountAlreadyExists'
		| 'phoneAlreadyExists',
	locale: string,
): string {
	return errorMessages[getLocale(locale)][key];
}

function getMessageKeyFromText(
	errorText: string,
	errorName: string,
): TAuthErrorMessageKey | undefined {
	if (
		errorName.includes('fetch') ||
		errorText.includes('failed to fetch') ||
		errorText.includes('network request failed') ||
		errorText.includes('networkerror')
	) {
		return 'network';
	}

	if (errorText.includes('email rate limit exceeded')) {
		return 'emailRateLimit';
	}

	if (errorText.includes('sms rate limit exceeded')) {
		return 'smsRateLimit';
	}

	if (errorText.includes('phone_already_exists')) {
		return 'phoneAlreadyExists';
	}

	if (errorText.includes('rate limit exceeded')) {
		return 'requestRateLimit';
	}

	if (errorText.includes('invalid login credentials')) {
		return 'invalidCredentials';
	}

	if (errorText.includes('email not confirmed')) {
		return 'emailNotConfirmed';
	}

	if (
		errorText.includes('user already registered') ||
		errorText.includes('already been registered') ||
		errorText.includes('already exists')
	) {
		return 'accountAlreadyExists';
	}

	if (
		errorText.includes('invalid email') ||
		errorText.includes('email address is invalid')
	) {
		return 'invalidEmail';
	}

	if (
		errorText.includes('password should be at least') ||
		errorText.includes('weak password')
	) {
		return 'weakPassword';
	}

	if (
		errorText.includes('signup is disabled') ||
		errorText.includes('signups not allowed')
	) {
		return 'signupDisabled';
	}

	if (
		errorText.includes('otp expired') ||
		errorText.includes('token has expired')
	) {
		return 'verificationExpired';
	}

	if (errorText.includes('captcha')) {
		return 'captchaFailed';
	}

	if (errorText.includes('timeout')) {
		return 'requestTimeout';
	}

	return undefined;
}

export function getAuthErrorMessage(
	error: unknown,
	locale: string,
): string {
	const authError = normalizeAuthError(error);
	const messages = errorMessages[getLocale(locale)];
	const errorCode = authError.code?.toLowerCase();
	const messageKey = errorCode
		? errorCodeToMessageKey[errorCode]
		: undefined;

	if (messageKey) {
		return messages[messageKey];
	}

	const fallbackMessageKey = getMessageKeyFromText(
		authError.message?.toLowerCase() ?? '',
		authError.name?.toLowerCase() ?? '',
	);

	return fallbackMessageKey
		? messages[fallbackMessageKey]
		: messages.generic;
}
