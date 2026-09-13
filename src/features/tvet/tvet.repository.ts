import { and, eq } from "drizzle-orm"
import { db } from "../../db/index.ts"
import { tvetAttendance, tvetRfp, tvetSession } from "./tvet.schema.ts"

export type CreateRfpRecord = {
  id: string
  organizationId: string
  title: string
  description: string
  status: string
}

export type UpdateRfpRecord = Partial<Pick<CreateRfpRecord, "title" | "description" | "status">>

export type CreateSessionRecord = {
  id: string
  rfpId: string
  organizationId: string
  title: string
  venue: string
  startsAt: string
  endsAt: string
  barcode: string
}

export type CreateAttendanceRecord = {
  id: string
  sessionId: string
  userId: string
}

export async function insertRfp(data: CreateRfpRecord) {
  const [row] = await db.insert(tvetRfp).values(data).returning()
  return row ?? null
}

export async function findRfpById(id: string) {
  const [row] = await db.select().from(tvetRfp).where(eq(tvetRfp.id, id)).limit(1)
  return row ?? null
}

export async function listRfpsByOrganization(organizationId: string) {
  return db.select().from(tvetRfp).where(eq(tvetRfp.organizationId, organizationId))
}

export async function updateRfpById(id: string, data: UpdateRfpRecord) {
  const [row] = await db.update(tvetRfp).set(data).where(eq(tvetRfp.id, id)).returning()
  return row ?? null
}

export async function insertSession(data: CreateSessionRecord) {
  const [row] = await db.insert(tvetSession).values(data).returning()
  return row ?? null
}

export async function findSessionById(id: string) {
  const [row] = await db.select().from(tvetSession).where(eq(tvetSession.id, id)).limit(1)
  return row ?? null
}

export async function findSessionByBarcode(barcode: string) {
  const [row] = await db
    .select()
    .from(tvetSession)
    .where(eq(tvetSession.barcode, barcode))
    .limit(1)
  return row ?? null
}

export async function listSessionsByOrganization(organizationId: string, rfpId?: string) {
  if (rfpId) {
    return db
      .select()
      .from(tvetSession)
      .where(and(eq(tvetSession.organizationId, organizationId), eq(tvetSession.rfpId, rfpId)))
  }
  return db.select().from(tvetSession).where(eq(tvetSession.organizationId, organizationId))
}

export async function insertAttendance(data: CreateAttendanceRecord) {
  const [row] = await db.insert(tvetAttendance).values(data).returning()
  return row ?? null
}

export async function findAttendance(sessionId: string, userId: string) {
  const [row] = await db
    .select()
    .from(tvetAttendance)
    .where(and(eq(tvetAttendance.sessionId, sessionId), eq(tvetAttendance.userId, userId)))
    .limit(1)
  return row ?? null
}

export async function listAttendanceBySession(sessionId: string) {
  return db.select().from(tvetAttendance).where(eq(tvetAttendance.sessionId, sessionId))
}

export async function listAttendanceByUser(userId: string) {
  return db.select().from(tvetAttendance).where(eq(tvetAttendance.userId, userId))
}
