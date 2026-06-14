import Link from "next/link";
import React from "react";

export function AdminBeforeNavLinks() {
  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--top">
      <Link className="bp-admin-nav-extra__link" href="/admin">
        <span aria-hidden="true">⌂</span>
        Dashboard
      </Link>
    </div>
  );
}

export default AdminBeforeNavLinks;
