import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Retired: address autocomplete now runs client-side against Google Places (New)
// using the HTTP-referrer-restricted browser key (NEXT_PUBLIC_GOOGLE_PLACES_API_KEY).
// This server proxy is no longer used. Kept as a no-op to avoid a dangling route.
export async function GET() {
  return NextResponse.json({ suggestions: [], error: "moved-client-side" }, { status: 410 });
}
