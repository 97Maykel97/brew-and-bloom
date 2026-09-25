import type { TAdminLocale } from '../types';

export type TEventType = 'coffee' | 'latte_art' | 'music' | 'community';
export type TEventLanguage = 'ru' | 'en' | 'he';
export type TEventRegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export type TAdminEvent = {
	id: string;
	slug: string;
	event_type: TEventType;
	title_ru: string;
	title_en: string;
	title_he: string;
	description_ru: string;
	description_en: string;
	description_he: string;
	event_date: string;
	start_time: string;
	end_time: string;
	capacity: number;
	is_published: boolean;
	created_at: string;
	updated_at: string;
};

export type TEventDraft = Omit<
	TAdminEvent,
	'id' | 'slug' | 'created_at' | 'updated_at'
>;

export type TAdminEventRegistration = {
	id: string;
	event_id: string;
	user_id: string;
	guest_count: number;
	status: TEventRegistrationStatus;
	created_at: string;
	updated_at: string;
};

export type TEventParticipantProfile = {
	id: string;
	first_name: string | null;
	last_name: string | null;
	email?: string | null;
	phone: string | null;
};

export const EMPTY_EVENT_DRAFT: TEventDraft = {
	event_type: 'coffee',
	title_ru: '',
	title_en: '',
	title_he: '',
	description_ru: '',
	description_en: '',
	description_he: '',
	event_date: '',
	start_time: '18:00',
	end_time: '20:00',
	capacity: 20,
	is_published: true,
};

export const ADMIN_EVENTS_COPY = {
	ru: {
		title: 'Управление событиями',
		subtitle: 'Создавайте события, переводите их и управляйте публикацией',
		add: 'Новое событие', edit: 'Редактировать', cancel: 'Отмена',
		save: 'Сохранить', create: 'Создать событие', delete: 'Удалить',
		deleteConfirm: 'Удалить это событие?', empty: 'Событий пока нет',
		error: 'Не удалось обновить события.', date: 'Дата', start: 'Начало',
		end: 'Окончание', capacity: 'Количество мест', type: 'Тип события', published: 'Опубликовано',
		hidden: 'Скрыто', titleField: 'Название', description: 'Описание',
		language: 'Язык', translationsHint: 'Заполните название и описание на всех трёх языках.', participants: 'Участники', noParticipants: 'На событие пока никто не записался', guests: 'гостей', confirmRegistration: 'Подтвердить', cancelRegistration: 'Отменить', registrationError: 'Не удалось обновить запись.', registrationStatuses: { pending: 'Ожидает', confirmed: 'Подтверждено', cancelled: 'Отменено' },
		types: { coffee: 'Дегустация', latte_art: 'Латте-арт', music: 'Музыка', community: 'Встреча' },
	},
	en: {
		title: 'Event management',
		subtitle: 'Create events, translate them, and control publication',
		add: 'New event', edit: 'Edit', cancel: 'Cancel', save: 'Save',
		create: 'Create event', delete: 'Delete', deleteConfirm: 'Delete this event?',
		empty: 'There are no events yet', error: 'Could not update events.',
		date: 'Date', start: 'Starts', end: 'Ends', capacity: 'Capacity', type: 'Event type',
		published: 'Published', hidden: 'Hidden', titleField: 'Title',
		description: 'Description', language: 'Language',
		translationsHint: 'Complete the title and description in all three languages.', participants: 'Participants', noParticipants: 'No one has registered for this event yet', guests: 'guests', confirmRegistration: 'Confirm', cancelRegistration: 'Cancel', registrationError: 'Could not update the registration.', registrationStatuses: { pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled' },
		types: { coffee: 'Tasting', latte_art: 'Latte art', music: 'Music', community: 'Community' },
	},
	he: {
		title: 'ניהול אירועים', subtitle: 'יצירת אירועים, תרגום וניהול הפרסום',
		add: 'אירוע חדש', edit: 'עריכה', cancel: 'ביטול', save: 'שמירה',
		create: 'יצירת אירוע', delete: 'מחיקה', deleteConfirm: 'למחוק את האירוע?',
		empty: 'אין עדיין אירועים', error: 'לא ניתן לעדכן את האירועים.',
		date: 'תאריך', start: 'התחלה', end: 'סיום', capacity: 'מספר מקומות', type: 'סוג אירוע',
		published: 'פורסם', hidden: 'מוסתר', titleField: 'כותרת',
		description: 'תיאור', language: 'שפה',
		translationsHint: 'יש למלא כותרת ותיאור בכל שלוש השפות.', participants: 'משתתפים', noParticipants: 'עדיין אין הרשמות לאירוע', guests: 'אורחים', confirmRegistration: 'אישור', cancelRegistration: 'ביטול', registrationError: 'לא ניתן לעדכן את ההרשמה.', registrationStatuses: { pending: 'ממתין', confirmed: 'אושר', cancelled: 'בוטל' },
		types: { coffee: 'טעימה', latte_art: 'לאטה ארט', music: 'מוזיקה', community: 'מפגש' },
	},
} as const;

export type TAdminEventsCopy = (typeof ADMIN_EVENTS_COPY)[TAdminLocale];

export const EVENT_LANGUAGE_LABELS: Record<TEventLanguage, string> = {
	ru: 'RU',
	en: 'EN',
	he: 'HE',
};

export function isEventDraftComplete(draft: TEventDraft) {
	return Boolean(
		draft.event_date &&
		draft.start_time &&
		draft.end_time &&
		draft.end_time > draft.start_time &&
		Number.isInteger(draft.capacity) &&
		draft.capacity > 0 &&
		draft.title_ru.trim() &&
		draft.title_en.trim() &&
		draft.title_he.trim() &&
		draft.description_ru.trim() &&
		draft.description_en.trim() &&
		draft.description_he.trim(),
	);
}

export function isEventLanguageComplete(
	draft: TEventDraft,
	language: TEventLanguage,
) {
	return Boolean(
		draft[`title_${language}`].trim() &&
		draft[`description_${language}`].trim(),
	);
}
