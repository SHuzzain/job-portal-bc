import * as notificationsService from "../notifications/notifications.service.ts"
import * as usersRepository from "../users/users.repository.ts"
import * as vacanciesService from "../vacancies/vacancies.service.ts"
import * as pasakRepository from "./pasak.repository.ts"
import { companyStatusSchema } from "./validator/pasak.schema.ts"

export class PasakError extends Error {
  constructor(
    public status: 400 | 404,
    message: string,
  ) {
    super(message)
    this.name = "PasakError"
  }
}

function toCompany(row: {
  id: string
  name: string
  slug: string
  status: string
  ssmNumber: string | null
  ssmDocumentUrl: string | null
  legalName: string | null
  industry: string | null
  website: string | null
  address: string | null
  reviewNotes?: string | null
}) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: companyStatusSchema.parse(row.status),
    ssmNumber: row.ssmNumber,
    ssmDocumentUrl: row.ssmDocumentUrl,
    legalName: row.legalName,
    industry: row.industry,
    website: row.website,
    address: row.address,
    reviewNotes: row.reviewNotes ?? null,
  }
}

export async function listCompanies(status?: string) {
  const rows = await pasakRepository.listCompanies(status)
  return rows.map(toCompany)
}

type ReviewAction = "APPROVE" | "REJECT" | "RETURN_FOR_CORRECTION"

function reviewOutcome(action: ReviewAction) {
  if (action === "APPROVE") {
    return "APPROVED" as const
  }
  if (action === "RETURN_FOR_CORRECTION") {
    return "RETURNED_FOR_CORRECTION" as const
  }
  return "REJECTED" as const
}

export async function setCompanyStatus(id: string, status: "APPROVED" | "REJECTED") {
  return reviewCompany(id, status === "APPROVED" ? "APPROVE" : "REJECT")
}

export async function reviewCompany(id: string, action: ReviewAction, comments?: string) {
  const existing = await pasakRepository.findCompanyById(id)
  if (!existing) {
    throw new PasakError(404, "Company not found")
  }

  const status = reviewOutcome(action)
  const notes = action === "APPROVE" ? null : comments?.trim() || existing.reviewNotes
  const row = await pasakRepository.updateCompany(id, {
    status,
    reviewNotes: notes,
  })
  if (!row) {
    throw new PasakError(404, "Company not found")
  }

  const returned = action === "RETURN_FOR_CORRECTION"
  await notificationsService.notifyOrganization(id, {
    type: returned
      ? "COMPANY_RETURNED"
      : status === "APPROVED"
        ? "COMPANY_APPROVED"
        : "COMPANY_REJECTED",
    title: returned
      ? "Company returned for correction"
      : status === "APPROVED"
        ? "Company approved"
        : "Company rejected",
    body: returned
      ? comments?.trim() || `${row.name} was returned for correction.`
      : status === "APPROVED"
        ? `${row.name} can now post vacancies.`
        : `${row.name} was not approved.`,
    href: "/employer",
    entityType: "company",
    entityId: id,
  })

  return toCompany(row)
}

export async function listVacancies(status = "PENDING_APPROVAL") {
  return vacanciesService.listVacanciesByStatus(status)
}

export async function setVacancyStatus(id: string, status: "APPROVED" | "REJECTED") {
  return reviewVacancy(id, status === "APPROVED" ? "APPROVE" : "REJECT")
}

export async function reviewVacancy(id: string, action: ReviewAction, comments?: string) {
  const status = reviewOutcome(action)
  const notes = action === "APPROVE" ? null : comments?.trim() || undefined
  const vacancy = await vacanciesService.setVacancyStatus(id, status, notes)
  const returned = action === "RETURN_FOR_CORRECTION"
  await notificationsService.notifyOrganization(vacancy.organizationId, {
    type: returned
      ? "VACANCY_RETURNED"
      : status === "APPROVED"
        ? "VACANCY_APPROVED"
        : "VACANCY_REJECTED",
    title: returned
      ? "Vacancy returned for correction"
      : status === "APPROVED"
        ? "Vacancy approved"
        : "Vacancy rejected",
    body: returned
      ? comments?.trim() || `${vacancy.title} was returned for correction.`
      : status === "APPROVED"
        ? `${vacancy.title} is now public.`
        : `${vacancy.title} was not approved.`,
    href: "/employer/vacancies",
    entityType: "vacancy",
    entityId: vacancy.id,
  })
  return vacancy
}

function toEmployer(row: {
  id: string
  name: string
  email: string
  hasTvetCapability: boolean | null
}) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    hasTvetCapability: row.hasTvetCapability === true,
  }
}

export async function listEmployers() {
  const rows = await usersRepository.listEmployers()
  return rows.map(toEmployer)
}

export async function setTvetCapability(id: string, hasTvetCapability: boolean) {
  const existing = await usersRepository.findUserById(id)
  if (!existing) {
    throw new PasakError(404, "Employer not found")
  }
  if (existing.role !== "employer") {
    throw new PasakError(400, "TVET capability can only be set on employer accounts")
  }

  const row = await usersRepository.updateUserById(id, {
    hasTvetCapability,
    ...(!hasTvetCapability ? { activeWorkspace: "employer" } : {}),
  })
  if (!row) {
    throw new PasakError(404, "Employer not found")
  }
  await notificationsService.notify(id, {
    type: hasTvetCapability ? "TVET_GRANTED" : "TVET_REVOKED",
    title: hasTvetCapability ? "TVET granted" : "TVET revoked",
    body: hasTvetCapability
      ? "PASAK granted TVET capability on your employer account."
      : "PASAK revoked TVET capability on your employer account.",
    href: "/employer/tvet",
    entityType: "user",
    entityId: id,
  })

  return toEmployer(row)
}
