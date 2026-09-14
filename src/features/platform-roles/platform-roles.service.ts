import {
  platformResourceStatements,
  sanitizePermissions,
  type PermissionMap,
} from "../../auth/access/catalog.ts"
import * as repository from "./platform-roles.repository.ts"

export class PlatformRoleError extends Error {
  constructor(
    public status: 400 | 403 | 404 | 409,
    message: string,
  ) {
    super(message)
    this.name = "PlatformRoleError"
  }
}

type RoleRow = Awaited<ReturnType<typeof repository.findRoleById>>

function toRole(row: NonNullable<RoleRow>) {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    permissions: row.permissions,
    isSystem: row.isSystem,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

async function roleOr404(id: string) {
  const row = await repository.findRoleById(id)
  if (!row) {
    throw new PlatformRoleError(404, "Platform role not found")
  }
  return row
}

export async function listRoles() {
  return (await repository.listRoles()).map(toRole)
}

export async function getRole(id: string) {
  return toRole(await roleOr404(id))
}

/** Resolves the permissions granted by a role name, for session and middleware use. */
export async function permissionsForRoleName(
  name: string | null | undefined,
): Promise<PermissionMap> {
  if (!name) {
    return {}
  }
  const row = await repository.findRoleByName(name)
  return row ? row.permissions : {}
}

export async function createRole(data: {
  name: string
  label: string
  permissions: PermissionMap
}) {
  const existing = await repository.findRoleByName(data.name)
  if (existing) {
    throw new PlatformRoleError(409, "A role with this name already exists")
  }

  const permissions = sanitizePermissions(data.permissions, platformResourceStatements)
  if (Object.keys(permissions).length === 0) {
    throw new PlatformRoleError(400, "Select at least one permission")
  }

  const row = await repository.insertRole({
    id: crypto.randomUUID(),
    name: data.name,
    label: data.label,
    permissions,
  })
  if (!row) {
    throw new PlatformRoleError(400, "Could not create platform role")
  }
  return toRole(row)
}

export async function updateRole(
  id: string,
  data: { label?: string; permissions?: PermissionMap },
) {
  await roleOr404(id)

  const patch: { label?: string; permissions?: PermissionMap } = {}
  if (data.label !== undefined) {
    patch.label = data.label
  }
  if (data.permissions !== undefined) {
    const permissions = sanitizePermissions(data.permissions, platformResourceStatements)
    if (Object.keys(permissions).length === 0) {
      throw new PlatformRoleError(400, "Select at least one permission")
    }
    patch.permissions = permissions
  }

  if (Object.keys(patch).length === 0) {
    return getRole(id)
  }

  const row = await repository.updateRole(id, patch)
  if (!row) {
    throw new PlatformRoleError(404, "Platform role not found")
  }
  return toRole(row)
}

export async function deleteRole(id: string) {
  const existing = await roleOr404(id)
  if (existing.isSystem) {
    throw new PlatformRoleError(403, "System roles cannot be deleted")
  }
  await repository.deleteRole(id)
}
