import React from "react";

export function AdminBeforeNavLinks() {
  return (
    <div className="bp-admin-nav-extra bp-admin-nav-extra--top">
      <a className="bp-admin-nav-extra__link" href="/admin">
        <span aria-hidden="true">⌂</span>
        Dashboard
      </a>
    </div>
  );
}

export default AdminBeforeNavLinks;
