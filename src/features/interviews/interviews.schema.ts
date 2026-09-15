import { date, pgTable, text } from "drizzle-orm/pg-core";

import { timestamps } from "../../lib/columns.ts";
import { application } from "../applications/applications.schema.ts";

export const interview = pgTable("interview", {
  id: text("id").primaryKey(),
  applicationId: text("application_id")
    .notNull()
    .references(() => application.id, { onDelete: "cascade" }),
  interviewDate: date("interview_date", { mode: "string" }).notNull(),
  interviewTime: text("interview_time").notNull(),
  mode: text("mode").notNull(),
  location: text("location"),
  meetingLink: text("meeting_link"),
  notes: text("notes"),
  status: text("status").notNull().default("SCHEDULED"),
  ...timestamps,
});
