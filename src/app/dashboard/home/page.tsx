"use client";

import { useEffect, useState } from "react";

type Organization = {
  id: string;
  name: string;
  is_active: boolean;
};

export default function HomePage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    const userdata = localStorage.getItem("userData");
    if (userdata) {
      const parsed = JSON.parse(userdata);
	  console.log(parsed,"parsed")
      setOrganizations(parsed.organizations || []);
    }
  }, []);

  console.log(organizations,"organizations")
  return (
    <main className="px-4 py-6">

      <div className="grid gap-3">
        {organizations.map((org) =>
          org.is_active ? (
            <div key={org.id} className="grid gap-3">
              <a
                href="/dashboard/products"
                className="card block h-24 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="text-sm font-medium">Products</div>
                <div className="text-xs text-muted-foreground">
                  Manage your product catalog
                </div>
              </a>
              <a
                href="/dashboard/clients"
                className="card block h-24 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="text-sm font-medium">Clients</div>
                <div className="text-xs text-muted-foreground">
                  Your customer list
                </div>
              </a>
              <a
                href="/dashboard/quotations"
                className="card block h-24 rounded-2xl p-4 transition-transform hover:-translate-y-0.5"
              >
                <div className="text-sm font-medium">Quotations</div>
                <div className="text-xs text-muted-foreground">
                  Create and track quotes
                </div>
              </a>
            </div>
          ) : (
            <div
              key={org.id}
              className="flex flex-col items-center justify-center border border-dashed rounded-2xl p-6"
            >
              <div className="text-center text-sm text-muted-foreground mb-2">
                Your organization is inactive
              </div>
              <img
  src="/download.png"
  alt="QR Code"
  className="w-32 h-32"
/>

              <div className="text-xs text-muted-foreground mt-2">
                Scan this QR code for reference
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}
