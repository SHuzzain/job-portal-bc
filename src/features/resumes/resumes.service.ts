import * as resumesRepository from "./resumes.repository.ts"

export class ResumeError extends Error {
  constructor(
    public status: 400 | 404,
    message: string,
  ) {
    super(message)
    this.name = "ResumeError"
  }
}

function toResume(row: {
  id: string
  userId: string
  title: string
  fileUrl: string
  createdAt: Date
}) {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    fileUrl: row.fileUrl,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function listMine(userId: string) {
  const rows = await resumesRepository.listByUserId(userId)
  return rows.map(toResume)
}

export async function createMine(userId: string, data: { title: string; fileUrl: string }) {
  const row = await resumesRepository.insertResume({
    id: crypto.randomUUID(),
    userId,
    title: data.title,
    fileUrl: data.fileUrl,
  })
  if (!row) {
    throw new ResumeError(400, "Could not save resume")
  }
  return toResume(row)
}

export async function deleteMine(userId: string, id: string) {
  const row = await resumesRepository.deleteByIdForUser(id, userId)
  if (!row) {
    throw new ResumeError(404, "Resume not found")
  }
}

export async function getOwned(userId: string, id: string) {
  return resumesRepository.findByIdForUser(id, userId)
}
