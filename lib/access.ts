import type { Access, FieldAccess } from "payload";

type MaybeUser = { id?: string | number; role?: string } | null | undefined;

// Public read (e.g. the book catalog).
export const anyone: Access = () => true;

// Collection-level: only admins.
export const isAdmin: Access = ({ req }) => (req.user as MaybeUser)?.role === "admin";

// Admin-panel gate (boolean only) for a collection's access.admin.
export const isAdminPanel = ({ req }: { req: { user?: MaybeUser } }) =>
  (req.user as MaybeUser)?.role === "admin";

// Field-level: only admins may read/update the field (e.g. role).
export const isAdminFieldLevel: FieldAccess = ({ req }) => (req.user as MaybeUser)?.role === "admin";

// Admins see everything; a signed-in customer is constrained to rows they own.
// `userField` is the relationship field that points at the owning user.
export const isAdminOrSelf =
  (userField = "customer"): Access =>
  ({ req }) => {
    const user = req.user as MaybeUser;
    if (!user) return false;
    if (user.role === "admin") return true;
    return { [userField]: { equals: user.id } };
  };

// Convenience bundle for admin-only collections.
export const adminOnly = {
  read: isAdmin,
  create: isAdmin,
  update: isAdmin,
  delete: isAdmin
};
