type TAuthMessageProps = {
	children: string;
};

export default function AuthMessage({
	children,
}: TAuthMessageProps) {
	return (
		<p
			role='status'
			className='mt-4 rounded-2xl bg-[var(--background)] px-4 py-3 text-center text-sm leading-5 text-[var(--accent)]'
		>
			{children}
		</p>
	);
}
