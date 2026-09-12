import Link from 'next/link';
import type { TProfileCopy } from '../profile-copy';
import type { TProfileTab } from '../types';

type TProfileSectionTabsProps = {
	activeTab: TProfileTab;
	copy: TProfileCopy;
};

export default function ProfileSectionTabs({
	activeTab,
	copy,
}: TProfileSectionTabsProps) {
	if (activeTab !== 'orders' && activeTab !== 'favorites') {
		return null;
	}

	const items = [
		{ tab: 'orders', label: copy.orders },
		{ tab: 'favorites', label: copy.favorites },
	] as const;

	return (
		<div
			id='orders'
			className='mt-8 hidden items-center gap-6 border-b border-[#e2d7cc] lg:flex'
		>
			{items.map(item => (
				<Link
					key={item.tab}
					href={'?tab=' + item.tab + '#' + item.tab}
					className={
						'border-b-2 pb-3 text-sm ' +
						(activeTab === item.tab
							? 'border-[var(--accent)] font-semibold'
							: 'border-transparent text-[var(--muted)] transition hover:text-[var(--foreground)]')
					}
				>
					{item.label}
				</Link>
			))}
		</div>
	);
}
