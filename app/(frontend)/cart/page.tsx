import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";
import CartPageClient from "../../components/CartPageClient";
import CartRecoveryRestore from "../../components/CartRecoveryRestore";

export const metadata: Metadata = {
  title: "Your Cart"
};

export default function CartPage() {
  return (
    <SiteShell>
      <CartRecoveryRestore />
      <CartPageClient />
    </SiteShell>
  );
}
