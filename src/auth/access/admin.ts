import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access"

export const adminStatements = {
  ...defaultStatements,
} as const

export const platformAc = createAccessControl(adminStatements)

export const jobseeker = platformAc.newRole({
  ...userAc.statements,
})

export const employer = platformAc.newRole({
  ...userAc.statements,
})

export const admin = platformAc.newRole({
  ...adminAc.statements,
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
})

export const platformRoles = {
  jobseeker,
  employer,
  admin,
  super_admin: superAdmin,
}
