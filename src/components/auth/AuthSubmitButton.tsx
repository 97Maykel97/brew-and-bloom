type TAuthSubmitButtonProps = {
	label: string;
	loadingLabel: string;
	isLoading: boolean;
};

export default function AuthSubmitButton({
	label,
	loadingLabel,
	isLoading,
}: TAuthSubmitButtonProps) {
	return (
		<button
			type='submit'
			disabled={isLoading}
			className='mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-[var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(74,56,44,0.2)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#3b2c23] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60'
		>
			{isLoading ? loadingLabel : label}
		</button>
	);
}
