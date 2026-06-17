import type { Metadata } from "next";
import PortalPageHeader from "../../../components/PortalPageHeader";
import PortalAddressesClient from "../../../components/PortalAddressesClient";

export const metadata: Metadata = {
  title: "My Addresses"
};

export default function PortalAddressesPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="Addresses ♥"
        title="Billing & shipping addresses"
        intro="Manage the addresses on your account and set defaults for faster checkout."
      />
      <PortalAddressesClient />
    </>
  );
}
