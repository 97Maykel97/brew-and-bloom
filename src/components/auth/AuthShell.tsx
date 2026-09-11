'use client';

import { useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import LanguageSwitcher from '@/components/UI/LanguageSwitcher';

type TAuthShellProps = {
	locale: string;
	title: string;
	description?: string;
	children: ReactNode;
	wide?: boolean;
};

export default function AuthShell({
	locale,
	title,
	description,
	children,
	wide = false,
}: TAuthShellProps) {
	const pathname = usePathname() ?? '/' + locale;
	const pathLocale = pathname.split('/')[1];
	const currentLocale = ['ru', 'en', 'he'].includes(pathLocale)
		? pathLocale
		: locale;
	const isHebrew = currentLocale === 'he';
	const backLabel =
		currentLocale === 'he'
			? 'חזרה'
			: currentLocale === 'en'
				? 'Back'
				: 'Назад';
	const backHref = '/' + currentLocale;
	const backgroundImage = isHebrew
		? '/home-hero-background-he.png'
		: '/home-hero-background.png';

	useEffect(() => {
		function handleBrowserBack() {
			window.location.replace('/' + currentLocale);
		}

		window.addEventListener('popstate', handleBrowserBack);
		return () => window.removeEventListener('popstate', handleBrowserBack);
	}, [currentLocale]);

	return (
		<main
			dir={isHebrew ? 'rtl' : 'ltr'}
			className='relative isolate min-h-[100svh] overflow-hidden bg-[var(--background)]'
		>
			<div className='absolute inset-0'>
				<Image
					src={backgroundImage}
					alt=''
					fill
					priority
					sizes='100vw'
					className='object-cover object-center'
				/>
				<div className='absolute inset-0 bg-[#f5efe7]/38 backdrop-blur-[1px]' />
				<div className='absolute inset-0 bg-gradient-to-b from-[#f5efe7]/24 via-[#f5efe7]/32 to-[#f5efe7]/52' />
			</div>

			<div className='relative z-10 min-h-[100svh] px-0 py-2 sm:px-6 sm:py-6 lg:px-8'>
				<div className='mx-auto flex min-h-[calc(100svh-1rem)] w-full max-w-[1180px] items-center justify-center py-3 sm:min-h-[calc(100svh-3rem)] sm:py-6'>
					<div
						className={
							'flex w-[calc(100%_-_1.5rem)] flex-col gap-2 sm:w-full ' +
							(wide ? 'max-w-[540px]' : 'max-w-[440px]')
						}
					>
						<div className='flex min-h-10 items-center justify-between px-1'>
							<Link
								href={backHref}
								aria-label={backLabel}
								className='flex h-10 cursor-pointer items-center gap-1 rounded-full px-2 text-sm font-medium text-[var(--foreground)] transition duration-200 hover:scale-105 hover:bg-white/45 active:scale-95'
							>
								{isHebrew ? (
									<ArrowRight size={17} strokeWidth={1.8} />
								) : (
									<ArrowLeft size={17} strokeWidth={1.8} />
								)}
								<span>{backLabel}</span>
							</Link>
							<LanguageSwitcher locale={locale} />
						</div>

					<section
						className='w-full rounded-[24px] border border-white/70 bg-[#fcf8f2]/94 p-4 shadow-[0_18px_45px_rgba(55,39,28,0.18)] backdrop-blur-md sm:rounded-[28px] sm:p-8 sm:shadow-[0_24px_70px_rgba(55,39,28,0.22)]'
					>
						<div className='mb-5 text-center sm:mb-7'>
							<Image
								src='/brand-logo.png'
								alt='Brew & Bloom'
								width={150}
								height={50}
								className='mx-auto h-auto w-[132px] sm:w-[138px]'
							/>
							<div className='mx-auto mt-4 h-px w-14 bg-[var(--border)] sm:mt-5' />
							<h1 className='mt-4 text-[2rem] leading-none text-[var(--foreground)] [font-family:var(--font-heading)] sm:mt-5 sm:text-[2.7rem]'>
								{title}
							</h1>
							{description && (
								<p className='mx-auto mt-3 max-w-[340px] text-sm leading-6 text-[var(--muted)]'>
									{description}
								</p>
							)}
						</div>

						{children}
					</section>
					</div>
				</div>
			</div>
		</main>
	);
}
