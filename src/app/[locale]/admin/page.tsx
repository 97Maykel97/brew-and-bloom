import {
	AdminDashboard,
	adminCopy,
	getAdminSection,
} from '@/features/admin';
import { requireAdmin } from '@/features/auth/server';
import { isSupportedLocale } from '@/i18n/languages';

type TAdminPageProps = {
	params: Promise<{
		locale: string;
	}>;
	searchParams: Promise<{
		section?: string;
	}>;
};

export default async function AdminPage({
	params,
	searchParams,
}: TAdminPageProps) {
	const [{ locale }, { section }] = await Promise.all([params, searchParams]);
	const currentLocale = isSupportedLocale(locale) ? locale : 'ru';
	const activeSection = getAdminSection(section);
	const copy = adminCopy[currentLocale];
	const { supabase, user } = await requireAdmin(currentLocale);

	const { data: profile } = await supabase
		.from('profiles')
		.select('first_name, last_name')
		.eq('id', user.id)
		.maybeSingle();
	const displayName = [profile?.first_name, profile?.last_name]
		.filter(Boolean)
		.join(' ') || user.email || copy.administrator;

	return (
		<AdminDashboard
			locale={currentLocale}
			activeSection={activeSection}
			copy={copy}
			displayName={displayName}
		/>
	);
}
