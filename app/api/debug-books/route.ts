import { Client } from "pg";

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

  const databaseUri = process.env.DATABASE_URI;

  if (!databaseUri) {
    return Response.json({ ok: false, message: "DATABASE_URI is not configured." }, { status: 500 });
  }

  const client = new Client({ connectionString: databaseUri });

  try {
    await client.connect();

    const result = await client.query(
      `select id, title, slug, status, price_digital from books order by number asc limit 20`
    );

    return Response.json({
      ok: true,
      count: result.rowCount,
      books: result.rows
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: "Could not read books table.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await client.end().catch(() => undefined);
  }
}
