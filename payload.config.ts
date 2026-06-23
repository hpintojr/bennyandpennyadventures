import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import { AbandonedCarts } from "./collections/AbandonedCarts.ts";
import { AccessGrants } from "./collections/AccessGrants.ts";
import { AuditLogs } from "./collections/AuditLogs.ts";
import { Books } from "./collections/Books.ts";
import { ConsentLogs } from "./collections/ConsentLogs.ts";
import { ContactSubmissions } from "./collections/ContactSubmissions.ts";
import { CustomerAddresses } from "./collections/CustomerAddresses.ts";
import { Downloads } from "./collections/Downloads.ts";
import { OrderItems } from "./collections/OrderItems.ts";
import { Orders } from "./collections/Orders.ts";
import { PrintJobs } from "./collections/PrintJobs.ts";
import { PrivacyRequests } from "./collections/PrivacyRequests.ts";
import { Promotions } from "./collections/Promotions.ts";
import { Gifts } from "./collections/Gifts.ts";
import { PasswordTokens } from "./collections/PasswordTokens.ts";
import { Subscribers } from "./collections/Subscribers.ts";
import { SupportMessages } from "./collections/SupportMessages.ts";
import { SupportTickets } from "./collections/SupportTickets.ts";
import { Users } from "./collections/Users.ts";

const databaseUri = process.env.DATABASE_URI;
const payloadKey = process.env["PAYLOAD_" + "SECRET"];

if (!databaseUri || !payloadKey) {
  throw new Error("Payload CMS environment variables are required.");
}

function getVerifiedDatabaseUri(value: string) {
  const uri = new URL(value);
  const sslMode = uri.searchParams.get("sslmode");

  if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
    uri.searchParams.set("sslmode", "verify-full");
  }

  return uri.toString();
}

export default buildConfig({
  admin: {
    user: Users.slug,
    components: {
      afterNavLinks: [
        "/app/(payload)/components/OrderProfileActions.tsx#OrderProfileActions",
        "/app/(payload)/components/AdminAfterNavLinks.tsx#AdminAfterNavLinks"
      ],
      beforeDashboard: ["/app/(payload)/components/BeforeDashboard.tsx#BeforeDashboard"],
      beforeNavLinks: ["/app/(payload)/components/AdminBeforeNavLinks.tsx#AdminBeforeNavLinks"],
      graphics: {
        Icon: "/app/(payload)/graphics/Icon.tsx#Icon",
        Logo: "/app/(payload)/graphics/Logo.tsx#Logo"
      }
    },
    meta: {
      titleSuffix: " - Benny & Penny Admin"
    }
  },
  collections: [
    Books,
    Orders,
    AbandonedCarts,
    Subscribers,
    SupportTickets,
    PrivacyRequests,
    ConsentLogs,
    Users,
    CustomerAddresses,
    ContactSubmissions,
    OrderItems,
    PrintJobs,
    Downloads,
    SupportMessages,
    AccessGrants,
    AuditLogs,
    Promotions,
    Gifts,
    PasswordTokens
  ],
  db: postgresAdapter({
    push: true,
    pool: {
      connectionString: getVerifiedDatabaseUri(databaseUri)
    }
  }),
  secret: payloadKey,
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  typescript: {
    outputFile: "payload-types.ts"
  }
});
