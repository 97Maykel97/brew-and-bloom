import type { TProfileLocale } from '@/features/profile/types';
import type { TEventRegistrationStatus, TEventType } from './types';

export const eventsCopy = {
	ru: {
		eyebrow: 'События Brew & Bloom', title: 'Встречи, которые хочется запомнить', description: 'Дегустации, творческие мастер-классы и тёплые музыкальные вечера. Выберите событие и забронируйте место.', all: 'Все', details: 'Подробнее', date: 'Дата', time: 'Время', spots: 'Свободных мест', guests: 'Количество гостей', register: 'Записаться', registering: 'Записываем…', signIn: 'Войти, чтобы записаться', full: 'Мест больше нет', myRegistration: 'Моя запись', openProfile: 'Посмотреть в личном кабинете', cancel: 'Отменить запись', cancelling: 'Отменяем…', close: 'Закрыть', empty: 'Скоро здесь появятся новые события', error: 'Не удалось выполнить действие. Попробуйте ещё раз.', registered: 'Заявка отправлена. Мы сообщим после подтверждения.', cancelConfirm: 'Отменить запись на событие?', types: { coffee: 'Дегустации', latte_art: 'Латте-арт', music: 'Музыка', community: 'Встречи' }, statuses: { pending: 'Ожидает подтверждения', confirmed: 'Подтверждено', cancelled: 'Отменено' },
	},
	en: {
		eyebrow: 'Brew & Bloom events', title: 'Moments worth remembering', description: 'Tastings, creative workshops, and warm music evenings. Choose an event and reserve your place.', all: 'All', details: 'View details', date: 'Date', time: 'Time', spots: 'Available spots', guests: 'Number of guests', register: 'Register', registering: 'Registering…', signIn: 'Sign in to register', full: 'Fully booked', myRegistration: 'My registration', openProfile: 'View in your account', cancel: 'Cancel registration', cancelling: 'Cancelling…', close: 'Close', empty: 'New events will appear here soon', error: 'Could not complete the action. Please try again.', registered: 'Your request was sent. We will notify you after confirmation.', cancelConfirm: 'Cancel your event registration?', types: { coffee: 'Tastings', latte_art: 'Latte art', music: 'Music', community: 'Community' }, statuses: { pending: 'Awaiting confirmation', confirmed: 'Confirmed', cancelled: 'Cancelled' },
	},
	he: {
		eyebrow: 'אירועים ב־Brew & Bloom', title: 'רגעים שכדאי לזכור', description: 'טעימות, סדנאות יצירה וערבי מוזיקה נעימים. בחרו אירוע ושמרו מקום.', all: 'הכל', details: 'פרטים נוספים', date: 'תאריך', time: 'שעה', spots: 'מקומות פנויים', guests: 'מספר אורחים', register: 'הרשמה', registering: 'נרשמים…', signIn: 'התחברות להרשמה', full: 'אין מקומות פנויים', myRegistration: 'ההרשמה שלי', openProfile: 'צפייה באזור האישי', cancel: 'ביטול הרשמה', cancelling: 'מבטלים…', close: 'סגירה', empty: 'אירועים חדשים יופיעו כאן בקרוב', error: 'לא ניתן לבצע את הפעולה. נסו שוב.', registered: 'הבקשה נשלחה. נעדכן לאחר האישור.', cancelConfirm: 'לבטל את ההרשמה לאירוע?', types: { coffee: 'טעימות', latte_art: 'לאטה ארט', music: 'מוזיקה', community: 'מפגשים' }, statuses: { pending: 'ממתין לאישור', confirmed: 'אושר', cancelled: 'בוטל' },
	},
} as const satisfies Record<TProfileLocale, {
	types: Record<TEventType, string>;
	statuses: Record<TEventRegistrationStatus, string>;
	[key: string]: unknown;
}>;

export type TEventsCopy = (typeof eventsCopy)[TProfileLocale];
