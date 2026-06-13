import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import { AccessGrants } from "./collections/AccessGrants";
import { AuditLogs } from "./collections/AuditLogs";
import { Books } from "./collections/Books";
import { ContactSubmissions } from "./collections/ContactSubmissions";
import { CustomerAddresses } from "./collections/CustomerAddresses";
import { Downloads } from "./collections/Downloads";
import { OrderItems } from "./collections/OrderItems";
import { Orders } from "./collections/Orders";
import { Subscribers } from "./collections/Subscribers";
import { SupportMessages } from "./collections/SupportMessages";
import { SupportTickets } from "./collections/SupportTickets";
import { Users } from "./collections/Users";

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
      connectionString: process.env.DATABASE_URI
    }
  }),
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000",
  typescript: {
    outputFile: "payload-types.ts"
  }
});
