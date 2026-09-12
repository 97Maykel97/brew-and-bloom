import type { TLocale } from './translations';

export type TAuthTranslations = {
	login: {
		title: string;
		email: string;
		password: string;
		submit: string;
		loading: string;
		forgotPassword: string;
		registerLink: string;
	};
	register: {
		title: string;
		firstName: string;
		lastName: string;
		birthDate: string;
		phone: string;
		email: string;
		password: string;
		confirmPassword: string;
		submit: string;
		loading: string;
		confirmEmail: string;
		registerSuccess: string;
		invalidBirthDate: string;
		passwordLength: string;
		passwordMismatch: string;
		loginLink: string;
	};
	forgotPassword: {
		title: string;
		description: string;
		email: string;
		submit: string;
		loading: string;
		success: string;
		backToLogin: string;
	};
	updatePassword: {
		title: string;
		description: string;
		password: string;
		confirmPassword: string;
		submit: string;
		loading: string;
		success: string;
		passwordLength: string;
		passwordMismatch: string;
		invalidLink: string;
		backToLogin: string;
	};
	form: {
		showPassword: string;
		hidePassword: string;
		requiredFields: string;
		invalidEmail: string;
		invalidCredentials: string;
		accountAlreadyExists: string;
		phoneAlreadyExists: string;
		emailRateLimit: string;
		genericError: string;
	};
};

export const authTranslations: Record<TLocale, TAuthTranslations> = {
	ru: {
		login: {
			title: 'Войти',
			email: 'Email',
			password: 'Пароль',
			submit: 'Войти',
			loading: 'Входим...',
			forgotPassword: 'Забыли пароль?',
			registerLink: 'Нет аккаунта? Зарегистрироваться',
		},
		register: {
			title: 'Создать аккаунт',
			firstName: 'Имя',
			lastName: 'Фамилия',
			birthDate: 'Дата рождения',
			phone: 'Телефон',
			email: 'Email',
			password: 'Пароль',
			confirmPassword: 'Повторите пароль',
			submit: 'Зарегистрироваться',
			loading: 'Создаём аккаунт...',
			confirmEmail: 'Аккаунт создан. Проверьте почту для подтверждения email.',
			registerSuccess: 'Аккаунт успешно создан.',
			invalidBirthDate: 'Введите корректную дату рождения.',
			passwordLength: 'Пароль должен содержать минимум 6 символов.',
			passwordMismatch: 'Пароли не совпадают.',
			loginLink: 'Уже есть аккаунт? Войти',
		},
		forgotPassword: {
			title: 'Восстановление пароля',
			description: 'Введите email, указанный при регистрации. Мы отправим ссылку для смены пароля.',
			email: 'Email',
			submit: 'Отправить ссылку',
			loading: 'Отправляем...',
			success: 'Если аккаунт с таким email существует, ссылка для восстановления отправлена.',
			backToLogin: 'Вернуться ко входу',
		},
		updatePassword: {
			title: 'Новый пароль',
			description: 'Введите новый пароль для вашего аккаунта.',
			password: 'Новый пароль',
			confirmPassword: 'Повторите новый пароль',
			submit: 'Сохранить пароль',
			loading: 'Сохраняем...',
			success: 'Пароль успешно изменён. Теперь вы можете войти.',
			passwordLength: 'Пароль должен содержать минимум 6 символов.',
			passwordMismatch: 'Пароли не совпадают.',
			invalidLink: 'Ссылка недействительна или устарела. Запросите новую.',
			backToLogin: 'Вернуться ко входу',
		},
		form: {
			showPassword: 'Показать пароль',
			hidePassword: 'Скрыть пароль',
			requiredFields: 'Заполните все поля.',
			invalidEmail: 'Введите корректный email.',
			invalidCredentials: 'Неверный email или пароль.',
			accountAlreadyExists: 'Пользователь с таким email уже зарегистрирован.',
			phoneAlreadyExists: 'Пользователь с таким номером телефона уже существует.',
			emailRateLimit: 'Лимит отправки писем исчерпан. Попробуйте позже.',
			genericError: 'Не удалось выполнить действие. Попробуйте ещё раз.',
		},
	},
	he: {
		login: {
			title: 'התחברות',
			email: 'אימייל',
			password: 'סיסמה',
			submit: 'התחברות',
			loading: 'מתחבר...',
			forgotPassword: 'שכחת את הסיסמה?',
			registerLink: 'אין לך חשבון? הרשמה',
		},
		register: {
			title: 'יצירת חשבון',
			firstName: 'שם פרטי',
			lastName: 'שם משפחה',
			birthDate: 'תאריך לידה',
			phone: 'מספר טלפון',
			email: 'כתובת אימייל',
			password: 'סיסמה',
			confirmPassword: 'אימות סיסמה',
			submit: 'הרשמה',
			loading: 'נרשמים...',
			confirmEmail: 'החשבון נוצר. יש לבדוק את תיבת הדואר כדי לאמת את כתובת האימייל.',
			registerSuccess: 'החשבון נוצר בהצלחה.',
			invalidBirthDate: 'יש להזין תאריך לידה תקין.',
			passwordLength: 'הסיסמה חייבת לכלול לפחות 6 תווים.',
			passwordMismatch: 'הסיסמאות אינן תואמות.',
			loginLink: 'כבר יש לך חשבון? התחברות',
		},
		forgotPassword: {
			title: 'איפוס סיסמה',
			description: 'יש להזין את כתובת האימייל שבה השתמשת להרשמה. נשלח קישור לאיפוס הסיסמה.',
			email: 'כתובת אימייל',
			submit: 'שליחת קישור',
			loading: 'שולחים...',
			success: 'אם קיים חשבון עם כתובת האימייל הזו, נשלח קישור לאיפוס הסיסמה.',
			backToLogin: 'חזרה להתחברות',
		},
		updatePassword: {
			title: 'הגדרת סיסמה חדשה',
			description: 'יש להזין סיסמה חדשה לחשבון.',
			password: 'סיסמה חדשה',
			confirmPassword: 'אימות הסיסמה החדשה',
			submit: 'שמירת הסיסמה',
			loading: 'שומרים...',
			success: 'הסיסמה שונתה בהצלחה. כעת ניתן להתחבר.',
			passwordLength: 'הסיסמה חייבת לכלול לפחות 6 תווים.',
			passwordMismatch: 'הסיסמאות אינן תואמות.',
			invalidLink: 'הקישור אינו תקין או שפג תוקפו. יש לבקש קישור חדש.',
			backToLogin: 'חזרה להתחברות',
		},
		form: {
			showPassword: 'הצגת הסיסמה',
			hidePassword: 'הסתרת הסיסמה',
			requiredFields: 'יש למלא את כל השדות.',
			invalidEmail: 'יש להזין כתובת אימייל תקינה.',
			invalidCredentials: 'כתובת האימייל או הסיסמה שגויות.',
			accountAlreadyExists: 'כבר קיים חשבון עם כתובת האימייל הזו.',
			phoneAlreadyExists: 'כבר קיים חשבון עם מספר הטלפון הזה.',
			emailRateLimit: 'מכסת שליחת האימיילים מוצתה. יש לנסות שוב מאוחר יותר.',
			genericError: 'לא ניתן להשלים את הפעולה. יש לנסות שוב.',
		},
	},
	en: {
		login: {
			title: 'Sign in',
			email: 'Email',
			password: 'Password',
			submit: 'Sign in',
			loading: 'Signing in...',
			forgotPassword: 'Forgot your password?',
			registerLink: "Don't have an account? Create one",
		},
		register: {
			title: 'Create an account',
			firstName: 'First name',
			lastName: 'Last name',
			birthDate: 'Date of birth',
			phone: 'Phone',
			email: 'Email',
			password: 'Password',
			confirmPassword: 'Confirm password',
			submit: 'Create account',
			loading: 'Creating account...',
			confirmEmail: 'Account created. Check your email to confirm your address.',
			registerSuccess: 'Account created successfully.',
			invalidBirthDate: 'Enter a valid date of birth.',
			passwordLength: 'Password must contain at least 6 characters.',
			passwordMismatch: 'Passwords do not match.',
			loginLink: 'Already have an account? Sign in',
		},
		forgotPassword: {
			title: 'Reset your password',
			description: "Enter the email address you used to register. We'll send you a password reset link.",
			email: 'Email',
			submit: 'Send reset link',
			loading: 'Sending...',
			success: 'If an account with this email exists, a password reset link has been sent.',
			backToLogin: 'Back to sign in',
		},
		updatePassword: {
			title: 'Set a new password',
			description: 'Enter a new password for your account.',
			password: 'New password',
			confirmPassword: 'Confirm new password',
			submit: 'Save password',
			loading: 'Saving...',
			success: 'Your password has been changed. You can now sign in.',
			passwordLength: 'Password must contain at least 6 characters.',
			passwordMismatch: 'Passwords do not match.',
			invalidLink: 'This link is invalid or has expired. Request a new one.',
			backToLogin: 'Back to sign in',
		},
		form: {
			showPassword: 'Show password',
			hidePassword: 'Hide password',
			requiredFields: 'Fill in all fields.',
			invalidEmail: 'Enter a valid email address.',
			invalidCredentials: 'Invalid email or password.',
			accountAlreadyExists: 'An account with this email already exists.',
			phoneAlreadyExists: 'An account with this phone number already exists.',
			emailRateLimit: 'The email sending limit has been reached. Please try again later.',
			genericError: 'Something went wrong. Please try again.',
		},
	},
};
