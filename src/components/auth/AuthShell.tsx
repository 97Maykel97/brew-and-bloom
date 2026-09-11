'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';

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
	const isHebrew = locale === 'he';
	const backgroundImage = isHebrew
		? '/home-hero-background-he.png'
		: '/home-hero-background.png';

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
				<div className='mx-auto flex w-full max-w-[1180px] justify-end px-3 sm:px-0'>
					<LanguageSwitcher locale={locale} />
				</div>

				<div className='mx-auto flex min-h-[calc(100svh-4.5rem)] w-full max-w-[1180px] items-start justify-center py-4 sm:py-8'>
					<section
						className={
							'my-auto w-[calc(100%_-_1.5rem)] rounded-[24px] border border-white/70 bg-[#fcf8f2]/94 p-4 shadow-[0_18px_45px_rgba(55,39,28,0.18)] backdrop-blur-md sm:w-full sm:rounded-[28px] sm:p-8 sm:shadow-[0_24px_70px_rgba(55,39,28,0.22)] ' +
							(wide ? 'max-w-[540px]' : 'max-w-[440px]')
						}
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
		</main>
	);
}
