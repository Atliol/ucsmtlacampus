interface MobileControlsProps {
	onHold: (key: string) => void;
	onRelease: (key: string) => void;
}

export function MobileControls({ onHold, onRelease }: MobileControlsProps) {
	function buttonHandlers(key: string) {
		return {
			onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				onHold(key);
			},
			onPointerUp: () => onRelease(key),
			onPointerCancel: () => onRelease(key),
			onLostPointerCapture: () => onRelease(key),
		};
	}

	return (
		<div className="mobile-controls" aria-label="Movement controls">
			<button className="up" aria-label="Move forward" {...buttonHandlers("w")}>↑</button>
			<button className="left" aria-label="Move left" {...buttonHandlers("a")}>←</button>
			<button className="down" aria-label="Move backward" {...buttonHandlers("s")}>↓</button>
			<button className="right" aria-label="Move right" {...buttonHandlers("d")}>→</button>
			<button className="sprint" aria-label="Run" {...buttonHandlers("shift")}>RUN</button>
			<button className="interact" aria-label="Interact" {...buttonHandlers("e")}>E</button>
		</div>
	);
}
