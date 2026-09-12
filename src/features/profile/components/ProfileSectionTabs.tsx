import type { TProfileCopy } from '../profile-copy';
import type { TProfileTab } from '../types';

type TProfileSectionTabsProps = {
	activeTab: TProfileTab;
	copy: TProfileCopy;
	onTabChange: (tab: TProfileTab) => void;
};

export default function ProfileSectionTabs({
	activeTab,
	copy,
	onTabChange,
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
				<button
					key={item.tab}
					type='button'
					onClick={() => onTabChange(item.tab)}
					className={
						'cursor-pointer border-b-2 pb-3 text-sm ' +
						(activeTab === item.tab
							? 'border-[var(--accent)] font-semibold'
							: 'border-transparent text-[var(--muted)] transition hover:text-[var(--foreground)]')
					}
				>
					{item.label}
				</button>
			))}
		</div>
	);
}
