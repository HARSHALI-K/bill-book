"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { apiFetch } from "../../lib/api";
import RHFInput from "@/app/hook/RHFInput";
import RHFAutoComplete from "@/app/hook/RHFAutocomplete";
import { Loader2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { DeleteDialog } from "@/components/deletedialog";

type Client = {
  id?: string;
  name: string;
  description?: string;
  email?: string;
  mobile_number?: string;
  address_line_1?: string;
  address_line_2?: string;
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  logo?: string;
  GSTIN?: string;
};

const schema = yup.object().shape({
  name: yup.string().required("Name is required").max(255),
  description: yup.string().max(500).nullable(),
  email: yup.string().email("Invalid email").nullable(),
  mobile_number: yup.string().max(20).nullable(),
  address_line_1: yup.string().max(255).nullable(),
  address_line_2: yup.string().max(255).nullable(),
  country: yup.string().max(100).nullable(),
  state: yup.string().max(100).nullable(),
  city: yup.string().max(100).nullable(),
  pincode: yup.string().max(20).nullable(),
  logo: yup.string().nullable(),
  GSTIN: yup.string().max(50).nullable(),
});

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const {
    handleSubmit,
    reset,
    control,
    setValue,
  } = useForm<Client>({
    resolver: yupResolver(schema),
  });

  // Load Clients
  async function loadClients() {
    setLoading(true);
    try {
      const res = await apiFetch<Client[]>("GET", "/organization/getAllClients");
      setClients(res?.data?.data ?? []);
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
  }, []);

  // Add or Update Client
  async function onSubmit(data: Client) {
    setLoading(true);
    try {
      if (editClient) {
        await apiFetch("POST", "/organization/updateClient", { ...data, id: editClient.id });
        toast.success("✅ Client updated successfully");
      } else {
        await apiFetch("POST", "/organization/createClient", data);
        toast.success("✅ Client added successfully");
      }
      await loadClients();
      reset();
      setEditClient(null);
      setShowForm(false);
    } catch {
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Delete Client
  async function onDelete(id?: string) {
    if (!id) return;
    setLoading(true);
    try {
      await apiFetch("DELETE", "/organization/deleteClient", { id });
      toast.success("🗑️ Client deleted successfully");
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Failed to delete client");
    } finally {
      setLoading(false);
    }
  }

  // Handle Edit
  function onEdit(client: Client) {
    setEditClient(client);
    setShowForm(true);
    Object.entries(client).forEach(([key, value]) => {
      setValue(key as keyof Client, value as any);
    });
  }

  return (
    <main className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Clients</h1>
        {clients.length > 0 && (
          <button
            onClick={() => {
              setShowForm((prev) => !prev);
              setEditClient(null);
              reset();
            }}
            className="flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium shadow hover:opacity-90"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" /> Close
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Client
              </>
            )}
          </button>
        )}
      </div>

      {/* Form */}
      {(showForm || clients.length === 0) && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 rounded-lg border border-border p-4 shadow-md bg-card mb-6"
        >
          <RHFInput control={control} name="name" label="Name" placeholder="Name" />
          <RHFInput control={control} name="description" label="Description" placeholder="Description" />
          <RHFInput control={control} name="email" label="Email" placeholder="Email" />
          <RHFInput control={control} name="mobile_number" label="Mobile Number" placeholder="Mobile Number" />
          <RHFInput control={control} name="address_line_1" label="Address Line 1" placeholder="Address Line 1" />
          <RHFInput control={control} name="address_line_2" label="Address Line 2" placeholder="Address Line 2" />
          <RHFInput control={control} name="country" label="Country" placeholder="Country" />
          <RHFInput control={control} name="state" label="State" placeholder="State" />
          <RHFInput control={control} name="city" label="City" placeholder="City" />
          <RHFInput control={control} name="pincode" label="Pincode" placeholder="Pincode" />
          <RHFInput control={control} name="logo" label="Logo URL" placeholder="Logo URL" />
          <RHFInput control={control} name="GSTIN" label="GSTIN" placeholder="GSTIN" />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {editClient ? "Update Client" : "Add Client"}
          </button>
        </form>
      )}

      {/* Client Cards */}
      {loading && clients.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Loading clients...</p>
        </div>
      ) : clients.length === 0 ? (
        <p className="text-muted-foreground text-center">No clients yet. Add one above 👆</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-1">
          {clients.map((c, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <h2 className="font-semibold text-lg">{c.name}</h2>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <p className="text-sm">Email: {c.email}</p>
                <p className="text-sm">Mobile: {c.mobile_number}</p>
                <p className="text-sm">Address: {c.address_line_1}, {c.address_line_2}</p>
                <p className="text-sm">City/State: {c.city}, {c.state}</p>
                <p className="text-sm">Country: {c.country} | Pincode: {c.pincode}</p>
                <p className="text-sm">GSTIN: {c.GSTIN}</p>
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0">
              
                <button
                  onClick={() => onEdit(c)}
                  className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600"
                >
                  Edit
                </button>
                <DeleteDialog
                  itemName={c.name}
                  onConfirm={() => onDelete(c.id)}
                  trigger={
                    <button className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600">
                      Delete
                    </button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
