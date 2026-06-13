import { postgresAdapter } from "@payloadcms/db-postgres";
import { buildConfig } from "payload";
import { AccessGrants } from "./collections/AccessGrants.ts";
import { AuditLogs } from "./collections/AuditLogs.ts";
import { Books } from "./collections/Books.ts";
import { ContactSubmissions } from "./collections/ContactSubmissions.ts";
import { CustomerAddresses } from "./collections/CustomerAddresses.ts";
import { Downloads } from "./collections/Downloads.ts";
import { OrderItems } from "./collections/OrderItems.ts";
import { Orders } from "./collections/Orders.ts";
import { Subscribers } from "./collections/Subscribers.ts";
import { SupportMessages } from "./collections/SupportMessages.ts";
import { SupportTickets } from "./collections/SupportTickets.ts";
import { Users } from "./collections/Users.ts";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required for Payload CMS.`);
  }
  return value;
}

const databaseUri = requiredEnv("DATABASE_URI");
const payloadSecret = requiredEnv("PAYLOAD_SECRET");

export default buildConfig({
  admin: {
    user: Users.slug
  },
  collections: [
    Users,
    Books,
    CustomerAddresses,
    ContactSubmissions,
    Subscribers,
    Orders,
    OrderItems,
    Downloads,
    SupportTickets,
    SupportMessages,
    AccessGrants,
    AuditLogs
  ],
  db: postgresAdapter({
    pool: {
      connectionString: databaseUri
    }
  }),
  secret: payloadSecret,
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  typescript: {
    outputFile: "payload-types.ts"
  }
});
