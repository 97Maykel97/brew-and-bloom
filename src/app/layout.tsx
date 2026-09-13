import type { Metadata } from 'next';
import { Caveat, Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const headingFont = Cormorant_Garamond({
	variable: '--font-heading',
	subsets: ['latin', 'cyrillic'],
});

const bodyFont = Manrope({
	variable: '--font-body',
	subsets: ['latin', 'cyrillic'],
});

const handwrittenFont = Caveat({
	variable: '--font-handwritten',
	subsets: ['cyrillic'],
});

export const metadata: Metadata = {
	title: 'Brew & Bloom',
	description: 'Brew & Bloom coffee shop',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
	return (
		<html
			lang='en'
			className={`${headingFont.variable} ${bodyFont.variable} ${handwrittenFont.variable} h-full antialiased`}
		>
			<body className='min-h-full flex flex-col'>{children}</body>
		</html>
	);
}
