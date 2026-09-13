import { organization } from "better-auth/plugins"
import { organizationAc, organizationRoles } from "../access/organization.ts"

const canCreateOrganization = (user: { role?: string | string[] | null } & Record<string, unknown>) => {
  const roles = Array.isArray(user.role) ? user.role : [user.role]
  return roles.some((role) =>
    role ? ["employer", "admin", "super_admin"].includes(role) : false,
  )
}

export const organizationPlugin = organization({
  ac: organizationAc,
  roles: organizationRoles,
  creatorRole: "owner",
  allowUserToCreateOrganization: async (user) => canCreateOrganization(user),
  dynamicAccessControl: {
    enabled: true,
  },
  schema: {
    organization: {
      additionalFields: {
        status: {
          type: "string",
          required: false,
          defaultValue: "PENDING_APPROVAL",
          input: false,
        },
        ssmNumber: {
          type: "string",
          required: false,
          input: true,
        },
        ssmDocumentUrl: {
          type: "string",
          required: false,
          input: true,
        },
        legalName: {
          type: "string",
          required: false,
          input: true,
        },
        industry: {
          type: "string",
          required: false,
          input: true,
        },
        website: {
          type: "string",
          required: false,
          input: true,
        },
        address: {
          type: "string",
          required: false,
          input: true,
        },
        reviewNotes: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },
  },
})
