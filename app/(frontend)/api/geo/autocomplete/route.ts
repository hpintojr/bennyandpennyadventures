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

type PlacePrediction = {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
  };
};

export async function GET(request: Request) {
  // Gate to signed-in users (customer or admin) so the key quota isn't public.
  const { user } = await getPortalAuth();
  if (!user) return NextResponse.json({ suggestions: [] });

  const key = googleKey();
  if (!key) return NextResponse.json({ suggestions: [], error: "not-configured" });

  const text = new URL(request.url).searchParams.get("text")?.trim() || "";
  if (text.length < 3) return NextResponse.json({ suggestions: [] });

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key
      },
      body: JSON.stringify({
        input: text,
        includedRegionCodes: ["us", "ca"],
        includedPrimaryTypes: ["street_address", "premise", "subpremise"]
      })
    });
    if (!res.ok) {
      console.error("Google Places autocomplete failed", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ suggestions: [], error: "lookup-failed" });
    }
    const data = (await res.json()) as { suggestions?: PlacePrediction[] };
    const suggestions = (data.suggestions || [])
      .map((s) => ({
        label: s.placePrediction?.text?.text || "",
        placeId: s.placePrediction?.placeId || ""
      }))
      .filter((s) => s.label && s.placeId);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Google Places autocomplete threw", error);
    return NextResponse.json({ suggestions: [], error: "lookup-failed" });
  }
}
