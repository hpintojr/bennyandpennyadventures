import type { Metadata } from "next";
import SiteShell from "../components/SiteShell";
import CartPageClient from "../components/CartPageClient";

export const metadata: Metadata = {
  title: "Your Cart"
};

export default function CartPage() {
  return (
    <SiteShell>
      <CartPageClient />
    </SiteShell>
  );
}
