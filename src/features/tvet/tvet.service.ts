import * as notificationsService from "../notifications/notifications.service.ts";
import { createCertificatePdf } from "./tvet-certificate.ts";
import * as tvetRepository from "./tvet.repository.ts";
import { rfpStatusSchema } from "./validator/tvet.schema.ts";

export class TvetError extends Error {
  constructor(
    public status: 400 | 403 | 404 | 409,
    message: string
  ) {
    super(message);
    this.name = "TvetError";
  }
}

function toRfp(row: {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  status: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    organizationId: row.organizationId,
    title: row.title,
    description: row.description,
    status: rfpStatusSchema.parse(row.status),
    createdAt: row.createdAt.toISOString(),
  };
}

function toSession(row: {
  id: string;
  rfpId: string;
  organizationId: string;
  title: string;
  venue: string;
  startsAt: string;
  endsAt: string;
  barcode: string;
  createdAt: Date;
}) {
  return {
    id: row.id,
    rfpId: row.rfpId,
    organizationId: row.organizationId,
    title: row.title,
    venue: row.venue,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    barcode: row.barcode,
    createdAt: row.createdAt.toISOString(),
  };
}

function toAttendance(
  row: {
    id: string;
    sessionId: string;
    userId: string;
    attendanceRecordedAt: Date;
    surveyCompletedAt: Date | null;
    certificateCode: string | null;
    surveyRating: number | null;
    surveyFeedback: string | null;
    createdAt: Date;
  },
  sessionTitle: string
) {
  return {
    id: row.id,
    sessionId: row.sessionId,
    userId: row.userId,
    sessionTitle,
    attendanceRecordedAt: row.attendanceRecordedAt.toISOString(),
    surveyCompletedAt: row.surveyCompletedAt?.toISOString() ?? null,
    certificateCode: row.certificateCode,
    surveyRating: row.surveyRating,
    surveyFeedback: row.surveyFeedback,
    createdAt: row.createdAt.toISOString(),
  };
}

function newBarcode() {
  return `TP-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

function newCertificateCode() {
  return `TP-CERT-${crypto.randomUUID().replaceAll("-", "").toUpperCase()}`;
}

export async function listRfps(organizationId: string) {
  const rows = await tvetRepository.listRfpsByOrganization(organizationId);
  return rows.map(toRfp);
}

export async function createRfp(
  organizationId: string,
  data: { title: string; description: string }
) {
  const row = await tvetRepository.insertRfp({
    id: crypto.randomUUID(),
    organizationId,
    title: data.title,
    description: data.description,
    status: "OPEN",
  });
  if (!row) {
    throw new TvetError(400, "Could not create RFP");
  }
  return toRfp(row);
}

export async function updateRfp(
  organizationId: string,
  id: string,
  data: { title?: string; description?: string; status?: "OPEN" | "CLOSED" }
) {
  const existing = await tvetRepository.findRfpById(id);
  if (!existing || existing.organizationId !== organizationId) {
    throw new TvetError(404, "RFP not found");
  }

  const row = await tvetRepository.updateRfpById(id, data);
  if (!row) {
    throw new TvetError(404, "RFP not found");
  }
  return toRfp(row);
}

export async function listSessions(organizationId: string, rfpId?: string) {
  const rows = await tvetRepository.listSessionsByOrganization(
    organizationId,
    rfpId
  );
  return rows.map(toSession);
}

export async function createSession(
  organizationId: string,
  data: {
    rfpId: string;
    title: string;
    venue: string;
    startsAt: string;
    endsAt: string;
  }
) {
  const rfp = await tvetRepository.findRfpById(data.rfpId);
  if (!rfp || rfp.organizationId !== organizationId) {
    throw new TvetError(404, "RFP not found");
  }
  if (rfp.status !== "OPEN") {
    throw new TvetError(403, "Sessions can only be created on an open RFP");
  }
  if (new Date(data.endsAt).getTime() <= new Date(data.startsAt).getTime()) {
    throw new TvetError(400, "Session end must be after start");
  }

  const row = await tvetRepository.insertSession({
    id: crypto.randomUUID(),
    rfpId: data.rfpId,
    organizationId,
    title: data.title,
    venue: data.venue,
    startsAt: data.startsAt,
    endsAt: data.endsAt,
    barcode: newBarcode(),
  });
  if (!row) {
    throw new TvetError(400, "Could not create session");
  }
  return toSession(row);
}

export async function getSession(organizationId: string, id: string) {
  const row = await tvetRepository.findSessionById(id);
  if (!row || row.organizationId !== organizationId) {
    throw new TvetError(404, "Session not found");
  }

  const attendance = await tvetRepository.listAttendanceBySession(id);
  return {
    ...toSession(row),
    attendance: attendance.map((item) => toAttendance(item, row.title)),
  };
}

export async function scan(userId: string, barcode: string) {
  const session = await tvetRepository.findSessionByBarcode(barcode.trim());
  if (!session) {
    throw new TvetError(404, "Session not found");
  }

  const now = Date.now();
  const startsAt = new Date(session.startsAt).getTime();
  const endsAt = new Date(session.endsAt).getTime();
  if (
    Number.isNaN(startsAt) ||
    Number.isNaN(endsAt) ||
    now < startsAt ||
    now > endsAt
  ) {
    throw new TvetError(403, "This session is not open for scanning");
  }

  const existing = await tvetRepository.findAttendance(session.id, userId);
  if (existing) {
    throw new TvetError(409, "You already scanned this session");
  }

  const row = await tvetRepository.insertAttendance({
    id: crypto.randomUUID(),
    sessionId: session.id,
    userId,
  });
  if (!row) {
    throw new TvetError(400, "Could not record attendance");
  }

  await notificationsService.notifyOrganization(session.organizationId, {
    type: "TVET_ATTENDANCE",
    title: "TVET attendance",
    body: `A seeker scanned ${session.title}.`,
    href: `/employer/tvet/sessions/${session.id}`,
    entityType: "tvet_session",
    entityId: session.id,
  });

  return toAttendance(row, session.title);
}

export async function listMyAttendance(userId: string) {
  const rows = await tvetRepository.listAttendanceByUser(userId);
  return rows.map((row) => toAttendance(row.attendance, row.sessionTitle));
}

export async function submitSurvey(
  userId: string,
  sessionId: string,
  data: { rating: number; feedback?: string }
) {
  const attendance = await tvetRepository.findAttendance(sessionId, userId);
  if (!attendance) {
    throw new TvetError(404, "Attendance not found for this session");
  }
  if (attendance.surveyCompletedAt) {
    throw new TvetError(409, "Survey already completed");
  }

  const updated = await tvetRepository.completeSurvey(sessionId, userId, {
    surveyCompletedAt: new Date(),
    certificateCode: newCertificateCode(),
    surveyRating: data.rating,
    surveyFeedback: data.feedback?.trim() || null,
  });
  if (!updated) {
    throw new TvetError(409, "Survey already completed");
  }

  return getCertificate(userId, sessionId);
}

export async function getCertificate(userId: string, sessionId: string) {
  const row = await tvetRepository.findCertificate(sessionId, userId);
  if (!row) {
    throw new TvetError(404, "Attendance not found for this session");
  }
  if (!row.attendance.surveyCompletedAt || !row.attendance.certificateCode) {
    throw new TvetError(
      403,
      "Complete the course survey to unlock your certificate"
    );
  }

  return {
    sessionId: row.session.id,
    recipientName: row.recipientName,
    courseTitle: row.session.title,
    providerName: row.providerName,
    venue: row.session.venue,
    startsAt: row.session.startsAt,
    endsAt: row.session.endsAt,
    attendanceRecordedAt: row.attendance.attendanceRecordedAt.toISOString(),
    surveyCompletedAt: row.attendance.surveyCompletedAt.toISOString(),
    certificateCode: row.attendance.certificateCode,
    downloadAuthorized: true as const,
    downloadUrl: `/tvet/sessions/${row.session.id}/certificate/download`,
  };
}

export async function downloadCertificate(userId: string, sessionId: string) {
  return createCertificatePdf(await getCertificate(userId, sessionId));
}
