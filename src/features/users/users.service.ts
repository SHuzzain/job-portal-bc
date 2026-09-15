import { isWorkspace, type Workspace } from "../../auth/access/workspace.ts"
import * as usersRepository from "./users.repository.ts"

export class WorkspaceError extends Error {
  constructor(
    public status: 400 | 403 | 404,
    message: string,
  ) {
    super(message)
    this.name = "WorkspaceError"
  }
}

export async function updateProfile(
  userId: string,
  data: { name?: string; image?: string | null },
) {
  const existing = await usersRepository.findUserById(userId)
  if (!existing) {
    return null
  }

  return usersRepository.updateUserById(userId, data)
}

export async function updatePhone(userId: string, phoneNumber: string) {
  const existing = await usersRepository.findUserById(userId)
  if (!existing) {
    return null
  }

  return usersRepository.updateUserById(userId, { phoneNumber })
}

export async function updateWorkspace(userId: string, workspace: Workspace) {
  if (!isWorkspace(workspace)) {
    throw new WorkspaceError(400, "Unsupported workspace")
  }

  const existing = await usersRepository.findUserById(userId)
  if (!existing) {
    throw new WorkspaceError(404, "User not found")
  }

  if (existing.role !== "employer") {
    throw new WorkspaceError(400, "Workspace switch is only available on employer accounts")
  }

  if (workspace === "training_provider" && existing.hasTvetCapability !== true) {
    throw new WorkspaceError(403, "TVET capability required")
  }

  const row = await usersRepository.updateUserById(userId, { activeWorkspace: workspace })
  if (!row) {
    throw new WorkspaceError(404, "User not found")
  }

  return row
}
