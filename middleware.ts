import { NextResponse, type NextRequest } from "next/server";

const adminCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:",
  "script-src-elem 'self' 'unsafe-inline' blob:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https: wss:",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'"
].join("; ");

const mutationMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isBrowserMutationRoute(pathname: string) {
  return (
    pathname === "/api/checkout" ||
    pathname.startsWith("/api/auth/") ||
    pathname === "/api/contact" ||
    pathname === "/api/subscribe" ||
    pathname === "/api/privacy-request" ||
    pathname.startsWith("/api/cart/") ||
    pathname.startsWith("/api/portal/") ||
    pathname.startsWith("/api/gift/") ||
    pathname.startsWith("/api/admin/")
  );
}

function forbiddenResponse() {
  return NextResponse.json(
    { error: "Invalid request origin." },
    {
      status: 403,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive"
      }
    }
  );
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Stripe webhooks and cron jobs are not matched by isBrowserMutationRoute;
  // their existing signature and bearer-token authentication remain intact.
  if (
    process.env.NODE_ENV === "production" &&
    mutationMethods.has(request.method) &&
    isBrowserMutationRoute(pathname) &&
    request.headers.get("origin") !== request.nextUrl.origin
  ) {
    return forbiddenResponse();
  }

  const response = NextResponse.next();

  if (pathname.startsWith("/admin")) {
    response.headers.set("Content-Security-Policy", adminCsp);
  }

  if (pathname === "/account/set-password") {
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Referrer-Policy", "no-referrer");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/set-password",
    "/api/checkout",
    "/api/auth/:path*",
    "/api/contact",
    "/api/subscribe",
    "/api/privacy-request",
    "/api/cart/:path*",
    "/api/portal/:path*",
    "/api/gift/:path*",
    "/api/admin/:path*"
  ]
};
