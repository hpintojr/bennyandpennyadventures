import config from "@payload-config";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const expectedSecret = process.env.PAYLOAD_SETUP_SECRET;
  const providedSecret = new URL(request.url).searchParams.get("secret");
  return Boolean(expectedSecret && providedSecret && providedSecret === expectedSecret);
}

export async function GET(request: Request) {
  // Setup/debug endpoints are disabled in production. Set ALLOW_SETUP_ROUTES=true to re-enable temporarily.
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SETUP_ROUTES !== "true") {
    return new Response("Not found", { status: 404 });
  }

  if (!isAuthorized(request)) {
    return Response.json({ ok: false, message: "Unauthorized debug request." }, { status: 401 });
  }

  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "books",
      limit: 20,
      sort: "number"
    });

    return Response.json({
      ok: true,
      totalDocs: result.totalDocs,
      docs: result.docs.map((book) => ({
        id: book.id,
        title: book.title,
        slug: book.slug,
        status: book.status,
        number: book.number
      }))
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Payload could not read the books collection.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
