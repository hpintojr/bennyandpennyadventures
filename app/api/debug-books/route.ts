import { Client } from "pg";

export const dynamic = "force-dynamic";

export async function GET() {
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
