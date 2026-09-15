import { admin } from "better-auth/plugins";

import { platformAc, platformRoles } from "../access/admin.ts";

export const adminPlugin = admin({
  ac: platformAc,
  roles: platformRoles,
  defaultRole: "jobseeker",
  adminRoles: ["admin", "super_admin"],
});
