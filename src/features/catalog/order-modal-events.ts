export const ORDER_CHANGED_EVENT = 'brew-bloom:order-changed';

export function notifyOrderChanged() {
	window.dispatchEvent(new Event(ORDER_CHANGED_EVENT));
}
