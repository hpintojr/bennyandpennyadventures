import crypto from "node:crypto";

function secretsMatch(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  return expectedBuffer.length === providedBuffer.length && crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

/**
 * Development-only guard for one-off setup and diagnostic routes.
 * These routes must never be reachable in a deployed environment, even if a
 * configuration flag is set accidentally. Local use requires an x-setup-secret
 * request header so secrets are not placed in URLs, browser history, or logs.
 */
export function isOperationsRouteAllowed(request: Request) {
  if (process.env.NODE_ENV === "production") return false;

  const expectedSecret = process.env.PAYLOAD_SETUP_SECRET;
  const providedSecret = request.headers.get("x-setup-secret");

  return Boolean(expectedSecret && providedSecret && secretsMatch(expectedSecret, providedSecret));
}

export function operationsRouteNotFound() {
  return new Response("Not found", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    }
  });
}
