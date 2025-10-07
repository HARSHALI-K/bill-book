"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "./auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	useEffect(() => {
		const token = getAuthToken();
		if (!token) router.replace("/login");
	}, [router]);
	return <>{children}</>;
} 