import Hero from '@/components/common/Hero';
import HomeBestsellers from '@/components/common/HomeBestsellers';
import HomeHighlights from '@/components/common/HomeHighlights';
import Header from '@/components/UI/Header';
import { getTranslations } from 'next-intl/server';

type TPageProps = {
	params: Promise<{
		locale: string;
	}>;
};

export default async function Page({ params }: TPageProps) {
	const { locale } = await params;
	const [heroT, highlightsT, bestsellersT] = await Promise.all([
		getTranslations('home.hero'),
		getTranslations('home.highlights'),
		getTranslations('home.bestsellers'),
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

	return (
		<>
			<Header locale={locale} />
			<Hero hero={hero} isRtl={locale === 'he'} />
			<HomeHighlights labels={highlights} isRtl={locale === 'he'} />
			<HomeBestsellers
				copy={bestsellers}
				isRtl={locale === 'he'}
				locale={locale}
			/>
		</>
	);
}
