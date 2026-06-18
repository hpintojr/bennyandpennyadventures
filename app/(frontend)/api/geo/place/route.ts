import { NextResponse } from "next/server";
import { getPortalAuth } from "@/lib/portalData";

export const runtime = "nodejs";

function googleKey() {
  return (
    process.env.GOOGLE_PLACES_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
    ""
  );
}

type AddressComponent = { longText?: string; shortText?: string; types?: string[] };

function pick(components: AddressComponent[], type: string, short = false) {
  const c = components.find((x) => (x.types || []).includes(type));
  if (!c) return "";
  return (short ? c.shortText : c.longText) || "";
}

export async function GET(request: Request) {
  const { user } = await getPortalAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = googleKey();
  if (!key) return NextResponse.json({ error: "not-configured" }, { status: 503 });

  const placeId = new URL(request.url).searchParams.get("place_id")?.trim() || "";
  if (!placeId) return NextResponse.json({ error: "place_id required" }, { status: 400 });

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "addressComponents,formattedAddress"
      }
    });
    if (!res.ok) {
      console.error("Google place details failed", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: "lookup-failed" }, { status: 502 });
    }
    const data = (await res.json()) as { addressComponents?: AddressComponent[]; formattedAddress?: string };
    const components = data.addressComponents || [];

    const streetNumber = pick(components, "street_number");
    const route = pick(components, "route");
    const street1 = [streetNumber, route].filter(Boolean).join(" ").trim();
    const city = pick(components, "locality") || pick(components, "postal_town") || pick(components, "sublocality") || pick(components, "administrative_area_level_2");
    const state = pick(components, "administrative_area_level_1", true);
    const postalCode = pick(components, "postal_code");
    const country = pick(components, "country", true).toUpperCase() || "US";

    return NextResponse.json({
      address: { street1, city, state, postalCode, country },
      formattedAddress: data.formattedAddress || ""
    });
  } catch (error) {
    console.error("Google place details threw", error);
    return NextResponse.json({ error: "lookup-failed" }, { status: 500 });
  }
}
