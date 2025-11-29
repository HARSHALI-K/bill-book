"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import RHFInput from "@/app/hook/RHFInput";
import RHFSelect from "@/app/hook/RHFSelect";
import GlobalLoader from "@/app/ui/GlobalLoader";
import { formatNumberCompact } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import RHFDateInput from "@/app/hook/RDFDatepicker";
import { useRouter } from "next/navigation";
       import { ArrowUpRight } from "lucide-react";

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
        product_id: yup.string().required("Product Name is required"),
        qty: yup
          .number()
          .typeError("Product Quantity must be a number")
          .positive("Product Quantity must be positive")
          .required("Product Quantity is required"),
        rate: yup
          .number()
          .typeError("Product Price must be a number")
          .positive("Product Price must be positive")
          .required("Product Price is required"),
        unit: yup.string().required("Product Unit is required"),
      })
    )
    .min(1, "At least one Product is required"),
});

export default function QuotationPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unitData,setUnitData]=useState([])

  const { control, handleSubmit, reset, watch, setValue, trigger } =
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
  const [editQuotation, setEditQuotation] = useState<any | null>(null);

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
console.log(products,"products")
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
    getAllUnit();
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
    // validate all fields and show errors
    const valid = await trigger();
    if (!valid) {
      setLoading(false);
      return;
    }

    const payload = {
      ...data,
      ref_no_template: data.ref_no_template,
    };

    if (editQuotation) {
      // update existing quotation (backend endpoint assumed)
      await apiFetch("POST", "/organization/updateQuotation", {
        ...payload,
        id: editQuotation.id,
      });
      toast.success("Quotation updated successfully");
    } else {
      await apiFetch("POST", "/organization/addQuotation", payload);
      toast.success("Quotation created successfully");
    }

    setDialogOpen(false);
    setEditQuotation(null);
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
    toast.error("Failed to create/update quotation");
  } finally {
    setLoading(false);
  }
}

// Edit existing quotation - normalize and reset form
function onEditQuotation(q: any) {
  const normalizedProducts = (q.products || []).map((p: any) => ({
    product_id: String(p.product_id ?? p.product?.id ?? ""),
    qty: Number(p.qty) || 1,
    rate: Number(p.rate) || 0,
    unit: String(p.unit ?? p.unit_id ?? p.product?.unit ?? ""),
  }));

  const normalized = {
    client_id: String(q.client_id ?? q.client?.id ?? ""),
    ref_no_template: q.ref_no_template || "",
    document_date: q.document_date || new Date().toISOString().split("T")[0],
    comment: q.comment || "",
    round_off: q.round_off ?? 0,
    products: normalizedProducts.length ? normalizedProducts : [{ product_id: "", qty: 1, rate: 0, unit: "" }],
  } as QuotationFormValues;

  setEditQuotation(q);
  reset(normalized);
  setDialogOpen(true);
}

// Delete quotation
async function onDeleteQuotation(id?: string) {
  if (!id) return;
  setLoading(true);
  try {
    await apiFetch("DELETE", "/organization/deleteQuotation", { id });
    toast.success("Quotation deleted successfully");
    setQuotations((prev) => prev.filter((q) => q.id !== id));
  } catch (err) {
    console.error(err);
    toast.error("Failed to delete quotation");
  } finally {
    setLoading(false);
  }
}

const router =useRouter()
const handleview=(id)=>{
console.log(id,"id")
    router.push(`/dashboard/quotations/view-quotation/${id}`);
}


 async function getAllUnit() {
    setLoading(true);
    try {
      const res = await apiFetch<Product[]>("GET", "/organization/getAllUnits");
      setUnitData(res?.data?.data ?? []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }
console.log(quotations,"quotations")
  return (
    <main className="px-4 py-6" >
      <GlobalLoader />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">Quotations</h1>
        {quotations.length > 0 && (
          <Button onClick={() => { setEditQuotation(null); setDialogOpen(true); }}> <Plus className="w-4 h-4" />Add Quotation</Button>
        )}
      </div>

      {quotations.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground">
          <p>No quotations yet</p>
          <Button className="mt-3" onClick={() => { setEditQuotation(null); setDialogOpen(true); }}>
            Add Quotation
          </Button>
        </div>
      ) : (
       <div className="grid gap-4">
  {quotations.map((q, idx) => (
    <div
      key={idx}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all"
    >
      {/* Left Section — Details */}
      <div>
       

        {/* CLICKABLE REF NO */}

<p
  onClick={() => handleview(q?.id)}
  className="text-lg text-blue-600 cursor-pointer hover:underline flex items-center gap-1 w-fit"
>
  {q.reference_no}
  <ArrowUpRight className="h-4 w-4" />
</p>

 <h2 className="font-semibold text-lg">
          {q.client?.name || "Unnamed Client"}
        </h2>
        <p className="text-sm text-muted-foreground">
          Date: {q.document_date}
        </p>
        <p className="text-sm text-muted-foreground">
          Comment: {q.comment || "-"}
        </p>

      
      </div>

      {/* Right Section — Buttons */}
     <div className="flex gap-2">
  <Button
    variant="secondary"
    size="sm"
    onClick={(e) => {
      e.stopPropagation();
      onEditQuotation(q);
    }}
    className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1"
  >
    Edit
  </Button>

  <Button
    variant="destructive"
    size="sm"
    onClick={(e) => {
      e.stopPropagation();
      onDeleteQuotation(q?.id);
    }}
    className="bg-red-500 hover:bg-red-600 text-xs px-3 py-1"
  >
    Delete
  </Button>
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
        <DialogTitle className="text-lg font-semibold text-start">
          {editQuotation ? "Edit Quotation" : "Add Quotation"}
        </DialogTitle>
        
      </DialogHeader>

      {/* FORM */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        {/* Fields */}
        <div className="space-y-3">
          {/* Client Dropdown */}
          <div>
            <RHFSelect
              control={control}
              name="client_id"
              label="Client Name"
              options={clients.map((c) => ({ label: c.name, value: c.id }))}
              placeholder="Select Client Name"
            />
          </div>

        
          
          <RHFDateInput
  control={control}
  name="document_date"
  label="Document Date"
  mandatory={true}
  type="date"   // or "datetime-local"
/>

          <RHFInput
            control={control}
            name="comment"
            label="Comment" mandatory={false}
            placeholder="Quotation comment"
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
                <RHFSelect
                  control={control}
                  name={`products.${index}.product_id`}
                  label="Product Name"
                  options={products.map((p) => ({ label: p.name, value: p.id }))}
                  placeholder="Select Product Name"
                  onValueChange={(val) => handleProductChange(index, String(val))}
                />
              </div>

              <RHFInput
                control={control}
                name={`products.${index}.qty`}
                label="Product Quantity"
                type="number"
                placeholder="1"
              />
              <RHFInput
                control={control}
                name={`products.${index}.rate`}
                label="Product Price"
                type="number"
                placeholder="0"
              />
              
                          <div>
                            <RHFSelect
                              control={control}
                              name={`products.${index}.unit`}
                              label="Product Unit"
                              options={unitData.map((u: any) => ({ label: u.name, value: u.id }))}
                              placeholder="Select Product Unit"
                            />
                          </div>



              
              <div className="flex justify-end">
                <Button size="sm" variant="ghost" onClick={() => remove(index)} className="text-red-600 hover:bg-red-50">
                  <Trash className="h-4 w-4" />
                  Remove
                </Button>
              </div>
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
            onClick={() => { setEditQuotation(null); setDialogOpen(false); }}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex items-center gap-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {editQuotation ? "Update Quotation" : "Save Quotation"}
          </Button>
        </DialogFooter>
      </form>
    </div>
  </DialogContent>
</Dialog>

    </main>
  );
}
