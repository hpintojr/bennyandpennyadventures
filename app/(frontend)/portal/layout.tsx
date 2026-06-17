import type { Metadata } from "next";
import SiteShell from "../../components/SiteShell";
import PortalShell from "../../components/PortalShell";

export const metadata: Metadata = {
  title: {
    default: "Customer Portal",
    template: "%s | Customer Portal"
  }
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteShell>
      <PortalShell>{children}</PortalShell>
    </SiteShell>
  );
}
