type Listener = (delta: number) => void;

const listeners: Listener[] = [];

export function subscribeApiActivity(listener: Listener) {
	listeners.push(listener);
	return () => {
		const idx = listeners.indexOf(listener);
		if (idx >= 0) listeners.splice(idx, 1);
	};
}

export function notifyApiActivity(delta: number) {
	for (const l of listeners) l(delta);
} 