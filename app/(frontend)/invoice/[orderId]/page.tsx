import type { Metadata } from "next";
import InvoiceClient from "../../../components/InvoiceClient";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false }
};

export default async function InvoicePage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  return <InvoiceClient orderId={orderId} />;
}
