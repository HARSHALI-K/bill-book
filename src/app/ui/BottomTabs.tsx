"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearAuthToken } from "../lib/auth";
import {
  Home,
  Package,
  Users,
  FileText,
  LogOut,
} from "lucide-react"; // ⬅️ icons

const tabs = [
  { href: "/dashboard/home", label: "Home", icon: Home },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/quotations", label: "Quotation", icon: FileText },
];

export default function BottomTabs() {
  const pathname = usePathname();
  const router = useRouter();

  function onLogout() {
    clearAuthToken();
    router.replace("/login");
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
      <div className="mx-auto grid h-16 w-full max-w-[480px] grid-cols-5">
        {tabs.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{tab.label}</span>
            </Link>
          );
        })}

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-destructive hover:opacity-90 transition-colors"
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
