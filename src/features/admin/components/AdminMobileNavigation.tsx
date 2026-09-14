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
			className='-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8 lg:hidden'
		>
			<div className='flex w-max min-w-full gap-2'>
				{adminNavigationItems.map(item => {
					const Icon = item.icon;
					const isActive = activeSection === item.section;

					return (
						<button
							key={item.section}
							type='button'
							onClick={() => onSectionChange(item.section)}
							className={
								'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-xs font-medium whitespace-nowrap transition sm:text-sm ' +
								(isActive
									? 'border-[var(--accent)] bg-[var(--accent)] text-white'
									: 'border-[#dfd3c7] bg-white/70 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--foreground)]')
							}
						>
							<Icon size={16} strokeWidth={1.7} />
							<span>{copy.navigation[item.section]}</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}
