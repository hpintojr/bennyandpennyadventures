import { NextResponse } from "next/server";
import { getPortalAuth } from "@/lib/portalData";

export const runtime = "nodejs";

function geoapifyKey() {
  return (
    process.env.GEOAPIFY_API_KEY ||
    process.env.GEOAPIFY_SERVER_KEY ||
    process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ||
    ""
  );
}

type GeoapifyResult = {
  formatted?: string;
  address_line1?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
};

function str(v: unknown) {
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

function street1From(r: GeoapifyResult) {
  if (r.address_line1) return r.address_line1;
  return [r.housenumber, r.street].filter(Boolean).join(" ").trim();
}

export async function GET(request: Request) {
  // Gate to signed-in users (customer or admin) so the key quota isn't public.
  const { user } = await getPortalAuth();
  if (!user) return NextResponse.json({ suggestions: [] });

  const key = geoapifyKey();
  if (!key) return NextResponse.json({ suggestions: [], error: "not-configured" });

  const text = new URL(request.url).searchParams.get("text")?.trim() || "";
  if (text.length < 3) return NextResponse.json({ suggestions: [] });

  const params = new URLSearchParams({
    text,
    format: "json",
    limit: "6",
    filter: "countrycode:us,ca",
    apiKey: key
  });

  try {
    const res = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) return NextResponse.json({ suggestions: [], error: "lookup-failed" });
    const data = (await res.json()) as { results?: GeoapifyResult[] };
    const suggestions = (data.results || [])
      .map((r) => ({
        label: str(r.formatted) || street1From(r),
        street1: street1From(r),
        city: str(r.city),
        state: str(r.state),
        postalCode: str(r.postcode),
        country: (str(r.country_code).toUpperCase() || "US")
      }))
      .filter((s) => s.street1 && s.city);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Geoapify autocomplete failed", error);
    return NextResponse.json({ suggestions: [], error: "lookup-failed" });
  }
}
