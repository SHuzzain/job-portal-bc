import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access"
import {
  fullPermissions,
  platformResourceStatements,
  type PermissionMap,
} from "./catalog.ts"

export const adminStatements = {
  ...defaultStatements,
  ...platformResourceStatements,
} as const

export const platformAc = createAccessControl(adminStatements)

const jobseekerPermissions = {
  seeker_profile: ["view", "update"],
  resume: ["view", "create", "delete"],
  seeker_application: ["view", "create"],
  tvet_attendance: ["view", "scan"],
  tvet_certificate: ["view", "submit_survey", "download"],
  notification: ["view", "mark_read"],
} as const

const employerPermissions = {
  company: ["view", "create", "update", "resubmit"],
  vacancy: ["view", "create", "update", "delete", "resubmit"],
  applicant: ["view", "shortlist", "reject", "hire", "follow_up"],
  interview: ["view", "schedule"],
  org_member: ["view", "invite", "update_role", "remove"],
  org_role: ["view", "create", "update", "delete"],
  notification: ["view", "mark_read"],
} as const

const trainingProviderPermissions = {
  company: ["view", "update"],
  tvet_rfp: ["view", "create", "update", "close"],
  tvet_session: ["view", "create"],
  tvet_claim: ["view", "create", "upload_signed", "download"],
  notification: ["view", "mark_read"],
} as const

const adminPermissions = {
  company_review: ["view", "approve", "reject", "return"],
  vacancy_review: ["view", "approve", "reject", "return"],
  tvet_capability: ["view", "grant", "revoke"],
  claim_review: ["view", "approve", "reject", "finalize"],
  platform_user: ["view", "create", "update", "set_role"],
  platform_role: ["view"],
  notification: ["view", "mark_read"],
} as const

export const jobseeker = platformAc.newRole({
  ...userAc.statements,
  ...jobseekerPermissions,
})

export const employer = platformAc.newRole({
  ...userAc.statements,
  ...employerPermissions,
})

export const admin = platformAc.newRole({
  ...adminAc.statements,
  ...adminPermissions,
})

export const superAdmin = platformAc.newRole({
  ...adminAc.statements,
  user: [
    "create",
    "list",
    "set-role",
    "ban",
    "impersonate",
    "impersonate-admins",
    "delete",
    "set-password",
    "set-email",
    "get",
    "update",
  ],
  ...platformResourceStatements,
})

export const platformRoles = {
  jobseeker,
  employer,
  admin,
  super_admin: superAdmin,
}

/**
 * Seed permissions for system roles, mirrored by the platform_role table.
 * training_provider is workspace-only and is not assigned as user.role.
 * Custom platform roles live in that table and are not compiled here.
 */
export const SYSTEM_PLATFORM_PERMISSIONS: Record<string, PermissionMap> = {
  jobseeker: fullPermissions(jobseekerPermissions),
  employer: fullPermissions(employerPermissions),
  training_provider: fullPermissions(trainingProviderPermissions),
  admin: fullPermissions(adminPermissions),
  super_admin: fullPermissions(platformResourceStatements),
}

export const SYSTEM_PLATFORM_ROLES = Object.keys(SYSTEM_PLATFORM_PERMISSIONS)
