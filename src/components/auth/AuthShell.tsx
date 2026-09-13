'use client';

import { useEffect, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import { isSupportedLocale } from '@/i18n/languages';

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
	const router = useRouter();
	const pathname = usePathname() ?? '/' + locale;
	const pathLocale = pathname.split('/')[1] ?? '';
	const currentLocale = isSupportedLocale(pathLocale)
		? pathLocale
		: locale;
	const isHebrew = currentLocale === 'he';
	const isLoginPage = pathname.endsWith('/auth/login');
	const authLabel =
		currentLocale === 'he'
			? 'חזרה להתחברות'
			: currentLocale === 'en'
				? 'Back to sign in'
				: 'К авторизации';
	const homeLabel =
		currentLocale === 'he'
			? 'חזרה לדף הבית'
			: currentLocale === 'en'
				? 'Back to home'
				: 'На главную';
	const authHref = '/' + currentLocale + '/auth/login';
	const homeHref = '/' + currentLocale;
	const backgroundImage = isHebrew
		? '/cafe-hero-background-rtl.png'
		: '/cafe-hero-background.png';

	useEffect(() => {
		function handleBrowserBack() {
			router.replace(homeHref);
		}

		window.addEventListener('popstate', handleBrowserBack);
		return () => window.removeEventListener('popstate', handleBrowserBack);
	}, [homeHref, router]);

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
						<div className='flex min-h-10 items-center justify-between gap-2 px-1'>
							<div className='flex min-w-0 flex-wrap items-center gap-1'>
								{!isLoginPage && (
									<Link
										href={authHref}
										aria-label={authLabel}
										className='flex min-h-10 cursor-pointer items-center gap-1 rounded-full px-2 text-xs font-medium text-[var(--foreground)] transition duration-200 hover:scale-105 hover:bg-white/45 active:scale-95 sm:text-sm'
									>
										{isHebrew ? (
											<ArrowRight size={17} strokeWidth={1.8} />
										) : (
											<ArrowLeft size={17} strokeWidth={1.8} />
										)}
										<span>{authLabel}</span>
									</Link>
								)}
								<Link
									href={homeHref}
									aria-label={homeLabel}
									className='flex min-h-10 cursor-pointer items-center gap-1 rounded-full px-2 text-xs font-medium text-[var(--foreground)] transition duration-200 hover:scale-105 hover:bg-white/45 active:scale-95 sm:text-sm'
								>
									{isHebrew ? (
										<ArrowRight size={17} strokeWidth={1.8} />
									) : (
										<ArrowLeft size={17} strokeWidth={1.8} />
									)}
									<span>{homeLabel}</span>
								</Link>
							</div>
							<LanguageSwitcher locale={currentLocale} />
						</div>

						<section className='w-full rounded-[24px] border border-white/70 bg-[#fcf8f2]/94 p-4 shadow-[0_18px_45px_rgba(55,39,28,0.18)] backdrop-blur-md sm:rounded-[28px] sm:p-8 sm:shadow-[0_24px_70px_rgba(55,39,28,0.22)]'>
							<div className='mb-5 text-center sm:mb-7'>
								<Image
									src='/brew-and-bloom-logo.png'
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
