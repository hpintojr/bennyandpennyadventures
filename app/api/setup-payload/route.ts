import configPromise from "@payload-config";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

type SetupResult = {
  ok: boolean;
  message: string;
  error?: string;
};

function jsonResponse(body: SetupResult, status = 200) {
  return Response.json(body, { status });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");
  const expectedSecret = process.env.PAYLOAD_SETUP_SECRET;

  if (!expectedSecret) {
    return jsonResponse(
      {
        ok: false,
        message: "PAYLOAD_SETUP_SECRET is not configured in Vercel."
      },
      500
    );
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    return jsonResponse(
      {
        ok: false,
        message: "Unauthorized setup request."
      },
      401
    );
  }

  try {
    const payload = await getPayload({ config: configPromise });
    const db = payload.db as unknown as {
      push?: () => Promise<void>;
      migrate?: () => Promise<void>;
    };

    if (typeof db.push === "function") {
      await db.push();
    } else if (typeof db.migrate === "function") {
      await db.migrate();
    } else {
      return jsonResponse(
        {
          ok: false,
          message: "Payload database adapter loaded, but no push or migrate method was available."
        },
        500
      );
    }

    return jsonResponse({
      ok: true,
      message: "Payload database schema setup completed. Now visit /admin to create the first admin user."
    });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        message: "Payload database schema setup failed. Check Vercel runtime logs for the full error.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      500
    );
  }
}
