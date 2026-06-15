"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PortalAddress = {
  id: string | number;
  addressType?: string;
  fullName?: string;
  company?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefaultShipping?: boolean;
};

type PortalAddressesResponse = {
  addresses?: PortalAddress[];
  error?: string;
};

function label(value?: string) {
  if (value === "billing") return "Billing";
  if (value === "shipping") return "Shipping";
  return "Address";
}

export default function PortalAddressesClient() {
  const [addresses, setAddresses] = useState<PortalAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAddresses() {
      try {
        const response = await fetch("/api/portal/addresses", { credentials: "include" });
        const data = (await response.json()) as PortalAddressesResponse;

        if (!response.ok) {
          throw new Error(data.error || "Please sign in to view your addresses.");
        }

        if (active) setAddresses(data.addresses || []);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load addresses.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAddresses();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <p className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-6 text-center font-bold text-teal shadow-soft">Loading your addresses...</p>;
  }

  if (error) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">Sign in required</h2>
        <p className="mt-3 text-ink">{error}</p>
        <Link href="/portal/login" className="btn mt-6">Sign In</Link>
      </div>
    );
  }

  if (!addresses.length) {
    return (
      <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">No addresses found yet</h2>
        <p className="mt-3 text-ink">We did not find any billing or shipping addresses linked to this customer account yet.</p>
        <Link href="/books" className="btn mt-6">Shop Books</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-2">
      {addresses.map((address) => (
        <article key={address.id} className="rounded-[2rem] border border-tan bg-white/75 p-6 shadow-soft sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[0.14em] text-coral">{label(address.addressType)}</p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-teal">{address.fullName || "Customer Address"}</h2>
            </div>
            {address.isDefaultShipping && <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-teal">Default</span>}
          </div>

          <div className="mt-5 space-y-1 text-base leading-7 text-ink">
            {address.company && <p>{address.company}</p>}
            <p>{address.street1}</p>
            {address.street2 && <p>{address.street2}</p>}
            <p>{address.city}, {address.state} {address.postalCode}</p>
            <p>{address.country}</p>
            {address.phone && <p className="pt-2 text-sm text-ink/70">Phone: {address.phone}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}
