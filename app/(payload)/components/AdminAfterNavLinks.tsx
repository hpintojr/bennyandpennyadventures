import { LogOut } from "lucide-react";
import Link from "next/link";
import React from "react";

export function AdminAfterNavLinks() {
  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--bottom">
      <Link className="bp-admin-nav-extra__link bp-admin-nav-extra__link--logout" href="/admin/logout">
        <LogOut className="bp-admin-nav-extra__iconSvg" size={18} strokeWidth={2.5} aria-hidden="true" />
        Log out
      </Link>
    </div>
  );
}

export default AdminAfterNavLinks;
