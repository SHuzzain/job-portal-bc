import { pgTable, text, unique } from "drizzle-orm/pg-core"
import { organization } from "../../auth/schema.ts"
import { user } from "../users/users.schema.ts"
import { timestamps } from "../../lib/columns.ts"

export const tvetRfp = pgTable("tvet_rfp", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("OPEN"),
  ...timestamps,
})

export const tvetSession = pgTable("tvet_session", {
  id: text("id").primaryKey(),
  rfpId: text("rfp_id")
    .notNull()
    .references(() => tvetRfp.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  venue: text("venue").notNull(),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  barcode: text("barcode").notNull().unique(),
  ...timestamps,
})

export const tvetAttendance = pgTable(
  "tvet_attendance",
  {
    id: text("id").primaryKey(),
    sessionId: text("session_id")
      .notNull()
      .references(() => tvetSession.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [unique("tvet_attendance_session_user").on(table.sessionId, table.userId)],
)
