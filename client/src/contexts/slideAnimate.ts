import { tweened } from 'svelte/motion';
import { cubicOut, linear } from 'svelte/easing';
const TWEEN_SETTINGS = { easing: linear, duration: 100 };

function getHeightSpring() {
	const heightSpring = tweened(0, TWEEN_SETTINGS);

	const sync = (open, height) => {
		heightSpring.set(open ? height || 0 : 0, TWEEN_SETTINGS);
	};

	return { sync, heightSpring };
}

export default function slideAnimate(el, open) {
	el.parentNode.style.overflow = 'hidden';

	const { heightSpring, sync } = getHeightSpring();
	const doUpdate = () => sync(open, el.offsetHeight);

	let currentHeight = null;
	const ro = new ResizeObserver(() => {
		const newHeight = el.offsetHeight;

		if (typeof currentHeight === 'number') {
			Object.assign(heightSpring, 0, TWEEN_SETTINGS);
		}

		currentHeight = newHeight;
		doUpdate();
	});

	const springCleanup = heightSpring.subscribe((height) => {
		el.parentNode.style.height = `${height}px`;
	});

	ro.observe(el);

	return {
		update(isOpen) {
			open = isOpen;
			Object.assign(heightSpring, 0, TWEEN_SETTINGS);
			doUpdate();
		},
		destroy() {
			ro.disconnect();
			springCleanup();
		},
	};
}
