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

export type THomeBestsellerProductKey =
	| 'classicRaf'
	| 'matchaLatte'
	| 'espressoTonic'
	| 'classicCroissant';

export type THomeBestsellersTranslations = {
	title: string;
	viewAll: string;
	addToCart: string;
	products: Record<
		THomeBestsellerProductKey,
		{ name: string; description: string }
	>;
};

export type TAppTranslations = {
	nav: string[];
	searchPlaceholder: string;
	hero: THeroTranslations;
	highlights: THomeHighlightsTranslations;
	bestsellers: THomeBestsellersTranslations;
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
		bestsellers: {
			title: 'Наши хиты',
			viewAll: 'Смотреть всё',
			addToCart: 'Добавить в корзину',
			products: {
				classicRaf: {
					name: 'Раф Классический',
					description: 'Нежный сливочный кофе с бархатистой пеной',
				},
				matchaLatte: {
					name: 'Матча Латте',
					description: 'Японская матча с мягким молочным вкусом',
				},
				espressoTonic: {
					name: 'Эспрессо-Тоник',
					description: 'Освежающий тоник с насыщенным эспрессо',
				},
				classicCroissant: {
					name: 'Круассан',
					description: 'Слоёный французский круассан на сливочном масле',
				},
			},
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
		bestsellers: {
			title: 'הלהיטים שלנו',
			viewAll: 'לצפייה בהכול',
			addToCart: 'הוספה לסל',
			products: {
				classicRaf: {
					name: 'ראף קלאסי',
					description: 'קפה קרמי עדין עם קצף קטיפתי',
				},
				matchaLatte: {
					name: "מאצ'ה לאטה",
					description: "מאצ'ה יפנית עם טעם חלבי ורך",
				},
				espressoTonic: {
					name: 'אספרסו טוניק',
					description: 'טוניק מרענן עם אספרסו עשיר',
				},
				classicCroissant: {
					name: 'קרואסון',
					description: 'קרואסון צרפתי פריך על בסיס חמאה',
				},
			},
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
		bestsellers: {
			title: 'Our favorites',
			viewAll: 'View all',
			addToCart: 'Add to cart',
			products: {
				classicRaf: {
					name: 'Classic Raf',
					description: 'Delicate creamy coffee with velvety foam',
				},
				matchaLatte: {
					name: 'Matcha Latte',
					description: 'Japanese matcha with a smooth milky taste',
				},
				espressoTonic: {
					name: 'Espresso Tonic',
					description: 'Refreshing tonic topped with rich espresso',
				},
				classicCroissant: {
					name: 'Croissant',
					description: 'Flaky French croissant made with butter',
				},
			},
		},
	},
};
