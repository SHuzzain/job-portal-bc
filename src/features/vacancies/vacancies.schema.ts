import { integer, pgTable, text } from "drizzle-orm/pg-core";

import { organization } from "../../auth/schema.ts";
import { timestamps } from "../../lib/columns.ts";

export const vacancy = pgTable("vacancy", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  employmentType: text("employment_type").notNull(),
  minQualification: text("min_qualification"),
  preferredGender: text("preferred_gender"),
  minAge: integer("min_age"),
  maxAge: integer("max_age"),
  status: text("status").notNull().default("PENDING_APPROVAL"),
  reviewNotes: text("review_notes"),
  ...timestamps,
});
