import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

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
	const messages = await getMessages();
	const isRtl = locale === 'he';

	return (
		<NextIntlClientProvider locale={locale} messages={messages}>
			<div
				lang={locale}
				dir={isRtl ? 'rtl' : 'ltr'}
				className='flex min-h-full min-w-0 flex-1 flex-col'
			>
				{children}
			</div>
		</NextIntlClientProvider>
	);
}
