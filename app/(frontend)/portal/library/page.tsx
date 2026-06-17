import type { Metadata } from "next";
import PortalPageHeader from "../../../components/PortalPageHeader";
import PortalLibraryClient from "../../../components/PortalLibraryClient";

export const metadata: Metadata = {
  title: "My Library"
};

export default function PortalLibraryPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="My Library ♥"
        title="Your books"
        intro="Read and download your books. Each title's license includes 3 reading slots, shared across PDF/EPUB downloads and gifts."
      />
      <PortalLibraryClient />
    </>
  );
}
