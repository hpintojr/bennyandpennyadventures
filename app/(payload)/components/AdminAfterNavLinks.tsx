import Link from "next/link";
import React from "react";

export function AdminAfterNavLinks() {
  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--bottom">
      <Link className="bp-admin-nav-extra__link bp-admin-nav-extra__link--logout" href="/admin/logout">
        <span aria-hidden="true">↳</span>
        Log out
      </Link>
    </div>
  );
}

export default AdminAfterNavLinks;
