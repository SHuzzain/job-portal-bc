import * as notificationsService from "../notifications/notifications.service.ts";
import * as vacanciesRepository from "./vacancies.repository.ts";
import {
  vacancyEmploymentTypeSchema,
  vacancyStatusSchema,
} from "./validator/vacancy.schema.ts";

export class VacancyError extends Error {
  constructor(
    public status: 400 | 403 | 404,
    message: string
  ) {
    super(message);
    this.name = "VacancyError";
  }
}

function toVacancy(row: {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  minQualification?: string | null;
  preferredGender?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  status: string;
  reviewNotes?: string | null;
  createdAt: Date;
}) {
  return {
    id: row.id,
    organizationId: row.organizationId,
    title: row.title,
    description: row.description,
    location: row.location,
    employmentType: vacancyEmploymentTypeSchema.parse(row.employmentType),
    minQualification: row.minQualification ?? null,
    preferredGender: row.preferredGender ?? null,
    minAge: row.minAge ?? null,
    maxAge: row.maxAge ?? null,
    status: vacancyStatusSchema.parse(row.status),
    reviewNotes: row.reviewNotes ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createVacancy(
  organizationId: string,
  data: {
    title: string;
    description: string;
    location: string;
    employmentType: string;
    minQualification?: string;
    preferredGender?: string;
    minAge?: number;
    maxAge?: number;
  }
) {
  const row = await vacanciesRepository.insertVacancy({
    id: crypto.randomUUID(),
    organizationId,
    title: data.title,
    description: data.description,
    location: data.location,
    employmentType: data.employmentType,
    minQualification: data.minQualification?.trim() || null,
    preferredGender: data.preferredGender || null,
    minAge: data.minAge ?? null,
    maxAge: data.maxAge ?? null,
    status: "PENDING_APPROVAL",
  });

  if (!row) {
    throw new VacancyError(400, "Could not create vacancy");
  }

  await notificationsService.notifyAdmins({
    type: "VACANCY_PENDING",
    title: "Vacancy waiting for approval",
    body: `${row.title} was submitted for PASAK review.`,
    href: "/pasak/vacancies",
    entityType: "vacancy",
    entityId: row.id,
  });

  return toVacancy(row);
}

export async function listApprovedVacancies(
  filters: {
    q?: string;
    location?: string;
    employmentType?: string;
  } = {}
) {
  const rows = await vacanciesRepository.listVacanciesByStatus(
    "APPROVED",
    filters
  );
  return rows.map(toVacancy);
}

export async function listOrganizationVacancies(organizationId: string) {
  const rows =
    await vacanciesRepository.listVacanciesByOrganization(organizationId);
  return rows.map(toVacancy);
}

export async function listVacanciesByStatus(status: string) {
  const rows = await vacanciesRepository.listVacanciesByStatus(status);
  return rows.map(toVacancy);
}

export async function getPublicVacancy(id: string) {
  const row = await vacanciesRepository.findVacancyById(id);
  if (!row || row.status !== "APPROVED") {
    throw new VacancyError(404, "Vacancy not found");
  }
  return toVacancy(row);
}

export async function updateOwnVacancy(
  organizationId: string,
  id: string,
  data: {
    title?: string;
    description?: string;
    location?: string;
    employmentType?: string;
    minQualification?: string;
    preferredGender?: string;
    minAge?: number;
    maxAge?: number;
  }
) {
  const existing = await vacanciesRepository.findVacancyById(id);
  if (!existing || existing.organizationId !== organizationId) {
    throw new VacancyError(404, "Vacancy not found");
  }
  if (
    existing.status !== "PENDING_APPROVAL" &&
    existing.status !== "RETURNED_FOR_CORRECTION" &&
    existing.status !== "REJECTED"
  ) {
    throw new VacancyError(
      403,
      "Only draft or returned vacancies can be edited"
    );
  }

  const row = await vacanciesRepository.updateVacancyById(id, {
    ...data,
    minQualification:
      data.minQualification !== undefined
        ? data.minQualification.trim() || null
        : undefined,
    preferredGender:
      data.preferredGender !== undefined
        ? data.preferredGender || null
        : undefined,
  });
  if (!row) {
    throw new VacancyError(404, "Vacancy not found");
  }
  return toVacancy(row);
}

export async function deleteOwnVacancy(organizationId: string, id: string) {
  const existing = await vacanciesRepository.findVacancyById(id);
  if (!existing || existing.organizationId !== organizationId) {
    throw new VacancyError(404, "Vacancy not found");
  }

  await vacanciesRepository.deleteVacancyById(id);
}

export async function setVacancyStatus(
  id: string,
  status:
    | "APPROVED"
    | "REJECTED"
    | "CLOSED"
    | "RETURNED_FOR_CORRECTION"
    | "PENDING_APPROVAL",
  reviewNotes?: string | null
) {
  const existing = await vacanciesRepository.findVacancyById(id);
  if (!existing) {
    throw new VacancyError(404, "Vacancy not found");
  }

  const row = await vacanciesRepository.updateVacancyById(id, {
    status,
    reviewNotes: reviewNotes !== undefined ? reviewNotes : undefined,
  });
  if (!row) {
    throw new VacancyError(404, "Vacancy not found");
  }
  return toVacancy(row);
}

const resubmittable = new Set(["RETURNED_FOR_CORRECTION", "REJECTED"]);

export async function getOwnVacancy(organizationId: string, id: string) {
  const row = await vacanciesRepository.findVacancyById(id);
  if (!row || row.organizationId !== organizationId) {
    throw new VacancyError(404, "Vacancy not found");
  }
  return toVacancy(row);
}

export async function resubmitOwnVacancy(organizationId: string, id: string) {
  const existing = await vacanciesRepository.findVacancyById(id);
  if (!existing || existing.organizationId !== organizationId) {
    throw new VacancyError(404, "Vacancy not found");
  }
  if (!resubmittable.has(existing.status)) {
    throw new VacancyError(
      403,
      "Only returned or rejected vacancies can be resubmitted"
    );
  }

  const row = await vacanciesRepository.updateVacancyById(id, {
    status: "PENDING_APPROVAL",
    reviewNotes: null,
  });
  if (!row) {
    throw new VacancyError(404, "Vacancy not found");
  }

  await notificationsService.notifyAdmins({
    type: "VACANCY_PENDING",
    title: "Vacancy resubmitted",
    body: `${row.title} was resubmitted for PASAK review.`,
    href: "/pasak/vacancies",
    entityType: "vacancy",
    entityId: row.id,
  });

  return toVacancy(row);
}
