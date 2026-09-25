import type { TLocale } from '@/i18n/languages';

export type TProfileTranslations = {
	allOrders: string;
	bookings: string;
	events: string;
	birthDate: string;
	bonuses: string;
	bonusDescription: string;
	bonusTab: string;
	bonusText: string;
	bonusTitle: string;
	cancel: string;
	changePassword: string;
	changePasswordDescription: string;
	newPassword: string;
	confirmNewPassword: string;
	savePassword: string;
	changingPassword: string;
	passwordChanged: string;
	passwordLength: string;
	passwordMismatch: string;
	passwordChangeError: string;
	showPassword: string;
	hidePassword: string;
	edit: string;
	deleteAccount: string;
	deleteConfirm: string;
	deleteError: string;
	deleting: string;
	currentPassword: string;
	verificationCode: string;
	sendCode: string;
	codeSent: string;
	invalidPassword: string;
	invalidCode: string;
	verifying: string;
	editingProfile: string;
	emptyBookings: string;
	emptyBookingsText: string;
	emptyFavorites: string;
	emptyFavoritesText: string;
	emptyOrders: string;
	emptyOrdersText: string;
	email: string;
	favorites: string;
	firstName: string;
	greeting: string;
	home: string;
	adminPanel: string;
	adminPanelShort: string;
	loading: string;
	name: string;
	lastName: string;
	orders: string;
	phone: string;
	processingOrders: string;
	preparingOrders: string;
	profileTab: string;
	profileUpdateError: string;
	invalidPhone: string;
	phoneAlreadyExists: string;
	profileUpdated: string;
	requiredProfileFields: string;
	readyOrders: string;
	cancelledOrders: string;
	cancelOrder: string;
	cancelOrderConfirm: string;
	cancellingOrder: string;
	cancelOrderError: string;
	settings: string;
	settingsDescription: string;
	activeDevices: string;
	activeDevicesDescription: string;
	currentDevice: string;
	desktopDevice: string;
	mobileDevice: string;
	tabletDevice: string;
	unknownDevice: string;
	mobileApp: string;
	lastActive: string;
	sessionsLoading: string;
	sessionsError: string;
	noActiveDevices: string;
	signOutAllDevices: string;
	signingOutAllDevices: string;
	otherDevicesSignedOut: string;
	signOutAllDevicesConfirm: string;
	signOutAllDevicesError: string;
	save: string;
	saving: string;
	signOut: string;
	title: string;
	welcome: string;
	completedOrders: string;
};

export const profileTranslations: Record<TLocale, TProfileTranslations> = {
	ru: {
		title: 'Личный кабинет',
		welcome: 'Добро пожаловать',
		greeting: 'Хорошего дня и вкусного кофе',
		profileTab: 'Мой профиль',
		orders: 'Мои заказы',
		bookings: 'Бронирования',
		events: 'Мои события',
		favorites: 'Избранное',
		firstName: 'Имя',
		allOrders: 'Все',
		processingOrders: 'В обработке',
		preparingOrders: 'Готовится',
		readyOrders: 'Готов к выдаче',
		completedOrders: 'Завершённые',
		cancelledOrders: 'Отменённые',
		cancelOrder: 'Отменить заказ',
		cancelOrderConfirm: 'Отменить заказ? После начала приготовления отмена будет недоступна.',
		cancellingOrder: 'Отменяем...',
		cancelOrderError: 'Не удалось отменить заказ.',
		emptyOrders: 'Здесь появятся ваши заказы',
		emptyOrdersText: 'Оформите первый заказ, чтобы увидеть историю.',
		emptyBookings: 'Здесь появятся ваши бронирования',
		emptyBookingsText:
			'Забронируйте столик, чтобы увидеть будущие посещения.',
		emptyFavorites: 'В избранном пока ничего нет',
		emptyFavoritesText:
			'Сохраняйте понравившиеся позиции, чтобы быстро найти их позже.',
		name: 'Имя',
		lastName: 'Фамилия',
		email: 'Email',
		phone: 'Телефон',
		birthDate: 'Дата рождения',
		bonuses: 'бонусов',
		bonusDescription:
			'Получайте 10% от стоимости завершённых заказов бонусами и используйте их при следующих покупках.',
		bonusTab: 'Бонусы',
		bonusText: 'У вас',
		bonusTitle: 'Бонусная программа',
		changePassword: 'Сменить пароль',
		changePasswordDescription:
			'Введите новый пароль для вашего аккаунта.',
		newPassword: 'Новый пароль',
		confirmNewPassword: 'Повторите новый пароль',
		savePassword: 'Сменить пароль',
		changingPassword: 'Сохраняем...',
		passwordChanged: 'Пароль успешно изменён.',
		passwordLength: 'Пароль должен содержать минимум 6 символов.',
		passwordMismatch: 'Пароли не совпадают.',
		passwordChangeError:
			'Не удалось изменить пароль. Попробуйте ещё раз.',
		showPassword: 'Показать пароль',
		hidePassword: 'Скрыть пароль',
		edit: 'Редактировать',
		cancel: 'Отмена',
		deleteAccount: 'Удалить аккаунт',
		deleteConfirm:
			'Удалить аккаунт? Все данные аккаунта будут удалены без возможности восстановления.',
		deleteError: 'Не удалось удалить аккаунт. Попробуйте ещё раз.',
		deleting: 'Удаляем...',
		currentPassword: 'Текущий пароль',
		verificationCode: 'Код из email',
		sendCode: 'Получить код',
		codeSent: 'Код отправлен на вашу почту.',
		invalidPassword: 'Неверный текущий пароль.',
		invalidCode: 'Неверный или просроченный код.',
		verifying: 'Проверяем...',
		editingProfile: 'Редактирование профиля',
		home: 'На главную',
		adminPanel: 'Админ-панель',
		adminPanelShort: 'Админ',
		settings: 'Настройки',
		settingsDescription:
			'Управление безопасностью и вашим аккаунтом.',
		activeDevices: 'Активные устройства',
		activeDevicesDescription:
			'Устройства и браузеры, на которых открыт ваш аккаунт.',
		currentDevice: 'Текущее устройство',
		desktopDevice: 'Компьютер',
		mobileDevice: 'Телефон',
		tabletDevice: 'Планшет',
		unknownDevice: 'Неизвестное устройство',
		mobileApp: 'Мобильное приложение',
		lastActive: 'Последняя активность',
		sessionsLoading: 'Загружаем активные устройства...',
		sessionsError: 'Не удалось загрузить активные устройства.',
		noActiveDevices: 'Активные устройства не найдены.',
		signOutAllDevices: 'Выйти на других устройствах',
		signingOutAllDevices: 'Завершаем другие сеансы...',
		otherDevicesSignedOut: 'На остальных устройствах выполнен выход.',
		signOutAllDevicesConfirm:
			'Выйти из аккаунта на всех остальных устройствах? Текущий сеанс останется активным.',
		signOutAllDevicesError:
			'Не удалось завершить все сеансы. Попробуйте ещё раз.',
		signOut: 'Выйти',
		loading: 'Загрузка...',
		profileUpdateError: 'Не удалось обновить данные профиля.',
		invalidPhone: 'Введите корректный номер телефона.',
		phoneAlreadyExists: 'Этот номер телефона уже используется другим аккаунтом.',
		profileUpdated: 'Данные профиля обновлены.',
		requiredProfileFields: 'Заполните имя, фамилию, телефон и дату рождения.',
		save: 'Сохранить',
		saving: 'Сохраняем...',
	},
	en: {
		title: 'My account',
		welcome: 'Welcome',
		greeting: 'Have a lovely day and a delicious coffee',
		profileTab: 'My profile',
		orders: 'My orders',
		bookings: 'Bookings',
		events: 'My events',
		favorites: 'Favorites',
		firstName: 'First name',
		allOrders: 'All',
		processingOrders: 'In progress',
		preparingOrders: 'Preparing',
		readyOrders: 'Ready for pickup',
		completedOrders: 'Completed',
		cancelledOrders: 'Cancelled',
		cancelOrder: 'Cancel order',
		cancelOrderConfirm: 'Cancel this order? Cancellation will be unavailable once preparation begins.',
		cancellingOrder: 'Cancelling...',
		cancelOrderError: 'Could not cancel the order.',
		emptyOrders: 'Your orders will appear here',
		emptyOrdersText: 'Make your first order to see your history.',
		emptyBookings: 'Your bookings will appear here',
		emptyBookingsText: 'Book a table to see your upcoming visits.',
		emptyFavorites: 'Your favorites are empty',
		emptyFavoritesText: 'Save items you like to find them quickly later.',
		name: 'Name',
		lastName: 'Last name',
		email: 'Email',
		phone: 'Phone',
		birthDate: 'Date of birth',
		bonuses: 'bonuses',
		bonusDescription:
			'Earn 10% of every completed order in bonuses and use them on future purchases.',
		bonusTab: 'Bonuses',
		bonusText: 'You have',
		bonusTitle: 'Bonus programme',
		changePassword: 'Change password',
		changePasswordDescription:
			'Enter a new password for your account.',
		newPassword: 'New password',
		confirmNewPassword: 'Confirm new password',
		savePassword: 'Change password',
		changingPassword: 'Saving...',
		passwordChanged: 'Your password has been changed.',
		passwordLength: 'Password must contain at least 6 characters.',
		passwordMismatch: 'Passwords do not match.',
		passwordChangeError:
			'Could not change your password. Please try again.',
		showPassword: 'Show password',
		hidePassword: 'Hide password',
		edit: 'Edit profile',
		cancel: 'Cancel',
		deleteAccount: 'Delete account',
		deleteConfirm:
			'Delete your account? All account data will be permanently removed.',
		deleteError: 'Could not delete your account. Please try again.',
		deleting: 'Deleting...',
		currentPassword: 'Current password',
		verificationCode: 'Email verification code',
		sendCode: 'Send code',
		codeSent: 'A verification code was sent to your email.',
		invalidPassword: 'The current password is incorrect.',
		invalidCode: 'The code is invalid or expired.',
		verifying: 'Verifying...',
		editingProfile: 'Edit profile',
		home: 'Back to home',
		adminPanel: 'Admin panel',
		adminPanelShort: 'Admin',
		settings: 'Settings',
		settingsDescription:
			'Manage your account security and sign-in settings.',
		activeDevices: 'Active devices',
		activeDevicesDescription:
			'Devices and browsers where your account is signed in.',
		currentDevice: 'Current device',
		desktopDevice: 'Computer',
		mobileDevice: 'Phone',
		tabletDevice: 'Tablet',
		unknownDevice: 'Unknown device',
		mobileApp: 'Mobile app',
		lastActive: 'Last active',
		sessionsLoading: 'Loading active devices...',
		sessionsError: 'Could not load active devices.',
		noActiveDevices: 'No active devices found.',
		signOutAllDevices: 'Sign out on other devices',
		signingOutAllDevices: 'Signing out other devices...',
		otherDevicesSignedOut: 'All other devices have been signed out.',
		signOutAllDevicesConfirm:
			'Sign out of your account on every other device? Your current session will stay active.',
		signOutAllDevicesError:
			'Could not sign out all devices. Please try again.',
		signOut: 'Sign out',
		loading: 'Loading...',
		profileUpdateError: 'Could not update your profile details.',
		invalidPhone: 'Enter a valid phone number.',
		phoneAlreadyExists: 'This phone number is already used by another account.',
		profileUpdated: 'Profile details updated.',
		requiredProfileFields: 'Fill in your first name, last name, phone, and birth date.',
		save: 'Save changes',
		saving: 'Saving...',
	},
	he: {
		title: 'אזור אישי',
		welcome: 'ברוכים הבאים',
		greeting: 'שיהיה לך יום נעים וקפה טעים',
		profileTab: 'הפרופיל שלי',
		orders: 'ההזמנות שלי',
		bookings: 'הזמנות שולחן',
		events: 'האירועים שלי',
		favorites: 'מועדפים',
		firstName: 'שם פרטי',
		allOrders: 'הכל',
		processingOrders: 'בטיפול',
		preparingOrders: 'בהכנה',
		readyOrders: 'מוכן לאיסוף',
		completedOrders: 'הושלם',
		cancelledOrders: 'בוטלו',
		cancelOrder: 'ביטול הזמנה',
		cancelOrderConfirm: 'לבטל את ההזמנה? לאחר תחילת ההכנה לא ניתן יהיה לבטל.',
		cancellingOrder: 'מבטלים...',
		cancelOrderError: 'לא ניתן לבטל את ההזמנה.',
		emptyOrders: 'ההזמנות שלך יופיעו כאן',
		emptyOrdersText: 'בצעו הזמנה ראשונה כדי לראות את ההיסטוריה שלכם.',
		emptyBookings: 'ההזמנות שלך יופיעו כאן',
		emptyBookingsText: 'הזמינו שולחן כדי לראות את הביקורים הקרובים שלכם.',
		emptyFavorites: 'אין עדיין פריטים מועדפים',
		emptyFavoritesText:
			'שמרו פריטים שאהבתם כדי למצוא אותם בקלות בהמשך.',
		name: 'שם',
		lastName: 'שם משפחה',
		email: 'אימייל',
		phone: 'טלפון',
		birthDate: 'תאריך לידה',
		bonuses: 'נקודות',
		bonusDescription: 'צוברים 10% מערך כל הזמנה שהושלמה כנקודות ומשתמשים בהן ברכישות הבאות.',
		bonusTab: 'נקודות',
		bonusText: 'יש לך',
		bonusTitle: 'תוכנית הטבות',
		changePassword: 'שינוי סיסמה',
		changePasswordDescription: 'יש להזין סיסמה חדשה לחשבון.',
		newPassword: 'סיסמה חדשה',
		confirmNewPassword: 'אימות הסיסמה החדשה',
		savePassword: 'שינוי סיסמה',
		changingPassword: 'שומר...',
		passwordChanged: 'הסיסמה שונתה בהצלחה.',
		passwordLength: 'הסיסמה חייבת לכלול לפחות 6 תווים.',
		passwordMismatch: 'הסיסמאות אינן תואמות.',
		passwordChangeError:
			'לא ניתן לשנות את הסיסמה. יש לנסות שוב.',
		showPassword: 'הצגת הסיסמה',
		hidePassword: 'הסתרת הסיסמה',
		edit: 'עריכת פרופיל',
		cancel: 'ביטול',
		deleteAccount: 'מחיקת חשבון',
		deleteConfirm: 'למחוק את החשבון? כל נתוני החשבון יימחקו לצמיתות.',
		deleteError: 'לא ניתן למחוק את החשבון. יש לנסות שוב.',
		deleting: 'מוחק...',
		currentPassword: 'סיסמה נוכחית',
		verificationCode: 'קוד אימות מהאימייל',
		sendCode: 'שליחת קוד',
		codeSent: 'קוד אימות נשלח לאימייל שלך.',
		invalidPassword: 'הסיסמה הנוכחית שגויה.',
		invalidCode: 'הקוד שגוי או שפג תוקפו.',
		verifying: 'מאמת...',
		editingProfile: 'עריכת פרופיל',
		home: 'חזרה לדף הבית',
		adminPanel: 'לוח ניהול',
		adminPanelShort: 'ניהול',
		settings: 'הגדרות',
		settingsDescription: 'ניהול אבטחת החשבון והכניסה.',
		activeDevices: 'מכשירים פעילים',
		activeDevicesDescription:
			'מכשירים ודפדפנים שבהם החשבון שלך מחובר.',
		currentDevice: 'המכשיר הנוכחי',
		desktopDevice: 'מחשב',
		mobileDevice: 'טלפון',
		tabletDevice: 'טאבלט',
		unknownDevice: 'מכשיר לא מוכר',
		mobileApp: 'אפליקציה לנייד',
		lastActive: 'פעילות אחרונה',
		sessionsLoading: 'טוען מכשירים פעילים...',
		sessionsError: 'לא ניתן לטעון את המכשירים הפעילים.',
		noActiveDevices: 'לא נמצאו מכשירים פעילים.',
		signOutAllDevices: 'יציאה ממכשירים אחרים',
		signingOutAllDevices: 'מתנתק ממכשירים אחרים...',
		otherDevicesSignedOut: 'החשבון נותק מכל המכשירים האחרים.',
		signOutAllDevicesConfirm:
			'להתנתק מהחשבון בכל המכשירים האחרים? החיבור במכשיר הנוכחי יישאר פעיל.',
		signOutAllDevicesError:
			'לא ניתן להתנתק מכל המכשירים. יש לנסות שוב.',
		signOut: 'יציאה',
		loading: 'טוען...',
		profileUpdateError: 'לא ניתן לעדכן את פרטי הפרופיל.',
		invalidPhone: 'יש להזין מספר טלפון תקין.',
		phoneAlreadyExists: 'מספר הטלפון הזה כבר משויך לחשבון אחר.',
		profileUpdated: 'פרטי הפרופיל עודכנו.',
		requiredProfileFields: 'יש למלא שם פרטי, שם משפחה, טלפון ותאריך לידה.',
		save: 'שמירת שינויים',
		saving: 'שומר...',
	},
};
