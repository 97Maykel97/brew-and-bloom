import { Pressable, Text, View } from 'react-native';

import type { TProfileTranslations } from '../profileTranslations';
import type { TProfileOrderStatus } from '../types';
import EmptyProfileState from './EmptyProfileState';
import { profileContentStyles as styles } from './profile-content.styles';

type TProfileListProps = {
	activeStatus: TProfileOrderStatus;
	activeTab: 'bookings' | 'favorites' | 'orders';
	copy: TProfileTranslations;
	isRtl: boolean;
	onStatusChange: (status: TProfileOrderStatus) => void;
};

export default function ProfileList({
	activeStatus,
	activeTab,
	copy,
	isRtl,
	onStatusChange,
}: TProfileListProps) {
	const isOrders = activeTab === 'orders';
	const title = isOrders ? copy.emptyOrders : copy.emptyBookings;
	const description = isOrders
		? copy.emptyOrdersText
		: copy.emptyBookingsText;

	if (activeTab === 'favorites') {
		return (
			<EmptyProfileState
				description={copy.emptyFavoritesText}
				icon='heart'
				isRtl={isRtl}
				title={copy.emptyFavorites}
			/>
		);
	}

	return (
		<View style={styles.list}>
			{isOrders ? (
				<OrderStatuses
					activeStatus={activeStatus}
					copy={copy}
					onStatusChange={onStatusChange}
				/>
			) : null}
			<EmptyProfileState
				description={description}
				icon={isOrders ? 'shopping-bag' : 'calendar'}
				isRtl={isRtl}
				title={title}
			/>
		</View>
	);
}

type TOrderStatusesProps = {
	activeStatus: TProfileOrderStatus;
	copy: TProfileTranslations;
	onStatusChange: (status: TProfileOrderStatus) => void;
};

function OrderStatuses({
	activeStatus,
	copy,
	onStatusChange,
}: TOrderStatusesProps) {
	const statuses: {
		key: TProfileOrderStatus;
		label: string;
	}[] = [
		{ key: 'all', label: copy.allOrders },
		{ key: 'processing', label: copy.processingOrders },
		{ key: 'ready', label: copy.readyOrders },
		{ key: 'completed', label: copy.completedOrders },
	];

	return (
		<View style={styles.statuses}>
			{statuses.map(status => (
				<Pressable
					key={status.key}
					onPress={() => onStatusChange(status.key)}
					style={({ pressed }) => [
						styles.status,
						activeStatus === status.key && styles.activeStatus,
						pressed && styles.pressed,
					]}
				>
					<Text style={styles.statusText}>{status.label}</Text>
				</Pressable>
			))}
		</View>
	);
}
