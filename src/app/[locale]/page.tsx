import Hero from '@/components/common/Hero';
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
	const [heroT, highlightsT] = await Promise.all([
		getTranslations('home.hero'),
		getTranslations('home.highlights'),
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

	return (
		<>
			<Header locale={locale} />
			<Hero hero={hero} isRtl={locale === 'he'} />
			<HomeHighlights labels={highlights} isRtl={locale === 'he'} />
		</>
	);
}
