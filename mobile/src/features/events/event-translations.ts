import type { TLocale } from '@/i18n/translations';
import type { TEventRegistrationStatus, TEventType } from './types';

type TEventTranslations = {
	eyebrow: string;
	title: string;
	description: string;
	all: string;
	types: Record<TEventType, string>;
	details: string;
	date: string;
	time: string;
	spots: string;
	guests: string;
	register: string;
	signIn: string;
	full: string;
	registered: string;
	cancel: string;
	cancelConfirm: string;
	cancelling: string;
	close: string;
	empty: string;
	error: string;
	statuses: Record<TEventRegistrationStatus, string>;
};

export const eventTranslations: Record<TLocale, TEventTranslations> = {
	ru: {
		eyebrow: 'Афиша Brew & Bloom', title: 'События', description: 'Дегустации, мастер-классы и уютные вечера в нашей кофейне.', all: 'Все',
		types: { coffee: 'Дегустации', latte_art: 'Латте-арт', music: 'Музыка', community: 'Встречи' },
		details: 'Подробнее', date: 'Дата', time: 'Время', spots: 'Свободно мест', guests: 'Количество гостей', register: 'Записаться', signIn: 'Войти и записаться',
		full: 'Мест нет', registered: 'Вы записаны на событие.', cancel: 'Отменить запись', cancelConfirm: 'Отменить запись на событие?', cancelling: 'Отменяем…', close: 'Закрыть',
		empty: 'В этой категории пока нет событий.', error: 'Не удалось выполнить действие. Попробуйте ещё раз.',
		statuses: { pending: 'Ожидает подтверждения', confirmed: 'Подтверждено', cancelled: 'Отменено' },
	},
	en: {
		eyebrow: 'Brew & Bloom calendar', title: 'Events', description: 'Tastings, workshops and cozy evenings at our coffee shop.', all: 'All',
		types: { coffee: 'Tastings', latte_art: 'Latte art', music: 'Music', community: 'Meetups' },
		details: 'Details', date: 'Date', time: 'Time', spots: 'Places left', guests: 'Guests', register: 'Register', signIn: 'Sign in to register',
		full: 'Fully booked', registered: 'You are registered.', cancel: 'Cancel registration', cancelConfirm: 'Cancel your event registration?', cancelling: 'Cancelling…', close: 'Close',
		empty: 'There are no events in this category yet.', error: 'Could not complete the action. Please try again.',
		statuses: { pending: 'Awaiting confirmation', confirmed: 'Confirmed', cancelled: 'Cancelled' },
	},
	he: {
		eyebrow: 'אירועי Brew & Bloom', title: 'אירועים', description: 'טעימות, סדנאות וערבים נעימים בבית הקפה שלנו.', all: 'הכול',
		types: { coffee: 'טעימות', latte_art: 'לאטה ארט', music: 'מוזיקה', community: 'מפגשים' },
		details: 'פרטים', date: 'תאריך', time: 'שעה', spots: 'מקומות פנויים', guests: 'מספר אורחים', register: 'הרשמה', signIn: 'כניסה והרשמה',
		full: 'אין מקומות', registered: 'נרשמת לאירוע.', cancel: 'ביטול הרשמה', cancelConfirm: 'לבטל את ההרשמה לאירוע?', cancelling: 'מבטלים…', close: 'סגירה',
		empty: 'אין עדיין אירועים בקטגוריה הזו.', error: 'לא ניתן להשלים את הפעולה. נסו שוב.',
		statuses: { pending: 'ממתין לאישור', confirmed: 'מאושר', cancelled: 'בוטל' },
	},
};
