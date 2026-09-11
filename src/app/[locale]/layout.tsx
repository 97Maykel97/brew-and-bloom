import type { ReactNode } from 'react';

type TLocaleLayoutProps = {
	children: ReactNode;
	params: Promise<{
		locale: string;
	}>;
};

export default async function LocaleLayout({
	children,
	params,
}: TLocaleLayoutProps) {
	const { locale } = await params;
	const isRtl = locale === 'he';

	return (
		<div
			lang={locale}
			dir={isRtl ? 'rtl' : 'ltr'}
			className='flex min-h-full min-w-0 flex-1 flex-col'
		>
			{children}
		</div>
	);
}
