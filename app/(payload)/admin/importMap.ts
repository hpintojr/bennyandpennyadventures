import { AdminAfterNavLinks as AdminAfterNavLinks_bennyPennyAdmin } from "../components/AdminAfterNavLinks";
import { AdminBeforeNavLinks as AdminBeforeNavLinks_bennyPennyAdmin } from "../components/AdminBeforeNavLinks";
import AdminWelcomeName_AdminWelcomeName from "../components/AdminWelcomeName";
import { BeforeDashboard as BeforeDashboard_bennyPennyAdmin } from "../components/BeforeDashboard";
import { Icon as Icon_bennyPennyAdmin } from "../graphics/Icon";
import { Logo as Logo_bennyPennyAdmin } from "../graphics/Logo";
import { CollectionCards as CollectionCards_ab83ff7e88da8d3530831f296ec4756a } from "@payloadcms/ui/rsc";
import type { ImportMap } from "payload";

export const importMap: ImportMap = {
  "@payloadcms/ui/rsc#CollectionCards": CollectionCards_ab83ff7e88da8d3530831f296ec4756a,
  "/app/(payload)/components/AdminAfterNavLinks.tsx#AdminAfterNavLinks": AdminAfterNavLinks_bennyPennyAdmin,
  "/app/(payload)/components/AdminBeforeNavLinks.tsx#AdminBeforeNavLinks": AdminBeforeNavLinks_bennyPennyAdmin,
  "/app/(payload)/components/AdminWelcomeName.tsx#default": AdminWelcomeName_AdminWelcomeName,
  "/app/(payload)/components/BeforeDashboard.tsx#BeforeDashboard": BeforeDashboard_bennyPennyAdmin,
  "/app/(payload)/graphics/Icon.tsx#Icon": Icon_bennyPennyAdmin,
  "/app/(payload)/graphics/Logo.tsx#Logo": Logo_bennyPennyAdmin
};
