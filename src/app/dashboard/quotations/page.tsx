"use client";

import { useEffect, useState } from "react";
import FormInput from "../../ui/FormInput";
import FormSelect from "../../ui/FormSelect";
import { apiFetch } from "../../lib/api";

type Quotation = { id: string; client: string; product: string; price: number };

type Option = { label: string; value: string };

export default function QuotationsPage() {
	const [client, setClient] = useState("");
	const [product, setProduct] = useState("");
	const [price, setPrice] = useState("");
	const [items, setItems] = useState<Quotation[]>([]);
	const [clients, setClients] = useState<Option[]>([]);
	const [products, setProducts] = useState<Option[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function load() {
		try {
			const [qs, cs, ps] = await Promise.all([
				apiFetch<Quotation[]>("/quotations", { method: "GET" }),
				apiFetch<{ id: string; name: string }[]>("/clients", { method: "GET" }),
				apiFetch<{ id: string; name: string }[]>("/products", { method: "GET" }),
			]);
			setItems(qs);
			setClients(cs.map((c) => ({ label: c.name, value: c.id })));
			setProducts(ps.map((p) => ({ label: p.name, value: p.id })));
		} catch (err: any) {
			setError(err?.message || "Failed to load quotations");
		}
	}

	useEffect(() => {
		load();
	}, []);

	async function addItem() {
		if (!client || !product || !price) return;
		setLoading(true);
		setError(null);
		try {
			const created = await apiFetch<Quotation>("/quotations", {
				method: "POST",
				body: JSON.stringify({ clientId: client, productId: product, price: parseFloat(price) }),
			});
			setItems([created, ...items]);
			setClient("");
			setProduct("");
			setPrice("");
		} catch (err: any) {
			setError(err?.message || "Failed to add quotation");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="px-4 py-6">
			<h1 className="mb-4 text-lg font-semibold">Quotations</h1>
			<div className="grid gap-3">
				<FormSelect
					label="Client"
					value={client}
					onChange={(e) => setClient(e.target.value)}
					options={clients}
					placeholder="Select client"
				/>
				<FormSelect
					label="Product"
					value={product}
					onChange={(e) => setProduct(e.target.value)}
					options={products}
					placeholder="Select product"
				/>
				<FormInput label="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
				<button disabled={loading} onClick={addItem} className="h-11 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{loading ? "Adding..." : "Add quotation"}</button>
				{error ? <p className="text-[12px] text-destructive">{error}</p> : null}
				<ul className="divide-y divide-border rounded-xl border border-border">
					{items.length === 0 ? (
						<li className="p-4 text-center text-xs text-muted-foreground">No quotations yet</li>
					) : (
						items.map((it) => (
							<li key={it.id} className="grid grid-cols-3 gap-2 p-4 text-sm">
								<span>{it.client}</span>
								<span className="text-muted-foreground">{it.product}</span>
								<span className="text-right font-medium">${it.price}</span>
							</li>
						))
					)}
				</ul>
			</div>
		</main>
	);
} 