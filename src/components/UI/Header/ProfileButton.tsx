'use client';

import { UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

type TProfileButtonProps = {
	href: string;
	onNavigate?: () => void;
};

export default function ProfileButton({
	href,
	onNavigate,
}: TProfileButtonProps) {
	const router = useRouter();

	useEffect(() => {
		router.prefetch(href);
	}, [href, router]);

	function handleClick() {
		onNavigate?.();
		router.push(href);
	}

	return (
		<button
			type='button'
			aria-label='Profile'
			onClick={handleClick}
			className='flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center transition-transform duration-200 hover:scale-110 active:scale-95'
		>
			<UserRound size={18} strokeWidth={1.8} />
		</button>
	);
}
