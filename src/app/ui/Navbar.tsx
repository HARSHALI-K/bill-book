"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function LogoIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
			<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" strokeWidth="1.6" />
			<path d="M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
		</svg>
	);
}

export default function Navbar() {
	const pathname = usePathname();
	const title = pathname?.split("/").filter(Boolean)[0] ?? "";
	const label = (
		title === "login" ? "Login" :
		title === "dashboard" ? "Dashboard" :
		title === "home" ? "Home" :
		title === "products" ? "Products" :
		title === "clients" ? "Clients" :
		title === "quotations" ? "Quotations" :
		""
	);

	return (
		<header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
			<div className="mx-auto flex h-12 w-full max-w-[480px] items-center justify-between px-4">
				<Link href="/dashboard/home" className="flex items-center gap-2 text-sm font-semibold">
					<LogoIcon />
					<span>BillBook</span>
				</Link>
				<div className="text-sm font-medium">{label}</div>
				<button className="h-7 w-7 overflow-hidden rounded-full border border-border bg-muted transition hover:opacity-90" aria-label="Profile" />
			</div>
		</header>
	);
} 