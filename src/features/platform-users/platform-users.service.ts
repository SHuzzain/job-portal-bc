import { auth } from "../../auth/index.ts"
import * as platformRolesRepository from "../platform-roles/platform-roles.repository.ts"
import * as repository from "./platform-users.repository.ts"

export class PlatformUserError extends Error {
  constructor(
    public status: 400 | 403 | 404 | 409,
    message: string,
  ) {
    super(message)
    this.name = "PlatformUserError"
  }
}

type UserRow = Awaited<ReturnType<typeof repository.findUserById>>

function toUser(row: NonNullable<UserRow>) {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
  }
}

async function roleOr404(name: string) {
  if (name === "training_provider") {
    throw new PlatformUserError(
      400,
      "Training Provider is a workspace, not a login role",
    )
  }

  const role = await platformRolesRepository.findRoleByName(name)
  if (!role) {
    throw new PlatformUserError(404, `Platform role "${name}" not found`)
  }
  return role
}

export async function listUsers() {
  return (await repository.listUsers()).map(toUser)
}

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: string
}) {
  await roleOr404(data.role)

  const existing = await repository.findUserByEmail(data.email)
  if (existing) {
    throw new PlatformUserError(409, "A user with this email already exists")
  }

  // Better Auth rejects `role` in the signup body, so the role is applied
  // directly afterwards - the same technique used by scripts/create-admin.ts.
  await auth.api.signUpEmail({
    body: { name: data.name, email: data.email, password: data.password },
  })

  const created = await repository.markVerifiedWithRole(data.email, data.role)
  if (!created) {
    throw new PlatformUserError(400, "Could not create platform user")
  }
  return toUser(created)
}

export async function assignRole(id: string, role: string) {
  await roleOr404(role)

  const updated = await repository.updateUserRole(id, role)
  if (!updated) {
    throw new PlatformUserError(404, "User not found")
  }
  return toUser(updated)
}

export async function updateUser(id: string, data: { accountStatus: string }) {
  const updated = await repository.setAccountStatus(id, data.accountStatus)
  if (!updated) {
    throw new PlatformUserError(404, "User not found")
  }
  return toUser(updated)
}
