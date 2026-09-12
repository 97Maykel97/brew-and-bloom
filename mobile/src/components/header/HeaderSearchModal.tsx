import { Feather } from '@expo/vector-icons';
import {
	Modal,
	Pressable,
	StyleSheet,
	TextInput,
} from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';

type THeaderSearchModalProps = {
	visible: boolean;
	isRtl: boolean;
	query: string;
	placeholder: string;
	onChangeQuery: (query: string) => void;
	onClose: () => void;
	onAction: () => void;
};

export default function HeaderSearchModal({
	visible,
	isRtl,
	query,
	placeholder,
	onChangeQuery,
	onClose,
	onAction,
}: THeaderSearchModalProps) {
	return (
		<Modal
			animationType='fade'
			onRequestClose={onClose}
			transparent
			visible={visible}
		>
			<Pressable style={styles.overlay} onPress={onClose}>
				<Pressable
					style={styles.searchBar}
					onPress={event => event.stopPropagation()}
				>
					<Feather name='search' size={19} color={Colors.muted} />
					<TextInput
						autoFocus
						accessibilityLabel='Search'
						onChangeText={onChangeQuery}
						placeholder={placeholder}
						placeholderTextColor={Colors.muted}
						style={[styles.input, isRtl && styles.rtlText]}
						value={query}
					/>
					<Pressable
						accessibilityLabel='Clear or close search'
						accessibilityRole='button'
						onPress={onAction}
						style={styles.clearButton}
					>
						<Feather name='x' size={18} color={Colors.foreground} />
					</Pressable>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		paddingTop: 84,
		paddingHorizontal: Spacing.medium,
		backgroundColor: 'rgba(43, 33, 27, 0.18)',
	},
	searchBar: {
		minHeight: 52,
		paddingHorizontal: Spacing.medium,
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.small,
		borderRadius: 12,
		backgroundColor: Colors.background,
		shadowColor: Colors.foreground,
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 4,
	},
	input: {
		flex: 1,
		minWidth: 0,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 15,
	},
	rtlText: {
		writingDirection: 'rtl',
	},
	clearButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
