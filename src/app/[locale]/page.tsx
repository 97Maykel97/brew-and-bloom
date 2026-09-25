import Hero from '@/components/common/Hero';
import HomeBestsellers from '@/components/common/HomeBestsellers';
import HomeEvents from '@/components/common/HomeEvents';
import HomeHighlights from '@/components/common/HomeHighlights';
import HomePromo from '@/components/common/HomePromo';
import Header from '@/components/UI/Header';
import { getTranslations } from 'next-intl/server';

type TPageProps = {
	params: Promise<{
		locale: string;
	}>;
};

export default async function Page({ params }: TPageProps) {
	const { locale } = await params;
	const [heroT, highlightsT, bestsellersT, promoT, eventsT] = await Promise.all([
		getTranslations('home.hero'),
		getTranslations('home.highlights'),
		getTranslations('home.bestsellers'),
		getTranslations('home.promo'),
		getTranslations('home.events'),
	]);

	const hero = {
		eyebrow: heroT('eyebrow'),
		title: heroT('title'),
		subtitle: heroT('subtitle'),
		descr: heroT('description'),
		buttonText: heroT('button'),
		note: heroT('note'),
	};
	const highlights = {
		freshCoffee: highlightsT('freshCoffee'),
		cozyAtmosphere: highlightsT('cozyAtmosphere'),
		signatureDrinks: highlightsT('signatureDrinks'),
		friendlyCommunity: highlightsT('friendlyCommunity'),
	};
	const bestsellers = {
		title: bestsellersT('title'),
		viewAll: bestsellersT('viewAll'),
		addToCart: bestsellersT('addToCart'),
		products: {
			classicRaf: {
				name: bestsellersT('products.classicRaf.name'),
				description: bestsellersT('products.classicRaf.description'),
			},
			matchaLatte: {
				name: bestsellersT('products.matchaLatte.name'),
				description: bestsellersT('products.matchaLatte.description'),
			},
			espressoTonic: {
				name: bestsellersT('products.espressoTonic.name'),
				description: bestsellersT('products.espressoTonic.description'),
			},
			classicCroissant: {
				name: bestsellersT('products.classicCroissant.name'),
				description: bestsellersT('products.classicCroissant.description'),
			},
		},
	};
	const promo = {
		title: promoT('title'),
		description: promoT('description'),
		button: promoT('button'),
	};
	const events = {
		eyebrow: eventsT('eyebrow'),
		title: eventsT('title'),
		description: eventsT('description'),
		tasting: {
			day: eventsT('items.tasting.day'),
			month: eventsT('items.tasting.month'),
			title: eventsT('items.tasting.title'),
			description: eventsT('items.tasting.description'),
			time: eventsT('items.tasting.time'),
		},
		latteArt: {
			day: eventsT('items.latteArt.day'),
			month: eventsT('items.latteArt.month'),
			title: eventsT('items.latteArt.title'),
			description: eventsT('items.latteArt.description'),
			time: eventsT('items.latteArt.time'),
		},
		acoustic: {
			day: eventsT('items.acoustic.day'),
			month: eventsT('items.acoustic.month'),
			title: eventsT('items.acoustic.title'),
			description: eventsT('items.acoustic.description'),
			time: eventsT('items.acoustic.time'),
		},
	};

	return (
		<>
			<Header locale={locale} />
			<Hero hero={hero} locale={locale} isRtl={locale === 'he'} />
			<HomeHighlights labels={highlights} isRtl={locale === 'he'} />
			<HomeBestsellers
				copy={bestsellers}
				isRtl={locale === 'he'}
				locale={locale}
			/>
			<HomePromo copy={promo} isRtl={locale === 'he'} locale={locale} />
			<HomeEvents copy={events} isRtl={locale === 'he'} locale={locale} />
		</>
	);
}
