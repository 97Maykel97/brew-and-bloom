import type { TLocale } from '@/i18n/languages';

export type TProfileTranslations = {
	allOrders: string;
	bookings: string;
	birthDate: string;
	bonuses: string;
	bonusDescription: string;
	bonusTab: string;
	bonusText: string;
	bonusTitle: string;
	changePassword: string;
	emptyBookings: string;
	emptyBookingsText: string;
	emptyFavorites: string;
	emptyFavoritesText: string;
	emptyOrders: string;
	emptyOrdersText: string;
	email: string;
	favorites: string;
	greeting: string;
	home: string;
	loading: string;
	name: string;
	orders: string;
	phone: string;
	processingOrders: string;
	profileTab: string;
	readyOrders: string;
	settings: string;
	settingsDescription: string;
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
		favorites: 'Избранное',
		allOrders: 'Все',
		processingOrders: 'В обработке',
		readyOrders: 'Готовы',
		completedOrders: 'Завершённые',
		emptyOrders: 'Здесь появятся ваши заказы',
		emptyOrdersText: 'Оформите первый заказ, чтобы увидеть историю.',
		emptyBookings: 'Здесь появятся ваши бронирования',
		emptyBookingsText:
			'Забронируйте столик, чтобы увидеть будущие посещения.',
		emptyFavorites: 'В избранном пока ничего нет',
		emptyFavoritesText:
			'Сохраняйте понравившиеся позиции, чтобы быстро найти их позже.',
		name: 'Имя',
		email: 'Email',
		phone: 'Телефон',
		birthDate: 'Дата рождения',
		bonuses: 'бонусов',
		bonusDescription:
			'Бонусы можно использовать при оформлении заказа.',
		bonusTab: 'Бонусы',
		bonusText: 'У вас',
		bonusTitle: 'Бонусная программа',
		changePassword: 'Сменить пароль',
		home: 'На главную',
		settings: 'Настройки',
		settingsDescription:
			'Управление безопасностью и вашим аккаунтом.',
		signOut: 'Выйти',
		loading: 'Загрузка...',
	},
	en: {
		title: 'My account',
		welcome: 'Welcome',
		greeting: 'Have a lovely day and a delicious coffee',
		profileTab: 'My profile',
		orders: 'My orders',
		bookings: 'Bookings',
		favorites: 'Favorites',
		allOrders: 'All',
		processingOrders: 'In progress',
		readyOrders: 'Ready',
		completedOrders: 'Completed',
		emptyOrders: 'Your orders will appear here',
		emptyOrdersText: 'Make your first order to see your history.',
		emptyBookings: 'Your bookings will appear here',
		emptyBookingsText: 'Book a table to see your upcoming visits.',
		emptyFavorites: 'Your favorites are empty',
		emptyFavoritesText: 'Save items you like to find them quickly later.',
		name: 'Name',
		email: 'Email',
		phone: 'Phone',
		birthDate: 'Date of birth',
		bonuses: 'bonuses',
		bonusDescription:
			'Bonuses can be used when placing an order.',
		bonusTab: 'Bonuses',
		bonusText: 'You have',
		bonusTitle: 'Bonus programme',
		changePassword: 'Change password',
		home: 'Back to home',
		settings: 'Settings',
		settingsDescription:
			'Manage your account security and sign-in settings.',
		signOut: 'Sign out',
		loading: 'Loading...',
	},
	he: {
		title: 'אזור אישי',
		welcome: 'ברוכים הבאים',
		greeting: 'שיהיה לך יום נעים וקפה טעים',
		profileTab: 'הפרופיל שלי',
		orders: 'ההזמנות שלי',
		bookings: 'הזמנות שולחן',
		favorites: 'מועדפים',
		allOrders: 'הכל',
		processingOrders: 'בטיפול',
		readyOrders: 'מוכן',
		completedOrders: 'הושלם',
		emptyOrders: 'ההזמנות שלך יופיעו כאן',
		emptyOrdersText: 'בצעו הזמנה ראשונה כדי לראות את ההיסטוריה שלכם.',
		emptyBookings: 'ההזמנות שלך יופיעו כאן',
		emptyBookingsText: 'הזמינו שולחן כדי לראות את הביקורים הקרובים שלכם.',
		emptyFavorites: 'אין עדיין פריטים מועדפים',
		emptyFavoritesText:
			'שמרו פריטים שאהבתם כדי למצוא אותם בקלות בהמשך.',
		name: 'שם',
		email: 'אימייל',
		phone: 'טלפון',
		birthDate: 'תאריך לידה',
		bonuses: 'נקודות',
		bonusDescription: 'ניתן להשתמש בנקודות בעת ביצוע הזמנה.',
		bonusTab: 'נקודות',
		bonusText: 'יש לך',
		bonusTitle: 'תוכנית הטבות',
		changePassword: 'שינוי סיסמה',
		home: 'חזרה לדף הבית',
		settings: 'הגדרות',
		settingsDescription: 'ניהול אבטחת החשבון והכניסה.',
		signOut: 'יציאה',
		loading: 'טוען...',
	},
};
