import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { organization } from "../../auth/schema.ts";
import { timestamps } from "../../lib/columns.ts";
import { tvetSession } from "../tvet/tvet.schema.ts";

export const tvetClaimStatus = pgEnum("tvet_claim_status", [
  "SUBMITTED",
  "FINANCE_APPROVED",
  "SIGNED_DOC_SUBMITTED",
  "PAID",
  "REJECTED",
]);

export const tvetClaim = pgTable(
  "tvet_claims",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => tvetSession.id, { onDelete: "restrict" }),
    employerId: text("employer_id")
      .notNull()
      .references(() => organization.id, { onDelete: "restrict" }),
    claimAmount: numeric("claim_amount", {
      precision: 12,
      scale: 2,
      mode: "string",
    }).notNull(),
    borangTuntutanUrl: text("borang_tuntutan_url").notNull(),
    status: tvetClaimStatus("status").notNull().default("SUBMITTED"),
    signedBorangAkuanUrl: text("signed_borang_akuan_url"),
    reviewNotes: text("review_notes"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    unique("tvet_claims_course_provider").on(table.courseId, table.employerId),
  ],
);
