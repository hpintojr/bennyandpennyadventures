"use client";

import { useEffect, useState } from "react";

type MeResponse = {
  user?: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
};

function getDisplayName(data: MeResponse | null) {
  const user = data?.user;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

  if (fullName) return fullName;
  if (user?.email) return user.email.split("@")[0];
  return "Admin";
}

export default function AdminWelcomeName() {
  const [name, setName] = useState("Admin");

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      try {
        const response = await fetch("/api/users/me?depth=0", {
          credentials: "include",
          headers: { Accept: "application/json" }
        });

        if (!response.ok) return;

        const data = (await response.json()) as MeResponse;
        if (mounted) setName(getDisplayName(data));
      } catch {
        // Keep the safe Admin fallback if the Payload me endpoint is unavailable.
      }
    }

    void loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  return <>{name}</>;
}
