import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';

import type { THomeProduct } from '@/features/catalog/home-products';

type TCustomerProductCardProps = {
	actionLabel?: string;
	createdAt?: string;
	description: string;
	name: string;
	onAction?: () => void;
	product: THomeProduct;
	quantity?: number;
	statusLabel?: string;
};

export default function CustomerProductCard({
	actionLabel,
	createdAt,
	description,
	name,
	onAction,
	product,
	quantity,
	statusLabel,
}: TCustomerProductCardProps) {
	return (
		<article className='flex gap-4 rounded-2xl border border-[#e5dcd3] bg-white/70 p-3 shadow-[0_10px_28px_rgba(63,43,31,0.05)] sm:p-4'>
		<div className='relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-[#efe4d7] sm:h-28 sm:w-36'>
			<Image
				alt={name}
				className='object-cover'
				fill
				sizes='(max-width: 640px) 112px, 144px'
				src={product.image}
			/>
		</div>

		<div className='flex min-w-0 flex-1 flex-col'>
			<div className='flex items-start justify-between gap-3'>
				<div className='min-w-0'>
					<h3 className='truncate text-sm font-semibold sm:text-base'>{name}</h3>
					<p className='mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]'>
						{description}
					</p>
				</div>

				{onAction ? (
					<button
						aria-label={actionLabel}
						className='inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#f3e8df] text-[#a65345] transition hover:bg-[#a65345] hover:text-white'
						onClick={onAction}
						type='button'
					>
						<Heart aria-hidden='true' fill='currentColor' size={17} />
					</button>
				) : null}
			</div>

			<div className='mt-auto flex flex-wrap items-end justify-between gap-2 pt-3'>
				<div>
					<p className='text-sm font-bold' dir='ltr'>
						{product.price * (quantity ?? 1)} ₪
					</p>
					{quantity && quantity > 1 ? (
						<p className='mt-0.5 text-[11px] text-[var(--muted)]'>
							{product.price} ₪ × {quantity}
						</p>
					) : null}
				</div>

				{statusLabel ? (
					<span className='inline-flex items-center gap-1.5 rounded-full bg-[#e7f0e2] px-3 py-1 text-[11px] font-semibold text-[#526c48]'>
						<ShoppingBag aria-hidden='true' size={13} />
						{statusLabel}
					</span>
				) : createdAt ? (
					<time className='text-[11px] text-[var(--muted)]'>{createdAt}</time>
				) : null}
			</div>
		</div>
	</article>
	);
}
