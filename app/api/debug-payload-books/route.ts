import config from "@payload-config";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

export async function GET() {
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
