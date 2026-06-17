import type { Metadata } from "next";
import PortalDashboardClient from "../../components/PortalDashboardClient";

export const metadata: Metadata = {
  title: "Dashboard"
};

export default function PortalPage() {
  return <PortalDashboardClient />;
}
