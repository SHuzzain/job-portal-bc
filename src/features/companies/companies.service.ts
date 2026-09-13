import * as notificationsService from "../notifications/notifications.service.ts"
import * as pasakRepository from "../pasak/pasak.repository.ts"
import { companyStatusSchema } from "../pasak/validator/pasak.schema.ts"
import * as companiesRepository from "./companies.repository.ts"

export class CompanyError extends Error {
  constructor(
    public status: 403 | 404,
    message: string,
  ) {
    super(message)
    this.name = "CompanyError"
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

const resubmittable = new Set(["RETURNED_FOR_CORRECTION", "REJECTED"])

export async function resubmitOwnCompany(userId: string, id: string) {
  const membership = await companiesRepository.findMembership(id, userId)
  if (!membership) {
    throw new CompanyError(404, "Company not found")
  }

  const existing = await pasakRepository.findCompanyById(id)
  if (!existing) {
    throw new CompanyError(404, "Company not found")
  }
  if (!resubmittable.has(existing.status)) {
    throw new CompanyError(403, "Only returned or rejected companies can be resubmitted")
  }

  const row = await pasakRepository.updateCompany(id, {
    status: "PENDING_APPROVAL",
    reviewNotes: null,
  })
  if (!row) {
    throw new CompanyError(404, "Company not found")
  }

  await notificationsService.notifyAdmins({
    type: "COMPANY_PENDING",
    title: "Company resubmitted",
    body: `${row.name} was resubmitted for PASAK review.`,
    href: "/pasak/companies",
    entityType: "company",
    entityId: row.id,
  })

  return toCompany(row)
}
