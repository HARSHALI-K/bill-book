"use client";

import { apiFetch } from "@/app/lib/api";
import { formatNumberCompact } from "@/lib/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";

export default function InvoiceMobile() {
  const [quotations, setQuotations] = useState<any>({});
  const [userdata, setUserdata] = useState<any>(null);

  async function loadQuotations() {
    try {
      const res = await apiFetch<any>(
        "GET",
        "/organization/getQuotationById/?id=1"
      );
      setQuotations(res?.data ?? {});
    } catch {
      toast.error("Failed to load quotations");
    }
  }
const router=useRouter();
console.log(router,"router",router?.query?.id)
  useEffect(() => {
    const stored = localStorage.getItem("userData");
    if (stored) setUserdata(JSON.parse(stored));
    loadQuotations();
  }, []);

  const org = quotations?.organization;
  const client = quotations?.client;
  const details = quotations?.quotation_details ?? [];

  const addressLine1 = `${org?.address_line_1 || ""}${
    org?.address_line_2 ? ", " + org.address_line_2 : ""
  }`;
  const addressLine2 = `${org?.city || ""}, ${org?.state || ""} - ${
    org?.pincode || ""
  }, ${org?.country || ""}`;

  // -------------------------------------------------------
  // 👉 DOWNLOAD PDF FUNCTION
  // -------------------------------------------------------
const downloadPDF = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  // ---------------- HEADER ----------------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(org?.name || "Organization", 40, 40);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(addressLine1, 40, 60);
  doc.text(addressLine2, 40, 75);
  doc.text(`Email: ${org?.email}`, 40, 90);
  doc.text(`Mobile: ${org?.mobile_number}`, 40, 105);

  // ---------------- QUOTATION INFO ----------------
  doc.text(`Reference No: ${quotations?.reference_no}`, 40, 130);
  doc.text(`Date: ${quotations?.document_date}`, 40, 145);

  // ---------------- CLIENT INFO ----------------
  doc.text(`Client: ${client?.name}`, 40, 165);
  doc.text(`${client?.address_line_1}, ${client?.address_line_2}`, 40, 180);
  doc.text(
    `${client?.city}, ${client?.state}, ${client?.country} - ${client?.pincode}`,
    40,
    195
  );

  // ---------------- FULL-WIDTH TABLE ----------------
  autoTable(doc, {
    startY: 220,

    head: [["Sr", "Product", "Qty", "Rate", "Amount"]],

    body: details.map((item: any, i: number) => [
      i + 1,
      item.product?.name || "",
      formatNumberCompact(item.qty),
      item.rate,
      item.amount,
    ]),

    theme: "grid",

    styles: {
      fontSize: 10,
      cellPadding: 6,
      lineColor: "#b30047",
      lineWidth: 0.6,
      textColor: "#000",
    },

    headStyles: {
      fillColor: [255, 230, 240],
      textColor: "#b30047",
      fontStyle: "bold",
      lineColor: "#b30047",
      lineWidth: 0.7,
    },

    tableLineColor: "#b30047",
    tableLineWidth: 0.7,

    // FULL-WIDTH COLUMNS
    columnStyles: {
      0: { cellWidth: 40 },   // Sr
      1: { cellWidth: 240 },  // Product
      2: { cellWidth: 70 },   // Qty
      3: { cellWidth: 80 },   // Rate
      4: { cellWidth: 85 },   // Amount
    },

    tableWidth: 515,
    margin: { left: 40 },
  });

  // ---------------- GRAND TOTAL (aligned under Amount column) ----------------
  const finalY = doc.lastAutoTable.finalY + 25;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  const tableStartX = -10;       // left margin
const tableWidth = 515;       // full width
const amountColWidth = 85;    // your last column width

const totalTextX = tableStartX + tableWidth - amountColWidth + 10;

doc.text(`Grand Total: Rs. ${quotations?.grand_total}`, totalTextX, finalY);


  // ---------------- SAVE ----------------
  doc.save(`Quotation_${quotations?.reference_no}.pdf`);
};




  // -------------------------------------------------------
  // 👉 WHATSAPP SHARE FUNCTION
  // -------------------------------------------------------
  const whatsappShare = () => {
    const msg = `Quotation Details:
Ref No: ${quotations?.reference_no}
Date: ${quotations?.document_date}
Client: ${client?.name}
Total Amount: ₹${quotations?.grand_total}`;

    const url = `https://wa.me/${client?.mobile_number}?text=${encodeURIComponent(
      msg
    )}`;

    window.open(url, "_blank");
  };

  return (
    <div
      style={{
        padding: "16px",
        width: "100%",
        maxWidth: "380px",
        margin: "20px auto",
        border: "2px solid #b30047",
        fontFamily: "Arial",
      }}
    >
      {/* Logo */}
      {org?.logo && org.logo.startsWith("http") && (
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <img
            src={org.logo}
            alt="Logo"
            style={{ width: "80px", height: "80px", objectFit: "contain" }}
          />
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ margin: 0, color: "#b30047" }}>{org?.name}</h2>
        <p style={{ fontSize: "10px", marginTop: "6px" }}>{addressLine1}</p>
        <p style={{ fontSize: "10px" }}>{addressLine2}</p>

        <p style={{ fontSize: "10px" }}>{org?.email}</p>
        <p style={{ fontSize: "10px" }}>{org?.mobile_number}</p>
      </div>

      {/* Quotation Info */}
      <div style={{ marginTop: "10px", fontSize: "12px" }}>
        <strong>Ref No:</strong> {quotations?.reference_no} <br />
        <strong>Date:</strong> {quotations?.document_date}
      </div>

      {/* Client Info */}
      <div style={{ marginTop: "10px", fontSize: "12px" }}>
        <strong>Client:</strong> {client?.name} <br />
        {client?.address_line_1}, {client?.address_line_2} <br />
        {client?.city}, {client?.state}, {client?.country} - {client?.pincode}
        <br />
        <strong>Mobile:</strong> {client?.mobile_number}
      </div>

      {/* Product Table */}
      <div
        style={{
          marginTop: "16px",
          overflowX: "auto",
          border: "2px solid #b30047",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#ffe6f0" }}>
              <th style={cellStyle(40)}>Sr</th>
              <th style={cellStyle()}>Desc</th>
              <th style={cellStyle(40)}>Qty</th>
              <th style={cellStyle(60)}>Rate</th>
              <th style={cellStyle(70)}>Amount</th>
            </tr>
          </thead>

          <tbody>
            {details.map((item: any, i: number) => (
              <tr key={i}>
                  <td style={bodyCell}>{i + 1}</td>
                  <td style={bodyCell}>{item.product?.name}</td>
                  <td style={bodyCell}>{formatNumberCompact(item.qty)}</td>
                  <td style={bodyCell}>{item.rate}</td>
                  <td style={bodyCell}>{item.amount}</td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div style={{ textAlign: "right", marginTop: "16px", fontSize: "14px" }}>
        <strong>Grand Total: Rs. {quotations?.grand_total}</strong>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
          justifyContent: "center",
        }}
      >
        <button
          onClick={downloadPDF}
          style={{
            padding: "8px 12px",
            border: "none",
            background: "#b30047",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Download PDF
        </button>

        <button
          onClick={whatsappShare}
          style={{
            padding: "8px 12px",
            border: "none",
            background: "green",
            color: "white",
            cursor: "pointer",
          }}
        >
          Share WhatsApp
        </button>
      </div>
    </div>
  );
}

function cellStyle(width?: number) {
  return {
    width: width || "auto",
    padding: "6px",
    borderRight: "1px solid #b30047",
    fontSize: "12px",
    textAlign: "center",
  };
}

const bodyCell = {
  padding: "6px",
  borderRight: "1px solid #b30047",
  fontSize: "12px",
  textAlign: "center",
};
