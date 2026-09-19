import type { TAdminCopy, TAdminSection } from '../types';
import { adminNavigationItems } from './admin-navigation';

type TAdminMobileNavigationProps = {
	activeSection: TAdminSection;
	copy: TAdminCopy;
	onSectionChange: (section: TAdminSection) => void;
};

export default function AdminMobileNavigation({
	activeSection,
	copy,
	onSectionChange,
}: TAdminMobileNavigationProps) {
	return (
		<nav
			aria-label={copy.navigationLabel}
			className='lg:hidden'
		>
			<div className='grid grid-cols-2 gap-2'>
				{adminNavigationItems.map(item => {
					const Icon = item.icon;
					const isActive = activeSection === item.section;

					return (
						<button
							key={item.section}
							type='button'
							onClick={() => onSectionChange(item.section)}
							className={
								'inline-flex min-h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-full border px-3 text-xs font-medium transition sm:text-sm ' +
								(isActive
									? 'border-[var(--accent)] bg-[var(--accent)] text-white'
									: 'border-[#dfd3c7] bg-white/70 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]')
							}
						>
							<Icon size={16} strokeWidth={1.7} />
							<span className='truncate'>
								{copy.navigation[item.section]}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
