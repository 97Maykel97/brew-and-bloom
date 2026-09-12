import type { TProfileCopy } from '../profile-copy';
import type {
	TOrderStatus,
	TProfileLocale,
	TProfileTab,
	TProfileViewModel,
} from '../types';
import BonusCard from './BonusCard';
import ProfileContent from './ProfileContent';
import ProfileHeader from './ProfileHeader';
import ProfileMobileNavigation from './ProfileMobileNavigation';
import ProfileSectionTabs from './ProfileSectionTabs';
import ProfileSidebar from './ProfileSidebar';
import ProfileTopBar from './ProfileTopBar';

type TProfileDashboardProps = {
	locale: TProfileLocale;
	activeTab: TProfileTab;
	activeOrderStatus: TOrderStatus;
	copy: TProfileCopy;
	profile: TProfileViewModel;
};

export default function ProfileDashboard({
	locale,
	activeTab,
	activeOrderStatus,
	copy,
	profile,
}: TProfileDashboardProps) {
	return (
		<main
			dir={locale === 'he' ? 'rtl' : 'ltr'}
			className='min-h-screen bg-[#e9dfd4] text-[var(--foreground)] sm:px-6 sm:py-6'
		>
			<div className='mx-auto flex min-h-screen max-w-[1320px] overflow-hidden bg-[#f8f3ec] sm:min-h-[calc(100svh-3rem)] sm:rounded-[32px] sm:shadow-[0_24px_80px_rgba(55,39,28,0.18)]'>
				<ProfileSidebar
					locale={locale}
					activeTab={activeTab}
					copy={copy}
				/>

				<section className='min-w-0 flex-1 bg-[#f8f3ec]'>
					<ProfileTopBar
						homeLabel={copy.home}
						locale={locale}
					/>

					<div className='mx-auto max-w-[920px] px-4 py-5 sm:px-8 sm:py-10 lg:px-12 lg:py-12'>
						<ProfileHeader
							copy={copy}
							displayName={profile.displayName}
						/>
						<BonusCard copy={copy} bonusPoints={profile.bonusPoints} />
						<ProfileMobileNavigation
							activeTab={activeTab}
							copy={copy}
						/>
						<ProfileSectionTabs activeTab={activeTab} copy={copy} />
						<ProfileContent
							locale={locale}
							activeTab={activeTab}
							activeOrderStatus={activeOrderStatus}
							copy={copy}
							profile={profile}
						/>
					</div>
				</section>
			</div>
		</main>
	);
}
