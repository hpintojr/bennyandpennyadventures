import type { Metadata } from "next";
import PortalPageHeader from "../../../components/PortalPageHeader";
import PortalGiftsClient from "../../../components/PortalGiftsClient";

export const metadata: Metadata = { title: "Gifting" };

export default function PortalGiftsPage() {
  return (
    <>
      <PortalPageHeader
        eyebrow="Gifting ♥"
        title="Gift a book"
        intro="Share a digital book from your library. Each gift uses one reading slot and gives a friend their own copy."
      />
      <PortalGiftsClient />
    </>
  );
}
