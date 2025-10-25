"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { apiFetch } from "../../lib/api";
import RHFInput from "@/app/hook/RHFInput";
import { Loader2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";
import { DeleteDialog } from "@/components/deletedialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [openDialog, setOpenDialog] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);

  const { handleSubmit, reset, control, setValue } = useForm<Client>({
    resolver: yupResolver(schema),
  });

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

  async function onSubmit(data: Client) {
    setLoading(true);
    try {
      if (editClient) {
        await apiFetch("POST", "/organization/updateClient", {
          ...data,
          id: editClient.id,
        });
        toast.success("✅ Client updated successfully");
      } else {
        await apiFetch("POST", "/organization/createClient", data);
        toast.success("✅ Client added successfully");
      }
      await loadClients();
      reset();
      setEditClient(null);
      setOpenDialog(false);
    } catch {
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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

  function onEdit(client: Client) {
    setEditClient(client);
    setOpenDialog(true);
    Object.entries(client).forEach(([key, value]) => {
      setValue(key as keyof Client, value as any);
    });
  }

  function openAddClientDialog() {
    reset();
    setEditClient(null);
    setOpenDialog(true);
  }

  return (
    <main className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Clients</h1>
        {clients.length > 0 && (
          <Button onClick={openAddClientDialog} className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        )}
      </div>

      {/* No Data */}
      {clients.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl bg-card shadow-sm">
          <p className="text-lg text-muted-foreground mb-3">
            No clients found.
          </p>
          <Button onClick={openAddClientDialog} className="flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Your First Client
          </Button>
        </div>
      )}

      {/* Loading State */}
      {loading && clients.length === 0 && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Loading clients...</p>
        </div>
      )}

      {/* Client Cards */}
      {!loading && clients.length > 0 && (
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
                <p className="text-sm">
                  Address: {c.address_line_1}, {c.address_line_2}
                </p>
                <p className="text-sm">
                  City/State: {c.city}, {c.state}
                </p>
                <p className="text-sm">
                  Country: {c.country} | Pincode: {c.pincode}
                </p>
                <p className="text-sm">GSTIN: {c.GSTIN}</p>
              </div>

              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button
                  variant="secondary"
                  onClick={() => onEdit(c)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1"
                >
                  Edit
                </Button>
                <DeleteDialog
                  itemName={c.name}
                  onConfirm={() => onDelete(c.id)}
                  trigger={
                    <Button
                      variant="destructive"
                      className="bg-red-500 hover:bg-red-600 text-xs px-3 py-1"
                    >
                      Delete
                    </Button>
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
     <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold text-center">
        {editClient ? "Edit Client" : "Add Client"}
      </DialogTitle>
    </DialogHeader>

    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 mt-4"
    >
      <div className="space-y-3">
        <RHFInput control={control} name="name" label="Name" placeholder="Name" />
        <RHFInput
          control={control}
          name="description"
          label="Description"
          placeholder="Description"
        />
        <RHFInput control={control} name="email" label="Email" placeholder="Email" />
        <RHFInput
          control={control}
          name="mobile_number"
          label="Mobile Number"
          placeholder="Mobile Number"
        />
        <RHFInput
          control={control}
          name="address_line_1"
          label="Address Line 1"
          placeholder="Address Line 1"
        />
        <RHFInput
          control={control}
          name="address_line_2"
          label="Address Line 2"
          placeholder="Address Line 2"
        />
        <RHFInput control={control} name="country" label="Country" placeholder="Country" />
        <RHFInput control={control} name="state" label="State" placeholder="State" />
        <RHFInput control={control} name="city" label="City" placeholder="City" />
        <RHFInput control={control} name="pincode" label="Pincode" placeholder="Pincode" />
        <RHFInput control={control} name="GSTIN" label="GSTIN" placeholder="GSTIN" />
      </div>

      <DialogFooter className="mt-6 flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpenDialog(false)}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {editClient ? "Update Client" : "Add Client"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

    </main>
  );
}
