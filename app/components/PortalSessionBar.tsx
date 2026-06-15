"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type PortalUser = {
  id: string | number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
};

type PortalMeResponse = {
  authenticated: boolean;
  user?: PortalUser;
};

const portalLinks = [
  { label: "Portal Home", href: "/portal" },
  { label: "My Orders", href: "/portal/orders" },
  { label: "My Library", href: "/portal/library" },
  { label: "Addresses", href: "/portal/addresses" }
];

function displayName(user?: PortalUser) {
  if (!user) return "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "Customer";
}

function isActiveLink(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PortalSessionBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<PortalUser | null>(null);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const response = await fetch("/api/portal/me", { credentials: "include" });
        const data = (await response.json()) as PortalMeResponse;
        if (active) setUser(data.authenticated ? data.user || null : null);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/portal/logout", {
      method: "POST",
      credentials: "include"
    });
    window.location.href = "/portal/login";
  }

  if (loading) {
    return (
      <div className="wrap pb-2">
        <div className="rounded-2xl border border-tan bg-white/60 px-4 py-3 text-center text-sm font-bold text-teal shadow-soft">Checking portal session...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap pb-2">
        <div className="rounded-2xl border border-tan bg-white/70 px-4 py-4 text-center text-sm shadow-soft">
          <div className="font-bold text-ink">You are not signed in to the customer portal.</div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Link href="/portal/login" className="rounded-full bg-coral px-4 py-2 font-extrabold text-white hover:bg-[#d95660]">Sign in</Link>
            <Link href="/books" className="rounded-full border border-tan bg-white px-4 py-2 font-extrabold text-teal hover:text-coral">Shop Books</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap pb-2">
      <div className="rounded-2xl border border-tan bg-white/75 px-4 py-4 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <div>
            <span className="font-bold text-ink">Signed in as <span className="text-teal">{displayName(user)}</span></span>
            {user.email && <span className="ml-2 text-ink/60">{user.email}</span>}
          </div>
          <button type="button" onClick={handleLogout} className="font-extrabold text-coral underline decoration-coral/40 underline-offset-4 hover:text-[#d95660]">Log out</button>
        </div>

        <nav className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-tan pt-4">
          {portalLinks.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${active ? "bg-coral text-white" : "border border-tan bg-cream text-teal hover:border-coral/50 hover:text-coral"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
