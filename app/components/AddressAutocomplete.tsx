"use client";

import { useEffect, useRef, useState } from "react";

export type AddressSuggestion = {
  label: string;
  street1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (s: AddressSuggestion) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
};

export default function AddressAutocomplete({ value, onChange, onSelect, className, placeholder, required, id }: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const skipNext = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced lookup as the customer types.
  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geo/autocomplete?text=${encodeURIComponent(q)}`, { credentials: "include" });
        const data = (await res.json()) as { suggestions?: AddressSuggestion[] };
        setSuggestions(data.suggestions || []);
        setOpen((data.suggestions || []).length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function choose(s: AddressSuggestion) {
    skipNext.current = true; // don't re-query for the value we just set
    onSelect(s);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        id={id}
        className={className}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/40">…</span>}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-tan bg-white py-1 shadow-lg">
          {suggestions.map((s, i) => (
            <li key={`${s.label}-${i}`}>
              <button
                type="button"
                onClick={() => choose(s)}
                className="block w-full px-4 py-2.5 text-left text-sm text-ink transition hover:bg-cream"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
