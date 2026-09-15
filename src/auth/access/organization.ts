import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  ownerAc,
} from "better-auth/plugins/organization/access";

import {
  type PermissionMap,
  fullPermissions,
  organizationResourceStatements,
} from "./catalog.ts";

export const organizationStatements = {
  ...defaultStatements,
  ...organizationResourceStatements,
} as const;

export const organizationAc = createAccessControl(organizationStatements);

const adminPermissions = {
  company: ["view", "update", "resubmit"],
  vacancy: ["view", "create", "update", "delete", "resubmit"],
  applicant: ["view", "shortlist", "reject", "hire", "follow_up"],
  interview: ["view", "schedule"],
  tvet_rfp: ["view", "create", "update", "close"],
  tvet_session: ["view", "create"],
  tvet_claim: ["view", "create", "upload_signed", "download"],
  org_member: ["view", "invite", "update_role"],
  org_role: ["view"],
  notification: ["view", "mark_read"],
} as const;

const memberPermissions = {
  company: ["view"],
  vacancy: ["view"],
  applicant: ["view"],
  interview: ["view"],
  notification: ["view", "mark_read"],
} as const;

export const owner = organizationAc.newRole({
  ...ownerAc.statements,
  ...organizationResourceStatements,
});

export const admin = organizationAc.newRole({
  ...adminAc.statements,
  ...adminPermissions,
});

export const organizationRoles = {
  owner,
  admin,
};

export const BUILTIN_ORG_PERMISSIONS: Record<string, PermissionMap> = {
  owner: fullPermissions(organizationResourceStatements),
  admin: fullPermissions(adminPermissions),
  member: fullPermissions(memberPermissions),
};
