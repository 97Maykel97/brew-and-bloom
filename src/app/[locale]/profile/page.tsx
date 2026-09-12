import { redirect } from 'next/navigation';

import {
	createProfileViewModel,
	getOrderStatus,
	getProfileLocale,
	getProfileTab,
	ProfileDashboard,
	profileCopy,
} from '@/features/profile';
import { createClient } from '@/lib/supabase/server';

type TProfilePageProps = {
	params: Promise<{
		locale: string;
	}>;
	searchParams: Promise<{
		tab?: string;
		status?: string;
	}>;
};

export default async function ProfilePage({
	params,
	searchParams,
}: TProfilePageProps) {
	const [{ locale }, { tab, status }] = await Promise.all([
		params,
		searchParams,
	]);
	const currentLocale = getProfileLocale(locale);
	const activeTab = getProfileTab(tab);
	const activeOrderStatus = getOrderStatus(status);
	const copy = profileCopy[currentLocale];
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect('/' + currentLocale + '/auth/login');
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('first_name, last_name, phone, birth_date')
		.eq('id', user.id)
		.maybeSingle();

	const metadata =
		user?.user_metadata && typeof user.user_metadata === 'object'
			? user.user_metadata
			: {};
	const profileViewModel = createProfileViewModel({
		locale: currentLocale,
		copy,
		profile,
		metadata,
		email: user.email,
	});

	return (
		<ProfileDashboard
			locale={currentLocale}
			activeTab={activeTab}
			activeOrderStatus={activeOrderStatus}
			copy={copy}
			profile={profileViewModel}
		/>
	);
}
