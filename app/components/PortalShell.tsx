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

type NavItem = {
  label: string;
  href: string;
  icon: (active: boolean) => React.ReactNode;
  description: string;
};

const stroke = (active: boolean) => (active ? "#E7646C" : "#064852");

const NAV: NavItem[] = [
  {
    label: "Dashboard",
    href: "/portal",
    description: "Your overview",
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M3 12 12 4l9 8" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10v9h14v-9" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: "My Library",
    href: "/portal/library",
    description: "Read & download",
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" stroke={stroke(a)} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" stroke={stroke(a)} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: "My Orders",
    href: "/portal/orders",
    description: "Receipts & shipping",
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M4 7h16l-1.2 11a2 2 0 0 1-2 1.8H7.2a2 2 0 0 1-2-1.8L4 7Z" stroke={stroke(a)} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 7V5.5a3 3 0 0 1 6 0V7" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    label: "Gifting",
    href: "/portal/gifts",
    description: "Share a book",
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M4 11h16v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8Z" stroke={stroke(a)} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M3 8h18v3H3zM12 8v12" stroke={stroke(a)} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 8S10.5 4 8.2 4.4C6.6 4.7 6.7 7 8 7.6c1 .5 4 .4 4 .4Zm0 0s1.5-4 3.8-3.6C17.4 4.7 17.3 7 16 7.6c-1 .5-4 .4-4 .4Z" stroke={stroke(a)} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    )
  },
  {
    label: "Addresses",
    href: "/portal/addresses",
    description: "Shipping book",
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" stroke={stroke(a)} strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="2.5" stroke={stroke(a)} strokeWidth="1.8" />
      </svg>
    )
  },
  {
    label: "Account",
    href: "/portal/account",
    description: "Profile & security",
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="8.5" r="3.5" stroke={stroke(a)} strokeWidth="1.8" />
        <path d="M5 20a7 7 0 0 1 14 0" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    label: "Help",
    href: "/portal/help",
    description: "Support & contact",
    icon: (a) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
        <circle cx="12" cy="12" r="9" stroke={stroke(a)} strokeWidth="1.8" />
        <path d="M9.5 9.5a2.5 2.5 0 0 1 4.6 1.3c0 1.7-2.1 2-2.1 3.2" stroke={stroke(a)} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill={stroke(a)} />
      </svg>
    )
  }
];

function displayName(user?: PortalUser | null) {
  if (!user) return "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "Customer";
}

function initials(user?: PortalUser | null) {
  if (!user) return "♥";
  const a = (user.firstName || "").trim();
  const b = (user.lastName || "").trim();
  if (a || b) return `${a.charAt(0)}${b.charAt(0)}`.toUpperCase() || "♥";
  return (user.email || "?").charAt(0).toUpperCase();
}

function isActive(pathname: string, href: string) {
  if (href === "/portal") return pathname === "/portal";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/portal/login");

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<PortalUser | null>(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/portal/me", { credentials: "include" });
        const data = (await res.json()) as PortalMeResponse;
        if (alive) setUser(data.authenticated ? data.user || null : null);
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/portal/logout", { method: "POST", credentials: "include" });
    window.location.href = "/portal/login";
  }

  // The login page renders bare inside SiteShell (no gate, no sidebar).
  if (isLogin) return <>{children}</>;

  if (loading) {
    return (
      <div className="wrap flex min-h-[50vh] items-center justify-center py-16">
        <div className="rounded-2xl border border-tan bg-white/70 px-6 py-4 text-sm font-bold text-teal shadow-sm">
          Opening your portal…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wrap py-12 sm:py-16">
        <div className="mx-auto max-w-lg rounded-3xl border border-tan bg-white/80 p-8 text-center shadow-sm">
          <p className="small-label">Customer Portal ♥</p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-teal">Please sign in</h1>
          <p className="mt-3 text-ink">
            Sign in with the email connected to your Benny &amp; Penny account to see your library, orders, gifts, and shipping.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/portal/login" className="btn">Sign In</Link>
            <Link href="/books" className="btn-ghost">Shop Books</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap py-6 sm:py-8">
      {/* Mobile identity + nav */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-tan bg-white/80 px-4 py-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-coral/15 font-extrabold text-coral">{initials(user)}</span>
            <span className="min-w-0">
              <span className="block truncate font-bold text-teal">{displayName(user)}</span>
              {user.email && <span className="block truncate text-xs text-ink/60">{user.email}</span>}
            </span>
          </div>
          <button type="button" onClick={handleLogout} className="shrink-0 rounded-full bg-coral/10 px-3 py-1.5 text-xs font-extrabold text-coral hover:bg-coral/15">
            Log out
          </button>
        </div>
        <nav className="-mx-1 mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Customer portal">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm font-extrabold transition ${active ? "bg-coral/12 text-coral" : "bg-teal/8 text-teal hover:bg-coral/10 hover:text-coral"}`}
              >
                {item.icon(active)}
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="lg:grid lg:grid-cols-[268px_1fr] lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 rounded-3xl border border-tan bg-white/80 p-5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-tan pb-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-coral/15 text-lg font-extrabold text-coral">{initials(user)}</span>
              <span className="min-w-0">
                <span className="block truncate font-serif text-lg font-bold text-teal">{displayName(user)}</span>
                {user.email && <span className="block truncate text-xs text-ink/60">{user.email}</span>}
              </span>
            </div>

            <nav className="mt-4 space-y-1.5" aria-label="Customer portal">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 transition ${active ? "bg-coral/12" : "hover:bg-cream"}`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${active ? "bg-white" : "bg-teal/5 group-hover:bg-white"}`}>
                      {item.icon(active)}
                    </span>
                    <span className="min-w-0">
                      <span className={`block text-sm font-extrabold ${active ? "text-coral" : "text-teal"}`}>{item.label}</span>
                      <span className="block truncate text-[11px] text-ink/55">{item.description}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 w-full rounded-2xl border border-tan bg-cream px-3.5 py-2.5 text-sm font-extrabold text-teal transition hover:border-coral hover:text-coral"
            >
              Log out
            </button>
          </div>
        </aside>

        {/* Page content */}
        <div className="mt-6 min-w-0 lg:mt-0">{children}</div>
      </div>
    </div>
  );
}
