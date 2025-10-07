"use client";

import { useEffect, useState } from "react";
import FormInput from "../../ui/FormInput";
import { apiFetch } from "../../lib/api";

type Client = { id: string; name: string };

export default function ClientsPage() {
	const [name, setName] = useState("");
	const [items, setItems] = useState<Client[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function load() {
		try {
			const data = await apiFetch<Client[]>("/clients", { method: "GET" });
			setItems(data);
		} catch (err) {
			setError(err?.message || "Failed to load clients");
		}
	}

	useEffect(() => {
		load();
	}, []);

	async function addItem() {
		if (!name.trim()) return;
		setLoading(true);
		setError(null);
		try {
			const created = await apiFetch<Client>("/clients", {
				method: "POST",
				body: JSON.stringify({ name: name.trim() }),
			});
			setItems([created, ...items]);
			setName("");
		} catch (err) {
			setError(err?.message || "Failed to add client");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="px-4 py-6">
			<h1 className="mb-4 text-lg font-semibold">Clients</h1>
			<div className="grid gap-3">
				<div className="flex gap-2">
					<FormInput label="Client name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Jane Doe" />
					<button disabled={loading} onClick={addItem} className="h-11 shrink-0 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">{loading ? "Adding..." : "Add"}</button>
				</div>
				{error ? <p className="text-[12px] text-destructive">{error}</p> : null}
				<ul className="divide-y divide-border rounded-xl border border-border">
					{items.length === 0 ? (
						<li className="p-4 text-center text-xs text-muted-foreground">No clients yet</li>
					) : (
						items.map((it) => (
							<li key={it.id} className="p-4 text-sm">{it.name}</li>
						))
					)}
				</ul>
			</div>
		</main>
	);
} 