import Hero from '@/components/common/Hero';
import Header from '@/components/UI/Header';
import { getTranslations } from 'next-intl/server';

type TPageProps = {
	params: Promise<{
		locale: string;
	}>;
};

export default async function Page({ params }: TPageProps) {
	const { locale } = await params;
	const t = await getTranslations('home.hero');

	const hero = {
		eyebrow: t('eyebrow'),
		title: t('title'),
		subtitle: t('subtitle'),
		descr: t('description'),
		buttonText: t('button'),
		note: t('note'),
	};

	return (
		<>
			<Header locale={locale} />
			<Hero hero={hero} isRtl={locale === 'he'} />
		</>
	);
}
