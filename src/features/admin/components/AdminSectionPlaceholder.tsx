import type { TAdminCopy, TAdminSection } from '../types';
import { adminNavigationItems } from './admin-navigation';

type TAdminSectionPlaceholderProps = {
	copy: TAdminCopy;
	section: Exclude<TAdminSection, 'overview'>;
};

export default function AdminSectionPlaceholder({
	copy,
	section,
}: TAdminSectionPlaceholderProps) {
	const navigationItem = adminNavigationItems.find(
		item => item.section === section,
	);
	const Icon = navigationItem?.icon;

	return (
		<section className='flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#e4d8cd] bg-white/75 px-5 py-12 text-center sm:min-h-[440px]'>
			{Icon ? (
				<div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#f1e5d8] text-[var(--accent)]'>
					<Icon size={24} strokeWidth={1.7} />
				</div>
			) : null}
			<h2 className='mt-5 text-2xl font-semibold'>
				{copy.navigation[section]}
			</h2>
			<p className='mt-2 max-w-md text-sm leading-6 text-[var(--muted)]'>
				{copy.sectionDescriptions[section]}
			</p>
		</section>
	);
}
