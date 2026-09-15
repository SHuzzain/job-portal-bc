import * as applicationsRepository from "../applications/applications.repository.ts";
import * as notificationsService from "../notifications/notifications.service.ts";
import * as usersRepository from "../users/users.repository.ts";
import * as vacanciesRepository from "../vacancies/vacancies.repository.ts";
import * as interviewsRepository from "./interviews.repository.ts";
import {
  interviewModeSchema,
  interviewStatusSchema,
} from "./validator/interview.schema.ts";

export class InterviewError extends Error {
  constructor(
    public status: 400 | 403 | 404,
    message: string
  ) {
    super(message);
    this.name = "InterviewError";
  }
}

function toInterview(row: {
  id: string;
  applicationId: string;
  interviewDate: string;
  interviewTime: string;
  mode: string;
  location: string | null;
  meetingLink: string | null;
  notes: string | null;
  status: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    applicationId: row.applicationId,
    interviewDate: row.interviewDate,
    interviewTime: row.interviewTime,
    mode: interviewModeSchema.parse(row.mode),
    location: row.location,
    meetingLink: row.meetingLink,
    notes: row.notes,
    status: interviewStatusSchema.parse(row.status),
    createdAt: row.createdAt.toISOString(),
  };
}

export function latestInterviewMap(
  rows: Array<{
    id: string;
    applicationId: string;
    interviewDate: string;
    interviewTime: string;
    mode: string;
    location: string | null;
    meetingLink: string | null;
    notes: string | null;
    status: string;
    createdAt: Date;
  }>
) {
  const map = new Map<string, ReturnType<typeof toInterview>>();
  for (const row of rows) {
    if (!map.has(row.applicationId)) {
      map.set(row.applicationId, toInterview(row));
    }
  }
  return map;
}

const schedulable = new Set(["SHORTLISTED", "WAITING_FOR_INTERVIEW"]);

export function interviewDateTime(
  interviewDate: string,
  interviewTime: string
) {
  const value = new Date(`${interviewDate}T${interviewTime}`);
  if (Number.isNaN(value.getTime())) {
    throw new InterviewError(400, "Invalid interview date or time");
  }
  return value;
}

export async function scheduleInterview(
  organizationId: string,
  data: {
    applicationId: string;
    interviewDate: string;
    interviewTime: string;
    mode: "PHYSICAL" | "ONLINE";
    location?: string;
    meetingLink?: string;
    notes?: string;
  }
) {
  const existing = await applicationsRepository.findById(data.applicationId);
  if (!existing) {
    throw new InterviewError(404, "Application not found");
  }

  const vacancy = await vacanciesRepository.findVacancyById(existing.vacancyId);
  if (!vacancy || vacancy.organizationId !== organizationId) {
    throw new InterviewError(404, "Application not found");
  }

  if (!schedulable.has(existing.status)) {
    throw new InterviewError(
      403,
      "Only shortlisted applications can be scheduled for interview"
    );
  }

  interviewDateTime(data.interviewDate, data.interviewTime);

  await interviewsRepository.cancelActiveByApplicationId(existing.id);

  const row = await interviewsRepository.insertInterview({
    id: crypto.randomUUID(),
    applicationId: existing.id,
    interviewDate: data.interviewDate,
    interviewTime: data.interviewTime,
    mode: data.mode,
    location: data.mode === "PHYSICAL" ? data.location?.trim() || null : null,
    meetingLink:
      data.mode === "ONLINE" ? data.meetingLink?.trim() || null : null,
    notes: data.notes?.trim() || null,
    status: "SCHEDULED",
  });
  if (!row) {
    throw new InterviewError(400, "Could not schedule interview");
  }

  await applicationsRepository.updateStatusById(
    existing.id,
    "WAITING_FOR_INTERVIEW"
  );

  const when = `${row.interviewDate} ${row.interviewTime}`;
  const place =
    row.mode === "ONLINE"
      ? row.meetingLink || "online"
      : row.location || "the listed location";
  await notificationsService.notify(existing.userId, {
    type: "INTERVIEW_INVITATION",
    title: "Interview invitation",
    body: `You are invited to interview for ${vacancy.title} on ${when} (${place}).`,
    href: `/seeker/applications/${existing.id}`,
    entityType: "interview",
    entityId: row.id,
  });

  return toInterview(row);
}

export async function candidatePhoneForApplication(applicationId: string) {
  const application = await applicationsRepository.findById(applicationId);
  if (!application) {
    return "";
  }
  const candidate = await usersRepository.findUserById(application.userId);
  return candidate?.phoneNumber ?? "";
}

export async function sendReminder(
  applicationId: string,
  expectedInterviewTime: Date,
  candidatePhone: string
) {
  const application = await applicationsRepository.findById(applicationId);
  if (!application) {
    return false;
  }

  const rows = await interviewsRepository.listByApplicationId(applicationId);
  const active = rows.find(
    (row) => row.status === "SCHEDULED" || row.status === "CONFIRMED"
  );
  if (
    !active ||
    interviewDateTime(active.interviewDate, active.interviewTime).getTime() !==
      expectedInterviewTime.getTime()
  ) {
    return false;
  }

  const vacancy = await vacanciesRepository.findVacancyById(
    application.vacancyId
  );
  void candidatePhone;
  await notificationsService.notify(application.userId, {
    type: "INTERVIEW_REMINDER",
    title: "Interview reminder",
    body: `Your interview${vacancy ? ` for ${vacancy.title}` : ""} is scheduled in 24 hours.`,
    href: `/seeker/applications/${application.id}`,
    entityType: "interview",
    entityId: active.id,
  });
  return true;
}

export async function applyCandidateReply(
  applicationId: string,
  response: "confirm" | "decline"
) {
  const application = await applicationsRepository.findById(applicationId);
  if (!application) {
    return false;
  }

  const status = response === "confirm" ? "CONFIRMED" : "CANCELLED";
  const row = await interviewsRepository.updateActiveStatusByApplicationId(
    applicationId,
    status
  );
  if (!row) {
    return false;
  }

  await notificationsService.notify(application.userId, {
    type: "INTERVIEW_REPLY_RECORDED",
    title: "Interview response recorded",
    body:
      response === "confirm"
        ? "Your interview attendance has been confirmed."
        : "Your interview attendance has been declined.",
    href: `/seeker/applications/${application.id}`,
    entityType: "interview",
    entityId: row.id,
  });
  return true;
}

export async function completeLatestForApplication(applicationId: string) {
  const rows = await interviewsRepository.listByApplicationId(applicationId);
  const active = rows.find(
    (row) => row.status === "SCHEDULED" || row.status === "CONFIRMED"
  );
  if (!active) {
    return null;
  }
  const row = await interviewsRepository.updateStatusById(
    active.id,
    "COMPLETED"
  );
  return row ? toInterview(row) : null;
}
