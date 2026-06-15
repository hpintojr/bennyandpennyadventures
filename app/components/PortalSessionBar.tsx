"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

function displayName(user?: PortalUser) {
  if (!user) return "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return name || user.email || "Customer";
}

export default function PortalSessionBar() {
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
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-tan bg-white/70 px-4 py-3 text-sm shadow-soft">
          <span className="font-bold text-ink">You are not signed in to the customer portal.</span>
          <Link href="/portal/login" className="font-extrabold text-coral underline decoration-coral/40 underline-offset-4">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap pb-2">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-tan bg-white/70 px-4 py-3 text-sm shadow-soft">
        <span className="font-bold text-ink">Signed in as <span className="text-teal">{displayName(user)}</span></span>
        {user.email && <span className="text-ink/60">{user.email}</span>}
        <button type="button" onClick={handleLogout} className="font-extrabold text-coral underline decoration-coral/40 underline-offset-4 hover:text-[#d95660]">Log out</button>
      </div>
    </div>
  );
}
