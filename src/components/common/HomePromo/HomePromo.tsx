import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

import Container from '../Container';
import styles from './HomePromo.module.scss';

export type THomePromoCopy = {
	title: string;
	description: string;
	button: string;
};

type THomePromoProps = {
	copy: THomePromoCopy;
	isRtl?: boolean;
	locale: string;
};

export default function HomePromo({
	copy,
	isRtl = false,
	locale,
}: THomePromoProps) {
	const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

	return (
		<section className={styles.section}>
			<Container>
				<div
					className={`${styles.banner} ${isRtl ? styles.rtl : ''}`}
					dir={isRtl ? 'rtl' : 'ltr'}
				>
					<div className={styles.content}>
						<h2 className={styles.title}>{copy.title}</h2>
						<p className={styles.description}>{copy.description}</p>
						<Link className={styles.button} href={`/${locale}#bestsellers`}>
							{copy.button}
							<ArrowIcon aria-hidden='true' size={16} strokeWidth={1.8} />
						</Link>
					</div>
				</div>
			</Container>
		</section>
	);
}
