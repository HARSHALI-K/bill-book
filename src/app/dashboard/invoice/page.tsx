"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "../../lib/api";

type Product = {
  description: string;
  qty: number;
  rate: number;
};

type QuotationFormValues = {
  name: string;
  date: string;
  products: Product[];
};

export default function QuotationMemo() {
  const { register, handleSubmit, reset, watch } = useForm<QuotationFormValues>({
    defaultValues: {
      name: "",
      date: new Date().toISOString().split("T")[0],
      products: [{ description: "", qty: 1, rate: 0 }],
    },
  });

  const [loading, setLoading] = useState(false);
  const [quotation, setQuotation] = useState<any>(null);

  // Fetch quotation
  const loadQuotation = async () => {
    setLoading(true);
    try {
      const res: any = await apiFetch("GET", "/organization/getQuotationById?id=3");
      if (res?.success && res?.data) {
        const q = res.data;
        setQuotation(q);

        reset({
          name: q.client?.name || "",
          date: q.document_date || new Date().toISOString().split("T")[0],
          products:
            q.quotation_details?.map((p: any) => ({
              description: p.product?.name || "",
              qty: Number(p.qty) || 1,
              rate: Number(p.rate) || 0,
            })) || [{ description: "", qty: 1, rate: 0 }],
        });

        toast.success("✅ Quotation loaded successfully");
      } else {
        toast.error("❌ Failed to load quotation");
      }
    } catch (error) {
      console.error("❌ API Error:", error);
      toast.error("Failed to fetch quotation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotation();
  }, []);

  // Download as PDF
  const handleDownload = async () => {
    const element = document.getElementById("quotation-preview");
    if (!element) {
      toast.error("Quotation not loaded yet!");
     //////// return;
    }

    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfHeight = (canvas.height * 210) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, 210, pdfHeight);
      pdf.save("quotation.pdf");
      toast.success("✅ PDF downloaded successfully");
    } catch (error) {
      console.error("❌ PDF Generation Failed:", error);
      toast.error("Failed to download PDF");
    }
  };

  // Share
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Quotation",
          text: "Here is the quotation",
          url: window.location.href,
        });
      } else {
        toast.error("Sharing not supported on this device");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formValues = watch();

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h2 style={{ color: "#b91c1c" }} className="text-2xl font-bold text-center">
        QUOTATION MEMO
      </h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit(() => {})}
        style={{ backgroundColor: "#f9fafb" }}
        className="p-4 rounded-xl shadow-md space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <input
            {...register("name")}
            placeholder="Client Name"
            className="border p-2 rounded"
          />
          <input
            type="date"
            {...register("date")}
            className="border p-2 rounded"
          />
        </div>

        <div className="mt-4">
          <h3 style={{ color: "#1f2937" }} className="font-semibold mb-2">Products / Work Details</h3>
          <div className="grid grid-cols-4 gap-2 font-semibold border-b pb-1" style={{ color: "#1f2937" }}>
            <span>Description</span>
            <span>Qty</span>
            <span>Rate</span>
            <span>Amount</span>
          </div>

          {formValues.products.map((prod, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mt-2">
              <input
                {...register(`products.${index}.description` as const)}
                className="border p-1"
              />
              <input
                type="number"
                {...register(`products.${index}.qty` as const)}
                className="border p-1"
              />
              <input
                type="number"
                {...register(`products.${index}.rate` as const)}
                className="border p-1"
              />
              <span
                className="flex items-center justify-center border p-1"
                style={{ backgroundColor: "#f3f4f6", color: "#1f2937" }}
              >
                ₹{(prod.qty * prod.rate).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center mt-4">
          <Button type="button" onClick={loadQuotation} disabled={loading}>
            {loading ? "Loading..." : "Reload Quotation"}
          </Button>
          <Button type="button" onClick={handleDownload} variant="outline">
            Download PDF
          </Button>
          <Button type="button" onClick={handleShare} variant="secondary">
            Share
          </Button>
        </div>
      </form>

      {/* Quotation Preview */}
      {quotation && (
        <div id="quotation-preview" className="pdf-safe border p-6 rounded-xl shadow-sm text-sm leading-tight">

          {/* Header */}
          <div className="text-center mb-2 space-y-1">
            <h3 style={{ color: "#b91c1c", fontSize: "1.25rem", fontWeight: 700 }}>
              {quotation?.organization?.name || "Organization Name"}
            </h3>
            <p style={{ color: "#4b5563", fontSize: "0.7rem" }}>
              {[
                quotation?.organization?.address_line_1,
                quotation?.organization?.address_line_2,
                quotation?.organization?.city,
                quotation?.organization?.state,
                quotation?.organization?.pincode,
                quotation?.organization?.country,
              ].filter(Boolean).join(", ")}
            </p>
            <p style={{ color: "#4b5563", fontSize: "0.7rem" }}>
              Mob: {quotation?.organization?.mobile_number || "N/A"}{" "}
              {quotation?.organization?.email && `| Email: ${quotation.organization.email}`}
            </p>
          </div>

          {/* Details */}
          <p>
            <strong>Name:</strong> {quotation?.client?.name}
          </p>
          <p>
            <strong>Date:</strong> {quotation?.document_date}
          </p>
          <p>
            <strong>Ref No:</strong> {quotation?.reference_no}
          </p>

          {/* Product Table */}
          <table
            className="w-full border mt-4 text-xs"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th className="border p-1">Sr.No</th>
                <th className="border p-1">Description</th>
                <th className="border p-1">Qty</th>
                <th className="border p-1">Rate</th>
                <th className="border p-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {quotation?.quotation_details?.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="border p-1 text-center">{idx + 1}</td>
                  <td className="border p-1">{item.product?.name}</td>
                  <td className="border p-1 text-center">{item.qty}</td>
                  <td className="border p-1 text-center">{item.rate}</td>
                  <td className="border p-1 text-center">{(item.qty * item.rate).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="text-right font-semibold mt-4">
            Total: ₹{quotation?.grand_total}
          </div>
          <p style={{ fontSize: "0.7rem", color: "#4b5563" }} className="text-right mt-2 italic">
            For {quotation?.organization?.name || "Organization Name"}
          </p>
        </div>
      )}
    </div>
  );
}
