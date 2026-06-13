import type { ImportMap } from "payload";

export const importMap: ImportMap = {
  "@payloadcms/next/views#Account": {
    id: "@payloadcms/next/views#Account",
    value: () => import("@payloadcms/next/views").then((mod) => mod.Account)
  },
  "@payloadcms/next/views#Dashboard": {
    id: "@payloadcms/next/views#Dashboard",
    value: () => import("@payloadcms/next/views").then((mod) => mod.Dashboard)
  },
  "@payloadcms/next/views#DefaultTemplate": {
    id: "@payloadcms/next/views#DefaultTemplate",
    value: () => import("@payloadcms/next/views").then((mod) => mod.DefaultTemplate)
  },
  "@payloadcms/next/views#Document": {
    id: "@payloadcms/next/views#Document",
    value: () => import("@payloadcms/next/views").then((mod) => mod.Document)
  },
  "@payloadcms/next/views#Login": {
    id: "@payloadcms/next/views#Login",
    value: () => import("@payloadcms/next/views").then((mod) => mod.Login)
  },
  "@payloadcms/next/views#NotFound": {
    id: "@payloadcms/next/views#NotFound",
    value: () => import("@payloadcms/next/views").then((mod) => mod.NotFound)
  },
  "@payloadcms/next/views#RootPage": {
    id: "@payloadcms/next/views#RootPage",
    value: () => import("@payloadcms/next/views").then((mod) => mod.RootPage)
  }
};
