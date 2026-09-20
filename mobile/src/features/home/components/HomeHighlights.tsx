import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { THomeHighlightsTranslations } from '@/i18n/translations';
import { homeHighlightsStyles as styles } from './home-highlights.styles';

type THomeHighlightsProps = {
	copy: THomeHighlightsTranslations;
	isRtl: boolean;
};

type THighlightItem = {
	icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
	labelKey: keyof THomeHighlightsTranslations;
};

const HIGHLIGHT_ITEMS: readonly THighlightItem[] = [
	{ icon: 'leaf', labelKey: 'freshCoffee' },
	{ icon: 'home-outline', labelKey: 'cozyAtmosphere' },
	{ icon: 'heart-outline', labelKey: 'signatureDrinks' },
	{ icon: 'account-group-outline', labelKey: 'friendlyCommunity' },
];

export default function HomeHighlights({
	copy,
	isRtl,
}: THomeHighlightsProps) {
	return (
		<View style={styles.section}>
			<View style={[styles.grid, isRtl && styles.rtlGrid]}>
				{HIGHLIGHT_ITEMS.map((item, index) => (
					<View
						key={item.labelKey}
						style={[
							styles.item,
							index % 2 === 1 &&
								(isRtl
									? styles.secondColumnRtl
									: styles.secondColumn),
							index >= 2 && styles.secondRow,
							isRtl && styles.rtlItem,
						]}
					>
						<MaterialCommunityIcons
							name={item.icon}
							size={29}
							color={Colors.accent}
						/>
						<Text style={[styles.label, isRtl && styles.rtlText]}>
							{copy[item.labelKey]}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}
