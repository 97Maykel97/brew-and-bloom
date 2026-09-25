import Header from '@/components/UI/Header';
import { EventsScreen } from '@/features/events';

type TEventsPageProps = {
	params: Promise<{ locale: string }>;
};

export default async function EventsPage({ params }: TEventsPageProps) {
	const { locale } = await params;
	return <><Header locale={locale} /><EventsScreen locale={locale} /></>;
}
