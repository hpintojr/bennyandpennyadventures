"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AddressType = "billing" | "shipping" | "both";

type PortalAddress = {
  id: string | number;
  label?: string;
  addressType?: AddressType | string;
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
  isDefaultBilling?: boolean;
  lastUsedAt?: string;
  source?: string;
};

type OrderAddress = {
  id: string | number;
  addressType?: string;
  fullName?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
};

type AddressesResponse = {
  addresses?: PortalAddress[];
  orderAddresses?: OrderAddress[];
  error?: string;
};

type FormState = {
  id?: string | number;
  label: string;
  addressType: AddressType;
  fullName: string;
  company: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

const EMPTY_FORM: FormState = {
  label: "",
  addressType: "shipping",
  fullName: "",
  company: "",
  street1: "",
  street2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "US",
  phone: "",
  isDefaultShipping: false,
  isDefaultBilling: false
};

function typeLabel(value?: string) {
  if (value === "billing") return "Billing";
  if (value === "shipping") return "Shipping";
  if (value === "both") return "Billing & Shipping";
  return "Address";
}

function formFromAddress(address: PortalAddress): FormState {
  const type = address.addressType === "billing" || address.addressType === "both" ? (address.addressType as AddressType) : "shipping";
  return {
    id: address.id,
    label: address.label || "",
    addressType: type,
    fullName: address.fullName || "",
    company: address.company || "",
    street1: address.street1 || "",
    street2: address.street2 || "",
    city: address.city || "",
    state: address.state || "",
    postalCode: address.postalCode || "",
    country: address.country || "US",
    phone: address.phone || "",
    isDefaultShipping: Boolean(address.isDefaultShipping),
    isDefaultBilling: Boolean(address.isDefaultBilling)
  };
}

function formFromOrderAddress(order: OrderAddress): FormState {
  return {
    ...EMPTY_FORM,
    addressType: order.addressType === "billing" ? "billing" : "shipping",
    fullName: order.fullName || "",
    street1: order.street1 || "",
    street2: order.street2 || "",
    city: order.city || "",
    state: order.state || "",
    postalCode: order.postalCode || "",
    country: order.country || "US",
    phone: order.phone || ""
  };
}

const inputClass =
  "w-full rounded-xl border border-tan bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30";
const fieldLabelClass = "mb-1 block text-xs font-extrabold uppercase tracking-[0.12em] text-teal/80";

function AddressForm({
  initial,
  saving,
  onSave,
  onCancel
}: {
  initial: FormState;
  saving: boolean;
  onSave: (form: FormState) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <form
      className="rounded-[1.5rem] border border-tan bg-white/90 p-5 shadow-soft sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(form);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={fieldLabelClass}>Label</label>
          <input className={inputClass} placeholder="Home, Work, Grandma..." value={form.label} onChange={(e) => update("label", e.target.value)} />
        </div>
        <div>
          <label className={fieldLabelClass}>Address type</label>
          <select className={inputClass} value={form.addressType} onChange={(e) => update("addressType", e.target.value as AddressType)}>
            <option value="shipping">Shipping</option>
            <option value="billing">Billing</option>
            <option value="both">Billing &amp; Shipping</option>
          </select>
        </div>
        <div>
          <label className={fieldLabelClass}>Full name *</label>
          <input className={inputClass} value={form.fullName} onChange={(e) => update("fullName", e.target.value)} required />
        </div>
        <div>
          <label className={fieldLabelClass}>Company</label>
          <input className={inputClass} value={form.company} onChange={(e) => update("company", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={fieldLabelClass}>Street address *</label>
          <input className={inputClass} value={form.street1} onChange={(e) => update("street1", e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className={fieldLabelClass}>Apartment, suite, etc.</label>
          <input className={inputClass} value={form.street2} onChange={(e) => update("street2", e.target.value)} />
        </div>
        <div>
          <label className={fieldLabelClass}>City *</label>
          <input className={inputClass} value={form.city} onChange={(e) => update("city", e.target.value)} required />
        </div>
        <div>
          <label className={fieldLabelClass}>State *</label>
          <input className={inputClass} value={form.state} onChange={(e) => update("state", e.target.value)} required />
        </div>
        <div>
          <label className={fieldLabelClass}>Postal code *</label>
          <input className={inputClass} value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)} required />
        </div>
        <div>
          <label className={fieldLabelClass}>Country *</label>
          <input className={inputClass} value={form.country} onChange={(e) => update("country", e.target.value)} required />
        </div>
        <div className="sm:col-span-2">
          <label className={fieldLabelClass}>Phone</label>
          <input className={inputClass} value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input type="checkbox" checked={form.isDefaultShipping} onChange={(e) => update("isDefaultShipping", e.target.checked)} />
          Default shipping
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input type="checkbox" checked={form.isDefaultBilling} onChange={(e) => update("isDefaultBilling", e.target.checked)} />
          Default billing
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving..." : form.id ? "Save changes" : "Add address"}
        </button>
        <button type="button" className="rounded-full border border-tan px-5 py-2 text-sm font-bold text-teal transition hover:bg-cream/60" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function AddressCard({
  address,
  busy,
  onEdit,
  onAction
}: {
  address: PortalAddress;
  busy: boolean;
  onEdit: () => void;
  onAction: (action: "default-shipping" | "default-billing" | "archive") => void;
}) {
  return (
    <article className="rounded-[1.5rem] border border-tan bg-white/80 p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">{typeLabel(address.addressType)}</p>
          <h2 className="mt-1 font-serif text-2xl font-bold text-teal">{address.label || address.fullName || "Saved address"}</h2>
          {address.label && <p className="text-sm font-semibold text-ink/70">{address.fullName}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {address.isDefaultShipping && <span className="rounded-full bg-teal/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-teal">Default shipping</span>}
          {address.isDefaultBilling && <span className="rounded-full bg-coral/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.1em] text-coral">Default billing</span>}
        </div>
      </div>

      <div className="mt-3 space-y-1 text-sm leading-6 text-ink">
        {address.company && <p>{address.company}</p>}
        <p>{address.street1}</p>
        {address.street2 && <p>{address.street2}</p>}
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>{address.country}</p>
        {address.phone && <p className="pt-1 text-xs text-ink/65">Phone: {address.phone}</p>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-tan pt-4">
        <button className="rounded-full border border-tan px-3 py-1.5 text-xs font-bold text-teal transition hover:bg-cream/60 disabled:opacity-50" onClick={onEdit} disabled={busy}>
          Edit
        </button>
        {!address.isDefaultShipping && (
          <button className="rounded-full border border-tan px-3 py-1.5 text-xs font-bold text-teal transition hover:bg-cream/60 disabled:opacity-50" onClick={() => onAction("default-shipping")} disabled={busy}>
            Set default shipping
          </button>
        )}
        {!address.isDefaultBilling && (
          <button className="rounded-full border border-tan px-3 py-1.5 text-xs font-bold text-teal transition hover:bg-cream/60 disabled:opacity-50" onClick={() => onAction("default-billing")} disabled={busy}>
            Set default billing
          </button>
        )}
        <button className="rounded-full border border-coral/40 px-3 py-1.5 text-xs font-bold text-coral transition hover:bg-coral/10 disabled:opacity-50" onClick={() => onAction("archive")} disabled={busy}>
          Archive
        </button>
      </div>
    </article>
  );
}

export default function PortalAddressesClient() {
  const [addresses, setAddresses] = useState<PortalAddress[]>([]);
  const [orderAddresses, setOrderAddresses] = useState<OrderAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadAddresses() {
    try {
      const response = await fetch("/api/portal/addresses", { credentials: "include" });
      const data = (await response.json()) as AddressesResponse;
      if (!response.ok) throw new Error(data.error || "Please sign in to view your addresses.");
      setAddresses(data.addresses || []);
      setOrderAddresses(data.orderAddresses || []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load addresses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function saveForm(form: FormState) {
    setSaving(true);
    setNotice(null);
    try {
      const method = form.id ? "PATCH" : "POST";
      const response = await fetch("/api/portal/addresses", {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not save this address.");
      setFormState(null);
      setNotice(form.id ? "Address updated." : "Address added.");
      await loadAddresses();
    } catch (saveError) {
      setNotice(saveError instanceof Error ? saveError.message : "Could not save this address.");
    } finally {
      setSaving(false);
    }
  }

  async function runAction(id: string | number, action: "default-shipping" | "default-billing" | "archive") {
    if (action === "archive" && !window.confirm("Archive this address? It will be removed from your Address Book but kept on past orders.")) {
      return;
    }
    setBusyId(id);
    setNotice(null);
    try {
      const response = await fetch("/api/portal/addresses", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || "Could not update this address.");
      await loadAddresses();
    } catch (actionError) {
      setNotice(actionError instanceof Error ? actionError.message : "Could not update this address.");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return <p className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-6 text-center font-bold text-teal shadow-soft">Loading your addresses...</p>;
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-3xl rounded-[2rem] border border-tan bg-white/70 p-8 text-center shadow-soft">
        <h2 className="font-serif text-3xl font-bold text-teal">Sign in required</h2>
        <p className="mt-3 text-ink">{error}</p>
        <Link href="/portal/login" className="btn mt-6">
          Sign In
        </Link>
      </div>
    );
  }

  const defaultShipping = addresses.find((a) => a.isDefaultShipping);
  const defaultBilling = addresses.find((a) => a.isDefaultBilling);
  const others = addresses.filter((a) => a !== defaultShipping && a !== defaultBilling);

  return (
    <div className="mx-auto mt-8 max-w-5xl space-y-6">
      {notice && <p className="rounded-2xl border border-teal/30 bg-teal/5 px-4 py-3 text-center text-sm font-semibold text-teal">{notice}</p>}

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-serif text-2xl font-bold text-teal">Your Address Book</h2>
        {!formState && (
          <button className="btn" onClick={() => setFormState({ ...EMPTY_FORM })}>
            + Add address
          </button>
        )}
      </div>

      {formState && <AddressForm initial={formState} saving={saving} onSave={saveForm} onCancel={() => setFormState(null)} />}

      {!addresses.length && !formState && (
        <div className="rounded-[2rem] border border-tan bg-white/70 p-8 text-center shadow-soft">
          <h3 className="font-serif text-2xl font-bold text-teal">No saved addresses yet</h3>
          <p className="mx-auto mt-3 max-w-xl text-ink">Add your first shipping or billing address, or import one from a past order below.</p>
          <button className="btn mt-6" onClick={() => setFormState({ ...EMPTY_FORM })}>
            Add your first address
          </button>
        </div>
      )}

      {(defaultShipping || defaultBilling) && (
        <div className="grid gap-5 md:grid-cols-2">
          {defaultShipping && <AddressCard address={defaultShipping} busy={busyId === defaultShipping.id} onEdit={() => setFormState(formFromAddress(defaultShipping))} onAction={(action) => runAction(defaultShipping.id, action)} />}
          {defaultBilling && defaultBilling !== defaultShipping && <AddressCard address={defaultBilling} busy={busyId === defaultBilling.id} onEdit={() => setFormState(formFromAddress(defaultBilling))} onAction={(action) => runAction(defaultBilling.id, action)} />}
        </div>
      )}

      {others.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-teal/90">Other saved addresses</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {others.map((address) => (
              <AddressCard key={address.id} address={address} busy={busyId === address.id} onEdit={() => setFormState(formFromAddress(address))} onAction={(action) => runAction(address.id, action)} />
            ))}
          </div>
        </div>
      )}

      {orderAddresses.length > 0 && (
        <details className="overflow-hidden rounded-[1.5rem] border border-tan bg-white/60 shadow-soft">
          <summary className="cursor-pointer list-none px-5 py-4 font-serif text-xl font-bold text-teal transition hover:bg-cream/60">
            Import from past orders ({orderAddresses.length})
          </summary>
          <div className="grid gap-4 border-t border-tan p-5 md:grid-cols-2">
            {orderAddresses.map((order) => (
              <article key={order.id} className="rounded-[1.25rem] border border-tan bg-white/75 p-4 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-coral">{typeLabel(order.addressType)} · from order</p>
                <p className="mt-1 font-serif text-lg font-bold text-teal">{order.fullName}</p>
                <div className="mt-2 space-y-0.5 text-sm leading-6 text-ink">
                  <p>{order.street1}</p>
                  {order.street2 && <p>{order.street2}</p>}
                  <p>
                    {order.city}, {order.state} {order.postalCode}
                  </p>
                </div>
                <button className="mt-3 rounded-full border border-tan px-3 py-1.5 text-xs font-bold text-teal transition hover:bg-cream/60" onClick={() => setFormState(formFromOrderAddress(order))}>
                  Save to Address Book
                </button>
              </article>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
