import * as notificationsService from "../notifications/notifications.service.ts";
import { createClaimPdf } from "./tvet-claims-pdf.ts";
import * as repository from "./tvet-claims.repository.ts";

export class TvetClaimError extends Error {
  constructor(
    public status: 400 | 403 | 404 | 409,
    message: string,
  ) {
    super(message);
    this.name = "TvetClaimError";
  }
}

type ClaimRow = Awaited<ReturnType<typeof repository.findClaim>>;

function toClaim(row: NonNullable<ClaimRow>) {
  return {
    ...row.claim,
    reviewedAt: row.claim.reviewedAt?.toISOString() ?? null,
    paidAt: row.claim.paidAt?.toISOString() ?? null,
    createdAt: row.claim.createdAt.toISOString(),
    updatedAt: row.claim.updatedAt.toISOString(),
    courseTitle: row.courseTitle,
    courseStartsAt: row.courseStartsAt,
    courseEndsAt: row.courseEndsAt,
    providerName: row.providerName,
    paymentVoucherDownloadUrl: `/tvet/claims/${row.claim.id}/payment-voucher`,
    borangAkuanDownloadUrl: `/tvet/claims/${row.claim.id}/borang-akuan`,
  };
}

async function claimOr404(id: string) {
  const row = await repository.findClaim(id);
  if (!row) {
    throw new TvetClaimError(404, "TVET claim not found");
  }
  return row;
}

async function ownedClaim(employerId: string, id: string) {
  const row = await claimOr404(id);
  if (row.claim.employerId !== employerId) {
    throw new TvetClaimError(404, "TVET claim not found");
  }
  return row;
}

function databaseErrorCode(error: unknown) {
  let current = error;
  for (let depth = 0; depth < 3; depth += 1) {
    if (typeof current !== "object" || current === null) return null;
    if ("code" in current && typeof current.code === "string") {
      return current.code;
    }
    current = "cause" in current ? current.cause : null;
  }
  return null;
}

export function listEligibleCourses(employerId: string) {
  return repository.listEligibleCourses(employerId, new Date().toISOString());
}

export async function submitClaim(
  employerId: string,
  data: {
    courseId: string;
    claimAmount: string;
    borangTuntutanUrl: string;
  },
) {
  const course = await repository.findCourse(data.courseId);
  if (!course || course.organizationId !== employerId) {
    throw new TvetClaimError(404, "Completed TVET course not found");
  }
  const endTime = new Date(course.endsAt).getTime();
  if (Number.isNaN(endTime) || endTime > Date.now()) {
    throw new TvetClaimError(
      403,
      "Claims are only allowed after the course ends",
    );
  }

  try {
    const claim = await repository.insertClaim({
      id: crypto.randomUUID(),
      courseId: data.courseId,
      employerId,
      claimAmount: data.claimAmount,
      borangTuntutanUrl: data.borangTuntutanUrl,
      status: "SUBMITTED",
    });
    if (!claim) {
      throw new TvetClaimError(400, "Could not submit TVET claim");
    }
    return toClaim(await claimOr404(claim.id));
  } catch (error) {
    if (databaseErrorCode(error) === "23505") {
      throw new TvetClaimError(409, "A claim already exists for this course");
    }
    throw error;
  }
}

export async function listProviderClaims(employerId: string) {
  return (await repository.listClaimsByProvider(employerId)).map(toClaim);
}

export async function listPasakClaims() {
  return (await repository.listAllClaims()).map(toClaim);
}

export async function reviewClaim(
  id: string,
  action: "APPROVE" | "REJECT",
  comments?: string,
) {
  await claimOr404(id);
  const status = action === "APPROVE" ? "FINANCE_APPROVED" : "REJECTED";
  const updated = await repository.transitionClaim(id, "SUBMITTED", {
    status,
    reviewNotes: comments?.trim() || null,
    reviewedAt: new Date(),
  });
  if (!updated) {
    throw new TvetClaimError(409, "Only submitted claims can be reviewed");
  }
  await notificationsService.notifyOrganization(updated.employerId, {
    type: action === "APPROVE" ? "TVET_CLAIM_APPROVED" : "TVET_CLAIM_REJECTED",
    title: action === "APPROVE" ? "TVET claim approved" : "TVET claim rejected",
    body:
      action === "APPROVE"
        ? "Download, sign, and upload the Borang Akuan Terima."
        : comments?.trim() || "Your TVET claim was rejected.",
    href: "/employer/tvet/claims",
    entityType: "tvet_claim",
    entityId: id,
  });
  return toClaim(await claimOr404(id));
}

export async function uploadSigned(
  employerId: string,
  id: string,
  signedBorangAkuanUrl: string,
) {
  await ownedClaim(employerId, id);
  const updated = await repository.transitionClaim(id, "FINANCE_APPROVED", {
    status: "SIGNED_DOC_SUBMITTED",
    signedBorangAkuanUrl,
  });
  if (!updated) {
    throw new TvetClaimError(
      409,
      "Signed acknowledgement is only accepted after finance approval",
    );
  }
  return toClaim(await claimOr404(id));
}

export async function finalizePayment(id: string) {
  const existing = await claimOr404(id);
  const updated = await repository.transitionClaim(id, "SIGNED_DOC_SUBMITTED", {
    status: "PAID",
    paidAt: new Date(),
  });
  if (!updated) {
    throw new TvetClaimError(
      409,
      "Payment can only be finalized after the signed acknowledgement is submitted",
    );
  }
  await notificationsService.notifyOrganization(existing.claim.employerId, {
    type: "TVET_CLAIM_PAID",
    title: "TVET claim paid",
    body: `Payment for ${existing.courseTitle} has been finalized.`,
    href: "/employer/tvet/claims",
    entityType: "tvet_claim",
    entityId: id,
  });
  return toClaim(await claimOr404(id));
}

export async function downloadDocument(
  id: string,
  kind: "PAYMENT_VOUCHER" | "BORANG_AKUAN",
  employerId?: string,
) {
  const row = employerId
    ? await ownedClaim(employerId, id)
    : await claimOr404(id);
  if (
    row.claim.status !== "FINANCE_APPROVED" &&
    row.claim.status !== "SIGNED_DOC_SUBMITTED" &&
    row.claim.status !== "PAID"
  ) {
    throw new TvetClaimError(
      403,
      "Documents are available after finance approval",
    );
  }
  return createClaimPdf(kind, {
    id,
    claimAmount: row.claim.claimAmount,
    courseTitle: row.courseTitle,
    courseStartsAt: row.courseStartsAt,
    courseEndsAt: row.courseEndsAt,
    providerName: row.providerName,
    createdAt: row.claim.createdAt.toISOString(),
  });
}
