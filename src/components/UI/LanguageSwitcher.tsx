'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

type TLocale = 'ru' | 'en' | 'he';

type TLanguageSwitcherProps = {
	locale: string;
};

const languageOptions: Array<{
	code: TLocale;
	label: string;
	name: string;
}> = [
	{ code: 'ru', label: 'RU', name: '\u0420\u0443\u0441\u0441\u043a\u0438\u0439' },
	{ code: 'en', label: 'EN', name: 'English' },
	{ code: 'he', label: 'HE', name: '\u05e2\u05d1\u05e8\u05d9\u05ea' },
];

function getLocalizedPath(pathname: string, locale: TLocale): string {
	const segments = pathname.split('/');

	if (languageOptions.some(option => option.code === segments[1])) {
		segments[1] = locale;
		return segments.join('/') || `/${locale}`;
	}

	return `/${locale}${pathname === '/' ? '' : pathname}`;
}

export default function LanguageSwitcher({
	locale,
}: TLanguageSwitcherProps) {
	const pathname = usePathname() ?? `/${locale}`;

	return (
		<details className='relative shrink-0'>
			<summary className='flex h-10 cursor-pointer list-none items-center gap-1 px-1 text-sm font-medium text-[var(--foreground)] transition-transform duration-200 hover:scale-105 [&::-webkit-details-marker]:hidden'>
				{locale.toUpperCase()}
				<ChevronDown size={13} strokeWidth={1.8} />
			</summary>

			<div className='absolute top-full right-0 z-30 min-w-40 max-w-[calc(100vw-1rem)] overflow-hidden rounded-xl bg-[var(--background)] p-1 shadow-md ring-1 ring-black/10'>
				{languageOptions
					.filter(option => option.code !== locale)
					.map(option => (
						<Link
							key={option.code}
							href={getLocalizedPath(pathname, option.code)}
							className='flex min-h-9 items-center justify-between gap-3 whitespace-nowrap rounded-lg px-3 text-sm text-[var(--foreground)] transition-colors hover:bg-black/5'
						>
							<span>{option.label}</span>
							<span className='text-xs text-[var(--muted)]'>
								{option.name}
							</span>
						</Link>
					))}
			</div>
		</details>
	);
}
