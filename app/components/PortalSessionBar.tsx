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
  { label: "Gifts", href: "/portal/gifts" },
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
        <div className="rounded-full border border-tan bg-white/65 px-5 py-3 text-center text-sm font-bold text-teal">Checking portal session...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-tan bg-white/75 px-5 py-3 text-sm">
          <span className="font-bold text-ink">Not signed in</span>
          <div className="flex items-center gap-3">
            <Link href="/portal/login" className="font-extrabold text-coral hover:text-[#d95660]">Sign in</Link>
            <span className="text-tan">|</span>
            <Link href="/books" className="font-extrabold text-teal hover:text-coral">Shop Books</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap pb-2">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-full border border-tan bg-white/75 px-5 py-3 text-sm">
        <div className="min-w-0 shrink text-ink">
          <span className="font-bold">Signed in as <span className="text-teal">{displayName(user)}</span></span>
          {user.email && <span className="ml-2 text-ink/55">{user.email}</span>}
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          {portalLinks.map((link) => {
            const active = isActiveLink(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-extrabold transition ${active ? "text-coral" : "text-teal hover:text-coral"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button type="button" onClick={handleLogout} className="font-extrabold text-coral hover:text-[#d95660]">Log out</button>
      </div>
    </div>
  );
}
