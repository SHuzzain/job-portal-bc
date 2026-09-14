import * as notificationsService from "../notifications/notifications.service.ts"
import * as interviewsRepository from "../interviews/interviews.repository.ts"
import { completeLatestForApplication, latestInterviewMap } from "../interviews/interviews.service.ts"
import * as resumesService from "../resumes/resumes.service.ts"
import {
  getRawMine,
  isProfileComplete,
} from "../seeker-profiles/seeker-profiles.service.ts"
import * as vacanciesRepository from "../vacancies/vacancies.repository.ts"
import * as applicationsRepository from "./applications.repository.ts"

export class ApplicationError extends Error {
  constructor(
    public status: 400 | 403 | 404 | 409,
    message: string,
  ) {
    super(message)
    this.name = "ApplicationError"
  }
}

function toApplication(
  row: {
    id: string
    userId: string
    vacancyId: string
    resumeId: string
    status: string
    createdAt: Date
  },
  interview: ReturnType<typeof latestInterviewMap> extends Map<string, infer T> ? T | null : never,
) {
  return {
    id: row.id,
    userId: row.userId,
    vacancyId: row.vacancyId,
    resumeId: row.resumeId,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    interview,
  }
}

async function interviewsFor(applicationIds: string[]) {
  const rows = await interviewsRepository.listByApplicationIds(applicationIds)
  return latestInterviewMap(rows)
}

export async function apply(userId: string, vacancyId: string, resumeId: string) {
  const vacancy = await vacanciesRepository.findVacancyById(vacancyId)
  if (!vacancy || vacancy.status !== "APPROVED") {
    throw new ApplicationError(404, "Vacancy not found")
  }

  const profile = await getRawMine(userId)
  if (!isProfileComplete(profile)) {
    throw new ApplicationError(403, "Complete your 5-step profile before applying")
  }

  const resume = await resumesService.getOwned(userId, resumeId)
  if (!resume) {
    throw new ApplicationError(400, "Choose one of your resumes")
  }

  const existing = await applicationsRepository.findByUserAndVacancy(userId, vacancyId)
  if (existing) {
    throw new ApplicationError(409, "You already applied to this vacancy")
  }

  const row = await applicationsRepository.insertApplication({
    id: crypto.randomUUID(),
    userId,
    vacancyId,
    resumeId,
    status: "SUBMITTED",
  })
  if (!row) {
    throw new ApplicationError(400, "Could not submit application")
  }

  await notificationsService.notifyOrganization(vacancy.organizationId, {
    type: "APPLICATION_RECEIVED",
    title: "New application",
    body: `A jobseeker applied to ${vacancy.title}.`,
    href: `/employer/vacancies/${vacancy.id}/applicants`,
    entityType: "application",
    entityId: row.id,
  })

  return toApplication(row, null)
}

export async function listMine(userId: string) {
  const rows = await applicationsRepository.listByUserId(userId)
  const interviews = await interviewsFor(rows.map((row) => row.id))
  return rows.map((row) => toApplication(row, interviews.get(row.id) ?? null))
}

export async function listForVacancy(organizationId: string, vacancyId: string) {
  const vacancy = await vacanciesRepository.findVacancyById(vacancyId)
  if (!vacancy || vacancy.organizationId !== organizationId) {
    throw new ApplicationError(404, "Vacancy not found")
  }

  const rows = await applicationsRepository.listByVacancyId(vacancyId)
  const interviews = await interviewsFor(rows.map((row) => row.id))
  return rows.map((row) => toApplication(row, interviews.get(row.id) ?? null))
}

export async function getVisibleApplication(
  userId: string,
  organizationId: string | null,
  id: string,
) {
  const existing = await applicationsRepository.findById(id)
  if (!existing) {
    throw new ApplicationError(404, "Application not found")
  }

  if (existing.userId !== userId) {
    if (!organizationId) {
      throw new ApplicationError(404, "Application not found")
    }
    const vacancy = await vacanciesRepository.findVacancyById(existing.vacancyId)
    if (!vacancy || vacancy.organizationId !== organizationId) {
      throw new ApplicationError(404, "Application not found")
    }
  }

  const interviews = await interviewsFor([existing.id])
  return toApplication(existing, interviews.get(existing.id) ?? null)
}

const employerStatuses = new Set([
  "SHORTLISTED",
  "INTERVIEW_COMPLETED",
  "REJECTED",
  "HIRED",
  "FAILED",
])

const allowedTransitions: Record<string, string[]> = {
  SUBMITTED: ["SHORTLISTED", "REJECTED"],
  REVIEWING: ["SHORTLISTED", "REJECTED"],
  SHORTLISTED: ["REJECTED"],
  WAITING_FOR_INTERVIEW: ["INTERVIEW_COMPLETED", "REJECTED"],
  INTERVIEW_COMPLETED: ["HIRED", "REJECTED"],
}

export const INACTIVE_AFTER_DAYS = 90

export async function setStatus(organizationId: string, id: string, status: string) {
  if (!employerStatuses.has(status)) {
    throw new ApplicationError(400, "Invalid application status")
  }

  const existing = await applicationsRepository.findById(id)
  if (!existing) {
    throw new ApplicationError(404, "Application not found")
  }

  const vacancy = await vacanciesRepository.findVacancyById(existing.vacancyId)
  if (!vacancy || vacancy.organizationId !== organizationId) {
    throw new ApplicationError(404, "Application not found")
  }

  const next = allowedTransitions[existing.status] ?? []
  if (status !== "FAILED" && !next.includes(status)) {
    throw new ApplicationError(400, `Cannot move application from ${existing.status} to ${status}`)
  }

  const row = await applicationsRepository.updateStatusById(id, status)
  if (!row) {
    throw new ApplicationError(404, "Application not found")
  }

  if (status === "INTERVIEW_COMPLETED") {
    await completeLatestForApplication(existing.id)
  }

  await notificationsService.notify(existing.userId, {
    type: "APPLICATION_STATUS",
    title: "Application updated",
    body: `Your application for ${vacancy.title} is now ${status}.`,
    href: `/seeker/applications/${existing.id}`,
    entityType: "application",
    entityId: existing.id,
  })

  const interviews = await interviewsFor([row.id])
  return toApplication(row, interviews.get(row.id) ?? null)
}

export async function requestFollowUp(organizationId: string, id: string) {
  const existing = await applicationsRepository.findById(id)
  if (!existing) {
    throw new ApplicationError(404, "Application not found")
  }

  const vacancy = await vacanciesRepository.findVacancyById(existing.vacancyId)
  if (!vacancy || vacancy.organizationId !== organizationId) {
    throw new ApplicationError(404, "Application not found")
  }

  await notificationsService.notify(existing.userId, {
    type: "APPLICATION_FOLLOW_UP",
    title: "Employer follow-up",
    body: `Please check your application for ${vacancy.title}.`,
    href: `/seeker/applications/${existing.id}`,
    entityType: "application",
    entityId: existing.id,
  })

  return toApplication(existing, (await interviewsFor([existing.id])).get(existing.id) ?? null)
}

export async function failIfStillAwaitingReview(applicationId: string) {
  const existing = await applicationsRepository.findById(applicationId)
  if (!existing || !["SUBMITTED", "REVIEWING"].includes(existing.status)) {
    return false
  }

  const row = await applicationsRepository.updateStatusIfCurrent(
    applicationId,
    ["SUBMITTED", "REVIEWING"],
    "FAILED",
  )
  if (!row) {
    return false
  }

  const vacancy = await vacanciesRepository.findVacancyById(row.vacancyId)
  await notificationsService.notify(row.userId, {
    type: "APPLICATION_FAILED",
    title: "Application closed",
    body: vacancy
      ? `Your application for ${vacancy.title} was closed as unsuccessful after 90 days without progress.`
      : "Your application was closed as unsuccessful after 90 days without progress.",
    href: `/seeker/applications/${row.id}`,
    entityType: "application",
    entityId: row.id,
  })

  return true
}

export async function markStaleForOrganization(organizationId: string) {
  const cutoff = new Date(Date.now() - INACTIVE_AFTER_DAYS * 24 * 60 * 60 * 1000)
  const rows = await applicationsRepository.listStaleForOrganization(organizationId, cutoff)

  for (const row of rows) {
    await applicationsRepository.updateStatusById(row.id, "FAILED")
    const vacancy = await vacanciesRepository.findVacancyById(row.vacancyId)
    await notificationsService.notify(row.userId, {
      type: "APPLICATION_FAILED",
      title: "Application closed",
      body: vacancy
        ? `Your application for ${vacancy.title} was closed as unsuccessful due to inactivity.`
        : "Your application was closed as unsuccessful due to inactivity.",
        href: `/seeker/applications/${row.id}`,
      entityType: "application",
      entityId: row.id,
    })
  }

  return { marked: rows.length }
}
