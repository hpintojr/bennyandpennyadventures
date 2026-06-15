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

type PortalAddressesResponse = { addresses?: PortalAddress[]; error?: string };

function label(value?: string) {
  if (value === "billing") return "Billing";
  if (value === "shipping") return "Shipping";
  return "Address";
}

function addressKey(address: PortalAddress) {
  return `${address.addressType || "address"}-${address.street1 || ""}-${address.postalCode || ""}`.toLowerCase();
}

function compactLine(address: PortalAddress) {
  return [address.street1, [address.city, address.state, address.postalCode].filter(Boolean).join(" ")].filter(Boolean).join(" · ");
}

function AddressCard({ address, compact = false }: { address: PortalAddress; compact?: boolean }) {
  return (
    <article className={`rounded-[1.5rem] border border-tan bg-white/75 shadow-soft ${compact ? "p-4" : "p-5 sm:p-6"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">{label(address.addressType)}</p>
          <h2 className={`${compact ? "text-xl" : "text-2xl"} mt-1 font-serif font-bold text-teal`}>{address.fullName || "Customer Address"}</h2>
        </div>
        {address.isDefaultShipping && <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-teal">Default</span>}
      </div>

      <div className="mt-4 space-y-1 text-sm leading-6 text-ink">
        {address.company && <p>{address.company}</p>}
        <p>{address.street1}</p>
        {address.street2 && <p>{address.street2}</p>}
        <p>{address.city}, {address.state} {address.postalCode}</p>
        <p>{address.country}</p>
        {address.phone && <p className="pt-1 text-xs text-ink/65">Phone: {address.phone}</p>}
      </div>
    </article>
  );
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
        if (!response.ok) throw new Error(data.error || "Please sign in to view your addresses.");
        if (active) setAddresses(data.addresses || []);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load addresses.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadAddresses();
    return () => { active = false; };
  }, []);

  if (loading) return <p className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-6 text-center font-bold text-teal shadow-soft">Loading your addresses...</p>;

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">Sign in required</h2>
        <p className="mt-3 text-ink">{error}</p>
        <Link href="/portal/login" className="btn mt-6">Sign In</Link>
      </div>
    );
  }

  if (!addresses.length) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">No addresses found yet</h2>
        <p className="mt-3 text-ink">We did not find any billing or shipping addresses linked to this customer account yet.</p>
        <Link href="/books" className="btn mt-6">Shop Books</Link>
      </div>
    );
  }

  const uniqueAddresses = addresses.filter((address, index, list) => list.findIndex((item) => addressKey(item) === addressKey(address)) === index);
  const shipping = uniqueAddresses.filter((address) => address.addressType === "shipping");
  const billing = uniqueAddresses.filter((address) => address.addressType === "billing");
  const primaryShipping = shipping.find((address) => address.isDefaultShipping) || shipping[0];
  const primaryBilling = billing[0];
  const primaryKeys = new Set([primaryShipping && addressKey(primaryShipping), primaryBilling && addressKey(primaryBilling)].filter(Boolean));
  const otherAddresses = uniqueAddresses.filter((address) => !primaryKeys.has(addressKey(address)));

  return (
    <div className="mx-auto mt-8 max-w-5xl space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        {primaryShipping && <AddressCard address={primaryShipping} />}
        {primaryBilling && <AddressCard address={primaryBilling} />}
      </div>

      {otherAddresses.length > 0 && (
        <details className="overflow-hidden rounded-[1.5rem] border border-tan bg-white/60 shadow-soft">
          <summary className="cursor-pointer list-none px-5 py-4 font-serif text-2xl font-bold text-teal transition hover:bg-cream/60">
            Other saved addresses ({otherAddresses.length})
          </summary>
          <div className="grid gap-4 border-t border-tan p-5 md:grid-cols-2">
            {otherAddresses.map((address) => <AddressCard key={address.id} address={address} compact />)}
          </div>
        </details>
      )}
    </div>
  );
}
