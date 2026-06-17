"use client";

import { useEffect, useState } from "react";

type MeResponse = {
  user?: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

function fullName(u: MeResponse["user"]) {
  return [u?.firstName, u?.lastName].filter(Boolean).join(" ").trim();
}

function displayName(data: MeResponse | null) {
  const u = data?.user;
  const name = fullName(u);
  if (name) return name;
  if (u?.email) return u.email.split("@")[0];
  return "Admin";
}

function initials(data: MeResponse | null) {
  const u = data?.user;
  const a = (u?.firstName || "").trim();
  const b = (u?.lastName || "").trim();
  if (a || b) return `${a.charAt(0)}${b.charAt(0)}`.toUpperCase();
  if (u?.email) return u.email.charAt(0).toUpperCase();
  return "A";
}

export default function AdminSidebarIdentity() {
  const [data, setData] = useState<MeResponse | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch("/api/users/me?depth=0", { credentials: "include", headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const json = (await res.json()) as MeResponse;
        if (mounted) setData(json);
      } catch {
        // keep fallback
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const email = data?.user?.email || "";

  return (
    <div className="bp-admin-identity">
      <span className="bp-admin-identity__avatar" aria-hidden="true">{initials(data)}</span>
      <span className="bp-admin-identity__meta">
        <span className="bp-admin-identity__name">{displayName(data)}</span>
        {email ? <span className="bp-admin-identity__email">{email}</span> : null}
      </span>
    </div>
  );
}
