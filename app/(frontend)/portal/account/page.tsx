import type { Metadata } from "next";
import PortalPageHeader from "../../../components/PortalPageHeader";
import PortalAccountClient from "../../../components/PortalAccountClient";

export const metadata: Metadata = {
  title: "Account"
};

export default function PortalAccountPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="Account ♥"
        title="Profile & security"
        intro="Update your details, manage your password, and control your privacy preferences."
      />
      <PortalAccountClient />
    </>
  );
}
