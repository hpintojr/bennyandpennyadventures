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
        <div className="rounded-[1.5rem] border border-tan bg-white/65 px-5 py-3 text-center text-sm font-bold text-teal sm:rounded-full">Checking portal session...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap pb-2">
        <div className="flex flex-col gap-3 rounded-[1.5rem] border border-tan bg-white/75 px-5 py-3 text-sm sm:flex-row sm:items-center sm:justify-between sm:rounded-full">
          <span className="font-bold text-ink">Not signed in</span>
          <div className="flex flex-wrap items-center gap-3">
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
      <div className="rounded-[1.5rem] border border-tan bg-white/75 px-4 py-4 text-sm sm:rounded-[2rem] sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 text-ink">
            <span className="block font-bold sm:inline">Signed in as <span className="text-teal">{displayName(user)}</span></span>
            {user.email && <span className="block truncate text-ink/55 sm:ml-2 sm:inline">{user.email}</span>}
          </div>

          <nav className="-mx-1 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:items-center sm:justify-center sm:overflow-visible sm:pb-0" aria-label="Customer portal navigation">
            {portalLinks.map((link) => {
              const active = isActiveLink(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-extrabold transition sm:text-sm ${active ? "bg-coral/10 text-coral" : "bg-teal/10 text-teal hover:bg-coral/10 hover:text-coral"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button type="button" onClick={handleLogout} className="self-start rounded-full bg-coral/10 px-3 py-1.5 text-xs font-extrabold text-coral hover:bg-coral/15 sm:text-sm lg:self-auto">Log out</button>
        </div>
      </div>
    </div>
  );
}
