import type { TProfileLocale } from '../types';
import type { TBookingStatus } from './booking-types';

type TBookingCopy = {
	title: string; subtitle: string; newBooking: string; date: string; time: string;
	guests: string; comment: string; commentPlaceholder: string; submit: string;
	submitting: string; upcoming: string; history: string; empty: string; cancel: string;
	cancelling: string; cancelConfirm: string; error: string; unavailable: string;
	created: string; person: string; statuses: Record<TBookingStatus, string>;
};

export const bookingCopy: Record<TProfileLocale, TBookingCopy> = {
	ru: {
		title: 'Бронирование столика', subtitle: 'Выберите удобное время — мы подготовим столик к вашему приходу.', newBooking: 'Новая бронь', date: 'Дата', time: 'Время', guests: 'Гости', comment: 'Комментарий', commentPlaceholder: 'Например, столик у окна', submit: 'Забронировать', submitting: 'Бронируем…', upcoming: 'Предстоящие', history: 'История', empty: 'Бронирований пока нет', cancel: 'Отменить бронь', cancelling: 'Отменяем…', cancelConfirm: 'Отменить эту бронь?', error: 'Не удалось выполнить действие. Попробуйте ещё раз.', unavailable: 'На это время свободных столиков нет.', created: 'Столик забронирован. Ожидайте подтверждения администратора.', person: 'гостей',
		statuses: { new: 'Ожидает подтверждения', confirmed: 'Подтверждено', completed: 'Завершено', cancelled: 'Отменено' },
	},
	en: {
		title: 'Table booking', subtitle: 'Choose a convenient time and we will prepare your table.', newBooking: 'New booking', date: 'Date', time: 'Time', guests: 'Guests', comment: 'Comment', commentPlaceholder: 'For example, a table by the window', submit: 'Book a table', submitting: 'Booking…', upcoming: 'Upcoming', history: 'History', empty: 'You have no bookings yet', cancel: 'Cancel booking', cancelling: 'Cancelling…', cancelConfirm: 'Cancel this booking?', error: 'Could not complete the action. Please try again.', unavailable: 'There are no available tables for this time.', created: 'Your table is booked and awaiting confirmation.', person: 'guests',
		statuses: { new: 'Awaiting confirmation', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' },
	},
	he: {
		title: 'הזמנת שולחן', subtitle: 'בחרו זמן נוח ואנחנו נכין את השולחן לקראתכם.', newBooking: 'הזמנה חדשה', date: 'תאריך', time: 'שעה', guests: 'אורחים', comment: 'הערה', commentPlaceholder: 'לדוגמה, שולחן ליד החלון', submit: 'הזמנת שולחן', submitting: 'מזמינים…', upcoming: 'הזמנות קרובות', history: 'היסטוריה', empty: 'אין עדיין הזמנות שולחן', cancel: 'ביטול הזמנה', cancelling: 'מבטלים…', cancelConfirm: 'לבטל את הזמנת השולחן?', error: 'לא ניתן לבצע את הפעולה. נסו שוב.', unavailable: 'אין שולחנות פנויים בשעה הזו.', created: 'השולחן הוזמן וממתין לאישור.', person: 'אורחים',
		statuses: { new: 'ממתין לאישור', confirmed: 'אושר', completed: 'הושלם', cancelled: 'בוטל' },
	},
};
