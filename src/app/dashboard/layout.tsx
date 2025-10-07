import BottomTabs from "../ui/BottomTabs";
import RequireAuth from "../lib/require-auth";

export default function DashboardLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<RequireAuth>
			<div className="pb-16">
				{children}
				<BottomTabs />
			</div>
		</RequireAuth>
	);
} 