"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import GlobalLoader from "./GlobalLoader";
import { Toaster } from "react-hot-toast";

export default function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const showNavbar = pathname !== "/login";
	return (
		<div className="mx-auto min-h-dvh w-full max-w-[480px] bg-background">
			<GlobalLoader />
			{showNavbar ? <Navbar /> : null}
			<div className={showNavbar ? "pb-20" : undefined}>{children}</div>
			<Toaster position="top-right" toastOptions={{ duration: 3000 }} />
		</div>
	);
} 