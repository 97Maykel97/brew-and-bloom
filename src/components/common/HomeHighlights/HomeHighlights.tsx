import {
	Heart,
	HeartHandshake,
	House,
	Leaf,
	type LucideIcon,
} from 'lucide-react';

import Container from '../Container';
import styles from './HomeHighlights.module.scss';

export type THomeHighlightLabels = {
	freshCoffee: string;
	cozyAtmosphere: string;
	signatureDrinks: string;
	friendlyCommunity: string;
};

type THomeHighlightsProps = {
	labels: THomeHighlightLabels;
	isRtl?: boolean;
};

type THighlightItem = {
	icon: LucideIcon;
	labelKey: keyof THomeHighlightLabels;
};

const HIGHLIGHT_ITEMS: readonly THighlightItem[] = [
	{ icon: Leaf, labelKey: 'freshCoffee' },
	{ icon: House, labelKey: 'cozyAtmosphere' },
	{ icon: Heart, labelKey: 'signatureDrinks' },
	{ icon: HeartHandshake, labelKey: 'friendlyCommunity' },
];

export default function HomeHighlights({
	labels,
	isRtl = false,
}: THomeHighlightsProps) {
	return (
		<section
			aria-label={HIGHLIGHT_ITEMS.map(item => labels[item.labelKey]).join(', ')}
			className={styles.section}
			dir={isRtl ? 'rtl' : 'ltr'}
		>
			<Container>
				<ul className={styles.list}>
					{HIGHLIGHT_ITEMS.map(item => {
						const Icon = item.icon;
						const label = labels[item.labelKey];

						return (
							<li key={item.labelKey} className={styles.item}>
								<span className={styles.icon} aria-hidden='true'>
									<Icon size={31} strokeWidth={1.55} />
								</span>
								<span className={styles.label}>{label}</span>
							</li>
						);
					})}
				</ul>
			</Container>
		</section>
	);
}
