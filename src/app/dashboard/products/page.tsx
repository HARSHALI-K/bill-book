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

type Product = {
  id?: string;
  org_id?: number;
  name: string;
  type: "service" | "product";
  unit: string;
  default_value: number;
  price: number;
};

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  type: yup.string().oneOf(["service", "product"]).required("Type is required"),
  unit: yup.string().required("Unit is required"),
  default_value: yup
    .number()
    .typeError("Default value must be a number")
    .min(1)
    .required("Default value is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .min(1)
    .required("Price is required"),
});

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const {
    handleSubmit,
    reset,
    control,
    setValue,
  } = useForm<Product>({
    resolver: yupResolver(schema),
  });

  // ✅ Load Products
  async function loadProducts() {
    setLoading(true);
    try {
      const res = await apiFetch<Product[]>("GET", "/organization/getAllProducts");
      setProducts(res?.data?.data ?? []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  // ✅ Add or Update Product
  async function onSubmit(data: Product) {
    setLoading(true);
    try {
      if (editProduct) {
        await apiFetch<Product>("POST", "/organization/updateProduct", {
          ...data,
          id: editProduct.id,
        });
        toast.success("✅ Product updated successfully");
      } else {
        await apiFetch<Product>("POST", "/organization/createProduct", data);
        toast.success("✅ Product added successfully");
      }
      await loadProducts();
      reset();
      setEditProduct(null);
      setShowForm(false);
    } catch {
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Delete Product
  async function onDelete(id?: string) {
    if (!id) return;
    setLoading(true);
    try {
      await apiFetch("DELETE", "/organization/deleteProduct", { id });
      toast.success("🗑️ Product deleted successfully");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Handle Edit
  function onEdit(p: Product) {
    setEditProduct(p);
    setShowForm(true);
    Object.entries(p).forEach(([key, value]) => {
      setValue(key as keyof Product, value as any);
    });
  }

  const TypeOption = [
    { label: "Service", value: "service" },
    { label: "Product", value: "product" },
  ];

  return (
    <main className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Products</h1>
        {products.length > 0 && (
          <button
            onClick={() => {
              setShowForm((prev) => !prev);
              setEditProduct(null);
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
                <Plus className="w-4 h-4" /> Add Product
              </>
            )}
          </button>
        )}
      </div>

      {/* Form */}
      {(showForm || products.length === 0) && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 rounded-lg border border-border p-4 shadow-md bg-card mb-6"
        >
          <RHFInput control={control} name="name" label="Name" placeholder="Name" />
          <RHFAutoComplete
            control={control}
            multiple={false}
            fullWidth
            name="type"
            placeholder="Type"
            options={TypeOption}
          />
          <RHFInput control={control} name="unit" label="Unit" placeholder="Unit" />
          <RHFInput
            label="Default Value"
            name="default_value"
            control={control}
            placeholder="Default Value"
          />
          <RHFInput
            label="Price"
            name="price"
            control={control}
            placeholder="Price"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {editProduct ? "Update Product" : "Add Product"}
          </button>
        </form>
      )}

      {/* Product Cards */}
      {loading && products.length === 0 ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="ml-2 text-muted-foreground">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <p className="text-muted-foreground text-center">No products yet. Add one above 👆</p>
      ) : (
        <div className="grid gap-3 md:grid-cols-1">
          {products.map((p, i) => (
            <div
              key={i}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div>
                <h2 className="font-semibold text-lg">{p.name}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {p.type} | Unit: {p.unit}
                </p>
                <p className="text-sm">Default: {p.default_value}</p>
                <p className="text-sm font-semibold">₹{p.price}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert(JSON.stringify(p, null, 2))}
                  className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                >
                  View
                </button>
                <button
                  onClick={() => onEdit(p)}
                  className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600"
                >
                  Edit
                </button>

                <DeleteDialog
                  itemName={p.name}
                  onConfirm={() => onDelete(p.id)}
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
