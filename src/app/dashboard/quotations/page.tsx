"use client";

import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import RHFInput from "@/app/hook/RHFInput";
import RHFSelect from "@/app/hook/RHFSelect";
import RHFSearchSelect from "@/app/hook/RHFSearchSelect";
import GlobalLoader from "@/app/ui/GlobalLoader";
import { formatNumberCompact } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash, X, ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { apiFetch } from "@/app/lib/api";
import RHFDateInput from "@/app/hook/RDFDatepicker";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  name: string;
  email?: string;
  mobile_number?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  GSTIN?: string;
  description?: string;
};

type Product = {
  id: number | string;
  name: string;
  unit?: string;
  price?: number;
  default_value?: number;
};

type Unit = { id: number | string; name: string };

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
          .min(0, "Product Price must be >= 0")
          .required("Product Price is required"),
        unit: yup.string().required("Product Unit is required"),
      })
    )
    .min(1, "At least one Product is required"),
});

export default function QuotationPage(): JSX.Element {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [unitData, setUnitData] = useState<Unit[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showAddClientDialog, setShowAddClientDialog] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [editQuotation, setEditQuotation] = useState<any | null>(null);

  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<QuotationFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      client_id: "",
      ref_no_template: "",
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

  // ---------- Data loaders ----------
  async function loadClients(search: string = "") {
    try {
      setLoading(true);
      const url = search
        ? `/organization/getAllClients?search=${encodeURIComponent(search)}`
        : "/organization/getAllClients";
      const res = await apiFetch<any>("GET", url);
      setClients(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      console.error("loadClients err", err);
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts(search: string = "") {
    try {
      setLoading(true);
      const url = search
        ? `/organization/getAllProducts?search=${encodeURIComponent(search)}`
        : "/organization/getAllProducts";
      const res = await apiFetch<any>("GET", url);
      setProducts(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      console.error("loadProducts err", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  }

  async function loadQuotations() {
    try {
      setLoading(true);
      const res = await apiFetch<any>("GET", "/organization/getAllQuotations");
      setQuotations(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      console.error("loadQuotations err", err);
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  }

  async function getAllUnit() {
    try {
      setLoading(true);
      const res = await apiFetch<any>("GET", "/organization/getAllUnits");
      setUnitData(res?.data?.data ?? res?.data ?? []);
    } catch (err) {
      console.error("getAllUnit err", err);
      toast.error("Failed to load units");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients();
    loadProducts();
    loadQuotations();
    getAllUnit();

    try {
      const userData =
        localStorage.getItem("userdata") || localStorage.getItem("userData");
      const parsed = userData ? JSON.parse(userData) : {};
      const template = parsed?.ref_no_template ?? "BB[[inc_number]]";
      setValue("ref_no_template", template);
    } catch (e) {
      setValue("ref_no_template", "BB[[inc_number]]");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClientSearch = (query: string) => {
    setClientSearch(query);
    loadClients(query);
  };

  const onProductSearch = (query: string) => {
    setProductSearch(query);
    loadProducts(query);
  };

  const handleAddClientClick = () => setShowAddClientDialog(true);
  const handleAddProductClick = () => setShowAddProductDialog(true);
  const handleClientAdded = () => {
    setShowAddClientDialog(false);
    loadClients(clientSearch);
  };
  const handleProductAdded = () => {
    setShowAddProductDialog(false);
    loadProducts(productSearch);
  };

  // ---------- handleProductChange ----------
  function handleProductChange(index: number, productId: string) {
    const pidNum = Number(productId);
    const product =
      products.find((p) => Number(p.id) === pidNum) ||
      products.find((p) => String(p.id) === String(productId));

    setValue(`products.${index}.product_id`, String(productId));

    if (product) {
      setValue(
        `products.${index}.rate`,
        Number((product as any).price ?? (product as any).rate ?? 0)
      );
      setValue(`products.${index}.unit`, (product as any).unit ?? "");
      setValue(
        `products.${index}.qty`,
        Number((product as any).default_value ?? 1) || 1
      );
    }
  }

  // ---------- onSubmit ----------
  async function onSubmit(data: QuotationFormValues) {
    setLoading(true);
    try {
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
      await loadQuotations();

      reset({
        client_id: "",
        ref_no_template: data.ref_no_template,
        document_date: new Date().toISOString().split("T")[0],
        comment: "",
        round_off: 0,
        products: [{ product_id: "", qty: 1, rate: 0, unit: "" }],
      });
    } catch (err) {
      console.error("onSubmit err", err);
      const msg =
        (err as any)?.message ||
        (err as any)?.data?.message ||
        (err as any)?.data?.error ||
        "Failed to create/update quotation";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  }

  // ---------- onEditQuotation ----------
  function onEditQuotation(q: any) {
    const normalizedProducts = (q.products || []).map((p: any) => ({
      product_id: String(p.product_id ?? p.product?.id ?? ""),
      qty: Number(p.qty ?? p.default_value) || 1,
      rate: Number(p.rate ?? p.product?.price) || 0,
      unit: String(p.unit ?? p.unit_id ?? p.product?.unit ?? ""),
    }));

    const normalized = {
      client_id: String(q.client_id ?? q.client?.id ?? ""),
      ref_no_template: q.ref_no_template ?? "",
      document_date: q.document_date || new Date().toISOString().split("T")[0],
      comment: q.comment ?? "",
      round_off: q.round_off ?? 0,
      products:
        normalizedProducts.length > 0
          ? normalizedProducts
          : [{ product_id: "", qty: 1, rate: 0, unit: "" }],
    } as QuotationFormValues;

    setEditQuotation(q);
    reset(normalized);
    setDialogOpen(true);
  }

  // ---------- onDeleteQuotation ----------
  async function onDeleteQuotation(id?: string) {
    if (!id) return;
    setLoading(true);
    try {
      await apiFetch("DELETE", "/organization/deleteQuotation", { id });
      toast.success("Quotation deleted successfully");
      setQuotations((prev) => prev.filter((q) => String(q.id) !== String(id)));
    } catch (err) {
      console.error("onDeleteQuotation err", err);
      const msg =
        (err as any)?.message ||
        (err as any)?.data?.message ||
        "Failed to delete quotation";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  }

  // ---------- view handler ----------
  const handleview = (id?: string | number) => {
    if (!id) return;
    router.push(`/dashboard/quotations/view-quotation/${id}`);
  };


  // ---------- JSX ----------
  return (
    <main className="px-2 sm:px-4 py-4 sm:py-6 max-w-full overflow-x-hidden">
      <GlobalLoader />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg sm:text-xl font-semibold">Quotations</h1>
        <Button
          onClick={() => {
            setEditQuotation(null);
            reset({
              client_id: "",
              ref_no_template: (watch("ref_no_template") as string) || "",
              document_date: new Date().toISOString().split("T")[0],
              comment: "",
              round_off: 0,
              products: [{ product_id: "", qty: 1, rate: 0, unit: "" }],
            });
            setDialogOpen(true);
          }}
          className="flex items-center gap-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium shadow hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Quotation
        </Button>
      </div>

      {quotations.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-8">
          <p className="mb-3">No quotations yet</p>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setEditQuotation(null);
              reset({
                client_id: "",
                ref_no_template: (watch("ref_no_template") as string) || "",
                document_date: new Date().toISOString().split("T")[0],
                comment: "",
                round_off: 0,
                products: [{ product_id: "", qty: 1, rate: 0, unit: "" }],
              });
              setDialogOpen(true);
            }}
          >
            Add Quotation
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {quotations.map((q, idx) => (
            <div
              key={q.id ?? idx}
              className="flex flex-col gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4 shadow-sm hover:shadow-md transition-all w-full"
            >
              {/* Left Section — Details */}
              <div className="flex-1 min-w-0">
                <p
                  onClick={() => handleview(q?.id)}
                  className="text-base sm:text-lg text-blue-600 cursor-pointer hover:underline flex items-center gap-1 w-fit break-words"
                >
                  {q.reference_no}
                  <ArrowUpRight className="h-4 w-4 flex-shrink-0" />
                </p>

                <h2 className="font-semibold text-base sm:text-lg mt-1 break-words">
                  {q.client?.name || "Unnamed Client"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Date: {q.document_date}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                  Comment: {q.comment || "-"}
                </p>

                <div className="mt-2">
                  <p className="font-medium text-xs sm:text-sm">Products:</p>
                  <ul className="list-disc pl-4 sm:pl-5 text-xs sm:text-sm text-muted-foreground mt-1">
                    {q.products?.map((p: any, i: number) => (
                      <li key={i} className="break-words">
                        {p.product_name} — {formatNumberCompact(p.qty)} {p.unit} ×
                        ₹{p.rate}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Section — Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditQuotation(q);
                  }}
                  className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600"
                >
                  Edit
                </Button>

                <Button
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteQuotation(q?.id);
                  }}
                  className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quotation Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => {
        setDialogOpen(v);
        if (!v) setEditQuotation(null);
      }}>
        <DialogContent 
          className="w-[95vw] sm:max-w-[600px] max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0 gap-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
            <DialogTitle className="text-base sm:text-lg">
              {editQuotation ? "Edit Quotation" : "Add Quotation"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {editQuotation
                ? "Update your existing quotation details."
                : "Fill the details below to create a new quotation."}
            </DialogDescription>
          </DialogHeader>

          <form 
            id="quotation-form" 
            onSubmit={handleSubmit(onSubmit)} 
            className="flex flex-col gap-3 sm:gap-4 overflow-y-auto flex-1 min-h-0 px-4 sm:px-6 pb-4"
          >
            <div className="space-y-3">
              <div>
                <RHFSearchSelect
                  control={control}
                  name="client_id"
                  label="Client Name"
                  options={clients.map((c) => ({ label: c.name, value: c.id }))}
                  placeholder="Search Client Name"
                  onSearch={onClientSearch}
                  onAddClick={handleAddClientClick}
                  addButtonLabel="Add"
                />
              </div>

              <RHFDateInput
                control={control}
                name="document_date"
                label="Document Date"
                mandatory={true}
                type="date"
              />

              <RHFInput
                control={control}
                name="comment"
                label="Comment"
                mandatory={false}
                placeholder="Quotation comment"
              />
            </div>

            {/* Products Section */}
            <div className="space-y-3 mt-2 sm:mt-4">
              <Label className="text-sm sm:text-base font-medium">Products</Label>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col gap-3 border p-3 rounded-lg bg-gray-50 w-full"
                >
                  <div className="w-full">
                    <RHFSearchSelect
                      control={control}
                      name={`products.${index}.product_id`}
                      label="Product Name"
                      options={products.map((p) => ({ label: p.name, value: p.id }))}
                      placeholder="Search Product Name"
                      onSearch={onProductSearch}
                      onAddClick={handleAddProductClick}
                      onValueChange={(val: any) => handleProductChange(index, String(val))}
                      addButtonLabel="Add"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
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
                    <RHFSelect
                      control={control}
                      name={`products.${index}.unit`}
                      label="Product Unit"
                      options={unitData.map((u: any) => ({ label: u.name, value: u.id }))}
                      placeholder="Select Product Unit"
                    />
                  </div>

                  <div className="flex justify-end w-full">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                      type="button"
                    >
                      <Trash className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() => append({ product_id: "", qty: 1, rate: 0, unit: "" })}
                className="flex items-center gap-1 w-full justify-center border border-gray-300 text-sm"
              >
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </div>
          </form>

          <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditQuotation(null);
                setDialogOpen(false);
              }}
              className="w-full sm:w-auto "
            >
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button
              type="submit"
              form="quotation-form"
              disabled={loading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editQuotation ? "Update Quotation" : "Save Quotation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Add Dialog */}
      <Dialog open={showAddClientDialog} onOpenChange={setShowAddClientDialog}>
        <DialogContent 
          className="w-[95vw] sm:max-w-[500px] max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0 gap-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
            <DialogTitle className="text-base sm:text-lg">Add New Client</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Fill the details below to add a new client.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0">
            <ClientAddForm onSuccess={handleClientAdded} onClose={() => setShowAddClientDialog(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Add Dialog */}
      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
        <DialogContent 
          className="w-[95vw] sm:max-w-[500px] max-h-[95vh] sm:max-h-[90vh] flex flex-col p-0 gap-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3">
            <DialogTitle className="text-base sm:text-lg">Add New Product</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Fill the details below to add a new product.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 min-h-0">
            <ProductAddForm onSuccess={handleProductAdded} onClose={() => setShowAddProductDialog(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

/* ---------------------------
   ClientAddForm component
   --------------------------- */
function ClientAddForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(
      yup.object().shape({
        name: yup.string().required("Name is required"),
        email: yup.string().email("Invalid email").required("Email is required"),
        mobile_number: yup.string().required("Mobile number is required"),
        address_line_1: yup.string().required("Address is required"),
        country: yup.string().required("Country is required"),
        state: yup.string().required("State is required"),
        city: yup.string().required("City is required"),
        pincode: yup.string().required("Pincode is required"),
        gstin: yup.string().required("GSTIN is required"),
      })
    ),
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await apiFetch("POST", "/organization/createClient", data);
      toast.success("Client added successfully");
      reset();
      onSuccess();
      onClose();
    } catch (err) {
      console.error("ClientAddForm err", err);
      const msg = (err as any)?.message || "Failed to add client";
      toast.error(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-3 py-2 px-4 sm:px-6 flex-1 overflow-y-auto">
        <RHFInput control={control} name="name" label="Client Name" mandatory placeholder="Enter client name" />
        <RHFInput control={control} name="email" label="Email" mandatory placeholder="Enter email" />
        <RHFInput control={control} name="mobile_number" label="Mobile" mandatory placeholder="Enter mobile number" />
        <RHFInput control={control} name="address_line_1" label="Address" mandatory placeholder="Enter address" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RHFInput control={control} name="country" label="Country" mandatory placeholder="Enter country" />
          <RHFInput control={control} name="state" label="State" mandatory placeholder="Enter state" />
          <RHFInput control={control} name="city" label="City" mandatory placeholder="Enter city" />
          <RHFInput control={control} name="pincode" label="Pincode" mandatory placeholder="Enter pincode" />
        </div>

        <RHFInput control={control} name="gstin" label="GSTIN" mandatory placeholder="Enter GSTIN" />
      </form>
      <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t flex-col sm:flex-row gap-2 bg-background">
        <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="client-form"
          disabled={loading} 
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Add Client
        </Button>
      </DialogFooter>
    </div>
  );
}

/* ---------------------------
   ProductAddForm component
   --------------------------- */
   function ProductAddForm({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
    const { control, handleSubmit, reset } = useForm({
      resolver: yupResolver(
        yup.object().shape({
          name: yup.string().required("Product name is required"),
          type: yup.string().required("Product type is required"),
          unit: yup.string().required("Product unit is required"),
          default_value: yup.number().typeError("Default value must be a number").nullable(),
          price: yup
            .number()
            .typeError("Price must be a number")
            .positive("Price must be positive")
            .required("Price is required"),
        })
      ),
    });
  
    const [loading, setLoading] = useState(false);
    const [unitData, setUnitData] = useState<any[]>([]);
  
    useEffect(() => {
      loadUnits();
    }, []);
  
    async function loadUnits() {
      try {
        const res = await apiFetch<any>("GET", "/organization/getAllUnits");
        setUnitData(res?.data?.data ?? res?.data ?? []);
      } catch (err) {
        console.error("ProductAddForm loadUnits err", err);
      }
    }
  
    const onSubmit = async (data: any) => {
      setLoading(true);
      try {
        await apiFetch("POST", "/organization/createProduct", data);
        toast.success("Product added successfully");
        reset();
        onSuccess();
        onClose();
      } catch (err) {
        console.error("ProductAddForm err", err);
        toast.error((err as any)?.message || "Failed to add product");
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="flex flex-col h-full">
        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="grid gap-3 py-2 px-4 sm:px-6 flex-1 overflow-y-auto">
          <RHFInput control={control} name="name" label="Product Name" mandatory placeholder="Enter product name" />
    
          <RHFSelect
            control={control}
            name="type"
            label="Type"
            options={[
              { label: "Good", value: "good" },
              { label: "Service", value: "service" },
            ]}
            mandatory
            placeholder="Select type"
          />
    
          <RHFSelect
            control={control}
            name="unit"
            label="Unit"
            options={unitData.map((u) => ({ label: u.name, value: u.id }))}
            mandatory
            placeholder="Select unit"
          />
    
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <RHFInput control={control} name="default_value" label="Default Value" type="number" placeholder="Enter default value" />
            <RHFInput control={control} name="price" label="Price" type="number" mandatory placeholder="Enter price" />
          </div>
        </form>
        <DialogFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-3 border-t flex-col sm:flex-row gap-2 bg-background">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto order-2 sm:order-1">
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="product-form"
            disabled={loading} 
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Add Product
          </Button>
        </DialogFooter>
      </div>
    );
  }
  
