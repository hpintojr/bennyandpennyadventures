import React from "react";

export function AdminAfterNavLinks() {
  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--bottom">
      <a className="bp-admin-nav-extra__link bp-admin-nav-extra__link--logout" href="/admin/logout">
        <span aria-hidden="true">↳</span>
        Log out
      </a>
    </div>
  );
}

export default AdminAfterNavLinks;
