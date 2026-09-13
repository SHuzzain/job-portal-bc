import { pgTable, text, unique } from "drizzle-orm/pg-core"
import { user } from "../users/users.schema.ts"
import { vacancy } from "../vacancies/vacancies.schema.ts"
import { resume } from "../resumes/resumes.schema.ts"
import { timestamps } from "../../lib/columns.ts"

export const application = pgTable(
  "application",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    vacancyId: text("vacancy_id")
      .notNull()
      .references(() => vacancy.id, { onDelete: "cascade" }),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resume.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("SUBMITTED"),
    ...timestamps,
  },
  (table) => [unique("application_user_vacancy").on(table.userId, table.vacancyId)],
)
