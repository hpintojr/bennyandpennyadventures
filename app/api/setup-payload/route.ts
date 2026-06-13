import configPromise from "@payload-config";
import { getPayload } from "payload";

export const dynamic = "force-dynamic";

type SetupResult = {
  ok: boolean;
  message: string;
  error?: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");
  const expectedSecret = process.env.PAYLOAD_SETUP_SECRET;

  if (!expectedSecret) {
    return Response.json<SetupResult>(
      {
        ok: false,
        message: "PAYLOAD_SETUP_SECRET is not configured in Vercel."
      },
      { status: 500 }
    );
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    return Response.json<SetupResult>(
      {
        ok: false,
        message: "Unauthorized setup request."
      },
      { status: 401 }
    );
  }

  try {
    await getPayload({ config: configPromise });

    return Response.json<SetupResult>({
      ok: true,
      message: "Payload initialized successfully. Now visit /admin to create the first admin user."
    });
  } catch (error) {
    return Response.json<SetupResult>(
      {
        ok: false,
        message: "Payload setup failed. Check Vercel runtime logs for the full error.",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
