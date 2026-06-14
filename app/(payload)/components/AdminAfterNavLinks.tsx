import Link from "next/link";
import React from "react";

export function AdminAfterNavLinks() {
  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--bottom">
      <Link className="bp-admin-nav-extra__link bp-admin-nav-extra__link--logout" href="/admin/logout">
        <svg className="bp-admin-nav-extra__iconSvg" aria-hidden="true" viewBox="0 0 16 16" focusable="false">
          <path fill="currentColor" d="M10 12.5a.5.5 0 0 1-.5.5h-7A1.5 1.5 0 0 1 1 11.5v-7A1.5 1.5 0 0 1 2.5 3h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 0-.5.5v7a.5.5 0 0 0 .5.5h7a.5.5 0 0 1 .5.5Z" />
          <path fill="currentColor" d="M14.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L13.293 7.5H5.5a.5.5 0 0 0 0 1h7.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3Z" />
        </svg>
        Log out
      </Link>
    </div>
  );
}

export default AdminAfterNavLinks;
