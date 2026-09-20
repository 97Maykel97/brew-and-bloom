import type { TLocale } from './languages';

export type { TLocale } from './languages';

export type THeroTranslations = {
	eyebrow: string;
	title: string;
	subtitle: string;
	description: string;
	button: string;
	note: string;
};

export type THomeHighlightsTranslations = {
	freshCoffee: string;
	cozyAtmosphere: string;
	signatureDrinks: string;
	friendlyCommunity: string;
};

export type TAppTranslations = {
	nav: string[];
	searchPlaceholder: string;
	hero: THeroTranslations;
	highlights: THomeHighlightsTranslations;
};

export const translations: Record<TLocale, TAppTranslations> = {
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
		highlights: {
			freshCoffee: 'Свежий кофе',
			cozyAtmosphere: 'Уютная атмосфера',
			signatureDrinks: 'Авторские напитки',
			friendlyCommunity: 'Дружелюбное сообщество',
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
		highlights: {
			freshCoffee: 'קפה טרי',
			cozyAtmosphere: 'אווירה נעימה',
			signatureDrinks: 'משקאות מיוחדים',
			friendlyCommunity: 'קהילה ידידותית',
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
		highlights: {
			freshCoffee: 'Fresh coffee',
			cozyAtmosphere: 'Cozy atmosphere',
			signatureDrinks: 'Signature drinks',
			friendlyCommunity: 'Friendly community',
		},
	},
};
