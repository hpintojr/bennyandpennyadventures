"use client";

import { Activity, BookOpen, Image as ImageIcon, LayoutDashboard, Mail, Package, Gift, ShieldAlert, Ticket, UserCog, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export type SidebarIconName = "activity" | "book" | "dashboard" | "image" | "mail" | "package" | "gift" | "shield" | "ticket" | "userCog" | "users";
export type SidebarActiveKey = "books" | "customers" | "dashboard" | "media" | "orders" | "printJobs" | "gifts" | "privacy" | "promotions" | "subscribers" | "system" | "users";

const iconMap: Record<SidebarIconName, LucideIcon> = {
  activity: Activity,
  book: BookOpen,
  dashboard: LayoutDashboard,
  image: ImageIcon,
  mail: Mail,
  package: Package,
  gift: Gift,
  shield: ShieldAlert,
  ticket: Ticket,
  userCog: UserCog,
  users: Users
};

type Props = { activeKey: SidebarActiveKey; badge?: number; href: string; iconName: SidebarIconName; label: string };

function isBasePath(pathname: string, base: string) {
  return pathname === base || pathname.startsWith(`${base}/`);
}

function hasCustomerFilter() {
  if (typeof window === "undefined") return false;
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("where[role][equals]") === "customer";
}

function isLinkActive(activeKey: SidebarActiveKey, pathname: string) {
  const customerFilter = hasCustomerFilter();
  if (activeKey === "dashboard") return pathname === "/admin" || pathname === "/admin/";
  if (activeKey === "orders") return isBasePath(pathname, "/admin/collections/orders");
  if (activeKey === "customers") return isBasePath(pathname, "/admin/collections/users") && customerFilter;
  if (activeKey === "users") return isBasePath(pathname, "/admin/collections/users") && !customerFilter;
  if (activeKey === "books") return isBasePath(pathname, "/admin/collections/books");
  if (activeKey === "media") return isBasePath(pathname, "/admin/collections/downloads");
  if (activeKey === "printJobs") return isBasePath(pathname, "/admin/collections/print-jobs");
  if (activeKey === "subscribers") return isBasePath(pathname, "/admin/collections/subscribers");
  if (activeKey === "privacy") return isBasePath(pathname, "/admin/collections/privacy-requests");
  if (activeKey === "promotions") return isBasePath(pathname, "/admin/collections/promotions");
  if (activeKey === "gifts") return isBasePath(pathname, "/admin/collections/gifts");
  return false;
}

export function AdminSidebarNavLink({ activeKey, badge, href, iconName, label }: Props) {
  const pathname = usePathname() || "";
  const Icon = iconMap[iconName];
  const active = isLinkActive(activeKey, pathname);

  return (
    <Link aria-current={active ? "page" : undefined} className={active ? "bp-admin-nav-extra__link bp-admin-nav-extra__link--active" : "bp-admin-nav-extra__link"} href={href}>
      <Icon className="bp-admin-nav-extra__iconSvg" size={18} strokeWidth={2.5} aria-hidden="true" />
      <em>{label}</em>
      {typeof badge === "number" && badge > 0 ? <strong>{badge}</strong> : null}
    </Link>
  );
}

export default AdminSidebarNavLink;
