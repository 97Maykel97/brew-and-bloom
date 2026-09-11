export type Locale = 'ru' | 'en' | 'he';

export type HeroTranslations = {
	eyebrow: string;
	title: string;
	subtitle: string;
	description: string;
	button: string;
	note: string;
};

export type AppTranslations = {
	nav: string[];
	searchPlaceholder: string;
	hero: HeroTranslations;
};

export const translations: Record<Locale, AppTranslations> = {
	ru: {
		nav: ['Главная', 'Меню', 'О нас', 'События', 'Контакты'],
		searchPlaceholder: 'Поиск',
		hero: {
			eyebrow: 'Brew & Bloom',
			title: 'Больше,\nчем кафе',
			subtitle: 'Место для тёплых встреч',
			description:
				'Ароматный кофе, уютная атмосфера и моменты, к которым хочется возвращаться.',
			button: 'Забронировать столик',
			note: 'Хорошие\nидеи начинаются\nздесь',
		},
	},
	he: {
		nav: ['דף הבית', 'תפריט', 'עלינו', 'אירועים', 'צור קשר'],
		searchPlaceholder: 'חיפוש',
		hero: {
			eyebrow: 'Brew & Bloom',
			title: 'יותר\n מקפה',
			subtitle: 'מקום לרגעים חמים',
			description: 'קפה מצוין, אווירה נעימה ורגעים שתרצו לחזור אליהם.',
			button: 'הזמנת שולחן',
			note: 'רעיונות טובים\nמתחילים כאן',
		},
	},
	en: {
		nav: ['Home', 'Menu', 'About us', 'Events', 'Contacts'],
		searchPlaceholder: 'Search',
		hero: {
			eyebrow: 'Brew & Bloom',
			title: 'More,\n than a café',
			subtitle: 'A place for warm moments',
			description:
				'Great coffee, a cozy atmosphere and moments worth coming back to.',
			button: 'Book a table',
			note: 'Good ideas\nbegin here',
		},
	},
};
