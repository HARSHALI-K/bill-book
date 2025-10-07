export default function HomePage() {
	return (
		<main className="px-4 py-6">
			<h1 className="mb-4 text-lg font-semibold">Home</h1>
			<div className="grid gap-3">
				<a href="/dashboard/products" className="card block h-24 rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
					<div className="text-sm font-medium">Products</div>
					<div className="text-xs text-muted-foreground">Manage your product catalog</div>
				</a>
				<a href="/dashboard/clients" className="card block h-24 rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
					<div className="text-sm font-medium">Clients</div>
					<div className="text-xs text-muted-foreground">Your customer list</div>
				</a>
				<a href="/dashboard/quotations" className="card block h-24 rounded-2xl p-4 transition-transform hover:-translate-y-0.5">
					<div className="text-sm font-medium">Quotations</div>
					<div className="text-xs text-muted-foreground">Create and track quotes</div>
				</a>
			</div>
		</main>
	);
} 