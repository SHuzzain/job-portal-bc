import { createAccessControl } from "better-auth/plugins/access"
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access"

export const organizationStatements = {
  ...defaultStatements,
  vacancy: ["create", "read", "update", "delete"],
  page: ["seeker_portal", "employer_portal", "tvet_portal", "pasak_portal"],
} as const

export const organizationAc = createAccessControl(organizationStatements)

export const owner = organizationAc.newRole({
  ...ownerAc.statements,
  vacancy: ["create", "read", "update", "delete"],
  page: ["employer_portal", "tvet_portal", "pasak_portal"],
})

export const admin = organizationAc.newRole({
  ...adminAc.statements,
  vacancy: ["create", "read", "update", "delete"],
  page: ["employer_portal", "tvet_portal"],
})

export const hr = organizationAc.newRole({
  ...memberAc.statements,
  member: ["create", "update"],
  invitation: ["create", "cancel"],
  vacancy: ["create", "read", "update"],
  page: ["employer_portal"],
})

export const finance = organizationAc.newRole({
  ...memberAc.statements,
  vacancy: ["read"],
  page: ["employer_portal"],
})

export const organizationRoles = {
  owner,
  admin,
  hr,
  finance,
}
