type TOrderChangedListener = () => void;

const listeners = new Set<TOrderChangedListener>();

export function notifyOrderChanged() {
	listeners.forEach(listener => listener());
}

export function subscribeToOrderChanges(listener: TOrderChangedListener) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}
