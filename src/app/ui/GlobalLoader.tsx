"use client";

import { useEffect, useState } from "react";
import { subscribeApiActivity } from "../lib/api-events";

export default function GlobalLoader() {
	const [count, setCount] = useState(0);
	useEffect(() => {
		return subscribeApiActivity((delta) => {
			setCount((c) => Math.max(0, c + delta));
		});
	}, []);

	if (count <= 0) return null;
	return (
		<div className="fixed inset-0 z-[1000] grid place-items-center bg-background/60 backdrop-blur-sm">
			<div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
		</div>
	);
} 