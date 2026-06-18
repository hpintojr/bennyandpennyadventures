"use client";

import { useField, useForm } from "@payloadcms/ui";
import { useEffect, useRef, useState } from "react";

// Google Places (New) address autocomplete for the Payload admin street1 field.
// Browser-side, HTTP-referrer-restricted key (admin runs on the same domain).
const KEY = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "";

type Prediction = { label: string; placeId: string };
type AddressComponent = { longText?: string; shortText?: string; types?: string[] };
type FieldProps = { path?: string; field?: { label?: unknown; required?: boolean } };

function newToken() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function pick(components: AddressComponent[], type: string, short = false) {
  const c = components.find((x) => (x.types || []).includes(type));
  if (!c) return "";
  return (short ? c.shortText : c.longText) || "";
}

export const AdminAddressField = (props: FieldProps) => {
  const path = props.path || "street1";
  const label = typeof props.field?.label === "string" ? props.field.label : "Street address";
  const required = Boolean(props.field?.required);

  const { value, setValue } = useField<string>({ path });
  const { dispatchFields } = useForm();

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const skipNext = useRef(false);
  const sessionToken = useRef<string>(newToken());
  const boxRef = useRef<HTMLDivElement>(null);

  const current = typeof value === "string" ? value : "";

  useEffect(() => {
    if (!KEY) return;
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const q = current.trim();
    if (q.length < 3) {
      setPredictions([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY },
          body: JSON.stringify({ input: q, includedRegionCodes: ["us", "ca"], sessionToken: sessionToken.current })
        });
        if (!res.ok) return;
        const data = (await res.json()) as { suggestions?: { placePrediction?: { placeId?: string; text?: { text?: string } } }[] };
        const preds = (data.suggestions || [])
          .map((s) => ({ label: s.placePrediction?.text?.text || "", placeId: s.placePrediction?.placeId || "" }))
          .filter((p) => p.label && p.placeId);
        setPredictions(preds);
        setOpen(preds.length > 0);
      } catch {
        setPredictions([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [current]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  async function choose(p: Prediction) {
    skipNext.current = true;
    setOpen(false);
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(p.placeId)}?sessionToken=${encodeURIComponent(sessionToken.current)}`, {
        headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": "addressComponents,formattedAddress" }
      });
      if (res.ok) {
        const data = (await res.json()) as { addressComponents?: AddressComponent[] };
        const c = data.addressComponents || [];
        const street1 = [pick(c, "street_number"), pick(c, "route")].filter(Boolean).join(" ").trim();
        setValue(street1 || p.label);
        dispatchFields({ type: "UPDATE", path: "city", value: pick(c, "locality") || pick(c, "postal_town") || pick(c, "sublocality") || pick(c, "administrative_area_level_2") });
        dispatchFields({ type: "UPDATE", path: "state", value: pick(c, "administrative_area_level_1", true) });
        dispatchFields({ type: "UPDATE", path: "postalCode", value: pick(c, "postal_code") });
        dispatchFields({ type: "UPDATE", path: "country", value: pick(c, "country", true).toUpperCase() || "US" });
      } else {
        setValue(p.label);
      }
    } catch {
      setValue(p.label);
    } finally {
      sessionToken.current = newToken();
      setPredictions([]);
    }
  }

  return (
    <div className="field-type text" ref={boxRef} style={{ position: "relative" }}>
      <label className="field-label" style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600 }}>
        {label}
        {required ? <span style={{ color: "#e7646c" }}> *</span> : null}
      </label>
      <input
        className="field-input"
        type="text"
        value={current}
        required={required}
        placeholder="Start typing an address…"
        autoComplete="off"
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => predictions.length > 0 && setOpen(true)}
        style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: "0.4rem", border: "1px solid rgba(6,87,102,0.3)", background: "#fff", color: "#1d3237" }}
      />
      {open && predictions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            zIndex: 50,
            left: 0,
            right: 0,
            marginTop: "0.25rem",
            maxHeight: "16rem",
            overflowY: "auto",
            listStyle: "none",
            padding: "0.25rem",
            border: "1px solid rgba(6,87,102,0.25)",
            borderRadius: "0.6rem",
            background: "#fff",
            boxShadow: "0 12px 28px rgba(20,36,42,0.18)"
          }}
        >
          {predictions.map((p, i) => (
            <li key={`${p.placeId}-${i}`}>
              <button
                type="button"
                onClick={() => choose(p)}
                style={{ display: "block", width: "100%", textAlign: "left", padding: "0.55rem 0.7rem", borderRadius: "0.45rem", border: "none", background: "transparent", color: "#1d3237", cursor: "pointer", fontSize: "0.9rem" }}
              >
                {p.label}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: "0.4rem", fontSize: "0.75rem", color: "rgba(29,50,55,0.6)" }}>
        Pick a suggestion to auto-fill city, state, and ZIP — or type it manually.
      </p>
    </div>
  );
};

export default AdminAddressField;
