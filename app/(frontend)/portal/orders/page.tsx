import type { Metadata } from "next";
import PortalPageHeader from "../../../components/PortalPageHeader";
import PortalOrdersClient from "../../../components/PortalOrdersClient";

export const metadata: Metadata = {
  title: "My Orders"
};

export default function PortalOrdersPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="My Orders ♥"
        title="Order history & shipping"
        intro="Every Benny & Penny order, with live print fulfillment and package tracking."
      />
      <PortalOrdersClient />
    </>
  );
}
