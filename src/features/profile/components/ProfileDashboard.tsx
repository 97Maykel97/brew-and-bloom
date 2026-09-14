'use client';

import { useEffect, useState } from 'react';

import type { TProfileCopy } from '../profile-copy';
import type {
	TOrderStatus,
	TProfileLocale,
	TProfileTab,
	TProfileViewModel,
} from '../types';
import {
	getOrderStatus,
	getProfileTab,
} from '../lib/profile-formatters';
import BonusCard from './BonusCard';
import ProfileContent from './ProfileContent';
import ProfileHeader from './ProfileHeader';
import ProfileMobileNavigation from './ProfileMobileNavigation';
import ProfileSectionTabs from './ProfileSectionTabs';
import ProfileSidebar from './ProfileSidebar';
import ProfileTopBar from './ProfileTopBar';

type TProfileDashboardProps = {
	locale: TProfileLocale;
	isAdmin: boolean;
	activeTab: TProfileTab;
	activeOrderStatus: TOrderStatus;
	copy: TProfileCopy;
	profile: TProfileViewModel;
};

export default function ProfileDashboard({
	locale,
	isAdmin,
	activeTab: initialActiveTab,
	activeOrderStatus: initialOrderStatus,
	copy,
	profile,
}: TProfileDashboardProps) {
	const [currentProfile, setCurrentProfile] =
		useState<TProfileViewModel>(profile);
	const [activeTab, setActiveTab] =
		useState<TProfileTab>(initialActiveTab);
	const [activeOrderStatus, setActiveOrderStatus] =
		useState<TOrderStatus>(initialOrderStatus);
	const [isEditing, setIsEditing] = useState(false);
	const [openChangePassword, setOpenChangePassword] = useState(false);

	useEffect(() => {
		function syncStateWithUrl() {
			const searchParams = new URLSearchParams(window.location.search);

			setActiveTab(getProfileTab(searchParams.get('tab') ?? undefined));
			setActiveOrderStatus(
				getOrderStatus(searchParams.get('status') ?? undefined),
			);
		}

		window.addEventListener('popstate', syncStateWithUrl);
		return () => window.removeEventListener('popstate', syncStateWithUrl);
	}, []);

	function updateUrl(tab: TProfileTab, status: TOrderStatus) {
		const url = new URL(window.location.href);

		url.searchParams.set('tab', tab);
		if (tab === 'orders' && status !== 'all') {
			url.searchParams.set('status', status);
		} else {
			url.searchParams.delete('status');
		}
		url.hash = tab;

		window.history.pushState(null, '', url);
	}

	function changeTab(tab: TProfileTab) {
		if (tab === activeTab) return;

		setActiveTab(tab);
		if (tab !== 'settings') {
			setOpenChangePassword(false);
		}
		updateUrl(tab, activeOrderStatus);
	}

	function changeOrderStatus(status: TOrderStatus) {
		if (status === activeOrderStatus) return;

		setActiveOrderStatus(status);
		updateUrl('orders', status);
	}

	return (
		<main
			dir={locale === 'he' ? 'rtl' : 'ltr'}
			className='min-h-screen bg-[#e9dfd4] text-[var(--foreground)] sm:px-6 sm:py-6'
		>
			<div className='mx-auto flex min-h-screen max-w-[1320px] overflow-hidden bg-[#f8f3ec] sm:min-h-[calc(100svh-3rem)] sm:rounded-[32px] sm:shadow-[0_24px_80px_rgba(55,39,28,0.18)]'>
				<ProfileSidebar
					locale={locale}
					isAdmin={isAdmin}
					activeTab={activeTab}
					copy={copy}
					onTabChange={changeTab}
				/>

				<section className='min-w-0 flex-1 bg-[#f8f3ec]'>
					<ProfileTopBar
						adminLabel={copy.adminPanel}
						homeLabel={copy.home}
						isAdmin={isAdmin}
						locale={locale}
					/>

					<div className='mx-auto max-w-[920px] px-4 py-5 sm:px-8 sm:py-10 lg:px-12 lg:py-12'>
						<ProfileHeader
							copy={copy}
							displayName={currentProfile.displayName}
							showEdit={activeTab === 'profile'}
							onEdit={() => {
								changeTab('profile');
								setIsEditing(true);
							}}
						/>
						<BonusCard
							copy={copy}
							bonusPoints={currentProfile.bonusPoints}
							onOpen={() => changeTab('bonuses')}
						/>
						<ProfileMobileNavigation
							activeTab={activeTab}
							copy={copy}
							onTabChange={changeTab}
						/>
						<ProfileSectionTabs
							activeTab={activeTab}
							copy={copy}
							onTabChange={changeTab}
						/>
						<ProfileContent
							locale={locale}
							activeTab={activeTab}
							activeOrderStatus={activeOrderStatus}
							copy={copy}
							isEditing={isEditing}
							onOrderStatusChange={changeOrderStatus}
							onCancelEdit={() => setIsEditing(false)}
							onOpenSettings={() => {
								setOpenChangePassword(true);
								changeTab('settings');
							}}
							openChangePassword={openChangePassword}
							onProfileSaved={updatedProfile => {
								setCurrentProfile(updatedProfile);
								setIsEditing(false);
							}}
							profile={currentProfile}
						/>
					</div>
				</section>
			</div>
		</main>
	);
}
