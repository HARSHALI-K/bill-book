"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import RHFInput from "@/app/hook/RHFInput";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";

type Client = { id: string; name: string };
type Product = { id: string; name: string; unit?: string; rate?: number };

type ProductItem = {
  product_id: string;
  qty: number;
  rate: number;
  unit: string;
};

type QuotationFormValues = {
  client_id: string;
  ref_no_template: string;
  document_date: string;
  comment?: string;
  round_off?: number;
  products: ProductItem[];
};

const schema = yup.object().shape({
  client_id: yup.string().required("Client is required"),
  document_date: yup.string().required("Document date is required"),
  comment: yup.string().nullable(),
  round_off: yup.number().nullable(),
  products: yup
    .array()
    .of(
      yup.object().shape({
        product_id: yup.string().required("Product is required"),
        qty: yup.number().positive("Quantity must be positive").required(),
        rate: yup.number().positive("Rate must be positive").required(),
        unit: yup.string().required("Unit is required"),
      })
    )
    .min(1, "At least one product is required"),
});

export default function QuotationPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<QuotationFormValues>({
      resolver: yupResolver(schema),
      defaultValues: {
        client_id: "",
        document_date: new Date().toISOString().split("T")[0],
        comment: "",
        round_off: 0,
        products: [{ product_id: "", qty: 1, rate: 0, unit: "" }],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  // Load data
  async function loadClients() {
    try {
      const res = await apiFetch<Client[]>("GET", "/organization/getAllClients");
      setClients(res?.data?.data ?? []);
    } catch {
      toast.error("Failed to load clients");
    }
  }

  async function loadProducts() {
    try {
      const res = await apiFetch<Product[]>("GET", "/organization/getAllProducts");
      setProducts(res?.data?.data ?? []);
    } catch {
      toast.error("Failed to load products");
    }
  }

  async function loadQuotations() {
    try {
      const res = await apiFetch<any>("GET", "/organization/getAllQuotations");
      setQuotations(res?.data?.data ?? []);
    } catch {
      toast.error("Failed to load quotations");
    }
  }

  useEffect(() => {
    loadClients();
    loadProducts();
    loadQuotations();

    const userData = localStorage.getItem("userdata");
    const parsed = userData ? JSON.parse(userData) : {};
    setValue("ref_no_template", parsed?.ref_no_template || "BB[[inc_number]]");
  }, [setValue]);

 const handleProductChange = (index: number, productId: string) => {
  const product = products.find((p) => p.id === Number(productId)); // convert
  console.log(product, "product", products);

  setValue(`products.${index}.product_id`, productId);

  if (product) {
    setValue(`products.${index}.rate`, Number(product.price) ?? 0); // correct key
    setValue(`products.${index}.unit`, product.unit ?? "");
    setValue(`products.${index}.qty`, product?.default_value); // default quantity
  }
};



async function onSubmit(data: QuotationFormValues) {
  setLoading(true);
  try {
    const payload = {
      ...data,
      ref_no_template: data.ref_no_template, // ✅ fixed syntax
    };

    await apiFetch("POST", "/organization/addQuotation", payload);
    toast.success("✅ Quotation created successfully");

    setDialogOpen(false);
    loadQuotations();

    reset({
      client_id: "",
      ref_no_template: data.ref_no_template,
      document_date: new Date().toISOString().split("T")[0],
      comment: "",
      round_off: 0,
      products: [{ product_id: "", qty: 1, rate: 0, unit: "" }],
    });
  } catch (error) {
    console.error(error);
    toast.error("Failed to create quotation");
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Quotations</h1>
        {quotations.length > 0 && (
          <Button onClick={() => setDialogOpen(true)}>Add Quotation</Button>
        )}
      </div>

      {quotations.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground">
          <p>No quotations yet</p>
          <Button className="mt-3" onClick={() => setDialogOpen(true)}>
            Add Quotation
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {quotations.map((q, idx) => (
            <div
              key={idx}
              className="border p-4 rounded-lg shadow-sm bg-white flex flex-col gap-1"
            >
              <h2 className="font-semibold">
                {q.client_name || "Unnamed Client"}
              </h2>
              <p className="text-sm text-gray-600">
                Ref No: {q.ref_no_template}
              </p>
              <p className="text-sm text-gray-600">
                Date: {q.document_date}
              </p>
              <p className="text-sm text-gray-600">
                Comment: {q.comment || "-"}
              </p>
              <div className="mt-2">
                <p className="font-medium text-sm mb-1">Products:</p>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  {q.products?.map((p: any, i: number) => (
                    <li key={i}>
                      {p.product_name} — {p.qty} {p.unit} × ₹{p.rate}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialog */}
     <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent
    className="max-w-lg w-[95%] p-0 overflow-hidden rounded-xl"
    style={{ maxHeight: "90vh" }} // ensures it fits mobile viewport
  >
    {/* Scrollable inner area */}
    <div className="max-h-[90vh] overflow-y-auto px-4 py-6 space-y-6">
      <DialogHeader>
        <DialogTitle className="text-lg font-semibold text-center">
          Add Quotation
        </DialogTitle>
      </DialogHeader>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Fields */}
        <div className="space-y-3">
          {/* Client Dropdown */}
          <div>
            <Label className="text-sm font-medium">Client</Label>
            <select
              className="border rounded-md px-3 py-2 w-full bg-white"
              {...(control.register
                ? { ...control.register("client_id") }
                : { name: "client_id" })}
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

        
          <RHFInput
            control={control}
            name="document_date"
            label="Document Date"
            type="date"
          />
          <RHFInput
            control={control}
            name="comment"
            label="Comment"
            placeholder="Quotation comment"
          />
          <RHFInput
            control={control}
            name="round_off"
            label="Round Off"
            type="number"
            placeholder="0"
          />
        </div>

        {/* Products Section */}
        <div className="space-y-3 mt-4">
          <Label className="text-base font-medium">Products</Label>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-col gap-3 border p-3 rounded-lg bg-gray-50"
            >
              <div>
                <Label className="text-sm mb-1 block">Product</Label>
                <select
                  className="border rounded-md px-3 py-2 w-full bg-white"
                  value={watch(`products.${index}.product_id`)}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <RHFInput
                control={control}
                name={`products.${index}.qty`}
                label="Quantity"
                type="number"
                placeholder="1"
              />
              <RHFInput
                control={control}
                name={`products.${index}.rate`}
                label="Rate"
                type="number"
                placeholder="0"
              />
              <RHFInput
                control={control}
                name={`products.${index}.unit`}
                label="Unit"
                placeholder="Unit"
              />

              <Button
                type="button"
                variant="destructive"
                onClick={() => remove(index)}
                className="flex items-center gap-1 justify-center"
              >
                <Trash className="h-4 w-4" /> Remove
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              append({ product_id: "", qty: 1, rate: 0, unit: "" })
            }
            className="flex items-center gap-1 w-full justify-center border border-gray-300"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>

        {/* Footer Buttons */}
        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setDialogOpen(false)}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex items-center gap-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Quotation
          </Button>
        </DialogFooter>
      </form>
    </div>
  </DialogContent>
</Dialog>

    </main>
  );
}
