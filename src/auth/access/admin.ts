import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access"

export const adminStatements = {
  ...defaultStatements,
  page: ["seeker_portal", "employer_portal", "tvet_portal", "pasak_portal"],
} as const

export const platformAc = createAccessControl(adminStatements)

export const jobseeker = platformAc.newRole({
  ...userAc.statements,
  page: ["seeker_portal"],
})

export const employer = platformAc.newRole({
  ...userAc.statements,
  page: ["employer_portal"],
})

export const admin = platformAc.newRole({
  ...adminAc.statements,
  page: ["pasak_portal", "tvet_portal"],
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
  page: ["seeker_portal", "employer_portal", "tvet_portal", "pasak_portal"],
})

export const platformRoles = {
  jobseeker,
  employer,
  admin,
  super_admin: superAdmin,
}
