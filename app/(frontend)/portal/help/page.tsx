import type { Metadata } from "next";
import PortalPageHeader from "../../../components/PortalPageHeader";
import PortalHelpClient from "../../../components/PortalHelpClient";

export const metadata: Metadata = {
  title: "Help"
};

export default function PortalHelpPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="Help ♥"
        title="Support & contact"
        intro="Get help with orders, downloads, shipping, or bulk orders — and track your past requests."
      />
      <PortalHelpClient />
    </>
  );
}
