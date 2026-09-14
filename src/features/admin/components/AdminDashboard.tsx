'use client';

import { useEffect, useState } from 'react';

import type {
	TAdminCopy,
	TAdminLocale,
	TAdminSection,
} from '../types';
import { getAdminSection } from '../lib/admin-section';
import AdminMobileNavigation from './AdminMobileNavigation';
import AdminOverview from './AdminOverview';
import AdminSectionPlaceholder from './AdminSectionPlaceholder';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

type TAdminDashboardProps = {
	locale: TAdminLocale;
	activeSection: TAdminSection;
	copy: TAdminCopy;
	displayName: string;
};

export default function AdminDashboard({
	locale,
	activeSection: initialActiveSection,
	copy,
	displayName,
}: TAdminDashboardProps) {
	const [activeSection, setActiveSection] = useState(initialActiveSection);

	useEffect(() => {
		function syncSectionWithUrl() {
			const searchParams = new URLSearchParams(window.location.search);
			setActiveSection(
				getAdminSection(searchParams.get('section') ?? undefined),
			);
		}

		window.addEventListener('popstate', syncSectionWithUrl);
		return () => window.removeEventListener('popstate', syncSectionWithUrl);
	}, []);

	function changeSection(section: TAdminSection) {
		if (section === activeSection) return;

		setActiveSection(section);
		const url = new URL(window.location.href);

		if (section === 'overview') {
			url.searchParams.delete('section');
		} else {
			url.searchParams.set('section', section);
		}

		window.history.pushState(null, '', url);
	}

	return (
		<main
			dir={locale === 'he' ? 'rtl' : 'ltr'}
			className='min-h-screen bg-[#e9dfd4] text-[var(--foreground)] sm:px-6 sm:py-6'
		>
			<div className='mx-auto flex min-h-screen max-w-[1440px] overflow-hidden bg-[#f8f3ec] sm:min-h-[calc(100svh-3rem)] sm:rounded-[32px] sm:shadow-[0_24px_80px_rgba(55,39,28,0.18)]'>
				<AdminSidebar
					locale={locale}
					activeSection={activeSection}
					copy={copy}
					onSectionChange={changeSection}
				/>

				<section className='min-w-0 flex-1'>
					<AdminTopBar
						homeLabel={copy.home}
						profileLabel={copy.profile}
						locale={locale}
					/>

					<div className='mx-auto max-w-[1120px] px-4 py-6 sm:px-8 sm:py-9 lg:px-10 lg:py-10'>
						<header className='mb-6 sm:mb-8'>
							<div className='flex flex-wrap items-end justify-between gap-3'>
								<div>
									<p className='text-xs font-medium uppercase tracking-[0.15em] text-[var(--muted)]'>
										{copy.administrator}
									</p>
									<h1 className='mt-2 font-serif text-3xl leading-tight sm:text-4xl'>
										{copy.title}
									</h1>
									<p className='mt-2 text-sm text-[var(--muted)]'>
										{copy.subtitle}
									</p>
								</div>

								<div className='rounded-full border border-[#dfd3c7] bg-white/65 px-4 py-2 text-sm font-medium'>
									{displayName}
								</div>
							</div>
						</header>

						<div className='mb-5 sm:mb-6'>
							<AdminMobileNavigation
								activeSection={activeSection}
								copy={copy}
								onSectionChange={changeSection}
							/>
						</div>

						{activeSection === 'overview' ? (
							<AdminOverview copy={copy} />
						) : (
							<AdminSectionPlaceholder
								copy={copy}
								section={activeSection}
							/>
						)}
					</div>
				</section>
			</div>
		</main>
	);
}
