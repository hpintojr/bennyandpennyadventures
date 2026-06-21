import type { ServerFunctionClient } from "payload";

import "@payloadcms/next/css";
import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import React from "react";

import { importMap } from "./admin/importMap";
import "./custom.scss";
import "./admin-polish-overrides.scss";
import "./admin-final-fixes.scss";
import "./login-brand.scss";
import "./brand-name-fix.scss";
import "./admin-toggler-cleanup.scss";
import "./admin-orders-cleanup.scss";
import "./admin-dashboard-mobile-rows.scss";
import "./admin-dashboard-final-polish.scss";
import "./admin-desktop-nav-toggle.scss";
import "./admin-portal-theme.scss";

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";

  return handleServerFunctions({
    ...args,
    config,
    importMap
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
